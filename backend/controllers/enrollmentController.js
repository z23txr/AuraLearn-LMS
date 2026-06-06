import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js'; 


export const applyForEnrollment = async (req, res) => {
    try {
        const { studentId, courseId, teacherId, courseTitle, studentDetails } = req.body;

        if (!studentId || !courseId || !teacherId) {
            return res.status(400).json({ message: "Missing required identification IDs" });
        }

        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: "You have already applied for this course!" });
        }

        const newEnrollment = new Enrollment({
            studentId, courseId, teacherId, courseTitle, studentDetails
        });

        await newEnrollment.save();
        res.status(201).json({ message: "Application submitted successfully! Please wait for approval." });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Already applied for this course!" });
        }
        res.status(500).json({ message: err.message });
    }
};


export const getStudentEnrollments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const enrollments = await Enrollment.find({ studentId })
            .populate('courseId')
            .populate('teacherId', 'name email');
        res.status(200).json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const approveEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        const checkStatus = await Enrollment.findById(id);
        
        if (!checkStatus) return res.status(404).json({ message: "Enrollment not found" });
        if (checkStatus.status === 'Approved') {
            return res.status(400).json({ message: "Student is already approved." });
        }

        // --- Reg ID Generation ---
        const lastRecord = await Enrollment.findOne({ regNumber: { $regex: /^AU-/ } }).sort({ createdAt: -1 });
        let nextNum = 1;
        if (lastRecord && lastRecord.regNumber) {
            const lastNumStr = lastRecord.regNumber.split('-')[1];
            nextNum = parseInt(lastNumStr) + 1;
        }

        const generatedID = `AU-${nextNum.toString().padStart(3, '0')}`;
        
        // --- Enrollment Update ---
        const updated = await Enrollment.findByIdAndUpdate(
            id, 
            { status: 'Approved', regNumber: generatedID }, 
            { new: true }
        );

        //  Notification Logic
        const notificationData = {
            text: `Approved! You're enrolled in "${updated.courseTitle}". Reg ID: ${generatedID}`,
            type: 'success',
            createdAt: new Date(),
            isRead: false
        };

        await User.findByIdAndUpdate(updated.studentId, {
            $push: { notifications: notificationData }
        });

        res.status(200).json({ 
            message: "Student approved and notified successfully!", 
            regNumber: generatedID, 
            updated 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const getAllCoursesWithStatus = async (req, res) => {
    try {
        const { studentId, sortBy } = req.query;
        const courses = await Course.find();
        const enrollments = studentId ? await Enrollment.find({ studentId }) : [];

        let coursesWithStatus = courses.map(course => {
            const enrollment = enrollments.find(e => e.courseId.toString() === course._id.toString());
            return {
                ...course._doc,
                enrollmentStatus: enrollment ? enrollment.status : "Not Enrolled"
            };
        });

        if (sortBy === 'enrollments') {
            coursesWithStatus.sort((a, b) => (b.enrollments?.length || 0) - (a.enrollments?.length || 0));
        }

        res.status(200).json(coursesWithStatus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const getInstructorApplications = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const applications = await Enrollment.find({ teacherId })
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateProgress = async (req, res) => {
    try {
        const { enrollmentId, itemId, totalItems } = req.body;
        const enrollment = await Enrollment.findById(enrollmentId);

        if (!enrollment.completedItems.includes(itemId)) {
            enrollment.completedItems.push(itemId);
        }

       
        const itemsCount = totalItems > 0 ? totalItems : 1;
        enrollment.progress = Math.round((enrollment.completedItems.length / itemsCount) * 100);
        if (enrollment.progress > 100) enrollment.progress = 100;

        await enrollment.save();
        res.status(200).json({ success: true, progress: enrollment.progress, completedItems: enrollment.completedItems });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Assignment Submission Logic
export const submitAssignment = async (req, res) => {
    try {
        const { enrollmentId, assignmentId } = req.body;
        
        //  Enrollment find karein
        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

        //  
        if (!enrollment.submissions) {
            enrollment.submissions = [];
        }

        //  
        if (!enrollment.completedItems) {
            enrollment.completedItems = [];
        }

        // 
        const alreadySubmitted = enrollment.submissions.some(
            (s) => s.assignmentId.toString() === assignmentId.toString()
        );
        
        if (alreadySubmitted) {
            return res.status(400).json({ message: "Assignment already submitted!" });
        }

        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        // 
        enrollment.submissions.push({
            assignmentId,
            filePath: req.file.path,
            submittedAt: new Date(),
            status: "Pending" 
        });

        // 
        if (!enrollment.completedItems.includes(assignmentId)) {
            enrollment.completedItems.push(assignmentId);
        }

        const course = await Course.findById(enrollment.courseId);
        const totalItems = (course.videoLectures?.length || 0) + 
                          (course.pdfNotes?.length || 0) + 
                          (course.pptSlides?.length || 0) +
                          (course.assignments?.length || 0);

        enrollment.progress = Math.round((enrollment.completedItems.length / totalItems) * 100);
        
       
        await enrollment.save();

        res.status(200).json({ 
            success: true, 
            enrollment, 
            message: "Submitted Successfully!" 
        });
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};