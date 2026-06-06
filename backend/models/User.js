import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["student", "instructor"],
        default: "student",
    },

    notifications: [{
        text: { type: String, required: true },
        type: { type: String, enum: ['info', 'success', 'ai', 'request'], default: 'info' },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

export default mongoose.model("User", UserSchema);