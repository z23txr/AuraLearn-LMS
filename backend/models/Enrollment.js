import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseTitle: { type: String, required: true },
    studentDetails: {
        fullName: { type: String, required: true },
        fatherName: { type: String, required: true },
        contact: { type: String, required: true },
        address: { type: String, required: true },
        cnic: { type: String, required: true },
        city: { type: String, required: true },
        classSection: { type: String } 
    },
    completedItems: [{ type: String }],
    progress: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    submissions: { type: Array, default: [] },
completedItems: { type: Array, default: [] },
    regNumber: { type: String, default: "" } 
}, { timestamps: true });


EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Enrollment', EnrollmentSchema);