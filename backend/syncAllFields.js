import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Enrollment from './models/Enrollment.js';
import Course from './models/Course.js';
import Student from './models/Student.js';

dotenv.config();

const sync = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const allEnrollments = await Enrollment.find({});
        console.log(`Found ${allEnrollments.length} total enrollments.`);

        let updatedStudentsCount = 0;
        let updatedCoursesTestCount = 0;

        for (const enrollment of allEnrollments) {
            // Sync Student.enrolledCourses
            const student = await Student.findOne({ userId: enrollment.studentId });
            if (student) {
                const alreadyEnrolled = student.enrolledCourses.find(c => c.courseId.toString() === enrollment.courseId.toString());
                if (!alreadyEnrolled) {
                    await Student.updateOne(
                        { userId: enrollment.studentId },
                        { $push: { enrolledCourses: { courseId: enrollment.courseId, status: enrollment.status } } }
                    );
                    updatedStudentsCount++;
                } else if (alreadyEnrolled.status !== enrollment.status) {
                    await Student.updateOne(
                        { userId: enrollment.studentId, "enrolledCourses.courseId": enrollment.courseId },
                        { $set: { "enrolledCourses.$.status": enrollment.status } }
                    );
                    updatedStudentsCount++;
                }
            }

            // Sync Course.testResults from submissions
            if (enrollment.submissions && enrollment.submissions.length > 0) {
                const course = await Course.findById(enrollment.courseId);
                if (course) {
                    let courseNeedsSave = false;
                    for (const sub of enrollment.submissions) {
                        // Skip if it's a Quiz (as quizzes might have different format)
                        if (sub.type === "Quiz") continue;

                        const existingTestResult = course.testResults.find(tr => tr.studentId.toString() === enrollment.studentId.toString() && tr.submissionPath === sub.filePath);
                        
                        if (!existingTestResult) {
                            course.testResults.push({
                                studentId: enrollment.studentId,
                                studentName: enrollment.studentDetails?.fullName || 'Student',
                                submissionPath: sub.filePath,
                                status: sub.status || 'Pending',
                                grade: sub.grade || '',
                                feedback: sub.feedback || '',
                                submittedAt: sub.submittedAt || new Date()
                            });
                            courseNeedsSave = true;
                            updatedCoursesTestCount++;
                        } else if (existingTestResult.status !== sub.status || existingTestResult.grade !== sub.grade) {
                            existingTestResult.status = sub.status || 'Pending';
                            existingTestResult.grade = sub.grade || '';
                            existingTestResult.feedback = sub.feedback || '';
                            courseNeedsSave = true;
                            updatedCoursesTestCount++;
                        }
                    }
                    if (courseNeedsSave) {
                        await course.save();
                    }
                }
            }
        }

        console.log(`Successfully synced! Updated ${updatedStudentsCount} student records and ${updatedCoursesTestCount} course test results.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

sync();
