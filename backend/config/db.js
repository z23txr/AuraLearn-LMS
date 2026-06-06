// db.js
import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(" MongoDB Connected Successfully");
    } catch (error) {
        console.log(" ⚠️ MongoDB Connection Failed:", error.message);
        console.log(" Running backend in database-disconnected mode. Please start your local MongoDB service at 127.0.0.1:27017 or update MONGO_URI in backend/.env");
    }
};

export default connectDb;