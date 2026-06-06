import express from "express";
import { subscribeEmail } from "../controllers/NewsletterController.js";

const router = express.Router();
router.post("/subscribe", subscribeEmail);

export default router;