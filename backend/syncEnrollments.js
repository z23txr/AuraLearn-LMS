import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Enrollment from './models/Enrollment.js';
import Course from './models/Course.js';

dotenv.config();

const sync = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const approvedEnrollments = await Enrollment.find({ status: 'Approved' });
        console.log(`Found ${approvedEnrollments.length} approved enrollments.`);

        for (const enrollment of approvedEnrollments) {
            await Course.findByIdAndUpdate(
                enrollment.courseId,
                { $addToSet: { enrollments: enrollment.studentId } }
            );
        }

        console.log("Successfully synced existing enrollments to Course model!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

sync();
