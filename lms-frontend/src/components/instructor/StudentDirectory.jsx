import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiUsers, FiTrendingUp, FiActivity, FiAlertTriangle, 
    FiAward, FiTarget, FiBarChart2, FiLoader, FiEye 
} from 'react-icons/fi';
import StudentInsight from './StudentInsight';

const ClassAnalyticsHub = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');

    useEffect(() => {
        fetchInstructorStudents();
    }, []);

    const fetchInstructorStudents = async () => {
        try {
            const instructorId = user.id || user._id;
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/enrollments/instructor/${instructorId}`);
            
            // Only consider approved enrollments for analytics
            setEnrollments(res.data.filter(s => s.status === 'Approved'));
            setLoading(false);
        } catch (err) {
            console.error("Error loading analytics data", err);
            setLoading(false);
        }
    };

    // Calculate Analytics
    const totalStudents = enrollments.length;

    // Average Progress
    const avgProgress = totalStudents > 0 
        ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalStudents)
        : 0;

    // Average Grade
    let totalGrades = 0;
    let gradeCount = 0;
    enrollments.forEach(enroll => {
        if (enroll.submissions && enroll.submissions.length > 0) {
            enroll.submissions.forEach(sub => {
                const numericGrade = parseFloat(sub.grade);
                if (!isNaN(numericGrade)) {
                    totalGrades += numericGrade;
                    gradeCount++;
                }
            });
        }
    });
    const avgGrade = gradeCount > 0 ? Math.round(totalGrades / gradeCount) : 0;

    // Calculate individual student average grade for sorting
    const getStudentAvgGrade = (enroll) => {
        if (!enroll.submissions || enroll.submissions.length === 0) return 0;
        let sum = 0, count = 0;
        enroll.submissions.forEach(sub => {
            const g = parseFloat(sub.grade);
            if (!isNaN(g)) { sum += g; count++; }
        });
        return count > 0 ? Math.round(sum / count) : 0;
    };

    // Top Performers (Sort by progress then grade)
    const sortedPerformers = [...enrollments].sort((a, b) => {
        if ((b.progress || 0) !== (a.progress || 0)) {
            return (b.progress || 0) - (a.progress || 0);
        }
        return getStudentAvgGrade(b) - getStudentAvgGrade(a);
    });
    const topPerformers = sortedPerformers.slice(0, 3);

    // Needs Attention (Progress < 25% or low grades)
    const atRiskStudents = sortedPerformers.filter(e => (e.progress || 0) < 25).slice(0, 4);

    // Course Breakdown
    const courseStatsMap = {};
    enrollments.forEach(enroll => {
        if (!courseStatsMap[enroll.courseTitle]) {
            courseStatsMap[enroll.courseTitle] = { totalProgress: 0, count: 0 };
        }
        courseStatsMap[enroll.courseTitle].totalProgress += (enroll.progress || 0);
        courseStatsMap[enroll.courseTitle].count++;
    });

    const courseBreakdown = Object.keys(courseStatsMap).map(title => ({
        title,
        avgProgress: Math.round(courseStatsMap[title].totalProgress / courseStatsMap[title].count),
        studentsCount: courseStatsMap[title].count
    })).sort((a, b) => b.avgProgress - a.avgProgress);


    if (selectedStudent) {
        return <StudentInsight student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4 text-[#f1f5f9]">
                <FiLoader className="text-5xl text-[#a855f7] animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-[4px] text-[10px]">Processing Analytics...</p>
            </div>
        );
    }

    return (
        <div className="p-2 sm:p-4 animate-in fade-in duration-500 font-['Poppins']">
            <div className="mb-10">
                <h2 className="text-white text-3xl font-bold tracking-tight">Performance <span className="text-[#38bdf8]">Analytics</span></h2>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-[2px] font-bold text-[10px]">Aura Intelligence • Class Overview Hub</p>
            </div>

            {/* --- TOP 4 DASHBOARD CARDS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-6 rounded-[30px] flex items-center gap-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
                        <FiUsers size={100} />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#a855f7] to-[#820ad4] flex items-center justify-center text-white shadow-lg">
                        <FiUsers size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Active Students</div>
                        <div className="text-3xl font-bold text-white">{totalStudents}</div>
                    </div>
                </div>

                <div className="bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-6 rounded-[30px] flex items-center gap-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
                        <FiTarget size={100} />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#0284c7] flex items-center justify-center text-white shadow-lg">
                        <FiTarget size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Avg Progress</div>
                        <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                            {avgProgress} <span className="text-base text-[#38bdf8]">%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-6 rounded-[30px] flex items-center gap-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
                        <FiAward size={100} />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#0284c7] flex items-center justify-center text-white shadow-lg">
                        <FiAward size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Avg Grade Score</div>
                        <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                            {avgGrade > 0 ? avgGrade : '--'} <span className="text-base text-[#38bdf8]">%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-6 rounded-[30px] flex items-center gap-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
                        <FiAlertTriangle size={100} />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#a855f7] to-[#820ad4] flex items-center justify-center text-white shadow-lg">
                        <FiAlertTriangle size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Needs Attention</div>
                        <div className="text-3xl font-bold text-[#a855f7]">{atRiskStudents.length}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- TOP PERFORMERS --- */}
                <div className="bg-[#1e293b]/30 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl relative">
                    <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                        <FiTrendingUp className="text-[#a855f7]" /> Top Performers Leaderboard
                    </h3>
                    
                    {topPerformers.length > 0 ? (
                        <div className="space-y-4">
                            {topPerformers.map((student, idx) => (
                                <div key={student._id} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-[25px] hover:bg-white/[0.05] transition-all cursor-pointer" onClick={() => setSelectedStudent(student)}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-lg ${idx === 0 ? 'bg-gradient-to-br from-[#38bdf8] to-[#0284c7]' : idx === 1 ? 'bg-gradient-to-br from-[#a855f7] to-[#820ad4]' : 'bg-gradient-to-br from-slate-300 to-slate-500'}`}>
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold text-sm tracking-tight">{student.studentDetails?.fullName}</h4>
                                        <p className="text-[#38bdf8] text-[9px] font-black uppercase tracking-widest">{student.courseTitle}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-bold text-sm">{Math.min(student.progress || 0, 100)}%</div>
                                        <div className="text-slate-500 text-[10px] uppercase font-bold">Progress</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 italic text-sm border-2 border-dashed border-white/10 rounded-3xl">Not enough data to calculate top performers.</div>
                    )}
                </div>

                {/* --- COURSE PERFORMANCE BREAKDOWN --- */}
                <div className="bg-[#1e293b]/30 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl relative">
                    <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                        <FiBarChart2 className="text-[#38bdf8]" /> Course Breakdown
                    </h3>

                    {courseBreakdown.length > 0 ? (
                        <div className="space-y-6">
                            {courseBreakdown.map((course, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="text-white font-bold text-sm tracking-tight">{course.title}</h4>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{course.studentsCount} Students Enrolled</p>
                                        </div>
                                        <div className="text-white font-bold">{Math.min(course.avgProgress || 0, 100)}%</div>
                                    </div>
                                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className="h-full bg-gradient-to-r from-[#a855f7] to-[#38bdf8] relative"
                                            style={{ width: `${Math.min(course.avgProgress || 0, 100)}%` }}
                                        >
                                            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 italic text-sm border-2 border-dashed border-white/10 rounded-3xl">No active courses found.</div>
                    )}
                </div>

                {/* --- NEEDS ATTENTION --- */}
                <div className="col-span-1 lg:col-span-2 bg-[#1e293b]/30 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl relative mt-4">
                    <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                        <FiActivity className="text-[#a855f7]" /> Needs Attention Roster
                    </h3>

                    {atRiskStudents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {atRiskStudents.map((student) => (
                                <div key={student._id} className="bg-[#a855f7]/5 border border-[#a855f7]/20 p-5 rounded-3xl group">
                                    <h4 className="text-white font-bold text-sm tracking-tight mb-1">{student.studentDetails?.fullName}</h4>
                                    <p className="text-[#38bdf8] text-[10px] uppercase font-bold tracking-widest mb-4 line-clamp-1">{student.courseTitle}</p>
                                    
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-white font-bold text-lg">{Math.min(student.progress || 0, 100)}%</span>
                                        <span className="text-[#a855f7] text-[10px] uppercase font-black tracking-widest bg-[#a855f7]/10 px-2 py-0.5 rounded-md">Review</span>
                                    </div>
                                    
                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-5">
                                        <div className="h-full bg-[#a855f7]" style={{ width: `${Math.min(student.progress || 0, 100)}%` }}></div>
                                    </div>

                                    <button 
                                        onClick={() => setSelectedStudent(student)}
                                        className="w-full py-2 bg-white/5 hover:bg-[#a855f7] text-slate-300 hover:text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2"
                                    >
                                        <FiEye /> View Profile
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest">
                            <FiAward size={18} /> Excellent! All students are performing well and on track.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClassAnalyticsHub;