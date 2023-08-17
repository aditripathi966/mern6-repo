const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userModel = new mongoose.Schema({
    passwordResetToken: {
        type: Number,
        default: 0,
    },
    username: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Username field must not empty"],
        minLength: [4, "Username field must have atleast 4 characters"],
    },
    password: String,
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, "Email address is required"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Invalid email address",
        ],
    },
    avatar: {
        type: String,
        default: "default.jpg",
    },
    todos: [{ type: mongoose.Schema.Types.ObjectId, ref: "todo" }],
});

userModel.plugin(plm);
const user = mongoose.model("user", userModel);

module.exports = user;
