import mongoose from 'mongoose';
import Enrollment from './models/Enrollment.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const res = await Enrollment.find().limit(2);
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
}).catch(console.error);
