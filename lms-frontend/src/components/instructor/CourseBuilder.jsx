// ====================================Imports-====================================

import React, { useState } from 'react';
import axios from 'axios';
import { 
    FiVideo, FiFileText, FiPlus, FiArrowLeft, FiUploadCloud, 
    FiClock, FiCheckCircle, FiUserCheck, FiExternalLink, FiLock, FiFile 
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

// ==============================component=====================================

const CourseBuilder = ({ course, onBack, refreshData }) => {

// ===================================States==============================================
    const [activeTab, setActiveTab] = useState('videoLectures');
    const [loading, setLoading] = useState(false);
    const [material, setMaterial] = useState({ title: '', file: null, deadline: '' });
    
    //===================================  Dynamic states =======================================

    const [courseStatus, setCourseStatus] = useState(course.status || 'In Progress');
    const [testSubmissions, setTestSubmissions] = useState(course.testResults || []);

    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const isLocked = courseStatus === 'Completed';

    // Finalize Course Logic 
    const handleFinishCourse = async () => {
        const { value: file } = await Swal.fire({
            title: 'Finalize Course',
            text: "Upload the Final Exam PDF to lock this course for students.",
            input: 'file',
            inputAttributes: { 'accept': '.pdf', 'aria-label': 'Upload exam' },
            showCancelButton: true,
            confirmButtonText: 'Upload & Finalize',
            confirmButtonColor: '#a855f7',
        });

        if (file) {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', "FINAL_EXAM");
            formData.append('section', 'assignments');

            try {
                // Upload Exam File
                await axios.patch(`http://localhost:5000/api/courses/add-material/${course._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });

                //  Mark Complete in Database
                await axios.patch(`http://localhost:5000/api/courses/complete/${course._id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                //  UPDATE
                setCourseStatus('Completed'); 
                if(refreshData) refreshData(); 
                toast.success("Course Finalized & Locked!");
            } catch (err) {
                toast.error("Failed to finalize.");
            } finally {
                setLoading(false);
            }
        }
    };

    //  Normal Material Upload
    const handleUpload = async () => {
        if (isLocked) return toast.error("Course is locked.");
        if (!material.title || !material.file) return toast.warning("Title and file required!");
        
        setLoading(true);
        const formData = new FormData();
        formData.append('file', material.file);
        formData.append('title', material.title);
        formData.append('section', activeTab); 

        try {
            const uploadToastId = toast.loading("Updating...");
            await axios.patch(`http://localhost:5000/api/courses/add-material/${course._id}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            toast.update(uploadToastId, { render: "Updated Successfully!", type: "success", isLoading: false, autoClose: 3000 });
            setMaterial({ title: '', file: null });
            if(refreshData) refreshData();
        } catch (err) {
            toast.error("Upload failed.");
        } finally { setLoading(false); }
    };

    //  Grading Students Logic
    const handleGrade = async (studentId, status, grade) => {
        try {
            await axios.put(`http://localhost:5000/api/courses/grade-test`, {
                courseId: course._id, studentId, status, grade
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            toast.success(`Student ${status}!`);
            setTestSubmissions(prev => prev.map(s => s.studentId === studentId ? { ...s, status, grade } : s));
        } catch (err) { toast.error("Grading failed."); }
    };

    return (
        <div className="h-screen flex flex-col bg-[#0b0e14] text-[#f1f5f9] font-sans overflow-hidden">
            <ToastContainer  position="top-center" />

            {/* Header */}
            <header className="px-10 py-[15px] bg-[#1e293b]/70 backdrop-blur-[12px] border-b border-white/10 flex justify-between items-center shadow-2xl z-10">
                <button onClick={onBack} className="flex items-center gap-2 border border-[#a855f7] text-[#a855f7] px-4 py-2 rounded-xl font-bold transition-all hover:bg-[#a855f7] hover:text-white">
                    <FiArrowLeft /> Back
                </button>
                
                <div className="flex items-center gap-4">
                    <div className="text-[#cbd5e1] bg-[#0f172a]/60 px-5 py-2.5 rounded-2xl text-sm border border-white/5 flex items-center gap-3">
                        {isLocked ? <FiLock className="text-red-500 animate-pulse" /> : <FiCheckCircle className="text-green-500" />}
                        Editing: <b className="text-white">{course.title}</b>
                    </div>
                    {!isLocked && (
                        <button onClick={handleFinishCourse} disabled={loading} className="bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                            <FiFile /> Finish Course
                        </button>
                    )}
                </div>
            </header>

            {/* Content Area */}
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-[280px] bg-[#0f172a] p-[30px_15px] border-r border-white/5 flex flex-col gap-3">
                    {[
                        { id: 'videoLectures', label: 'Video Lectures', icon: <FiVideo /> },
                        { id: 'pdfNotes', label: 'PDF Notes', icon: <FiFileText /> },
                        { id: 'pptSlides', label: 'PPT Slides', icon: <FiFileText /> },
                        { id: 'assignments', label: 'Assignments', icon: <FiPlus /> },
                        { id: 'gradingPanel', label: 'Grading Panel', icon: <FiUserCheck /> }
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            className={`flex items-center gap-[15px] p-[15px] text-left rounded-2xl font-semibold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-[#a855f7] text-white shadow-lg' 
                                : 'text-[#94a3b8] hover:bg-[#a855f71a] hover:text-white'
                            }`} 
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Main section  */}
                <main className="flex-1 p-[60px] flex justify-center items-start overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

                    {activeTab !== 'gradingPanel' ? (
                        <div className={`bg-[#1e293b]/40 backdrop-blur-[10px] p-10 rounded-[35px] w-full max-w-[550px] border border-white/10 shadow-2xl transition-all ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                            <h3 className="text-2xl mb-8 text-[#f8fafc] font-bold flex items-center gap-3 italic tracking-tighter uppercase">
                                {isLocked ? <FiLock className="text-red-500" /> : <FiPlus className="text-[#a855f7]" />} 
                                Add {activeTab.replace(/([A-Z])/g, ' $1')}
                            </h3>
                            
                            <fieldset disabled={isLocked} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[#94a3b8] text-[0.8rem] font-bold uppercase ml-1 tracking-widest">Title</label>
                                    <input 
                                        type="text" 
                                        placeholder={isLocked ? "LOCKED" : "Enter Title"} 
                                        className="w-full bg-[#0b0e14] border border-[#334155] text-white p-4 rounded-2xl outline-none focus:border-[#a855f7] transition-all"
                                        value={material.title} 
                                        onChange={(e) => setMaterial({...material, title: e.target.value})} 
                                    />
                                </div>

                                <label htmlFor={isLocked ? "" : "file-up"} className={`flex flex-col items-center gap-4 border-2 border-dashed border-[#475569] p-[50px_20px] text-center rounded-[30px] transition-all ${isLocked ? 'bg-slate-900/40' : 'cursor-pointer hover:border-[#a855f7] hover:bg-[#a855f70a]'}`}>
                                    <FiUploadCloud size={48} className={isLocked ? "text-slate-700" : "text-[#a855f7]"} /> 
                                    <span className="text-[#94a3b8] font-bold">{material.file ? material.file.name : isLocked ? "No Access" : "Select File"}</span>
                                    {!isLocked && <input type="file" id="file-up" hidden onChange={(e) => setMaterial({...material, file: e.target.files[0]})} />}
                                </label>

                                <button 
                                    className={`w-full p-4 text-white rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all ${isLocked ? 'bg-slate-800' : 'bg-[#a855f7] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95'}`}
                                    onClick={handleUpload} 
                                    disabled={loading || isLocked}
                                >
                                    {isLocked ? "READ ONLY" : loading ? "Publishing..." : `Publish ${activeTab}`}
                                </button>
                            </fieldset>
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl bg-[#1e293b]/30 p-10 rounded-[40px] border border-white/5 shadow-2xl">
                            <h3 className="text-3xl font-black mb-10 tracking-tight">Evaluations</h3>
                            {testSubmissions.length > 0 ? (
                                <div className="grid gap-5">
                                    {testSubmissions.map((sub, idx) => (
                                        <div key={idx} className="bg-[#0b0e14]/60 p-6 rounded-[28px] border border-white/5 flex justify-between items-center hover:border-[#a855f740] transition-all group">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#38bdf8] flex items-center justify-center text-white font-black text-xl shadow-lg">
                                                    {sub.studentName?.charAt(0) || "S"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{sub.studentName || "Aura Student"}</p>
                                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${sub.status === 'Passed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{sub.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <a href={`http://localhost:5000/${sub.submissionPath}`} target="_blank" rel="noreferrer" className="p-4 bg-[#1e293b] rounded-2xl text-[#a855f7] border border-white/5 hover:bg-[#a855f7] hover:text-white transition-all"><FiExternalLink size={20} /></a>
                                                {sub.status === 'Pending' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleGrade(sub.studentId, 'Passed', 80)} className="bg-green-600/20 text-green-500 border border-green-600/30 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-green-600 hover:text-white transition-all">Accept</button>
                                                        <button onClick={() => handleGrade(sub.studentId, 'Failed', 30)} className="bg-red-600/20 text-red-500 border border-red-600/30 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Reject</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px] text-slate-700 italic font-bold uppercase tracking-widest text-xs">No records found.</div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseBuilder;