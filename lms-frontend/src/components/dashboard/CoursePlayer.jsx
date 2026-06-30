import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FiVideo, FiFileText, FiLayers, FiCheckCircle, FiArrowLeft, 
    FiMonitor, FiClipboard, FiExternalLink, FiLoader, FiStar, FiEye, FiDownload 
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const CoursePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeFile, setActiveFile] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);

    const PF = import.meta.env.VITE_API_URL + "/";
    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const token = localStorage.getItem('token')?.replace(/"/g, '');

    const fetchData = async () => {
        try {
            const courseRes = await axios.get(`${PF}api/courses/${id}`);
            const courseData = courseRes.data;
            setCourse(courseData);

            const enrollRes = await axios.get(`${PF}api/enrollments/student/${user.id || user._id}`);
            const current = enrollRes.data?.find(e => e.courseId && (e.courseId._id === id || e.courseId === id));
            setEnrollment(current || null);

            // Log view event
            const studentId = user.id || user._id;
            if (studentId && courseData._id && courseData.category) {
                axios.post(`${PF}api/courses/view`, {
                    userId: studentId,
                    courseId: courseData._id,
                    category: courseData.category
                }).catch(err => console.error("Error logging course view:", err));
            }
            setLoading(false);
        } catch (err) { 
            console.error(err);
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const formatUrl = (path) => {
        if (!path) return "";
        return `${PF}${path.replace(/\\/g, '/')}`;
    };

    const openInNewTab = (fileUrl) => {
        if (!fileUrl) return toast.error("File invalid");
        window.open(formatUrl(fileUrl), '_blank', 'noopener,noreferrer');
    };

    const downloadFile = async (fileUrl, fileName) => {
        if (!fileUrl) return toast.error("Download invalid");
        try {
            const toastId = toast.loading("Downloading...");
            const res = await axios.get(formatUrl(fileUrl), { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || "Resource";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.dismiss(toastId);
        } catch (err) {
            toast.error("Failed to download file");
        }
    };

    const getSubmissionData = (asnId) => {
        return enrollment?.submissions?.find(s => s.assignmentId === asnId || s.assignmentId?._id === asnId);
    };

    // --- CURRICULUM FLATTENING ---
    const curriculumSections = [];
    if (course?.videoLectures?.length > 0) {
        curriculumSections.push({
            id: 'lectures', title: 'Video Lectures', icon: <FiVideo />,
            steps: course.videoLectures.map(item => ({ ...item, type: 'video', id: item._id, url: item.filePath }))
        });
    }
    if (course?.pptSlides?.length > 0) {
        curriculumSections.push({
            id: 'slides', title: 'Presentations', icon: <FiMonitor />,
            steps: course.pptSlides.map(item => ({ ...item, type: 'ppt', id: item._id, url: item.filePath }))
        });
    }
    if (course?.pdfNotes?.length > 0) {
        curriculumSections.push({
            id: 'notes', title: 'Reading Materials', icon: <FiFileText />,
            steps: course.pdfNotes.map(item => ({ ...item, type: 'pdf', id: item._id, url: item.filePath }))
        });
    }
    const regularAssignments = course?.assignments?.filter(a => a.title !== "FINAL_EXAM") || [];
    if (regularAssignments.length > 0) {
        curriculumSections.push({
            id: 'assignments', title: 'Lab Tasks', icon: <FiClipboard />,
            steps: regularAssignments.map(item => ({ ...item, type: 'assignment', id: item._id, url: item.filePath }))
        });
    }
    const finalAssignment = course?.assignments?.find(a => a.title === "FINAL_EXAM");
    if (finalAssignment) {
        curriculumSections.push({
            id: 'final', title: 'Final Assessment', icon: <FiStar />,
            steps: [{ ...finalAssignment, type: 'final', id: finalAssignment._id, url: finalAssignment.filePath }]
        });
    }

    const allSteps = curriculumSections.flatMap(sec => sec.steps);

    // Auto-select first incomplete step or first step
    useEffect(() => {
        if (!activeFile && allSteps.length > 0 && enrollment) {
            const firstIncomplete = allSteps.find(s => !enrollment?.completedItems?.includes(s.id));
            setActiveFile(firstIncomplete || allSteps[0]);
        }
    }, [allSteps, activeFile, enrollment]);

    const handleFileClick = (step) => {
        setActiveFile(step);
        if (['pdf', 'ppt'].includes(step.type)) {
            downloadFile(step.url, step.title);
        }
        
        // Scroll to player area on mobile
        if (window.innerWidth < 1024) {
            setTimeout(() => {
                document.getElementById('main-player-area')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const handleMarkAsDone = async (itemId) => {
        if (enrollment?.completedItems?.includes(itemId)) return;
        const totalItems = allSteps.length;
        try {
            const res = await axios.post(`${PF}api/enrollments/update-progress`, { enrollmentId: enrollment._id, itemId, totalItems }, { headers: { Authorization: `Bearer ${token}` } });
            setEnrollment(prev => ({ ...prev, progress: res.data.progress, completedItems: res.data.completedItems }));
            toast.success("Progress Saved!");
            
            // Auto Advance to next step
            const currentIndex = allSteps.findIndex(s => s.id === itemId);
            if (currentIndex !== -1 && currentIndex < allSteps.length - 1) {
                setActiveFile(allSteps[currentIndex + 1]);
            }
        } catch (err) { toast.error("Sync Error"); }
    };

    const handleAssignmentSubmit = async (asnId) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const optimisticSub = { assignmentId: asnId, status: "Pending" };
            setEnrollment(prev => ({ ...prev, submissions: [...(prev.submissions || []), optimisticSub] }));
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('assignmentId', asnId);
            formData.append('enrollmentId', enrollment._id);

            const toastId = toast.loading("Syncing Submission...");
            try {
                const res = await axios.post(`${PF}api/enrollments/submit-assignment`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
                setEnrollment(res.data.enrollment);
                toast.update(toastId, { render: "Successfully Submitted!", type: "success", isLoading: false, autoClose: 2000 });
                
                // Auto advance
                const currentIndex = allSteps.findIndex(s => s.id === asnId);
                if (currentIndex !== -1 && currentIndex < allSteps.length - 1) {
                    setActiveFile(allSteps[currentIndex + 1]);
                }
            } catch (err) { fetchData(); toast.update(toastId, { render: "Error", type: "error", isLoading: false, autoClose: 2000 }); }
        };
        fileInput.click();
    };

    const handleFinalTestSubmit = async (asnId) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const optimisticSub = { assignmentId: asnId, status: "Pending" };
            setEnrollment(prev => ({ ...prev, submissions: [...(prev.submissions || []), optimisticSub] }));
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('assignmentId', asnId);
            formData.append('enrollmentId', enrollment._id);

            const formDataTest = new FormData();
            formDataTest.append('file', file);
            formDataTest.append('courseId', course._id);

            const toastId = toast.loading("Syncing Capstone Project...");
            try {
                const res = await axios.post(`${PF}api/enrollments/submit-assignment`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
                setEnrollment(res.data.enrollment);
                await axios.post(`${PF}api/courses/submit-test`, formDataTest, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });

                toast.update(toastId, { render: "Final Test Submitted Successfully!", type: "success", isLoading: false, autoClose: 2000 });
                fetchData();
            } catch (err) { 
                fetchData(); 
                toast.update(toastId, { render: "Error submitting final test", type: "error", isLoading: false, autoClose: 2000 }); 
            }
        };
        fileInput.click();
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-black"><FiLoader className="animate-spin text-[var(--accent-color,#a855f7)]" size={30} /></div>;

    if (!enrollment || enrollment.status !== 'Approved') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#05070a] text-white p-6 text-center font-['Poppins']">
                <div className="max-w-md w-full p-8 md:p-10 rounded-[40px] bg-[#0f172a]/60 backdrop-blur-[20px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
                    <div className="w-16 h-16 mx-auto bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center text-3xl animate-pulse">⚠️</div>
                    <h2 className="text-2xl font-black uppercase tracking-wider text-white">Access Restricted</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {enrollment?.status === 'Pending' 
                            ? "Your enrollment request is pending approval." 
                            : "You are not registered in this course."}
                    </p>
                    <button onClick={() => navigate('/student-dashboard')} className="w-full py-4 bg-[var(--accent-color,#a855f7)] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-[#080808] text-white font-sans overflow-y-auto lg:overflow-hidden">
            <style>{`*::-webkit-scrollbar { display: none !important; } * { -ms-overflow-style: none !important; scrollbar-width: none !important; }`}</style>
            
            {/* --- VERTICAL STEPPER SIDEBAR --- */}
            <aside id="curriculum-sidebar" className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r border-white/5 bg-black z-30 transition-all flex flex-col shrink-0">
                <div className="p-6 border-b border-white/5">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-[2px] mb-6">
                        <FiArrowLeft size={16}/> Back to Dashboard
                    </button>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-4 line-clamp-2 leading-relaxed">{course?.title}</h2>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Overall Progress</span>
                            <span className="text-[12px] font-black text-green-400">{enrollment?.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${enrollment?.progress || 0}%` }}></div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-2">
                    {curriculumSections.map((section) => (
                        <div key={section.id} className="mb-6">
                            <div className="flex items-center gap-3 px-4 mb-4 opacity-50">
                                {section.icon}
                                <h3 className="text-[10px] font-black uppercase tracking-[3px]">{section.title}</h3>
                            </div>
                            
                            <div className="relative px-2">
                                {/* Vertical Stepper Line */}
                                <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-white/5 z-0"></div>

                                <div className="space-y-1">
                                    {section.steps.map((step, idx) => {
                                        const isCompleted = enrollment?.completedItems?.includes(step.id);
                                        const isActive = activeFile?.id === step.id;
                                        
                                        return (
                                            <button 
                                                key={step.id}
                                                onClick={() => handleFileClick(step)}
                                                className={`w-full relative z-10 flex items-center gap-4 p-3 rounded-2xl transition-all text-left group
                                                    ${isActive ? 'bg-white/10 border border-white/10 shadow-lg' : 'hover:bg-white/5 border border-transparent'}
                                                `}
                                            >
                                                {/* Step Circle */}
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all
                                                    ${isCompleted 
                                                        ? 'bg-green-500 border-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                                                        : isActive 
                                                            ? 'border-white bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                                            : 'border-white/20 bg-[#0a0a0a] text-white/30 group-hover:border-white/40 group-hover:text-white/60'
                                                    }
                                                `}>
                                                    {isCompleted ? <FiCheckCircle size={14}/> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                                                </div>
                                                
                                                {/* Step Details */}
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className={`text-[11px] font-bold truncate tracking-wide ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                                                        {step.title}
                                                    </h4>
                                                    <span className={`text-[9px] uppercase tracking-widest ${isActive ? 'text-[var(--accent-color,#a855f7)]' : 'text-white/30'}`}>{step.type}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {allSteps.length === 0 && (
                        <div className="text-center p-6 text-white/20 text-[10px] uppercase tracking-widest font-black">
                            No Curriculum Found
                        </div>
                    )}
                </nav>
            </aside>

            {/* --- MAIN PLAYER AREA --- */}
            <main id="main-player-area" className="flex-1 overflow-y-auto bg-[#080808] p-4 lg:p-10 no-scrollbar flex flex-col">
                {activeFile ? (
                    <div className="max-w-5xl mx-auto w-full h-full flex flex-col space-y-6 lg:space-y-8 pb-20">
                        
                        {/* HEADER */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/[0.02] p-6 lg:p-8 rounded-[35px] border border-white/5 backdrop-blur-md gap-4 shrink-0 shadow-2xl">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-[var(--accent-color,#a855f7)]/10 text-[var(--accent-color,#a855f7)] rounded-full text-[9px] font-black uppercase tracking-widest border border-[var(--accent-color,#a855f7)]/20">
                                        {activeFile.type}
                                    </span>
                                    {enrollment?.completedItems?.includes(activeFile.id) && (
                                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20 flex items-center gap-1">
                                            <FiCheckCircle size={10}/> Completed
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => document.getElementById('curriculum-sidebar')?.scrollIntoView({ behavior: 'smooth' })} 
                                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <FiArrowLeft size={14}/> Back to List
                                    </button>
                                    <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">{activeFile.title}</h2>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {['video', 'pdf', 'ppt'].includes(activeFile.type) && (
                                    <button onClick={() => downloadFile(activeFile.url, activeFile.title)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5" title="Download">
                                        <FiDownload/>
                                    </button>
                                )}
                                
                                {['video', 'pdf', 'ppt', 'assignment', 'final'].includes(activeFile.type) && !enrollment?.completedItems?.includes(activeFile.id) && activeFile.type !== 'assignment' && activeFile.type !== 'final' && (
                                    <button onClick={() => handleMarkAsDone(activeFile.id)} className="px-8 py-4 bg-green-500 text-black text-[11px] font-black uppercase rounded-2xl hover:scale-105 hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all">
                                        Mark as Done
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* CONTENT RENDERER */}
                        <div className="flex-1 rounded-[40px] overflow-hidden bg-[#0c0c0c] border border-white/10 shadow-2xl relative min-h-[400px]">
                            {activeFile.type === 'video' && (
                                <video key={activeFile.url} controls className="w-full h-full object-contain bg-black">
                                    <source src={formatUrl(activeFile.url)} type="video/mp4" />
                                </video>
                            )}

                            {(activeFile.type === 'pdf' || activeFile.type === 'ppt') && (
                                <iframe 
                                    key={activeFile.url}
                                    src={`${formatUrl(activeFile.url)}#toolbar=0`} 
                                    className="w-full h-full min-h-[60vh] bg-white border-none" 
                                    title="Document Viewer"
                                />
                            )}

                            {activeFile.type === 'assignment' && (() => {
                                const sub = getSubmissionData(activeFile.id);
                                const isSubmitted = !!sub;
                                return (
                                    <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                                        <div className="w-20 h-20 bg-white/5 text-white/40 rounded-3xl flex items-center justify-center mb-6"><FiClipboard size={40}/></div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Lab Task Submission</h3>
                                        <p className="text-white/40 text-sm mb-8 max-w-md">Download the brief, complete your work, and upload your final file here for grading.</p>
                                        
                                        <div className="flex gap-4">
                                            <button onClick={() => openInNewTab(activeFile.filePath)} className="px-8 py-4 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/5">
                                                View Brief
                                            </button>
                                            <button 
                                                onClick={() => !isSubmitted && handleAssignmentSubmit(activeFile.id)} 
                                                disabled={isSubmitted} 
                                                className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isSubmitted ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white text-black hover:scale-105 shadow-xl'}`}
                                            >
                                                {isSubmitted ? 'Already Submitted' : 'Upload Work'}
                                            </button>
                                        </div>

                                        {isSubmitted && (
                                            <div className="mt-10 p-6 bg-white/5 rounded-[24px] border border-white/10 w-full max-w-md text-left">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[10px] font-black uppercase text-white/40">Status</span>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${sub.grade ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {sub.grade ? `Graded: ${sub.grade}` : 'Review Pending'}
                                                    </span>
                                                </div>
                                                {sub.feedback && (
                                                    <div className="text-xs text-slate-300 italic p-4 bg-black/40 rounded-xl border border-white/5">
                                                        "{sub.feedback}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {activeFile.type === 'final' && (() => {
                                const finalResult = course?.testResults?.find(r => r.studentId?.toString() === (user.id || user._id)?.toString());
                                const isSubmitted = !!getSubmissionData(activeFile.id);
                                return (
                                    <div className="h-full flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none">
                                            <FiStar size={400} />
                                        </div>
                                        <div className="w-24 h-24 bg-[var(--accent-color,#a855f7)]/10 text-[var(--accent-color,#a855f7)] rounded-[35px] flex items-center justify-center mb-8 relative z-10 border border-[var(--accent-color,#a855f7)]/20 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                                            <FiStar size={40}/>
                                        </div>
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4 relative z-10">Capstone Final Exam</h3>
                                        <p className="text-white/40 text-sm mb-10 max-w-lg relative z-10">This final assessment is mandatory for course completion and official certification. Review the brief carefully.</p>
                                        
                                        <div className="flex gap-4 relative z-10">
                                            <button onClick={() => openInNewTab(activeFile.filePath)} className="px-8 py-4 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/5">
                                                View Exam Brief
                                            </button>
                                            <button 
                                                onClick={() => !isSubmitted && handleFinalTestSubmit(activeFile.id)} 
                                                disabled={isSubmitted} 
                                                className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isSubmitted ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
                                            >
                                                {isSubmitted ? 'Exam Submitted' : 'Submit Final'}
                                            </button>
                                        </div>

                                        {finalResult && (
                                            <div className="mt-10 p-6 bg-white/5 rounded-[24px] border border-white/10 w-full max-w-md text-left relative z-10">
                                                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                                                    <span className="text-[10px] font-black uppercase text-white/40">Final Result</span>
                                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${finalResult.status === 'Passed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : finalResult.status === 'Failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                                        {finalResult.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm items-center">
                                                    <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Score / Grade</span>
                                                    <span className="font-black text-2xl text-white">{finalResult.grade ? `${finalResult.grade}%` : '--'}</span>
                                                </div>
                                                {finalResult.feedback && (
                                                    <div className="text-xs text-white/60 font-medium italic mt-4 p-4 bg-black/40 rounded-xl border border-white/5">
                                                        Feedback: "{finalResult.feedback}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                        <FiLayers size={80} className="mb-6"/>
                        <h2 className="text-2xl font-black uppercase tracking-widest">Select a Step</h2>
                        <p className="text-sm mt-2">Choose an item from the curriculum sidebar to begin.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoursePlayer;