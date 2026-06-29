import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url'; 
import authRoutes from "./routes/AuthRoute.js";
import newsletterRoutes from "./routes/NewsletterRoute.js";
import connectDB from "./config/db.js";
import courseRoutes from './routes/courseRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import enrollmentRoute from './routes/enrollment.js';
import  notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoute.js';
import messageRoutes from './routes/messages.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/enrollments', enrollmentRoute); 
app.use('/api/notifications', notificationRoutes); 
app.use('/api/chat', chatRoutes); 
app.use('/api/messages', messageRoutes);

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));