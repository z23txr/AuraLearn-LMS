import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FiVideo, FiFileText, FiLayers, FiCheckCircle, FiArrowLeft, 
    FiMonitor, FiClipboard, FiExternalLink, FiLoader, FiStar, FiEye, FiDownload 
} from 'react-icons/fi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CoursePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeFile, setActiveFile] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [activeTab, setActiveTab] = useState('curriculum'); 
    const [loading, setLoading] = useState(true);

    const PF = "http://localhost:5000/";
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

            // Log view event to recommendation system
            const studentId = user.id || user._id;
            if (studentId && courseData._id && courseData.category) {
                axios.post(`${PF}api/courses/view`, {
                    userId: studentId,
                    courseId: courseData._id,
                    category: courseData.category
                }).catch(err => console.error("Error logging course view:", err));
            }

            if (!activeFile) {
                if (courseData.videoLectures?.length > 0) {
                    const first = courseData.videoLectures[0];
                    setActiveFile({ type: 'video', url: first.filePath, title: first.title, id: first._id });
                } else if (courseData.pdfNotes?.length > 0) {
                    const first = courseData.pdfNotes[0];
                    setActiveFile({ type: 'pdf', url: first.filePath, title: first.title, id: first._id });
                }
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

    const downloadFile = (fileUrl, fileName) => {
        if (!fileUrl) return toast.error("Download invalid");
        const link = document.createElement('a');
        link.href = formatUrl(fileUrl);
        link.download = fileName || "Resource";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getSubmissionData = (asnId) => {
        return enrollment?.submissions?.find(s => s.assignmentId === asnId || s.assignmentId?._id === asnId);
    };

    const handleMarkAsDone = async (itemId) => {
        if (enrollment?.completedItems?.includes(itemId)) return;
        const totalItems = (course?.videoLectures?.length || 0) + (course?.pdfNotes?.length || 0) + (course?.pptSlides?.length || 0) + (course?.assignments?.length || 0);
        try {
            const res = await axios.post(`${PF}api/enrollments/update-progress`, { enrollmentId: enrollment._id, itemId, totalItems }, { headers: { Authorization: `Bearer ${token}` } });
            setEnrollment(prev => ({ ...prev, progress: res.data.progress, completedItems: res.data.completedItems }));
            toast.success("Progress Saved!");
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
            } catch (err) { fetchData(); toast.update(toastId, { render: "Error", type: "error", isLoading: false, autoClose: 2000 }); }
        };
        fileInput.click();
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-black"><FiLoader className="animate-spin text-white" size={30} /></div>;

    // Check enrollment and approval status before displaying materials
    if (!enrollment || enrollment.status !== 'Approved') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#05070a] text-white p-6 text-center font-['Poppins']">
                <ToastContainer position="top-center" />
                <div className="max-w-md w-full p-8 md:p-10 rounded-[40px] bg-[#0f172a]/60 backdrop-blur-[20px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
                    <div className="w-16 h-16 mx-auto bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center text-3xl animate-pulse">
                        ⚠️
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-wider text-white">Access Restricted</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {enrollment?.status === 'Pending' 
                            ? "Your enrollment request for this course is currently pending approval. You will be able to access the study material once the instructor approves your registration." 
                            : "You are not registered in this course. Please head to the Explore Library page to enroll first!"}
                    </p>
                    <button 
                        onClick={() => navigate('/student-dashboard')}
                        className="w-full py-4 bg-gradient-to-r from-[#38bdf8] to-[#2563eb] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const regularAssignments = course?.assignments?.filter(a => a.title !== "FINAL_EXAM");
    const finalAssignment = course?.assignments?.find(a => a.title === "FINAL_EXAM");

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-[#080808] text-white font-sans overflow-hidden">
            <style>{`*::-webkit-scrollbar { display: none !important; } * { -ms-overflow-style: none !important; scrollbar-width: none !important; }`}</style>
            <ToastContainer  position="top-center" />
            
            {/* --- SIDEBAR --- */}
            <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 bg-black z-30 transition-all flex flex-col shrink-0">
                <div className="p-6 border-b border-white/5 lg:border-none">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-purple-400 transition-all uppercase tracking-[2px] mb-6">
                        <FiArrowLeft size={16}/> Back
                    </button>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-4 line-clamp-1">{course?.title}</h2>
                    <div className="bg-white/5 p-3 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase text-white/30">Course Progress</span>
                            <span className="text-[10px] font-black text-purple-400">{enrollment?.progress || 0}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${enrollment?.progress || 0}%` }}></div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
                    <SideLink active={activeTab === 'curriculum'} icon={<FiLayers/>} label="Materials" onClick={() => setActiveTab('curriculum')} />
                    <SideLink active={activeTab === 'assignments'} icon={<FiClipboard/>} label="Lab Tasks" onClick={() => setActiveTab('assignments')} />
                    <SideLink active={activeTab === 'final-exam'} icon={<FiStar/>} label="Assessment" onClick={() => setActiveTab('final-exam')} />
                </nav>
            </aside>

            {/* --- MAIN AREA --- */}
            <main className="flex-1 overflow-y-auto bg-[#080808] p-4 lg:p-10 no-scrollbar">
                
                {/* 1. MATERIALS TAB */}
                {activeTab === 'curriculum' && (
                    <div className="max-w-6xl mx-auto space-y-8 pb-32">
                        <div className="rounded-3xl overflow-hidden bg-[#111] aspect-video border border-white/10 shadow-2xl relative">
                            {activeFile?.type === 'video' ? (
                                <video key={activeFile.url} controls className="w-full h-full object-contain">
                                    <source src={formatUrl(activeFile.url)} type="video/mp4" />
                                </video>
                            ) : activeFile?.type === 'pdf' ? (
                                <iframe 
                                    key={activeFile.url}
                                    src={`${formatUrl(activeFile.url)}#toolbar=0`} 
                                    className="w-full h-full bg-white border-none" 
                                    title="PDF Viewer"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-center p-6">
                                    <FiMonitor size={60} className="text-white/10"/>
                                    <p className="text-white/40 text-sm">Preview not supported for this file.</p>
                                    <button onClick={() => downloadFile(activeFile?.url, activeFile?.title)} className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase rounded-full">Download Now</button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/[0.03] p-6 lg:p-8 rounded-[40px] border border-white/5 backdrop-blur-md gap-4">
                            <div>
                                <h2 className="text-xl lg:text-2xl font-black text-white uppercase">{activeFile?.title}</h2>
                                <p className="text-[10px] text-[#a855f7] uppercase font-bold tracking-[3px] mt-1">Resource • {activeFile?.type}</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => downloadFile(activeFile?.url, activeFile?.title)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5"><FiDownload/></button>
                                {!enrollment?.completedItems?.includes(activeFile?.id) ? (
                                    <button onClick={() => handleMarkAsDone(activeFile?.id)} className="px-8 py-4 bg-purple-600 text-white text-[11px] font-black uppercase rounded-2xl hover:scale-105 transition-all">Mark Done</button>
                                ) : (
                                    <div className="flex items-center gap-3 px-8 py-4 bg-green-500/10 text-green-500 rounded-2xl text-[11px] font-black uppercase border border-green-500/20"><FiCheckCircle size={18}/> Finished</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all">
                            <ListSection title="Lectures" items={course?.videoLectures} type="video" icon={<FiVideo/>} onSelect={setActiveFile} activeId={activeFile?.id} completed={enrollment?.completedItems} onDownload={downloadFile} />
                            <ListSection title="Slides" items={course?.pptSlides} type="ppt" icon={<FiMonitor/>} onSelect={setActiveFile} activeId={activeFile?.id} completed={enrollment?.completedItems} onDownload={downloadFile} />
                            <ListSection title="Notes" items={course?.pdfNotes} type="pdf" icon={<FiFileText/>} onSelect={setActiveFile} activeId={activeFile?.id} completed={enrollment?.completedItems} onDownload={downloadFile} />
                        </div>
                    </div>
                )}

                {/* 2. ASSIGNMENTS TAB */}
                {activeTab === 'assignments' && (
                    <div className="max-w-4xl mx-auto space-y-6 py-4 lg:py-10">
                        <h2 className="text-xl font-black uppercase tracking-[5px] text-white/20 mb-10 text-center lg:text-left">Lab Submissions</h2>
                        {regularAssignments?.map((asn, i) => {
                            const sub = getSubmissionData(asn._id);
                            const isSubmitted = !!sub;
                            return (
                                <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-6 lg:p-8 bg-white/[0.02] border border-white/5 rounded-[35px] hover:border-purple-500/30 transition-all gap-6">
                                    <div className="flex items-center gap-6 w-full sm:w-auto">
                                        <div className="p-4 bg-white/5 rounded-2xl text-purple-400 transition-all"><FiClipboard size={22}/></div>
                                        <div>
                                            <h4 className="text-md font-bold uppercase tracking-tight">{asn.title}</h4>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isSubmitted ? 'text-green-500' : 'text-white/20'}`}>{isSubmitted ? (sub.grade ? `Graded: ${sub.grade}` : 'Review Pending') : 'Status: Incomplete'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
                                        {isSubmitted && sub?.filePath && <button onClick={() => openInNewTab(sub.filePath)} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white" title="View Submission"><FiEye/></button>}
                                        <button onClick={() => openInNewTab(asn.filePath)} className="text-[10px] font-black uppercase px-6 py-3 border border-white/10 rounded-xl hover:bg-white hover:text-black">Brief</button>
                                        <button onClick={() => !isSubmitted && handleAssignmentSubmit(asn._id)} disabled={isSubmitted} className={`text-[10px] font-black uppercase px-6 py-3 rounded-xl transition-all ${isSubmitted ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-purple-600 text-white shadow-lg'}`}>
                                            {isSubmitted ? 'Submitted' : 'Hand In'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {regularAssignments?.length === 0 && <p className="text-center text-white/10 py-20 font-black uppercase tracking-widest">No regular tasks found.</p>}
                    </div>
                )}

                {/* 3. FINAL ASSESSMENT TAB */}
                {activeTab === 'final-exam' && (
                    <div className="h-full flex flex-col items-center justify-center p-6 lg:p-12 text-center">
                        {finalAssignment ? (
                            <div className="max-w-md w-full p-8 lg:p-12 bg-white/[0.02] border border-white/5 rounded-[50px] space-y-8 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-all rotate-12"><FiStar size={180}/></div>
                                <div className="inline-block p-6 bg-purple-500/10 text-purple-500 rounded-3xl relative z-10"><FiStar size={40}/></div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-black tracking-tight text-white italic">Capstone Project</h2>
                                    <p className="text-white/40 text-sm mt-4 leading-relaxed">This final assessment is mandatory for course completion and official certification.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 pt-6 relative z-10">
                                    <button onClick={() => openInNewTab(finalAssignment.filePath)} className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5">Brief</button>
                                    {getSubmissionData(finalAssignment._id) && <button onClick={() => openInNewTab(getSubmissionData(finalAssignment._id).filePath)} className="p-4 bg-white/5 rounded-2xl"><FiEye/></button>}
                                    <button 
                                        onClick={() => !getSubmissionData(finalAssignment._id) && handleAssignmentSubmit(finalAssignment._id)} 
                                        disabled={!!getSubmissionData(finalAssignment._id)} 
                                        className={`flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${getSubmissionData(finalAssignment._id) ? 'bg-green-500/10 text-green-500' : 'bg-white text-black hover:scale-105'}`}
                                    >
                                        {getSubmissionData(finalAssignment._id) ? 'Locked' : 'Submit Final'}
                                    </button>
                                </div>
                            </div>
                        ) : <span className="text-white/10 font-black uppercase tracking-[20px] text-2xl">Not Required</span>}
                    </div>
                )}
            </main>
        </div>
    );
};

// 🔹 Navigation Helper Component
const SideLink = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
        <span className={active ? 'text-purple-600' : ''}>{icon}</span>
        <span className="hidden lg:block text-[11px] font-black uppercase tracking-[2px]">{label}</span>
    </button>
);

// 🔹 Materials List Helper Component
const ListSection = ({ title, items, icon, type, onSelect, activeId, completed, onDownload }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="space-y-5">
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[5px] px-2">{title}</h3>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div 
                        key={i} 
                        onClick={() => onSelect({ ...item, type, url: item.filePath, id: item._id })} 
                        className={`group flex items-center justify-between p-4 rounded-[25px] cursor-pointer transition-all border ${activeId === item._id ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-lg' : 'bg-[#0f0f0f] border-transparent hover:bg-white/[0.03] text-white/60'}`}
                    >
                        <div className="flex items-center gap-4 truncate">
                            <span className="text-white/20 group-hover:text-purple-400 transition-colors">{icon}</span>
                            <span className="text-[12px] font-bold truncate uppercase tracking-tight">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); onDownload(item.filePath, item.title); }} className="p-2 opacity-0 group-hover:opacity-100 hover:text-white transition-all"><FiDownload size={15}/></button>
                            {completed?.includes(item._id) && <FiCheckCircle className="text-green-500" size={16}/>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoursePlayer;