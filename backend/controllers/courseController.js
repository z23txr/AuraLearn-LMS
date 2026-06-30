import Course from '../models/Course.js'; 
import Instructor from '../models/Instructor.js';
import User from '../models/User.js';
import CourseView from '../models/CourseView.js';
import Enrollment from '../models/Enrollment.js';
import Student from '../models/Student.js';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// ========================Create Course (Initial metadata)
export const createCourse = async (req, res) => {
    try {
        const { title, description, category, fileUrl } = req.body;
        // ================================= Direct Cloudinary URL
        const thumbnailPath = fileUrl || ''; 

        // ================================= Naya Course create karna
        const newCourse = new Course({
            title, 
            description, 
            category,
            thumbnail: thumbnailPath,
            instructor: req.user._id, 
            instructorName: req.user.name,
            instructorEmail: req.user.email
        });

        const savedCourse = await newCourse.save();

       
        await Instructor.findOneAndUpdate(
            { userId: req.user._id }, 
            { $push: { myCourses: savedCourse._id } }
        );

        res.status(201).json({
            message: "Course created and linked to profile successfully",
            course: savedCourse
        });
    } catch (err) {
        console.error("Course Link Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};
// ========================== Add Content Dynamically
export const addMaterial = async (req, res) => {
    try {
        const { section, title, fileUrl } = req.body; 
        const filePath = fileUrl; 

        const updateData = {};
        updateData[section] = { title, filePath };

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { $push: updateData },
            { new: true }
        );
        res.status(200).json(updatedCourse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =========================== Get All Courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
       
        await Instructor.findOneAndUpdate(
            { userId: req.user.id },
            { $pull: { myCourses: req.params.id } }
        );
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const markCourseAsComplete = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'Completed', 
                completionDate: new Date() 
            },
            { new: true }
        );

        if (!course) return res.status(404).json({ message: "Course not found" });

        //  Notification Logic
        if (course.enrollments && course.enrollments.length > 0) {
            const notificationData = {
                text: `Congratulations! The course "${course.title}" is now complete. Please provide feedback to claim your certificate.`,
                type: 'success', 
                isRead: false,
                createdAt: new Date()
            };

           
            await User.updateMany(
                { _id: { $in: course.enrollments } },
                { $push: { notifications: notificationData } }
            );
        }

        res.status(200).json({ 
            message: "Course marked as completed and students notified!", 
            course 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const submitFinalTest = async (req, res) => {
    try {
        const { courseId, fileUrl } = req.body;
        const studentId = req.user._id; 
        const submissionPath = fileUrl || '';

        const course = await Course.findById(courseId);
        
       
        const existingResultIndex = course.testResults.findIndex(r => r.studentId.toString() === studentId.toString());

        if (existingResultIndex !== -1) {
            // Update existing
            course.testResults[existingResultIndex].submissionPath = submissionPath;
            course.testResults[existingResultIndex].status = 'Pending';
        } else {
            // New submission
            course.testResults.push({
                studentId,
                studentName: req.user.name,
                submissionPath,
                status: 'Pending'
            });
        }

        await course.save();
        res.status(200).json({ message: "Test submitted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const updateStudentGrade = async (req, res) => {
    try {
        const { courseId, studentId, grade, feedback, status } = req.body;

        const course = await Course.findOneAndUpdate(
            { _id: courseId, "testResults.studentId": studentId },
            { 
                $set: { 
                    "testResults.$.grade": grade,
                    "testResults.$.feedback": feedback,
                    "testResults.$.status": status 
                } 
            },
            { new: true }
        );

        res.status(200).json({ message: "Academic record synced!", course });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProgress = async (req, res) => {
    try {
        const { enrollmentId, itemId, totalItems } = req.body;
        
        const enrollment = await Enrollment.findById(enrollmentId);
        
      
        if (!enrollment.completedItems.includes(itemId)) {
            enrollment.completedItems.push(itemId);
        }

     
        enrollment.progress = Math.round((enrollment.completedItems.length / totalItems) * 100);
        
        await enrollment.save();
        res.status(200).json({ progress: enrollment.progress });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const trackCourseView = async (req, res) => {
    try {
        const { userId, courseId, category } = req.body;
        if (!userId || !courseId || !category) {
            return res.status(400).json({ message: "Missing required view details" });
        }
        await CourseView.findOneAndUpdate(
            { userId, courseId },
            { userId, courseId, category, viewedAt: new Date() },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: "Course view logged successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRecommendedCourses = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Get all courses to recommend from
        const allCourses = await Course.find();

        // 2. Get user's enrollment list to exclude already enrolled or pending courses
        const userEnrollments = await Enrollment.find({ studentId: userId });
        const enrolledCourseIds = userEnrollments.map(e => e.courseId && e.courseId._id ? e.courseId._id.toString() : (e.courseId ? e.courseId.toString() : ''));

        // Filter out courses the user is already enrolled/pending in
        const candidateCourses = allCourses.filter(c => !enrolledCourseIds.includes(c._id.toString()));

        // 3. Get user's view history
        const userViews = await CourseView.find({ userId });
        const viewedCourseIds = userViews.map(v => v.courseId.toString());

        // 4. Content-based matching: Category preference count
        const categoryWeights = {};
        userViews.forEach(v => {
            categoryWeights[v.category] = (categoryWeights[v.category] || 0) + 2; // Weight of 2 per view
        });
        userEnrollments.forEach(e => {
            const courseDetail = allCourses.find(c => c._id.toString() === e.courseId.toString());
            if (courseDetail && courseDetail.category) {
                categoryWeights[courseDetail.category] = (categoryWeights[courseDetail.category] || 0) + 5; // Weight of 5 for enrollment
            }
        });

        // 5. Collaborative filtering: Identify other students with overlapping course views
        const recommendedByCollaborative = {};
        if (viewedCourseIds.length > 0) {
            const similarUserViews = await CourseView.find({
                courseId: { $in: viewedCourseIds },
                userId: { $ne: userId }
            });
            const similarUserIds = [...new Set(similarUserViews.map(sv => sv.userId.toString()))];

            if (similarUserIds.length > 0) {
                const otherViewsBySimilarUsers = await CourseView.find({
                    userId: { $in: similarUserIds },
                    courseId: { $nin: viewedCourseIds }
                });
                otherViewsBySimilarUsers.forEach(ov => {
                    const cid = ov.courseId.toString();
                    recommendedByCollaborative[cid] = (recommendedByCollaborative[cid] || 0) + 1;
                });
            }
        }

        // 6. Profile matching: Scan student details for keywords to personalize recommendations
        let studentProfile = await Student.findOne({ userId });
        if (!studentProfile) {
            const user = await User.findById(userId);
            if (user) {
                studentProfile = await Student.create({
                    userId,
                    fullName: user.name,
                    regNumber: "Pending",
                    contact: "",
                    address: "",
                    classSection: ""
                });
            }
        }
        let profileKeywords = [];
        if (studentProfile) {
            if (studentProfile.classSection) {
                profileKeywords.push(...studentProfile.classSection.toLowerCase().split(/[\s,/-]+/));
            }
            if (studentProfile.fullName) {
                profileKeywords.push(...studentProfile.fullName.toLowerCase().split(' '));
            }
        }

        // 7. Core scoring algorithm combining collaborative + content-based + profile keywords weights
        const scoredCandidates = candidateCourses.map(course => {
            let score = 0;
            const courseIdStr = course._id.toString();

            // Content Match Score
            if (course.category && categoryWeights[course.category]) {
                score += categoryWeights[course.category];
            }

            // Collaborative Co-occurrence Score
            if (recommendedByCollaborative[courseIdStr]) {
                score += recommendedByCollaborative[courseIdStr] * 3;
            }

            // Profile Keyword Context Matching
            if (profileKeywords.length > 0) {
                const titleLower = course.title.toLowerCase();
                const descLower = course.description.toLowerCase();
                const categoryLower = course.category.toLowerCase();
                profileKeywords.forEach(keyword => {
                    if (keyword.length > 2) {
                        if (titleLower.includes(keyword)) score += 4;
                        if (descLower.includes(keyword)) score += 2;
                        if (categoryLower.includes(keyword)) score += 3;
                    }
                });
            }

            // Default fallback base weight
            score += 1;

            return { course, score };
        });

        // 8. Order by priority score descending
        scoredCandidates.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.course.title.localeCompare(b.course.title);
        });

        const recommendations = scoredCandidates.map(item => ({
            ...item.course._doc,
            recommendationScore: item.score
        }));

        // Limit the recommendations to top 3 courses as requested
        res.status(200).json(recommendations.slice(0, 3));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const generateQuizWithAI = async (req, res) => {
    try {
        const { courseId, promptText, numQuestions, fileUrl } = req.body;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: "Course not found" });

        const count = parseInt(numQuestions) || 5;
        let topicPrompt = promptText ? `on the topic: "${promptText}"` : "matching the course description and curriculum";
        
        if (fileUrl) {
            try {
                // Polyfill DOMMatrix for Vercel/Node environment to prevent pdf-parse crash
                if (typeof global.DOMMatrix === 'undefined') {
                    global.DOMMatrix = class DOMMatrix {};
                }
                const pdfParse = (await import('pdf-parse')).default || require('pdf-parse');
                
                // Fetch the PDF from Cloudinary directly
                const pdfRes = await fetch(fileUrl);
                if (!pdfRes.ok) throw new Error("Failed to fetch PDF from Cloudinary");
                
                const arrayBuffer = await pdfRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                const pdfData = await pdfParse(buffer);
                topicPrompt += `\n\nAlso base your questions tightly on the following document context:\n"""${pdfData.text.substring(0, 5000)}"""\n\n`;
            } catch (err) {
                console.error("PDF Parsing Error:", err);
            }
        }

        const systemPrompt = `Generate a quiz with ${count} multiple choice questions for a course titled "${course.title}".
Description: "${course.description}".
The quiz should be ${topicPrompt}.
You MUST return a JSON array containing objects. Each object MUST have exactly these fields:
- "question": string (the question text)
- "options": array of 4 strings (options)
- "correctAnswer": string (must exactly match one of the options in the array)

Do not return any markdown tags or backticks (like \`\`\`json). Return ONLY the raw JSON array.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: systemPrompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data.error);
            return res.status(400).json({ error: `AI Service Error: ${data.error?.message || 'Unknown API Error'}` });
        }

        let resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        // Robust Extraction of JSON Array
        const startIdx = resultText.indexOf('[');
        const endIdx = resultText.lastIndexOf(']');
        if (startIdx !== -1 && endIdx !== -1) {
            resultText = resultText.substring(startIdx, endIdx + 1);
        } else {
            console.error("Gemini returned invalid format:", resultText);
            return res.status(400).json({ error: "Invalid AI response format. Please try again." });
        }
        
        const generatedQuizzes = JSON.parse(resultText);

        if (Array.isArray(generatedQuizzes)) {
            return res.status(200).json({ message: "Quiz generated successfully! Please review before publishing.", quizzes: generatedQuizzes });
        } else {
            return res.status(400).json({ error: "Failed to parse generated questions as array" });
        }
    } catch (err) {
        console.error("AI Quiz Gen Error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const updateQuizzes = async (req, res) => {
    try {
        const { quizzes } = req.body; // array of quiz questions
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { quizzes },
            { new: true }
        );
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.status(200).json({ message: "Quizzes updated successfully!", quizzes: course.quizzes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};