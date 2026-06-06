import express from "express";
import {register,login,forgotPassword,resetPassword,getProfile,updateProfile,changePassword} from "../controllers/AuthController.js"


const router = express.Router();

router.post("/register",register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile/:userId", getProfile);
router.put("/profile/:userId", updateProfile);
router.put("/change-password/:userId", changePassword);

export default router;