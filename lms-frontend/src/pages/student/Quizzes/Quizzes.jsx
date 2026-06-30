import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiCheckSquare, FiAlertCircle, FiClock, FiCheck, FiX, 
    FiChevronRight, FiChevronLeft, FiAward, FiInfo, FiActivity, 
    FiSearch, FiBookOpen, FiHelpCircle
} from 'react-icons/fi';
import PageTransition from '../../../components/common/PageTransition/PageTransition';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Quizzes = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Search & Filter state
    const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'pending' | 'completed'
    const [searchQuery, setSearchQuery] = useState('');

    // Quiz Player State
    const [activeQuiz, setActiveQuiz] = useState(null); // { enrollment, course, questions }
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]); // Array of strings index-matched to questions
    const [submitting, setSubmitting] = useState(false);

    // Results Review State
    const [reviewQuiz, setReviewQuiz] = useState(null); // { courseTitle, score, totalQuestions, answers }

    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const userId = user.id || user._id;
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const PF = import.meta.env.VITE_API_URL + "/";

    const fetchEnrollments = async () => {
        try {
            const res = await axios.get(`${PF}api/enrollments/student/${userId}`);
            // Filter to approved enrollments that have course quizzes
            const approved = res.data.filter(e => e.status === 'Approved' && e.courseId);
            setEnrollments(approved);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching enrollments for quizzes:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchEnrollments();
        }
    }, [userId]);

    const startQuiz = (enrollment, course, quizIndex) => {
        const quizGroup = course.quizzes && course.quizzes[quizIndex];
        const questions = quizGroup ? quizGroup.questions : [];
        if (questions.length === 0) {
            return toast.info("No quiz questions added for this quiz yet!");
        }
        setActiveQuiz({ enrollment, course, quizIndex, quizGroup, questions });
        setCurrentQuestionIdx(0);
        setSelectedAnswers(new Array(questions.length).fill(""));
    };

    const handleSelectOption = (option) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIdx] = option;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIdx < activeQuiz.questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        // Validate all answered
        if (selectedAnswers.some(a => !a)) {
            return toast.warning("Please answer all questions before submitting!");
        }

        setSubmitting(true);
        const toastId = toast.loading("Checking answers automatically...");
        try {
            const res = await axios.post(`${PF}api/enrollments/submit-quiz`, {
                enrollmentId: activeQuiz.enrollment._id,
                answers: selectedAnswers,
                quizIndex: activeQuiz.quizIndex
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.update(toastId, { render: `Quiz Submitted! Score: ${res.data.score}/${res.data.totalQuestions}`, type: "success", isLoading: false, autoClose: 3000 });
            
            // Reload enrollments
            await fetchEnrollments();
            
            // Show result review
            setReviewQuiz({
                courseTitle: activeQuiz.course.title,
                quizTitle: activeQuiz.quizGroup.title,
                score: res.data.score,
                totalQuestions: res.data.totalQuestions,
                answers: res.data.answers
            });

            setActiveQuiz(null);
        } catch (err) {
            console.error(err);
            toast.update(toastId, { render: "Failed to submit quiz.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    // Flatten enrollments into individual quizzes
    const allQuizzes = [];
    enrollments.forEach(enroll => {
        if (enroll.courseId && enroll.courseId.quizzes) {
            enroll.courseId.quizzes.forEach((quiz, quizIndex) => {
                allQuizzes.push({
                    enroll,
                    course: enroll.courseId,
                    quiz,
                    quizIndex
                });
            });
        }
    });

    const totalPendingCount = allQuizzes.filter(q => !q.enroll.submissions?.find(s => s.type === "Quiz" && s.quizIndex === q.quizIndex)).length;
    const totalCompletedCount = allQuizzes.filter(q => q.enroll.submissions?.find(s => s.type === "Quiz" && s.quizIndex === q.quizIndex)).length;

    // Filtered quizzes
    const filteredQuizzes = allQuizzes.filter((item) => {
        const quizResult = item.enroll.submissions?.find(s => s.type === "Quiz" && s.quizIndex === item.quizIndex);
        const hasAttempted = !!quizResult;

        const matchesSearch = item.course.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.quiz.title?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesFilter = true;
        if (selectedFilter === 'pending') {
            matchesFilter = !hasAttempted;
        } else if (selectedFilter === 'completed') {
            matchesFilter = hasAttempted;
        }

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-white">
                <FiActivity className="text-4xl text-[#38bdf8] animate-spin" />
                <p className="text-xs uppercase font-bold tracking-widest text-slate-500">Syncing Quiz Hub...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-10 pb-24 font-['Poppins'] text-white">
                

                {/* --- HEADER HERO --- */}
                <div className="relative p-8 sm:p-10 rounded-[30px] bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#38bdf8]/10 blur-[130px] rounded-full -mr-32 -mt-32 animate-pulse"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#38bdf8] text-xs sm:text-sm font-black uppercase tracking-[4px]">
                                <FiCheckSquare className="animate-bounce" /> Smart Evaluations
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase leading-none">
                                Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#a855f7]">Center</span>
                            </h2>
                            <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
                                Test your knowledge. Quizzes are checked automatically by AI. Correct answers and grades are shown immediately.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- FILTER CONTROL HEADER --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    {/* Status Tabs */}
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                        <button 
                            onClick={() => setSelectedFilter('all')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                                selectedFilter === 'all' 
                                ? 'bg-gradient-to-r from-[#38bdf8]/20 to-[#a855f7]/20 border-[#38bdf8] text-[#38bdf8]' 
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            All Assessments <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full">{enrollments.length}</span>
                        </button>
                        <button 
                            onClick={() => setSelectedFilter('pending')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                                selectedFilter === 'pending' 
                                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            Pending <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">{totalPendingCount}</span>
                        </button>
                        <button 
                            onClick={() => setSelectedFilter('completed')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                                selectedFilter === 'completed' 
                                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            Completed <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">{totalCompletedCount}</span>
                        </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full md:w-72">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by course..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] transition-all"
                        />
                    </div>
                </div>

                {/* --- QUIZZES GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {filteredQuizzes.map((item, index) => {
                        const { enroll, course, quiz, quizIndex } = item;

                        // Check if student has submitted this specific quiz
                        const quizResult = enroll.submissions?.find(s => s.type === "Quiz" && s.quizIndex === quizIndex);
                        const hasAttempted = !!quizResult;
                        
                        // Dynamic hover effects and classes based on completion status
                        const borderLeftClass = hasAttempted ? "border-l-[6px] border-l-green-500" : "border-l-[6px] border-l-amber-500";
                        const cardHoverClass = hasAttempted 
                            ? "hover:border-green-500/40 hover:shadow-[0_15px_30px_rgba(34,197,94,0.06)]" 
                            : "hover:border-amber-500/40 hover:shadow-[0_15px_30px_rgba(245,158,11,0.06)]";

                        // Calculate SVG Radial progress elements
                        let scorePercentage = 0;
                        let strokeDashoffset = 0;
                        const radius = 18;
                        const circumference = 2 * Math.PI * radius;

                        if (hasAttempted) {
                            scorePercentage = Math.round((quizResult.score / quizResult.totalQuestions) * 100);
                            strokeDashoffset = circumference - (scorePercentage / 100) * circumference;
                        }

                        return (
                            <div 
                                key={enroll._id} 
                                className={`bg-gradient-to-b from-[#0f172a]/80 to-[#0b0e14]/95 border border-white/10 rounded-[24px] p-6 flex flex-col justify-between gap-5 relative group transition-all duration-300 ${borderLeftClass} ${cardHoverClass}`}
                            >
                                <div className="space-y-4">
                                    {/* Category and Status pill */}
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-[#38bdf8]">{course.title}</span>
                                            <h5 className="text-white font-bold text-sm tracking-tight line-clamp-1 uppercase group-hover:text-[#38bdf8] transition-colors">{quiz.title}</h5>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${hasAttempted ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 animate-pulse'}`}>
                                            {hasAttempted ? 'Completed' : 'Pending'}
                                        </div>
                                    </div>

                                    {/* Stats panel */}
                                    {hasAttempted ? (
                                        /* Graded score section */
                                        <div className="bg-black/20 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Evaluated Grade</div>
                                                <div className="text-sm font-black text-white">{quizResult.score} / {quizResult.totalQuestions} Correct</div>
                                            </div>
                                            
                                            {/* Beautiful Radial SVG */}
                                            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle 
                                                        cx="24" cy="24" r={radius} 
                                                        className="stroke-white/5 fill-transparent" 
                                                        strokeWidth="3.5" 
                                                    />
                                                    <circle 
                                                        cx="24" cy="24" r={radius} 
                                                        className="stroke-green-500 fill-transparent" 
                                                        strokeWidth="3.5" 
                                                        strokeDasharray={circumference}
                                                        strokeDashoffset={strokeDashoffset}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="absolute text-[9px] text-green-400 font-black">{scorePercentage}%</span>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Upcoming test guidelines details */
                                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 bg-black/15 p-3 rounded-2xl border border-white/[0.03]">
                                            <div className="flex items-center gap-2">
                                                <FiHelpCircle className="text-[#38bdf8]" />
                                                <span>Questions: <b>{quiz.questions?.length || 0}</b></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiClock className="text-[#a855f7]" />
                                                <span>Time: <b>{(quiz.questions?.length || 0) * 2} min</b></span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {hasAttempted ? (
                                    <button 
                                        onClick={() => setReviewQuiz({
                                            courseTitle: course.title,
                                            quizTitle: quiz.title,
                                            score: quizResult.score,
                                            totalQuestions: quizResult.totalQuestions,
                                            answers: quizResult.answers
                                        })}
                                        className="w-full py-3 border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7] hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300"
                                    >
                                        Review Checked Answers
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => startQuiz(enroll, course, quizIndex)}
                                        className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#820ad4] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-95 transition-all duration-300"
                                    >
                                        Attempt Quiz
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {filteredQuizzes.length === 0 && (
                        <div className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-[30px] text-slate-600">
                            <FiInfo className="text-4xl mx-auto opacity-35 animate-pulse mb-3" />
                            <p className="italic font-bold uppercase tracking-wider text-xs">No matching assessments found.</p>
                        </div>
                    )}
                </div>

                {/* --- MODAL: ACTIVE QUIZ PLAYER --- */}
                <AnimatePresence>
                    {activeQuiz && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="bg-[#0b0e14] p-5 sm:p-8 md:p-10 rounded-[25px] sm:rounded-[35px] border border-white/10 max-w-[650px] w-full flex flex-col justify-between gap-6 sm:gap-8 shadow-2xl relative max-h-[90vh] overflow-y-auto my-4"
                            >
                                {/* Close Button */}
                                <button 
                                    onClick={() => {
                                        if (confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
                                            setActiveQuiz(null);
                                        }
                                    }}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-all w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-lg"
                                >
                                    <FiX size={20} />
                                </button>

                                {/* Quiz Progress Header */}
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8] bg-[#38bdf8]/10 px-3 py-1 rounded-md border border-[#38bdf8]/20 inline-block">
                                        {activeQuiz.course.title}
                                    </span>
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Evaluation</h3>
                                        <span className="text-xs text-purple-400 font-black">
                                            Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                                        </span>
                                    </div>

                                    {/* Linear dots Stepper Tracker */}
                                    <div className="flex gap-1.5 items-center py-2">
                                        {activeQuiz.questions.map((_, idx) => {
                                            const isCurrent = idx === currentQuestionIdx;
                                            const isAnswered = selectedAnswers[idx] !== "";
                                            
                                            let dotBg = "bg-white/5 border border-white/10";
                                            if (isCurrent) {
                                                dotBg = "bg-purple-500 border border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.7)] scale-110";
                                            } else if (isAnswered) {
                                                dotBg = "bg-[#38bdf8]/80 border border-[#38bdf8]";
                                            }

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentQuestionIdx(idx)}
                                                    className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${dotBg}`}
                                                    title={`Question ${idx + 1}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Current Question Display */}
                                <div className="space-y-6">
                                    <div className="text-white font-bold text-lg leading-relaxed bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                                        {activeQuiz.questions[currentQuestionIdx].question}
                                    </div>

                                    <div className="grid gap-3">
                                        {activeQuiz.questions[currentQuestionIdx].options.map((option, idx) => {
                                            const isSelected = selectedAnswers[currentQuestionIdx] === option;
                                            
                                            const optionStyle = isSelected 
                                                ? 'bg-gradient-to-r from-purple-500/10 to-[#38bdf8]/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] scale-[1.01]' 
                                                : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.04] hover:border-white/10';

                                            return (
                                                <button 
                                                    key={idx}
                                                    onClick={() => handleSelectOption(option)}
                                                    className={`w-full p-4.5 rounded-2xl text-left text-sm font-bold transition-all border flex items-center justify-between ${optionStyle}`}
                                                >
                                                    <span className="flex items-center">
                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-black ${
                                                            isSelected ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400 border border-white/10'
                                                        }`}>
                                                            {String.fromCharCode(65 + idx)}
                                                        </span>
                                                        {option}
                                                    </span>

                                                    {isSelected && (
                                                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px]">
                                                            <FiCheck size={12} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Navigation Footer */}
                                <div className="flex justify-between gap-4 border-t border-white/5 pt-6">
                                    <button 
                                        onClick={handlePrev}
                                        disabled={currentQuestionIdx === 0}
                                        className="px-6 py-3.5 border border-white/10 rounded-xl font-bold uppercase text-xs tracking-wider text-slate-400 hover:bg-white/5 disabled:opacity-30 flex items-center gap-2 transition-all duration-200"
                                    >
                                        <FiChevronLeft /> Prev
                                    </button>

                                    {currentQuestionIdx === activeQuiz.questions.length - 1 ? (
                                        <button 
                                            onClick={handleSubmitQuiz}
                                            disabled={submitting}
                                            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_5px_15px_rgba(168,85,247,0.3)]"
                                        >
                                            {submitting ? "Checking..." : "Submit Answers"}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleNext}
                                            className="px-6 py-3.5 bg-white text-black rounded-xl font-bold uppercase text-xs tracking-wider hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            Next <FiChevronRight />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- MODAL: REVIEW GRADED QUIZ RESULTS --- */}
                <AnimatePresence>
                    {reviewQuiz && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="bg-[#0b0e14] p-5 sm:p-8 md:p-10 rounded-[25px] sm:rounded-[35px] border border-white/10 max-w-[680px] w-full flex flex-col gap-6 shadow-2xl relative my-4 sm:my-10"
                            >
                                {/* Close Button */}
                                <button 
                                    onClick={() => setReviewQuiz(null)}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-all w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-lg"
                                >
                                    <FiX size={20} />
                                </button>

                                {/* Header Performance Overview */}
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8] bg-[#38bdf8]/10 px-3 py-1 rounded-md border border-[#38bdf8]/20 inline-block">
                                        {reviewQuiz.courseTitle} - {reviewQuiz.quizTitle}
                                    </span>
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                        <FiAward className="text-[#a855f7]" /> Graded Evaluation
                                    </h3>
                                    
                                    {/* Premium horizontal grade stats banner */}
                                    <div className="p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-green-400 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black mb-1">Final Result Score</div>
                                            <div className="text-xl font-black">{reviewQuiz.score} / {reviewQuiz.totalQuestions} Correct Answers</div>
                                        </div>
                                        <div className="text-3xl font-black bg-green-500/10 border border-green-500/20 px-5 py-2.5 rounded-2xl">
                                            {Math.round((reviewQuiz.score / reviewQuiz.totalQuestions) * 100)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Graded responses lists */}
                                <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1.5 no-scrollbar">
                                    {reviewQuiz.answers?.map((ans, idx) => {
                                        const sideBorder = ans.isCorrect ? 'border-l-4 border-l-green-500 bg-green-500/[0.02]' : 'border-l-4 border-l-red-500 bg-red-500/[0.02]';
                                        
                                        return (
                                            <div key={idx} className={`p-5 rounded-2xl border border-white/5 space-y-3 ${sideBorder}`}>
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="font-bold text-sm text-white leading-relaxed">
                                                        <span className="text-slate-400 mr-1.5">Q{idx+1}.</span> {ans.question}
                                                    </div>
                                                    <div className="shrink-0 mt-0.5">
                                                        {ans.isCorrect 
                                                            ? <FiCheck className="text-green-500 bg-green-500/10 p-0.5 rounded-full border border-green-500/30" size={20} /> 
                                                            : <FiX className="text-red-500 bg-red-500/10 p-0.5 rounded-full border border-red-500/30" size={20} />
                                                        }
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
                                                    <div className={`p-3 rounded-xl border flex flex-col gap-0.5 ${
                                                        ans.isCorrect 
                                                        ? 'bg-green-500/5 border-green-500/10 text-green-400' 
                                                        : 'bg-red-500/5 border-red-500/10 text-red-400'
                                                    }`}>
                                                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Your Answer</span>
                                                        <span className="font-bold">{ans.selectedOption || '--'}</span>
                                                    </div>

                                                    {!ans.isCorrect && (
                                                        <div className="p-3 rounded-xl border bg-green-500/5 border-green-500/10 text-green-400 flex flex-col gap-0.5">
                                                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Correct Answer</span>
                                                            <span className="font-bold">{ans.correctAnswer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Close Button */}
                                <button 
                                    onClick={() => setReviewQuiz(null)}
                                    className="w-full py-4 bg-white text-black hover:bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mt-2 shadow-lg"
                                >
                                    Close Sheet
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </PageTransition>
    );
};

export default Quizzes;
