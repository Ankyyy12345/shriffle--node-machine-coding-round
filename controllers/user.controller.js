const User = require("../models/user.model");
const { hashPassword } = require("../utils/hash");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
        error: "Validation Error",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
        error: "Email exists",
      });
    }
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "USER",
    });
    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({  
      message: "Error creating user",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        error: "Validation Error",
      });
    }

    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: "Not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        error: "Unauthorized",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    deletedAt: null,
  }).select("-password");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      error: "Not Found",
    });
  }
  res.status(200).json({
    message: "User found",
    user,
  });
};

exports.getUsers = async (req, res) => {
  const { page = 1, limit = 10, role, isActive } = req.query;

  const filter = { deletedAt: null };

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const users = await User.find(filter)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.status(200).json({
    message: "Users retrieved successfully",
    users,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  });
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findById(id);
  if (!user || user.deletedAt) {
    return res.status(404).json({
      message: "User not found",
      error: "Not Found",
    });
  }

  if (req.user.role === "USER" && req.user.id !== id) {
    return res.status(403).json({
      message: "Access denied",
      error: "Forbidden",
    });
  }
  if (updates.password) {
    updates.password = await hashPassword(updates.password);
  }
  const updated = await User.findByIdAndUpdate(id, updates, {
    new: true,
  }).select("-password");

  res.status(200).json({
    message: "User updated successfully",
    user: updated,
  });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
  res.status(200).json({
    message: "User deleted successfully",
  });
};
