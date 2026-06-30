// db.js
import mongoose from "mongoose";

let isConnected = false;

const connectDb = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        console.log(" MongoDB already connected");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log(" MongoDB Connected Successfully");
    } catch (error) {
        console.log(" ⚠️ MongoDB Connection Failed:", error.message);
        console.log(" Running backend in database-disconnected mode.");
    }
};

export default connectDb;