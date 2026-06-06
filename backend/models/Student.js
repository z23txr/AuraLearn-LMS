import e from 'express';
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    fatherName: { type: String },
    regNumber: { type: String, default: "Pending" }, 
    contact: { type: String },
    address: { type: String },
    classSection: { type: String },
    cnic: { type: String },
    profileImage: { type: String },
    
    
    notifications: [{
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
        teacherName: String,
        message: String,
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    
    enrolledCourses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' }
    }]
}, { timestamps: true });

export default mongoose.model('Student', StudentSchema);