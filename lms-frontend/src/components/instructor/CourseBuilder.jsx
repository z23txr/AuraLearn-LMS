// ====================================Imports-====================================

import React, { useState } from 'react';
import axios from 'axios';
import { 
    FiVideo, FiFileText, FiPlus, FiArrowLeft, FiUploadCloud, 
    FiClock, FiCheckCircle, FiUserCheck, FiExternalLink, FiLock, FiFile,
    FiCheckSquare, FiTrash, FiCpu, FiSearch, FiInfo, FiBook, FiX, FiMenu
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import { uploadToCloudinary } from '../../utils/uploadCloudinary.js';

// ==============================component=====================================

const CourseBuilder = ({ course, onBack, refreshData }) => {

// ===================================States==============================================
    const [activeTab, setActiveTab] = useState('videoLectures');
    const [loading, setLoading] = useState(false);
    const [material, setMaterial] = useState({ title: '', file: null, deadline: '' });
    const [isTabMenuOpen, setIsTabMenuOpen] = useState(false);
    
    //===================================  Dynamic states =======================================
    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const [courseStatus, setCourseStatus] = useState(course.status || 'In Progress');
    const [testSubmissions, setTestSubmissions] = useState(course.testResults || []);
    
    // Quiz states
    const [quizzesList, setQuizzesList] = useState(course.quizzes || []);
    const [manualQuiz, setManualQuiz] = useState({ question: '', options: ['', '', '', ''], correctAnswer: '' });
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiCount, setAiCount] = useState(5);
    const [aiLoading, setAiLoading] = useState(false);
    const [showQuizBuilderModal, setShowQuizBuilderModal] = useState(false);
    const [quizBuilderMode, setQuizBuilderMode] = useState(null); // null, 'manual', 'ai', 'stage'
    const [aiFile, setAiFile] = useState(null);
    const [stagedQuizzes, setStagedQuizzes] = useState(null);

    // Grading states
    const [gradingTab, setGradingTab] = useState('final'); // 'final' or 'assignments'
    const [enrollmentsList, setEnrollmentsList] = useState([]);

    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const isLocked = courseStatus === 'Completed';

    const fetchEnrollments = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/enrollments/instructor/${user.id || user._id}`);
            // Filter enrollments for this specific course
            const filtered = res.data.filter(e => e.courseId === course._id || e.courseId?._id === course._id);
            setEnrollmentsList(filtered);
        } catch (err) {
            console.error("Error fetching instructor applications for grading:", err);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'gradingPanel') {
            fetchEnrollments();
        }
    }, [activeTab]);

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
            
            try {
                // Upload Exam File directly to Cloudinary
                toast.info("Uploading final exam document...");
                const fileUrl = await uploadToCloudinary(file);
                
                const payload = {
                    fileUrl,
                    title: "FINAL_EXAM",
                    section: 'assignments'
                };

                await axios.patch(`${import.meta.env.VITE_API_URL}/api/courses/add-material/${course._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                //  Mark Complete in Database
                await axios.patch(`${import.meta.env.VITE_API_URL}/api/courses/complete/${course._id}`, {}, {
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
        try {
            const uploadToastId = toast.loading("Uploading to cloud...");
            
            // Upload directly to Cloudinary
            const fileUrl = await uploadToCloudinary(material.file);
            
            const payload = {
                fileUrl,
                title: material.title,
                section: activeTab
            };

            await axios.patch(`${import.meta.env.VITE_API_URL}/api/courses/add-material/${course._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
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
            await axios.put(`${import.meta.env.VITE_API_URL}/api/courses/grade-test`, {
                courseId: course._id, studentId, status, grade
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            toast.success(`Student ${status}!`);
            setTestSubmissions(prev => prev.map(s => s.studentId === studentId ? { ...s, status, grade } : s));
        } catch (err) { toast.error("Grading failed."); }
    };

    // Add Quiz manually
    const handleAddManualQuestion = async () => {
        const { question, options, correctAnswer } = manualQuiz;
        if (!question || options.some(o => !o) || !correctAnswer) {
            return toast.error("Please fill all fields and select correct answer.");
        }

        const updatedList = [...quizzesList];
        if (updatedList.length === 0) {
            updatedList.push({ title: "Quiz 1", questions: [manualQuiz] });
        } else {
            updatedList[updatedList.length - 1].questions.push(manualQuiz);
        }

        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/courses/quizzes/${course._id}`, { quizzes: updatedList }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzesList(res.data.quizzes);
            setManualQuiz({ question: '', options: ['', '', '', ''], correctAnswer: '' });
            setShowQuizBuilderModal(false);
            setQuizBuilderMode(null);
            toast.success("Question added to the latest quiz successfully!");
        } catch (err) {
            toast.error("Failed to add question.");
        }
    };

    // Generate Quiz using AI
    const handleAIQuizGen = async () => {
        setAiLoading(true);
        const toastId = toast.loading("Preparing AI context...");
        try {
            let fileUrl = '';
            if (aiFile) {
                toast.update(toastId, { render: "Uploading document to cloud...", type: "info", isLoading: true });
                fileUrl = await uploadToCloudinary(aiFile);
            }

            toast.update(toastId, { render: "AI is crafting quiz questions...", type: "info", isLoading: true });
            
            const payload = {
                courseId: course._id,
                promptText: aiPrompt,
                numQuestions: aiCount,
                fileUrl
            };

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/courses/generate-quiz`, payload, { 
                headers: { 
                    Authorization: `Bearer ${token}`
                } 
            });
            
            setStagedQuizzes(res.data.quizzes);
            setAiPrompt('');
            setAiFile(null);
            toast.update(toastId, { render: "AI Quiz generated! Please review.", type: "success", isLoading: false, autoClose: 3000 });
            setQuizBuilderMode('stage');
        } catch (err) {
            console.error(err);
            toast.update(toastId, { render: "Failed to generate AI Quiz.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setAiLoading(false);
        }
    };

    const handlePublishStagedQuizzes = async () => {
        const nextQuizNumber = quizzesList.length + 1;
        const newQuiz = {
            title: `Quiz ${nextQuizNumber}`,
            questions: stagedQuizzes
        };
        const updated = [...quizzesList, newQuiz];
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/courses/quizzes/${course._id}`, { quizzes: updated }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzesList(res.data.quizzes);
            setStagedQuizzes(null);
            setQuizBuilderMode(null);
            setShowQuizBuilderModal(false);
            toast.success(`AI Quizzes published as ${newQuiz.title} successfully!`);
        } catch (err) {
            toast.error("Failed to publish quizzes.");
        }
    };

    // Delete Quiz question
    const handleDeleteQuestion = async (quizIdx, qIdx) => {
        const updatedList = [...quizzesList];
        updatedList[quizIdx].questions = updatedList[quizIdx].questions.filter((_, i) => i !== qIdx);
        
        // Remove the quiz if it has no questions left
        if (updatedList[quizIdx].questions.length === 0) {
            updatedList.splice(quizIdx, 1);
        }

        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/courses/quizzes/${course._id}`, { quizzes: updatedList }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzesList(res.data.quizzes);
            toast.success("Question deleted.");
        } catch (err) {
            toast.error("Failed to delete question.");
        }
    };

    const handleDeleteQuiz = async (quizIdx) => {
        const updatedList = quizzesList.filter((_, i) => i !== quizIdx);
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/courses/quizzes/${course._id}`, { quizzes: updatedList }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzesList(res.data.quizzes);
            toast.success("Quiz deleted completely.");
        } catch (err) {
            toast.error("Failed to delete quiz.");
        }
    };

    // Grade assignment manually
    const handleGradeAssignment = async (enrollmentId, assignmentId, grade, feedback, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/enrollments/grade-assignment`, {
                enrollmentId, assignmentId, grade, feedback, status
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Submission ${status}!`);
            fetchEnrollments();
        } catch (err) {
            toast.error("Grading failed.");
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#0b0e14] text-[#f1f5f9] font-sans overflow-hidden">
            

            {/* Header */}
            <header className="px-4 md:px-10 py-[15px] bg-[#1e293b]/70 backdrop-blur-[12px] border-b border-white/10 flex justify-between items-center shadow-2xl z-20 relative">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsTabMenuOpen(!isTabMenuOpen)}
                        className="md:hidden flex items-center justify-center p-2.5 bg-[#1e293b] rounded-xl border border-white/10 text-white hover:bg-[#a855f7] transition-colors"
                    >
                        <FiMenu size={20} /> 
                    </button>
                    <button onClick={onBack} className="flex items-center gap-2 border border-[#a855f7] text-[#a855f7] px-3 md:px-4 py-2 rounded-xl font-bold transition-all hover:bg-[#a855f7] hover:text-white">
                        <FiArrowLeft /> <span className="hidden sm:block">Back</span>
                    </button>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden sm:flex text-[#cbd5e1] bg-[#0f172a]/60 px-5 py-2.5 rounded-2xl text-sm border border-white/5 items-center gap-3">
                        {isLocked ? <FiLock className="text-red-500 animate-pulse" /> : <FiCheckCircle className="text-green-500" />}
                        Editing: <b className="text-white truncate max-w-[150px] md:max-w-none">{course.title}</b>
                    </div>
                    {!isLocked && (
                        <button onClick={handleFinishCourse} disabled={loading} className="bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white px-3 md:px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all text-sm md:text-base">
                            <FiFile /> <span className="hidden sm:block">Finish Course</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Tab Drawer Overlay */}
                {isTabMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                        onClick={() => setIsTabMenuOpen(false)}
                    />
                )}

                <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#0f172a] p-6 border-r border-white/5 flex flex-col gap-3 z-[101] transform transition-transform duration-300 md:static md:translate-x-0 ${isTabMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {[
                        { id: 'videoLectures', label: 'Video Lectures', icon: <FiVideo /> },
                        { id: 'pdfNotes', label: 'PDF Notes', icon: <FiFileText /> },
                        { id: 'pptSlides', label: 'PPT Slides', icon: <FiFileText /> },
                        { id: 'assignments', label: 'Assignments', icon: <FiPlus /> },
                        { id: 'quizzes', label: 'Quiz Builder', icon: <FiCheckSquare /> }
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            className={`flex items-center gap-[15px] p-[15px] text-left rounded-2xl font-semibold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-[#a855f7] text-white shadow-lg' 
                                : 'text-[#94a3b8] hover:bg-[#a855f71a] hover:text-white'
                            }`} 
                            onClick={() => { setActiveTab(tab.id); setIsTabMenuOpen(false); }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Main section  */}
                <main className="flex-1 p-4 md:p-[60px] flex justify-center items-start overflow-y-auto no-scrollbar w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

                    {activeTab === 'quizzes' ? (
                        <div className="w-full max-w-6xl flex flex-col gap-8 animate-in fade-in duration-500">
                            
                            {/* Quiz builder header controls */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 sm:p-8 bg-white/[0.03] border border-white/5 rounded-[30px] backdrop-blur-md gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold tracking-tight">Quiz Hub</h3>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                        Total Questions: <b className="text-[#a855f7]">{quizzesList.length}</b>
                                    </p>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button 
                                        onClick={() => {
                                            setShowQuizBuilderModal(true);
                                            setQuizBuilderMode(null);
                                        }}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#a855f7] to-[#8227e3] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300"
                                    >
                                        <FiPlus size={16} /> Add Quiz Questions
                                    </button>
                                </div>
                            </div>

                            {/* Questions list */}
                            <div className="bg-[#1e293b]/20 p-8 rounded-[40px] border border-white/5 shadow-2xl flex flex-col min-h-[400px]">
                                <h4 className="text-lg font-black uppercase tracking-wider text-slate-500 mb-6 border-b border-white/5 pb-4">Quiz Center</h4>
                                
                                <div className="space-y-6">
                                    {quizzesList.length > 0 ? quizzesList.map((quizGroup, quizIdx) => (
                                        <div key={quizIdx} className="bg-[#1e293b]/40 rounded-3xl border border-white/5 p-6 mb-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h5 className="text-white font-bold text-lg">{quizGroup.title}</h5>
                                                <button 
                                                    onClick={() => handleDeleteQuiz(quizIdx)}
                                                    className="text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                                                >
                                                    Delete Quiz
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {quizGroup.questions?.map((q, idx) => (
                                                    <div key={idx} className="bg-[#0b0e14]/60 p-4 rounded-2xl border border-white/5 relative group hover:border-[#a855f7]/30 transition-all flex flex-col justify-between">
                                                        <button 
                                                            onClick={() => handleDeleteQuestion(quizIdx, idx)}
                                                            className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg bg-white/5 hover:bg-red-500/10"
                                                        >
                                                            <FiTrash size={16} />
                                                        </button>
                                                        <div className="space-y-4">
                                                            <div className="text-white font-bold text-sm pr-6 leading-relaxed">Q{idx+1}: {q.question}</div>
                                                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                                                {q.options?.map((o, oIdx) => (
                                                                    <div 
                                                                        key={oIdx}
                                                                        className={`p-2.5 rounded-xl border ${o === q.correctAnswer ? 'bg-green-500/10 text-green-400 border-green-500/20 font-bold' : 'bg-white/5 border-transparent'}`}
                                                                    >
                                                                        {String.fromCharCode(65 + oIdx)}. {o}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-600 gap-3">
                                            <FiInfo size={40} className="opacity-30 animate-bounce" />
                                            <p className="italic text-xs font-bold uppercase tracking-widest text-slate-500">No Quizzes Added Yet</p>
                                            <p className="text-[10px] text-slate-600 max-w-sm text-center">Click the top buttons to design quiz questions manually or generate them instantly using AI.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- UNIFIED QUIZ BUILDER OVERLAY MODAL --- */}
                            {showQuizBuilderModal && (
                                <div className="fixed inset-0 z-[6000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                                    <div className="bg-[#0b0e14] p-8 sm:p-10 rounded-[40px] border border-white/10 max-w-[550px] w-full flex flex-col gap-6 relative animate-in zoom-in-95 duration-200">
                                        <button 
                                            onClick={() => setShowQuizBuilderModal(false)}
                                            className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-all w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
                                        >
                                            <FiX size={20} />
                                        </button>
                                        
                                        {quizBuilderMode === null && (
                                            <>
                                                <div className="space-y-1">
                                                    <span className="text-[#a855f7] text-[10px] font-black uppercase tracking-wider">Quiz Hub</span>
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Add Quiz Questions</h3>
                                                </div>
                                                <p className="text-slate-400 text-xs leading-relaxed">
                                                    Choose how you want to add questions to this course. You can design a question manually or generate multiple questions instantly with Gemini AI.
                                                </p>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                    <div 
                                                        onClick={() => setQuizBuilderMode('manual')}
                                                        className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-between text-center cursor-pointer hover:border-[#a855f7] hover:bg-[#a855f7]/5 transition-all group duration-300 shadow-xl"
                                                    >
                                                        <div className="w-14 h-14 rounded-2xl bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                            <FiPlus size={24} />
                                                        </div>
                                                        <div className="mt-4 space-y-1">
                                                            <h4 className="text-sm font-black uppercase text-white tracking-wider">Manual Designer</h4>
                                                            <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">
                                                                Craft questions and options one-by-one.
                                                            </p>
                                                        </div>
                                                        <div className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#a855f7] group-hover:text-white bg-[#a855f7]/10 group-hover:bg-[#a855f7] px-4 py-1.5 rounded-full transition-all">
                                                            Create Manual
                                                        </div>
                                                    </div>

                                                    <div 
                                                        onClick={() => setQuizBuilderMode('ai')}
                                                        className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-between text-center cursor-pointer hover:border-[#38bdf8] hover:bg-[#38bdf8]/5 transition-all group duration-300 shadow-xl"
                                                    >
                                                        <div className="w-14 h-14 rounded-2xl bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                            <FiCpu size={24} className="animate-pulse" />
                                                        </div>
                                                        <div className="mt-4 space-y-1">
                                                            <h4 className="text-sm font-black uppercase text-white tracking-wider">AI Assistant</h4>
                                                            <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">
                                                                Auto-generate quizzes using Gemini API.
                                                            </p>
                                                        </div>
                                                        <div className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#38bdf8] group-hover:text-white bg-[#38bdf8]/10 group-hover:bg-[#38bdf8] px-4 py-1.5 rounded-full transition-all">
                                                            Generate AI
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {quizBuilderMode === 'manual' && (
                                            <>
                                                <button 
                                                    onClick={() => setQuizBuilderMode(null)}
                                                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#a855f7] transition-all bg-white/5 px-3 py-1.5 rounded-xl self-start"
                                                >
                                                    <FiArrowLeft size={14} /> Back to Options
                                                </button>
                                                
                                                <div className="space-y-1">
                                                    <span className="text-[#a855f7] text-[10px] font-black uppercase tracking-wider">Manual Designer</span>
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Create Quiz Question</h3>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Question Text</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="Enter the quiz question..."
                                                            className="w-full bg-[#0b0e14] border border-white/10 text-white p-3.5 rounded-2xl outline-none focus:border-[#a855f7] transition-all font-medium"
                                                            value={manualQuiz.question}
                                                            onChange={(e) => setManualQuiz({ ...manualQuiz, question: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        {manualQuiz.options.map((opt, i) => (
                                                            <div key={i}>
                                                                <label className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block mb-1">Option {String.fromCharCode(65 + i)}</label>
                                                                <input 
                                                                    type="text"
                                                                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                                    className="w-full bg-[#0b0e14] border border-white/10 text-white p-3 rounded-2xl outline-none focus:border-[#a855f7] transition-all"
                                                                    value={opt}
                                                                    onChange={(e) => {
                                                                        const newOpts = [...manualQuiz.options];
                                                                        newOpts[i] = e.target.value;
                                                                        setManualQuiz({ ...manualQuiz, options: newOpts });
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div>
                                                        <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Correct Answer</label>
                                                        <select 
                                                            className="w-full bg-[#0b0e14] border border-white/10 text-white p-3.5 rounded-2xl outline-none focus:border-[#a855f7] cursor-pointer"
                                                            value={manualQuiz.correctAnswer}
                                                            onChange={(e) => setManualQuiz({ ...manualQuiz, correctAnswer: e.target.value })}
                                                        >
                                                            <option value="">Select Correct Option</option>
                                                            {manualQuiz.options.filter(o => o).map((o, idx) => (
                                                                <option key={idx} value={o}>{o}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <button 
                                                        onClick={handleAddManualQuestion}
                                                        className="w-full py-4 bg-[#a855f7] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#9333ea] transition-all mt-2"
                                                    >
                                                        Save Question
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {quizBuilderMode === 'ai' && (
                                            <>
                                                <button 
                                                    onClick={() => setQuizBuilderMode(null)}
                                                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#38bdf8] transition-all bg-white/5 px-3 py-1.5 rounded-xl self-start"
                                                >
                                                    <FiArrowLeft size={14} /> Back to Options
                                                </button>
                                                
                                                <div className="space-y-1">
                                                    <span className="text-[#38bdf8] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                                        <FiCpu className="animate-pulse" /> Aura Intelligence
                                                    </span>
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">AI Quiz Generator</h3>
                                                </div>
                                                <p className="text-slate-400 text-xs leading-relaxed">
                                                    Generate multiple choice questions based on specific topics or the course description using Gemini API.
                                                </p>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Specific Topic Prompt (Optional)</label>
                                                        <input 
                                                            type="text"
                                                            placeholder="e.g. loops, async functions, inheritance..."
                                                            className="w-full bg-[#0b0e14] border border-white/10 text-white p-3.5 rounded-2xl outline-none focus:border-[#38bdf8] transition-all"
                                                            value={aiPrompt}
                                                            onChange={(e) => setAiPrompt(e.target.value)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Context Document (Optional PDF)</label>
                                                        <input 
                                                            type="file"
                                                            accept=".pdf"
                                                            className="w-full bg-[#0b0e14] border border-white/10 text-white p-2.5 rounded-2xl outline-none focus:border-[#38bdf8] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#38bdf8]/20 file:text-[#38bdf8] hover:file:bg-[#38bdf8]/30"
                                                            onChange={(e) => setAiFile(e.target.files[0])}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Number of Questions</label>
                                                        <select 
                                                            className="w-full bg-[#0b0e14] border border-white/10 text-white p-3.5 rounded-2xl outline-none focus:border-[#38bdf8] transition-all cursor-pointer"
                                                            value={aiCount}
                                                            onChange={(e) => setAiCount(parseInt(e.target.value))}
                                                        >
                                                            <option value={3}>3 Questions</option>
                                                            <option value={5}>5 Questions</option>
                                                            <option value={10}>10 Questions</option>
                                                        </select>
                                                    </div>

                                                    <button 
                                                        onClick={handleAIQuizGen}
                                                        disabled={aiLoading}
                                                        className="w-full py-4 bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all mt-2"
                                                    >
                                                        {aiLoading ? "Generating Questions..." : "Generate & Add"}
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {quizBuilderMode === 'stage' && stagedQuizzes && (
                                            <>
                                                <div className="space-y-1">
                                                    <span className="text-[#a855f7] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                                        <FiCheckSquare className="animate-pulse" /> Review & Edit
                                                    </span>
                                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">AI Generated Quizzes</h3>
                                                </div>
                                                <p className="text-slate-400 text-xs leading-relaxed">
                                                    Review the questions generated by AI. You can edit them below before publishing to the course.
                                                </p>

                                                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                                    {stagedQuizzes.map((q, qIdx) => (
                                                        <div key={qIdx} className="bg-[#1e293b]/40 border border-white/5 p-5 rounded-3xl space-y-4">
                                                            <div>
                                                                <label className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Question {qIdx + 1}</label>
                                                                <input 
                                                                    type="text"
                                                                    value={q.question}
                                                                    onChange={(e) => {
                                                                        const updated = [...stagedQuizzes];
                                                                        updated[qIdx].question = e.target.value;
                                                                        setStagedQuizzes(updated);
                                                                    }}
                                                                    className="w-full bg-[#0b0e14] border border-white/10 text-white p-3 rounded-xl text-sm"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {q.options.map((opt, oIdx) => (
                                                                    <div key={oIdx}>
                                                                        <label className="text-slate-500 text-[9px] font-bold uppercase block mb-1">Opt {String.fromCharCode(65 + oIdx)}</label>
                                                                        <input 
                                                                            type="text"
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const updated = [...stagedQuizzes];
                                                                                updated[qIdx].options[oIdx] = e.target.value;
                                                                                setStagedQuizzes(updated);
                                                                            }}
                                                                            className="w-full bg-[#0b0e14] border border-white/10 text-white p-2.5 rounded-lg text-xs"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div>
                                                                <label className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Correct Answer</label>
                                                                <select 
                                                                    value={q.correctAnswer}
                                                                    onChange={(e) => {
                                                                        const updated = [...stagedQuizzes];
                                                                        updated[qIdx].correctAnswer = e.target.value;
                                                                        setStagedQuizzes(updated);
                                                                    }}
                                                                    className="w-full bg-[#0b0e14] border border-white/10 text-white p-3 rounded-xl text-xs"
                                                                >
                                                                    {q.options.filter(o => o).map((o, i) => (
                                                                        <option key={i} value={o}>{o}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex gap-4 mt-4">
                                                    <button 
                                                        onClick={() => {
                                                            setStagedQuizzes(null);
                                                            setQuizBuilderMode(null);
                                                        }}
                                                        className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black text-xs uppercase hover:bg-red-500/20 hover:text-red-500 transition-all"
                                                    >
                                                        Discard
                                                    </button>
                                                    <button 
                                                        onClick={handlePublishStagedQuizzes}
                                                        className="flex-[2] py-4 bg-gradient-to-r from-[#a855f7] to-[#8227e3] text-white rounded-2xl font-black text-xs uppercase shadow-lg transition-all"
                                                    >
                                                        Publish AI Quizzes
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
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
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseBuilder;