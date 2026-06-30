import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiAward, FiLock, FiBookOpen, FiFileText, 
    FiClipboard, FiX, FiCheckCircle, FiAlertCircle, 
    FiClock, FiActivity, FiGrid, FiList, FiSearch, FiTrendingUp, FiArrowRight
} from 'react-icons/fi';
import Certificate from '../../../components/instructor/Certificate';
import PageTransition from '../../../components/common/PageTransition/PageTransition';

const Certificates = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);
    
    // Premium Interactive States
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const userId = user.id || user._id;
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    const PF = import.meta.env.VITE_API_URL + "/";

    const fetchEnrollments = async () => {
        try {
            const res = await axios.get(`${PF}api/enrollments/student/${userId}`);
            setEnrollments(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching student certificates:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchEnrollments();
        }
    }, [userId]);

    // Helper: calculate breakdown of completed items
    const calculateBreakdown = (enrollment) => {
        const course = enrollment.courseId;
        if (!course) return null;

        const completed = enrollment.completedItems || [];

        const videosTotal = course.videoLectures?.length || 0;
        const videosDone = course.videoLectures?.filter(v => completed.includes(v._id)).length || 0;

        const pdfTotal = course.pdfNotes?.length || 0;
        const pdfDone = course.pdfNotes?.filter(p => completed.includes(p._id)).length || 0;

        const pptTotal = course.pptSlides?.length || 0;
        const pptDone = course.pptSlides?.filter(p => completed.includes(p._id)).length || 0;

        const assignmentsTotal = course.assignments?.length || 0;
        const assignmentsDone = course.assignments?.filter(a => completed.includes(a._id)).length || 0;

        return {
            videos: { done: videosDone, total: videosTotal },
            pdfs: { done: pdfDone, total: pdfTotal },
            ppts: { done: pptDone, total: pptTotal },
            assignments: { done: assignmentsDone, total: assignmentsTotal }
        };
    };

    // Filter and split enrollments
    const earnedCertificates = [];
    const lockedCertificates = [];

    const categories = ['All', ...new Set(enrollments.map(e => e.courseId?.category).filter(Boolean))];

    enrollments.forEach(enroll => {
        const course = enroll.courseId;
        if (!course) return;

        // Apply filters
        const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              course.instructorName?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;

        if (!matchesSearch || !matchesCategory) return;

        // Check if student has passed the final test
        const testResult = course.testResults?.find(r => r.studentId === userId || r.studentId?._id === userId);
        const isPassed = testResult?.status === 'Passed';
        const isCompleted = course.status === 'Completed';

        if (enroll.status === 'Approved' && isCompleted && isPassed) {
            earnedCertificates.push({
                enrollment: enroll,
                course: course,
                testResult: testResult,
                breakdown: calculateBreakdown(enroll)
            });
        } else if (enroll.status === 'Approved') {
            lockedCertificates.push({
                enrollment: enroll,
                course: course,
                testResult: testResult,
                breakdown: calculateBreakdown(enroll)
            });
        }
    });

    // Determine student tier based on certificates earned
    const getStudentTier = (count) => {
        if (count >= 5) return { name: "Grandmaster", style: "from-amber-400 to-red-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]" };
        if (count >= 3) return { name: "Elite Scholar", style: "from-purple-500 to-indigo-500 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]" };
        if (count >= 1) return { name: "Certified Graduate", style: "from-cyan-500 to-blue-500 text-cyan-100 shadow-[0_0_15px_rgba(56,189,248,0.3)]" };
        return { name: "Active Learner", style: "from-slate-600 to-slate-700 text-slate-200" };
    };

    const studentTier = getStudentTier(earnedCertificates.length);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-white">
                <FiActivity className="text-4xl text-[#38bdf8] animate-spin" />
                <p className="text-xs uppercase font-bold tracking-widest text-slate-500">Loading Certificate Archives...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-10 pb-24 font-['Poppins'] text-white">
                
                {/* --- HEADER HERO --- */}
                <div className="relative p-8 sm:p-10 rounded-[30px] bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#a855f7]/10 blur-[130px] rounded-full -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#38bdf8]/5 blur-[100px] rounded-full"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#38bdf8] text-xs sm:text-sm font-black uppercase tracking-[4px]">
                                <FiAward className="animate-bounce text-lg" /> Academic Credentials
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
                                Earned <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#a855f7]">Certificates</span>
                            </h2>
                            <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
                                Access and download verified certificates for courses you have fully cleared, graded, and completed.
                            </p>
                            
                            <div className="pt-2 flex flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${studentTier.style}`}>
                                    Tier: {studentTier.name}
                                </span>
                            </div>
                        </div>
                        
                        <div className="bg-black/40 px-6 sm:px-8 py-5 sm:py-6 rounded-[24px] border border-white/5 text-center flex gap-8 sm:gap-12 shadow-2xl relative overflow-hidden backdrop-blur-lg shrink-0 w-full sm:w-auto justify-center">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#38bdf8] to-[#a855f7]"></div>
                            <div>
                                <div className="text-4xl font-black text-[#38bdf8] [text-shadow:0_0_15px_rgba(56,189,248,0.3)]">{earnedCertificates.length}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-2">Earned</div>
                            </div>
                            <div className="w-px bg-white/10 self-stretch"></div>
                            <div>
                                <div className="text-4xl font-black text-purple-400 [text-shadow:0_0_15px_rgba(168,85,247,0.3)]">{lockedCertificates.length}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-2">In Progress</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FILTERS & SEARCH CONTROL CONTROLLERS --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                                    selectedCategory === cat
                                    ? "bg-gradient-to-r from-[#38bdf8]/20 to-[#a855f7]/20 border-[#38bdf8] text-[#38bdf8]"
                                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 items-center w-full md:w-auto justify-end">
                        {/* Search Input */}
                        <div className="relative w-full md:w-64">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search credentials..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] transition-all"
                            />
                        </div>

                        {/* Layout Toggle Buttons */}
                        <div className="flex bg-black/40 p-1 border border-white/5 rounded-xl shrink-0">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'text-slate-400 hover:text-white'}`}
                                title="Grid View"
                            >
                                <FiGrid size={16} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'text-slate-400 hover:text-white'}`}
                                title="List View"
                            >
                                <FiList size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- SECTION: EARNED CERTIFICATES --- */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-white text-lg font-bold uppercase tracking-wider flex items-center gap-3">
                            <span className="w-2.5 h-6 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            Verified Achievements
                        </h3>
                        <span className="text-xs text-slate-500 font-bold uppercase">{earnedCertificates.length} credentials</span>
                    </div>

                    {earnedCertificates.length > 0 ? (
                        viewMode === 'grid' ? (
                            /* --- GALLERY GRID VIEW --- */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                                {earnedCertificates.map(({ enrollment, course, testResult, breakdown }) => (
                                    <motion.div 
                                        key={enrollment._id}
                                        whileHover={{ y: -6, borderColor: 'rgba(56,189,248,0.3)' }}
                                        className="bg-gradient-to-b from-[#0f172a]/80 to-[#0b0e14]/95 border border-white/10 rounded-[28px] p-6 relative overflow-hidden group shadow-2xl transition-all duration-300 hover:shadow-[0_15px_30px_rgba(56,189,248,0.05)] flex flex-col justify-between h-full"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#38bdf8]/10 to-transparent blur-2xl rounded-full"></div>
                                        
                                        <div>
                                            {/* Micro Decorative Certificate Mockup */}
                                            <div className="relative aspect-[1.48/1] w-full rounded-2xl border border-white/10 bg-[#0f172a] shadow-inner p-3 flex flex-col items-center justify-between text-center overflow-hidden mb-5 group-hover:border-[#38bdf8]/30 transition-all">
                                                {/* Fancy Glowing Shimmer Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                                                
                                                {/* Mini Background design elements */}
                                                <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-full -mr-6 -mt-6"></div>
                                                <div className="absolute bottom-0 left-0 w-12 h-12 bg-[#38bdf8]/5 rounded-full -ml-6 -mb-6"></div>

                                                <div className="flex flex-col items-center mt-1">
                                                    <FiAward className="text-[#a855f7] text-xl" />
                                                    <span className="text-[6px] tracking-[2px] font-black text-[#a855f7] uppercase mt-1">Certificate</span>
                                                    <span className="text-[4px] tracking-[1px] font-bold text-slate-500 uppercase">of completion</span>
                                                </div>

                                                <div className="w-full flex flex-col items-center gap-0.5">
                                                    <span className="text-[4px] text-slate-500 italic">This is certified to</span>
                                                    <div className="text-[7px] font-bold uppercase tracking-tight text-white border-b-[0.5px] border-white/10 px-3 py-0.5">
                                                        {enrollment.studentDetails?.fullName || user.name}
                                                    </div>
                                                    <span className="text-[4px] text-slate-400 line-clamp-1 max-w-[90%] font-medium mt-1">
                                                        "{course.title}"
                                                    </span>
                                                </div>

                                                <div className="w-full flex justify-between items-center text-[4px] text-slate-500 px-2 mt-1">
                                                    <span>REG NO: {enrollment.regNumber}</span>
                                                    {/* Golden Seal Mock */}
                                                    <div className="w-4 h-4 rounded-full bg-amber-500 border border-amber-300 flex items-center justify-center text-[3px] text-white font-bold shadow-lg">★</div>
                                                    <span>AuraLearn LMS</span>
                                                </div>
                                            </div>

                                            {/* Details Info */}
                                            <div className="space-y-2.5">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded-md border border-[#38bdf8]/20">
                                                        {course.category}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9px] font-black text-white/90 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                                            Grade: <b className="text-green-400">{testResult.grade}%</b>
                                                        </span>
                                                    </div>
                                                </div>

                                                <h4 className="text-white text-md font-bold tracking-tight uppercase line-clamp-1 group-hover:text-[#38bdf8] transition-colors">
                                                    {course.title}
                                                </h4>
                                                <p className="text-slate-400 text-xs font-medium">
                                                    Instructor: <b className="text-slate-200">{course.instructorName}</b>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="border-t border-white/5 mt-5 pt-4 flex items-center justify-between gap-4">
                                            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                                                Issued: <b>{new Date(course.completionDate || enrollment.updatedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</b>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedCert({
                                                    studentName: enrollment.studentDetails?.fullName || user.name,
                                                    courseName: course.title,
                                                    instructorName: course.instructorName,
                                                    regNo: enrollment.regNumber
                                                })}
                                                className="px-5 py-2.5 bg-gradient-to-r from-[#38bdf8] to-[#a855f7] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center gap-1"
                                            >
                                                Download <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            /* --- PERFORMANCE LIST ROW VIEW --- */
                            <div className="space-y-4">
                                {earnedCertificates.map(({ enrollment, course, testResult, breakdown }) => (
                                    <motion.div 
                                        key={enrollment._id}
                                        whileHover={{ x: 4, borderColor: 'rgba(56,189,248,0.4)' }}
                                        className="bg-[#0f172a]/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(56,189,248,0.05)]"
                                    >
                                        {/* Left: Course Details */}
                                        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-1/3 shrink-0">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-slate-900 shadow-inner flex items-center justify-center">
                                                {course.thumbnail ? (
                                                    <img 
                                                        src={`${PF}${course.thumbnail.replace(/\\/g, '/')}`} 
                                                        alt={course.title} 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => { e.target.src = `https://placehold.co/100x100/0f172a/38bdf8?text=${(course.title?.charAt(0) || 'C')}` }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#a855f7] to-[#38bdf8] text-white font-black text-xl uppercase">
                                                        {course.title?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#38bdf8]">{course.category}</span>
                                                <h4 className="text-white text-md sm:text-lg font-bold tracking-tight uppercase line-clamp-1 group-hover:text-[#38bdf8] transition-colors">{course.title}</h4>
                                                <p className="text-slate-400 text-xs font-medium mt-0.5">Instructor: <b className="text-slate-200">{course.instructorName}</b></p>
                                            </div>
                                        </div>

                                        {/* Middle: Performance breakdown summary */}
                                        {breakdown && (
                                            <div className="hidden lg:flex items-center gap-6 bg-black/20 px-5 py-3 rounded-2xl border border-white/5 text-[11px] text-slate-400 font-medium">
                                                <span className="flex items-center gap-1.5"><FiBookOpen size={12} className="text-[#38bdf8]"/> {breakdown.videos.done}/{breakdown.videos.total} Videos</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                                <span className="flex items-center gap-1.5"><FiFileText size={12} className="text-[#a855f7]"/> {breakdown.pdfs.done}/{breakdown.pdfs.total} Notes</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                                <span className="flex items-center gap-1.5"><FiClipboard size={12} className="text-green-400"/> {breakdown.assignments.done}/{breakdown.assignments.total} Labs</span>
                                            </div>
                                        )}

                                        {/* Right: Performance & Action Button */}
                                        <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-between md:justify-end w-full md:w-auto shrink-0">
                                            {/* Metrics */}
                                            <div className="flex gap-6 text-center">
                                                <div>
                                                    <div className="text-md font-black text-white">{testResult.grade}%</div>
                                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Grade</div>
                                                </div>
                                                <div className="w-px bg-white/10 h-8 self-center"></div>
                                                <div>
                                                    <div className="text-md font-black text-green-400">Passed</div>
                                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Status</div>
                                                </div>
                                                <div className="w-px bg-white/10 h-8 self-center"></div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-white/95 leading-tight pt-0.5">
                                                        {new Date(course.completionDate || enrollment.updatedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">Issued</div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button 
                                                onClick={() => setSelectedCert({
                                                    studentName: enrollment.studentDetails?.fullName || user.name,
                                                    courseName: course.title,
                                                    instructorName: course.instructorName,
                                                    regNo: enrollment.regNumber
                                                })}
                                                className="px-6 py-3.5 bg-gradient-to-r from-[#38bdf8] to-[#a855f7] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 w-full sm:w-auto text-center animate-pulse"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="p-16 border-2 border-dashed border-white/10 rounded-[35px] text-center max-w-xl mx-auto space-y-4">
                            <FiAward className="text-slate-600 text-5xl mx-auto opacity-30 animate-pulse" />
                            <h4 className="text-white font-bold uppercase tracking-wide">No Certificates Earned Yet</h4>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto font-medium">
                                You need to complete courses and pass their final assessment capstone exams with a grade of 50% or above to claim verified certificates.
                            </p>
                        </div>
                    )}
                </section>

                {/* --- SECTION: LOCKED / IN PROGRESS --- */}
                <section className="space-y-6 pt-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-white text-lg font-bold uppercase tracking-wider flex items-center gap-3">
                            <span className="w-2.5 h-6 bg-[#a855f7] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                            Locked Credentials
                        </h3>
                        <span className="text-xs text-slate-500 font-bold uppercase">{lockedCertificates.length} locked</span>
                    </div>

                    {lockedCertificates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                            {lockedCertificates.map(({ enrollment, course, testResult, breakdown }) => {
                                // Calculate status display
                                let statusText = "Active Learning";
                                let statusColor = "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20 shadow-[0_0_10px_rgba(56,189,248,0.05)]";
                                let statusIcon = <FiBookOpen className="text-xs" />;
                                let statusDesc = "Review course materials and prepare for the final assessment.";
                                let isExamAvailable = false;

                                if (course.status === 'Completed') {
                                    if (!testResult) {
                                        statusText = "Exam Available";
                                        statusColor = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.1)]";
                                        statusIcon = <FiAlertCircle className="text-xs animate-bounce" />;
                                        statusDesc = "Capstone Final Exam is now open! Attempt it inside course player.";
                                        isExamAvailable = true;
                                    } else if (testResult.status === 'Pending') {
                                        statusText = "Evaluation Pending";
                                        statusColor = "text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]";
                                        statusIcon = <FiClock className="text-xs animate-spin" />;
                                        statusDesc = "Final paper submitted. Wait for instructor evaluation.";
                                    } else if (testResult.status === 'Failed') {
                                        statusText = "Re-attempt Required";
                                        statusColor = "text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
                                        statusIcon = <FiX className="text-xs" />;
                                        statusDesc = `Your score: ${testResult.grade}% (Needs >=50%). Submit answers again.`;
                                        isExamAvailable = true;
                                    }
                                } else {
                                    statusDesc = "Final assessment will become available once course is finalized.";
                                }

                                return (
                                    <div 
                                        key={enrollment._id} 
                                        className="bg-gradient-to-r from-[#0f172a]/40 to-[#0f172a]/20 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col justify-between gap-6 group hover:border-[#a855f7]/20 transition-all hover:shadow-[0_10px_25px_rgba(168,85,247,0.02)] h-full"
                                    >
                                        <div className="space-y-4">
                                            {/* Header row */}
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 shrink-0">
                                                        <FiLock size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{course.category}</span>
                                                        <h5 className="text-white font-bold text-sm sm:text-md tracking-tight line-clamp-1 uppercase group-hover:text-purple-400 transition-colors">
                                                            {course.title}
                                                        </h5>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${statusColor}`}>
                                                    {statusIcon} {statusText}
                                                </div>
                                            </div>

                                            {/* Info message */}
                                            <p className="text-slate-400 text-[11px] font-medium leading-relaxed bg-black/15 p-3 rounded-xl border border-white/[0.03]">
                                                {statusDesc}
                                            </p>
                                        </div>

                                        {/* Progress row */}
                                        <div className="space-y-3 pt-2">
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-slate-500 uppercase tracking-wider">Curriculum Progress</span>
                                                <span className="text-[#38bdf8] font-black">{enrollment.progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                <div className="h-full bg-gradient-to-r from-[#38bdf8] to-[#a855f7] rounded-full transition-all duration-700" style={{ width: `${enrollment.progress}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Action footer */}
                                        <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-4 mt-2">
                                            {/* Breakdown counts */}
                                            {breakdown && (
                                                <div className="flex gap-4 text-[10px] text-slate-500 font-medium">
                                                    <span>Videos: <b>{breakdown.videos.done}/{breakdown.videos.total}</b></span>
                                                    <span>Labs: <b>{breakdown.assignments.done}/{breakdown.assignments.total}</b></span>
                                                </div>
                                            )}
                                            
                                            <button 
                                                onClick={() => window.location.href = '/student-dashboard/my-courses'}
                                                className={`px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                                    isExamAvailable 
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {isExamAvailable ? 'Take Assessment' : 'Resume Learning'} <FiArrowRight size={10} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-slate-600 py-10 text-xs italic font-bold uppercase tracking-wider border border-dashed border-white/5 rounded-3xl">
                            No locked credentials found.
                        </div>
                    )}
                </section>
                
                {/* --- MODAL POPUP FOR PREVIEW --- */}
                <AnimatePresence>
                    {selectedCert && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[5000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="relative bg-[#0c1017] p-4 sm:p-6 md:p-8 rounded-[25px] sm:rounded-[35px] border border-white/10 max-w-[960px] w-full flex flex-col items-center gap-6 shadow-2xl my-4 sm:my-8 max-h-[90vh] overflow-y-auto"
                            >
                                <button 
                                    onClick={() => setSelectedCert(null)}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-all w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-lg"
                                    title="Close Certificate Overlay"
                                >
                                    <FiX size={20} />
                                </button>
                                
                                <div className="w-full overflow-x-auto no-scrollbar flex justify-center py-4">
                                    <Certificate 
                                        studentName={selectedCert.studentName}
                                        courseName={selectedCert.courseName}
                                        instructorName={selectedCert.instructorName}
                                        regNo={selectedCert.regNo}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </PageTransition>
    );
};

export default Certificates;
