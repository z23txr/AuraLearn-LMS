import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    FiArrowLeft, FiAward, FiCheckSquare, FiPieChart, FiTrendingUp, 
    FiMapPin, FiPhone, FiSave, FiCpu, FiBookOpen, FiActivity, FiMessageSquare, FiExternalLink 
} from 'react-icons/fi';

const StudentInsight = ({ student, onBack }) => {
    const [activeTab, setActiveTab] = useState('academic');
    const [loading, setLoading] = useState(false);
    
   
    const [submissions, setSubmissions] = useState(student.testResults || []);

    const token = localStorage.getItem('token')?.replace(/"/g, '');

    
    const handleUpdate = async (studentId, updatedData) => {
        try {
            setLoading(true);
            const res = await axios.put(`http://localhost:5000/api/courses/grade-test`, {
                courseId: student.courseId,
                studentId: studentId,
                grade: updatedData.grade,
                feedback: updatedData.feedback,
                status: updatedData.grade >= 50 ? 'Passed' : 'Failed' // Auto-pass logic
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Update Successfully");
            
            
            setSubmissions(prev => prev.map(s => s.studentId === studentId ? { ...s, ...updatedData } : s));
        } catch (err) {
            toast.error("Updation Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-right duration-700 font-['Poppins'] text-slate-200">
            {/* --- Top Header Navigation --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-[#1e293b]/20 p-6 rounded-[35px] border border-white/5">
                <div className="flex items-center gap-5">
                    <button onClick={onBack} className="w-12 h-12 bg-[#a855f7]/10 rounded-2xl text-[#a855f7] flex items-center justify-center hover:bg-[#a855f7] hover:text-white transition-all shadow-lg">
                        <FiArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-white text-2xl font-bold tracking-tight">{student.studentDetails?.fullName || "Student Name"}</h2>
                        <p className="text-[#38bdf8] text-[10px] font-black uppercase tracking-[3px] italic">{student.regNumber || "AURA-786"}</p>
                    </div>
                </div>
                
                <div className="flex bg-[#0b0e14] p-1.5 rounded-2xl border border-white/5">
                    {['academic', 'submissions'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#a855f7] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 pb-24">
                
                {/* --- Left Content Area --- */}
                <div className="space-y-8">
                    
                    {activeTab === 'academic' ? (
                        <>
                            {/* Performance  */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'LAST GRADE', val: submissions[0]?.grade ? `${submissions[0].grade}%` : 'N/A', icon: <FiAward />, color: 'text-yellow-500' },
                                    { label: 'COURSE PROGRESS', val: student.progress || '0%', icon: <FiActivity />, color: 'text-[#a855f7]' },
                                    { label: 'STATUS', val: student.status || 'Active', icon: <FiCheckSquare />, color: 'text-green-500' },
                                    { label: 'ASSIGNMENTS', val: `${student.completedTasks || 0}/1`, icon: <FiTrendingUp />, color: 'text-[#38bdf8]' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-[#1e293b]/40 border border-white/5 p-6 rounded-[30px] text-center backdrop-blur-md">
                                        <div className={`${stat.color} mb-2 flex justify-center text-xl`}>{stat.icon}</div>
                                        <div className="text-2xl font-bold text-white tracking-tighter">{stat.val}</div>
                                        <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Skills Section */}
                            <div className="bg-[#1e293b]/40 border border-white/5 rounded-[40px] p-10">
                                <h3 className="text-white font-bold mb-8 flex items-center gap-3 italic">
                                    <FiCpu className="text-[#a855f7]"/> Verified Skill Matrix
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {['Course Completion', 'Assessment Score', 'Platform Activity', 'Peer Feedback'].map((skill, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                                <span className="text-slate-300">{skill}</span>
                                                <span className="text-[#38bdf8]">{student.progress || '25%'}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#38bdf8]" style={{ width: student.progress || '25%' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Submissions & Feedback Logic */
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {submissions.length > 0 ? submissions.map((sub, idx) => (
                                <div key={idx} className="bg-[#1e293b]/40 border border-white/5 rounded-[32px] p-8 group hover:border-[#a855f7]/30 transition-all">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-[#0b0e14] rounded-2xl flex items-center justify-center text-[#38bdf8] shadow-inner">
                                                <FiBookOpen size={24}/>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold tracking-tight uppercase text-sm">FINAL ASSESSMENT SUBMISSION</h4>
                                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">
                                                    Status: <span className={sub.status === 'Passed' ? 'text-green-500' : 'text-yellow-500'}>{sub.status}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            {/* View Paper Link */}
                                            <a 
                                                href={`http://localhost:5000/${sub.submissionPath}`} 
                                                target="_blank" rel="noreferrer"
                                                className="p-3.5 bg-[#1e293b] text-[#a855f7] rounded-xl border border-white/5 hover:bg-[#a855f7] hover:text-white transition-all"
                                                title="View Submitted Paper"
                                            >
                                                <FiExternalLink size={20} />
                                            </a>

                                            <div className="relative flex-1 md:flex-none">
                                                <input 
                                                    type="number" 
                                                    placeholder="Grade"
                                                    defaultValue={sub.grade}
                                                    className="w-full md:w-24 bg-[#0b0e14] border border-white/10 rounded-xl px-4 py-3 text-sm text-center text-white focus:border-[#a855f7] outline-none transition-all font-bold"
                                                    onBlur={(e) => handleUpdate(sub.studentId, { grade: e.target.value, feedback: sub.feedback })}
                                                />
                                            </div>
                                            <button 
                                                className="p-3.5 bg-[#a855f7] text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                                onClick={() => handleUpdate(sub.studentId, { grade: sub.grade, feedback: sub.feedback })}
                                            >
                                                <FiSave size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Instructor Feedback Box */}
                                    <div className="mt-6 relative">
                                        <FiMessageSquare className="absolute left-4 top-4 text-slate-600" />
                                        <textarea 
                                            placeholder="Leave detailed feedback for the student..."
                                            defaultValue={sub.feedback}
                                            className="w-full bg-[#0b0e14]/50 border border-white/5 rounded-2xl p-4 pl-12 text-xs text-slate-400 outline-none focus:border-[#38bdf8]/30 transition-all min-h-[80px] resize-none"
                                            onBlur={(e) => handleUpdate(sub.studentId, { grade: sub.grade, feedback: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                                    <p className="text-slate-500 italic">No submissions found for this student.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- Right Sidebar--- */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-b from-[#1e293b] to-[#0b0e14] border border-white/5 p-10 rounded-[50px] text-center shadow-2xl sticky top-10">
                        <div className="relative inline-block mb-8">
                            <div className="w-28 h-28 rounded-[35px] bg-[#a855f7] flex items-center justify-center text-4xl font-black text-white shadow-[0_20px_40px_rgba(168,85,247,0.3)] uppercase">
                                {student.studentDetails?.fullName?.charAt(0) || "S"}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#38bdf8] rounded-2xl border-4 border-[#0b0e14] flex items-center justify-center text-white shadow-lg">
                                <FiCpu size={18} />
                            </div>
                        </div>

                        <h3 className="text-white text-xl font-bold mb-2 tracking-tight">{student.studentDetails?.fullName}</h3>
                        <p className="text-[#38bdf8] text-[10px] font-black uppercase tracking-[3px] mb-8 italic">{student.courseTitle}</p>

                        <div className="space-y-5 text-left bg-white/5 p-6 rounded-[30px] border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl text-slate-500"><FiMapPin /></div>
                                <span className="text-xs text-slate-300 font-medium">{student.studentDetails?.city || "Unknown City"}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl text-slate-500"><FiPhone /></div>
                                <span className="text-xs text-slate-300 font-medium">{student.studentDetails?.contact || "N/A"}</span>
                            </div>
                        </div>

                        <div className="mt-8 px-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">
                                <span>Batch Efficiency</span>
                                <span className="text-[#a855f7]">Superior</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#38bdf8]" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentInsight;