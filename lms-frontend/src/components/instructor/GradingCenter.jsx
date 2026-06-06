import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { 
    FiFileText, FiCheckCircle, FiClock, FiSearch, 
    FiFilter, FiSave, FiExternalLink, FiLoader, 
    FiRefreshCw // 🚀 Yeh missing tha, isay add karein
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';

const GradingCenter = () => {
    const { searchQuery } = useOutletContext();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");

    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const API_URL = "http://localhost:5000/";

    useEffect(() => {
        fetchSubmissions();
    }, []);

    //  Fetch All Submissions Across All Instructor's Courses
    const fetchSubmissions = async () => {
        try {
            const instructorId = user.id || user._id;
            const res = await axios.get(`${API_URL}api/courses`);
            
            // Logic: Filter instructor's courses and extract testResults
            const allInstructorSubmissions = [];
            res.data.filter(course => course.instructor === instructorId).forEach(course => {
                if (course.testResults && course.testResults.length > 0) {
                    course.testResults.forEach(result => {
                        allInstructorSubmissions.push({
                            ...result,
                            courseTitle: course.title,
                            courseId: course._id
                        });
                    });
                }
            });

            setSubmissions(allInstructorSubmissions);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load submissions.");
            setLoading(false);
        }
    };

    //  Quick Grade Functionality
    const handleQuickGrade = async (sub, gradeValue) => {
        if (!gradeValue || gradeValue === sub.grade) return;

        try {
            const res = await axios.put(`${API_URL}api/courses/grade-test`, {
                courseId: sub.courseId,
                studentId: sub.studentId,
                grade: gradeValue,
                feedback: sub.feedback || "Automated grade sync.",
                status: parseInt(gradeValue) >= 50 ? 'Passed' : 'Failed'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state 
            setSubmissions(prev => prev.map(item => 
                (item.studentId === sub.studentId && item.courseId === sub.courseId) 
                ? { ...item, grade: gradeValue, status: parseInt(gradeValue) >= 50 ? 'Passed' : 'Failed' } 
                : item
            ));

            toast.success(`Grade assigned to ${sub.studentName}! `, { theme: "dark" });
        } catch (err) {
            toast.error("failed");
        }
    };

    //  Filter and Search Logic
    const filteredData = submissions.filter(s => 
        (s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         s.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterStatus === "All" ? true : s.status === filterStatus)
    );

    return (
        <div className="p-2 animate-in fade-in duration-700 font-['Poppins']">
            <ToastContainer />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-white text-3xl font-bold tracking-tight">Grading <span className="text-[#38bdf8]">Center</span></h2>
                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-[2px] font-bold text-[10px]">Aura Intelligence • Real-time Evaluation</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-[#a855f7] transition-all" />
                        <select 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-[#1e293b] text-white border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold outline-none focus:border-[#a855f7] appearance-none cursor-pointer transition-all shadow-lg"
                        >
                            <option value="All">All Submissions</option>
                            <option value="Pending">Pending Evaluation</option>
                            <option value="Passed">Passed Only</option>
                            <option value="Failed">Failed Only</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={fetchSubmissions}
                        className="p-3.5 bg-white/5 text-slate-400 rounded-2xl hover:bg-[#a855f7] hover:text-white transition-all shadow-lg"
                        title="Refresh Submissions"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <FiLoader className="text-5xl text-[#a855f7] animate-spin" />
                    <p className="text-slate-500 font-black uppercase tracking-[4px] text-[10px]">Synchronizing Cloud Data...</p>
                </div>
            ) : (
                <div className="bg-[#1e293b]/20 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-[3px]">
                                <tr>
                                    <th className="p-8">Student & Assessment</th>
                                    <th className="p-8">Course Module</th>
                                    <th className="p-8">Submission Date</th>
                                    <th className="p-8">Status</th>
                                    <th className="p-8 text-center">Quick Grade</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-300">
                                {filteredData.map((sub, idx) => (
                                    <tr key={`${sub.studentId}-${idx}`} className="border-b border-white/5 hover:bg-white/[0.03] transition-all group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#a855f7] group-hover:bg-gradient-to-br from-[#a855f7] to-[#38bdf8] group-hover:text-white transition-all shadow-inner">
                                                    <FiFileText size={22} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm tracking-tight uppercase">{sub.studentName}</div>
                                                    <div className="text-[10px] text-slate-500 font-medium">Final Exam Attempt</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className="bg-[#38bdf8]/10 text-[#38bdf8] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#38bdf8]/20">{sub.courseTitle}</span>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                <FiClock className="text-[#a855f7]" /> {new Date(sub.submittedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] ${sub.status === 'Passed' ? 'text-green-500' : sub.status === 'Failed' ? 'text-red-500' : 'text-orange-500'}`}>
                                                <div className={`w-2 h-2 rounded-full ${sub.status === 'Passed' ? 'bg-green-500' : sub.status === 'Failed' ? 'bg-red-500' : 'bg-orange-500 animate-pulse'}`}></div>
                                                {sub.status}
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <input 
                                                    type="number" 
                                                    placeholder="--"
                                                    defaultValue={sub.grade}
                                                    className="bg-[#0b0e14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white text-center w-20 outline-none focus:border-[#a855f7] transition-all font-bold placeholder:text-slate-700"
                                                    onBlur={(e) => handleQuickGrade(sub, e.target.value)}
                                                />
                                                <a 
                                                    href={`${API_URL}${sub.submissionPath?.replace(/\\/g, '/')}`} 
                                                    target="_blank" rel="noreferrer"
                                                    className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-[#a855f7] hover:bg-white/10 transition-all shadow-lg"
                                                    title="Evaluate Submission Paper"
                                                >
                                                    <FiExternalLink size={18} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredData.length === 0 && (
                            <div className="py-32 flex flex-col items-center gap-4 text-slate-600">
                                <FiSearch size={40} className="opacity-20" />
                                <div className="font-bold italic uppercase tracking-[4px] text-[10px]">
                                    Empty Archives • No records matching query
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradingCenter;