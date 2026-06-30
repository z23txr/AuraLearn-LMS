import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { 
    FiFileText, FiCheckCircle, FiClock, FiSearch, 
    FiFilter, FiSave, FiExternalLink, FiLoader, 
    FiRefreshCw, FiChevronRight, FiChevronLeft, FiUser,
    FiBook, FiCheck, FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const GradingCenter = () => {
    const { searchQuery } = useOutletContext();
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    // View States
    // step 1: null (show courses)
    // step 2: courseId (show assignments for this course)
    // step 3: assignment grading mode (show sequential player)
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [gradingSession, setGradingSession] = useState(null); // { assignmentId, assignmentTitle, submissionsList, currentIndex }

    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const API_URL = import.meta.env.VITE_API_URL + "/";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const instructorId = user.id || user._id;
            
            // Fetch courses
            const courseRes = await axios.get(`${API_URL}api/courses`);
            const myCourses = courseRes.data.filter(c => c.instructor === instructorId);
            setCourses(myCourses);

            // Fetch enrollments
            const enrollRes = await axios.get(`${API_URL}api/enrollments/instructor/${instructorId}`);
            setEnrollments(enrollRes.data);

            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load grading data.");
            setLoading(false);
        }
    };

    // Calculate course stats
    const getCourseStats = (courseId) => {
        let totalSubmissions = 0;
        let pendingSubmissions = 0;

        const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
        courseEnrollments.forEach(enroll => {
            if (enroll.submissions) {
                enroll.submissions.forEach(sub => {
                    // Regular assignment submissions (exclude Quiz for manual grading, though tests can be included)
                    if (sub.type !== 'Quiz' && sub.assignmentId) {
                        totalSubmissions++;
                        if (sub.status === 'Pending') pendingSubmissions++;
                    }
                });
            }
        });

        // Also add Final Exam tests if any
        const course = courses.find(c => c._id === courseId);
        if (course && course.testResults) {
            course.testResults.forEach(test => {
                totalSubmissions++;
                if (test.status === 'Pending') pendingSubmissions++;
            });
        }

        return { totalSubmissions, pendingSubmissions };
    };

    const handleStartGrading = (course, assignmentId, title, isFinalExam = false) => {
        // Build list of submissions for this specific assignment across all enrollments
        const submissionsList = [];

        if (isFinalExam) {
            course.testResults?.forEach(test => {
                submissionsList.push({
                    isFinalExam: true,
                    studentId: test.studentId,
                    studentName: test.studentName || 'Student',
                    submissionPath: test.submissionPath,
                    submittedAt: test.submittedAt,
                    status: test.status,
                    grade: test.grade || '',
                    feedback: test.feedback || '',
                    courseId: course._id
                });
            });
        } else {
            const courseEnrollments = enrollments.filter(e => e.courseId === course._id);
            courseEnrollments.forEach(enroll => {
                const sub = enroll.submissions?.find(s => s.assignmentId === assignmentId && s.type !== 'Quiz');
                if (sub) {
                    submissionsList.push({
                        isFinalExam: false,
                        enrollmentId: enroll._id,
                        studentId: enroll.studentId?._id || enroll.studentId,
                        studentName: enroll.studentDetails?.fullName || enroll.studentId?.name || 'Student',
                        assignmentId: sub.assignmentId,
                        submissionPath: sub.filePath,
                        submittedAt: sub.submittedAt,
                        status: sub.status || 'Pending',
                        grade: sub.grade || '',
                        feedback: sub.feedback || '',
                        courseId: course._id
                    });
                }
            });
        }

        if (submissionsList.length === 0) {
            return toast.info("No submissions found for this assignment yet.");
        }

        // Start from the first pending if possible, else 0
        const firstPendingIdx = submissionsList.findIndex(s => s.status === 'Pending');
        
        setGradingSession({
            courseTitle: course.title,
            assignmentTitle: title,
            submissionsList,
            currentIndex: firstPendingIdx !== -1 ? firstPendingIdx : 0
        });
    };

    const handleSaveGradeAndNext = async (gradeVal, feedbackVal, statusVal) => {
        const currentSub = gradingSession.submissionsList[gradingSession.currentIndex];
        const toastId = toast.loading("Saving grade...");

        try {
            if (currentSub.isFinalExam) {
                await axios.put(`${API_URL}api/courses/grade-test`, {
                    courseId: currentSub.courseId,
                    studentId: currentSub.studentId,
                    grade: gradeVal,
                    feedback: feedbackVal,
                    status: statusVal
                }, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.put(`${API_URL}api/enrollments/grade-assignment`, {
                    enrollmentId: currentSub.enrollmentId,
                    assignmentId: currentSub.assignmentId,
                    grade: gradeVal,
                    feedback: feedbackVal,
                    status: statusVal
                }, { headers: { Authorization: `Bearer ${token}` } });
            }

            toast.update(toastId, { render: "Grade saved successfully!", type: "success", isLoading: false, autoClose: 2000 });

            // Update local state
            const updatedList = [...gradingSession.submissionsList];
            updatedList[gradingSession.currentIndex] = {
                ...currentSub,
                grade: gradeVal,
                feedback: feedbackVal,
                status: statusVal
            };

            setGradingSession(prev => ({
                ...prev,
                submissionsList: updatedList
            }));

            // Refresh global data in background
            fetchData();

            // Auto-advance to next pending submission
            const nextPendingIdx = updatedList.findIndex((s, idx) => idx > gradingSession.currentIndex && s.status === 'Pending');
            if (nextPendingIdx !== -1) {
                setGradingSession(prev => ({ ...prev, currentIndex: nextPendingIdx }));
            } else {
                // If no more pending ahead, just move to next if exists, or show complete
                if (gradingSession.currentIndex < updatedList.length - 1) {
                    setGradingSession(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
                } else {
                    toast.success("All submissions graded!");
                    setGradingSession(null); // exit session
                }
            }

        } catch (err) {
            toast.update(toastId, { render: "Failed to save grade.", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    // Rendering Views
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4 text-[#f1f5f9]">
                <FiLoader className="text-5xl text-[#a855f7] animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-[4px] text-[10px]">Synchronizing Submissions...</p>
            </div>
        );
    }

    if (gradingSession) {
        // STEP 3: SEQUENTIAL GRADING PLAYER
        const sub = gradingSession.submissionsList[gradingSession.currentIndex];
        
        return (
            <div className="p-4 sm:p-6 animate-in fade-in duration-500 min-h-screen">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 bg-[#1e293b]/50 p-6 rounded-[30px] border border-white/10 backdrop-blur-md">
                        <div>
                            <button onClick={() => setGradingSession(null)} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-2 transition-all">
                                ← Exit Grading Mode
                            </button>
                            <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">{gradingSession.assignmentTitle}</h2>
                            <p className="text-[#38bdf8] text-sm mt-1 uppercase tracking-widest font-black text-[10px]">{gradingSession.courseTitle}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black text-[#a855f7]">
                                {gradingSession.currentIndex + 1} <span className="text-xl text-slate-500">/ {gradingSession.submissionsList.length}</span>
                            </div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Submissions</p>
                        </div>
                    </div>

                    {/* Main Player Area */}
                    <div className="bg-[#0b0e14] border border-white/10 rounded-[40px] p-8 shadow-2xl relative">
                        <div className="flex flex-col lg:flex-row gap-8">
                            
                            {/* Left: Student Info & Document Preview */}
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a855f7] to-[#38bdf8] flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                        {sub.studentName?.charAt(0) || "S"}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white uppercase">{sub.studentName}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                            <FiClock /> Submitted: {new Date(sub.submittedAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="ml-auto">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'Passed' ? 'bg-green-500/20 text-green-500' : sub.status === 'Failed' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-[#1e293b]/30 p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center gap-4 min-h-[250px]">
                                    <FiFileText className="text-6xl text-slate-600" />
                                    <p className="text-slate-400 text-sm font-medium max-w-sm">The student has attached their submission file. Click below to view or download it.</p>
                                    <a 
                                        href={`${API_URL}${sub.submissionPath?.replace(/\\/g, '/')}`} 
                                        target="_blank" rel="noreferrer"
                                        className="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#38bdf8] hover:text-white transition-all shadow-lg"
                                    >
                                        <FiExternalLink /> View Submission File
                                    </a>
                                </div>
                            </div>

                            {/* Right: Grading Controls */}
                            <div className="w-full lg:w-[400px] bg-white/[0.02] p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <h4 className="text-white font-bold uppercase tracking-widest text-sm border-b border-white/5 pb-4">Evaluation</h4>
                                    
                                    <div className="space-y-2">
                                        <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Assign Grade</label>
                                        <input 
                                            id={`gradeInput-${sub.studentId}`}
                                            type="text"
                                            defaultValue={sub.grade}
                                            disabled={sub.status !== 'Pending'}
                                            placeholder="e.g. 85/100, A+"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#a855f7] disabled:opacity-50 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Feedback / Comments</label>
                                        <textarea 
                                            id={`feedbackInput-${sub.studentId}`}
                                            defaultValue={sub.feedback}
                                            disabled={sub.status !== 'Pending'}
                                            placeholder="Leave detailed feedback for the student..."
                                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-[#a855f7] disabled:opacity-50 transition-all resize-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    {sub.status === 'Pending' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => {
                                                    const grade = document.getElementById(`gradeInput-${sub.studentId}`).value;
                                                    const feedback = document.getElementById(`feedbackInput-${sub.studentId}`).value;
                                                    handleSaveGradeAndNext(grade || 'Passed', feedback, 'Passed');
                                                }}
                                                className="bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white border border-green-600/30 px-4 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                <FiCheck size={16} /> Mark Pass & Next
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const grade = document.getElementById(`gradeInput-${sub.studentId}`).value;
                                                    const feedback = document.getElementById(`feedbackInput-${sub.studentId}`).value;
                                                    handleSaveGradeAndNext(grade || 'Failed', feedback, 'Failed');
                                                }}
                                                className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 px-4 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                <FiX size={16} /> Mark Fail & Next
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            Already Evaluated
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Pagination Overlay (Desktop) / Footer (Mobile) */}
                        <div className="flex justify-between mt-8 lg:mt-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:left-0 lg:right-0 lg:w-full lg:pointer-events-none">
                            <button 
                                onClick={() => setGradingSession(prev => ({...prev, currentIndex: prev.currentIndex - 1}))}
                                disabled={gradingSession.currentIndex === 0}
                                className="w-12 h-12 rounded-full bg-[#1e293b] border border-white/10 text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a855f7] transition-all shadow-xl lg:pointer-events-auto lg:-ml-16"
                            >
                                <FiChevronLeft size={24} />
                            </button>

                            <button 
                                onClick={() => setGradingSession(prev => ({...prev, currentIndex: prev.currentIndex + 1}))}
                                disabled={gradingSession.currentIndex === gradingSession.submissionsList.length - 1}
                                className="w-12 h-12 rounded-full bg-[#1e293b] border border-white/10 text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#a855f7] transition-all shadow-xl lg:pointer-events-auto lg:-mr-16"
                            >
                                <FiChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedCourse) {
        // STEP 2: COURSE ASSIGNMENTS VIEW
        const course = courses.find(c => c._id === selectedCourse);
        
        // Build list of assignments that have submissions
        const assignmentsWithSubmissions = [];

        // 1. Regular Assignments
        course.assignments?.forEach(asn => {
            let total = 0;
            let pending = 0;
            const courseEnrollments = enrollments.filter(e => e.courseId === course._id);
            courseEnrollments.forEach(enroll => {
                const sub = enroll.submissions?.find(s => s.assignmentId === asn._id?.toString() && s.type !== 'Quiz');
                if (sub) {
                    total++;
                    if (sub.status === 'Pending') pending++;
                }
            });

            if (total > 0) {
                assignmentsWithSubmissions.push({
                    id: asn._id?.toString(),
                    title: asn.title,
                    total,
                    pending,
                    isFinalExam: false
                });
            }
        });

        // 2. Final Exam / Test Results
        if (course.testResults && course.testResults.length > 0) {
            let pending = course.testResults.filter(t => t.status === 'Pending').length;
            assignmentsWithSubmissions.push({
                id: 'final_exam',
                title: 'Final Examination',
                total: course.testResults.length,
                pending: pending,
                isFinalExam: true
            });
        }

        return (
            <div className="p-2 animate-in fade-in duration-500 font-['Poppins']">
                <button onClick={() => setSelectedCourse(null)} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-all flex items-center gap-2">
                    <FiChevronLeft /> Back to Courses
                </button>
                
                <div className="mb-10">
                    <h2 className="text-white text-3xl font-bold tracking-tight uppercase">{course.title}</h2>
                    <p className="text-[#a855f7] text-sm mt-1 uppercase tracking-[2px] font-bold text-[10px]">Select an assignment to start grading</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignmentsWithSubmissions.length > 0 ? assignmentsWithSubmissions.map((asn, idx) => (
                        <div key={idx} className="bg-[#1e293b]/40 backdrop-blur-md p-8 rounded-[35px] border border-white/5 hover:border-[#a855f7]/50 transition-all flex flex-col justify-between group shadow-xl">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#820ad4] text-white flex items-center justify-center mb-6 shadow-lg">
                                    <FiBook size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{asn.title}</h3>
                                <div className="flex gap-3 text-xs font-medium">
                                    <span className="bg-white/5 text-slate-300 px-3 py-1.5 rounded-lg border border-white/10">{asn.total} Total Submissions</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                {asn.pending > 0 ? (
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                            {asn.pending} Pending Review
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <FiCheckCircle />
                                            All Evaluated
                                        </span>
                                    </div>
                                )}

                                <button 
                                    onClick={() => handleStartGrading(course, asn.id, asn.title, asn.isFinalExam)}
                                    className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${asn.pending > 0 ? 'bg-[#a855f7] text-white hover:bg-[#820ad4] shadow-[0_5px_20px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                                >
                                    {asn.pending > 0 ? 'Start Grading' : 'Review Grades'}
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                            <FiSearch size={40} className="mb-4 opacity-50" />
                            <p className="font-black uppercase tracking-[3px] text-xs">No Submissions Yet</p>
                            <p className="text-[10px] text-slate-500 mt-2 max-w-sm text-center">Students have not submitted any assignments or final exams for this course yet.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // STEP 1: COURSES VIEW (Default)
    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-2 animate-in fade-in duration-700 font-['Poppins']">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-white text-3xl font-bold tracking-tight">Grading <span className="text-[#38bdf8]">Center</span></h2>
                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-[2px] font-bold text-[10px]">Aura Intelligence • Sequential Grading Mode</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="p-3.5 bg-white/5 text-slate-400 rounded-2xl hover:bg-[#a855f7] hover:text-white transition-all shadow-lg"
                    title="Refresh Data"
                >
                    <FiRefreshCw />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => {
                    const stats = getCourseStats(course._id);
                    return (
                        <div 
                            key={course._id} 
                            onClick={() => setSelectedCourse(course._id)}
                            className="bg-[#1e293b]/30 backdrop-blur-xl border border-white/5 rounded-[35px] p-8 cursor-pointer group hover:bg-[#1e293b]/60 hover:border-[#a855f7]/40 transition-all shadow-xl"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 text-[#38bdf8] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                    <FiFileText size={24} />
                                </div>
                                {stats.pending > 0 && (
                                    <span className="bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-bounce">
                                        {stats.pending}
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="text-white font-bold text-xl mb-1 group-hover:text-[#a855f7] transition-colors">{course.title}</h3>
                            <p className="text-[#38bdf8] text-[9px] uppercase font-black tracking-widest">{course.category}</p>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>{stats.totalSubmissions} Total</span>
                                {stats.pending === 0 && stats.totalSubmissions > 0 ? (
                                    <span className="text-green-500">All Graded</span>
                                ) : (
                                    <span>Submissions</span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filteredCourses.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-[3px] text-xs">
                        No courses found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradingCenter;