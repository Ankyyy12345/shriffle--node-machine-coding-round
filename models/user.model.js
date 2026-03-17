const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password:{

        type: String,
        required: true,
    },
    role:{
        type: String,
        enum:["ADMIN", "USER"],
        default: "USER",
    },
    isActive:{
        type: Boolean,
        default: true,
    },
    deletedAt:{
        type: Date,
        default: null,
        index: true,
    },
}, {
    timestamps: true,
});
 
 module.exports= mongoose.model("User", userSchema);