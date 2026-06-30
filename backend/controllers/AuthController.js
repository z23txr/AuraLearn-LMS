import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import Student from "../models/Student.js";


export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const UserExist = await User.findOne({ email });
        if (UserExist) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "student" 
        });

        res.status(201).json({ 
            message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account created successfully!` 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (!user.password) {
            return res.status(400).json({ message: "Account setup incomplete. Please reset your password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1d" } //1 day
        );

        res.status(200).json({
            message: "Login successful",
            token, 
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};


export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
    await user.save();
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `AuraLearn Password Reset Request:\n\nClick this link: ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Recovery',
        message,
      });
      res.status(200).json({ message: "Email sent!" });
    } catch (emailError) {
      console.warn("⚠️ SMTP/Nodemailer email delivery failed. Reset Link logged to console:");
      console.warn(`---------------- RESET LINK FOR ${user.email} ----------------`);
      console.warn(message);
      console.warn("---------------------------------------------------------------");
      res.status(200).json({ 
        message: "SMTP not configured. Reset link logged to backend console!" 
      });
    }
  } catch (error) {
    console.error("Forgot Password general error:", error);
    res.status(500).json({ message: "Server error, try again." });
  }
};

export const resetPassword = async (req, res) => {
    try {
      
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }, 
        });

        if (!user) {
            return res.status(400).json({ message: "Token is invalid or has expired" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;

      
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successfully! You can now login." });
    } catch (error) {
        res.status(500).json({ message: "Server error during password reset" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const student = await Student.findOne({ userId }).populate("userId", "email name");
        if (!student) {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "User not found" });
            const newStudent = await Student.create({
                userId,
                fullName: user.name,
                regNumber: "Pending",
                contact: "",
                address: "",
                classSection: ""
            });
            const populatedStudent = await Student.findById(newStudent._id).populate("userId", "email name");
            return res.status(200).json(populatedStudent);
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, fatherName, contact, address, classSection, cnic } = req.body;

        const student = await Student.findOneAndUpdate(
            { userId },
            { $set: { fullName, fatherName, contact, address, classSection, cnic } },
            { new: true, upsert: true }
        ).populate("userId", "email name");

        res.status(200).json({ message: "Profile updated successfully", student });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current and new passwords are required." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters." });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};