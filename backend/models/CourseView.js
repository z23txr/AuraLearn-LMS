import mongoose from "mongoose";

const CourseViewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    category: { type: String, required: true },
    viewedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Log one view record per user-course to keep tracking data clean
CourseViewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("CourseView", CourseViewSchema);
