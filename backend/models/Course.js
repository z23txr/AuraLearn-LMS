import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    category: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    instructorName: String,
    instructorEmail: String,
    videoLectures: [{ title: String, filePath: String }],
    pdfNotes: [{ title: String, filePath: String }],
    pptSlides: [{ title: String, filePath: String }],
    assignments: [{ title: String, filePath: String, deadline: Date }],
    quizzes: [{
        title: { type: String, required: true },
        questions: [{
            question: String,
            options: [String],
            correctAnswer: String
        }]
    }],

  
    status: { 
        type: String, 
        enum: ['In Progress', 'Completed'], 
        default: 'In Progress' 
    },
    completionDate: { type: Date },
    enrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Students list
     testResults: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        studentName: String,
        submissionPath: String, 
        status: { type: String, enum: ['Pending', 'Passed', 'Failed'], default: 'Pending' },
        grade: { type: String, default: '' },
        feedback: { type: String, default: '' },
        submittedAt: { type: Date, default: Date.now }
    }],
    certificateTemplate: { title: String, signaturePath: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Course', CourseSchema);