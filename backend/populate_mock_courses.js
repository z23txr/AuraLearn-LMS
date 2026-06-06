import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

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
    assignments: [{ title: String, filePath: String, deadline: Date }]
});

const Course = mongoose.model('Course', CourseSchema);

const mockCourses = [
    {
        title: "Mastering MERN Stack Development",
        description: "Learn to build full-stack web applications using MongoDB, Express, React, and Node.js with real-world industry standards.",
        category: "Web Development",
        instructorName: "Dr. Sarah Ahmed",
        instructorEmail: "sarah@auralearn.edu",
        videoLectures: [
            { title: "MERN Architecture Overview", filePath: "uploads/mern-intro.mp4" },
            { title: "Express Middleware Explained", filePath: "uploads/express-middle.mp4" }
        ],
        pdfNotes: [
            { title: "MERN Cheat Sheet", filePath: "uploads/mern-notes.pdf" }
        ],
        assignments: [
            { title: "Lab 1: Basic Node API Setup", filePath: "uploads/lab1.pdf" }
        ]
    },
    {
        title: "Python Data Science Foundations",
        description: "Master Python programming, Pandas, NumPy, and Matplotlib data visualization techniques for modern data engineering.",
        category: "Data Science",
        instructorName: "Prof. Ali Raza",
        instructorEmail: "ali@auralearn.edu",
        videoLectures: [
            { title: "Python Basics & OOP", filePath: "uploads/python-basics.mp4" },
            { title: "Pandas DataFrames Tutorial", filePath: "uploads/pandas-dataframes.mp4" }
        ],
        pdfNotes: [
            { title: "Data Science Syllabus", filePath: "uploads/ds-syllabus.pdf" }
        ],
        assignments: [
            { title: "Lab 1: Pandas Data Aggregation", filePath: "uploads/lab1-ds.pdf" }
        ]
    },
    {
        title: "Introduction to Artificial Intelligence",
        description: "Explore neural networks, supervised learning algorithms, predictive analytics, and future concepts of AI.",
        category: "Artificial Intelligence",
        instructorName: "Dr. Sarah Ahmed",
        instructorEmail: "sarah@auralearn.edu",
        videoLectures: [
            { title: "Introduction to Neural Networks", filePath: "uploads/nn-intro.mp4" }
        ],
        pdfNotes: [
            { title: "AI Class Slides", filePath: "uploads/ai-slides.pdf" }
        ],
        assignments: [
            { title: "Lab 1: Linear Regression implementation", filePath: "uploads/lab1-ai.pdf" }
        ]
    }
];

const populate = async () => {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB!");

        // Check if courses already exist
        const count = await Course.countDocuments();
        if (count > 0) {
            console.log(`Database already contains ${count} courses. Skipping seed.`);
            process.exit(0);
        }

        console.log("Seeding mock courses...");
        await Course.insertMany(mockCourses);
        console.log("Successfully seeded mock courses!");
        process.exit(0);
    } catch (err) {
        console.error("Population error:", err);
        process.exit(1);
    }
};

populate();
