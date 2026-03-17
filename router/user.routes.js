const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const { auth } = require("../middleware/auth.middleware");
const { adminAuth } = require("../middleware/role.middleware");

router.post("/login", userController.loginUser);
router.post("/users", userController.createUser);
router.get("/users/:id", auth, userController.getUserById);
router.get("/users", auth, userController.getUsers);
router.put("/users/:id", auth, adminAuth, userController.updateUser);
router.delete("/users/:id", auth, adminAuth, userController.deleteUser);

module.exports = router;
