import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiArrowLeft, FiPlayCircle, FiFileText, FiTarget, 
    FiLayers, FiCheckCircle, FiDownload, FiExternalLink, 
    FiRefreshCw, FiUsers, FiClock, FiLayout, FiEdit3, FiAward,
    FiChevronDown, FiChevronUp 
} from 'react-icons/fi';

const CourseDetailsView = ({ course: initialCourse, onBack }) => {
    const [course, setCourse] = useState(initialCourse);
    const [expandedSections, setExpandedSections] = useState({}); // State to track which sections are open
    const API_URL = import.meta.env.VITE_API_URL + "/";

    const fetchLatestCourseData = async () => {
        try {
            const res = await axios.get(`${API_URL}api/courses/${initialCourse._id}`);
            if (JSON.stringify(res.data) !== JSON.stringify(course)) {
                setCourse(res.data);
            }
        } catch (err) {
            console.error("Sync Error:", err);
        }
    };

    useEffect(() => {
        fetchLatestCourseData();
        const interval = setInterval(() => {
            fetchLatestCourseData();
        }, 3000); 
        return () => clearInterval(interval);
    }, [initialCourse._id]);

    const totalVideos = course.videoLectures?.length || 0;
    const totalPDFs = course.pdfNotes?.length || 0;
    const totalPPTs = course.pptSlides?.length || 0;
    const totalAssignments = course.assignments?.filter(a => a.title !== "FINAL_EXAM").length || 0;
    const hasFinalExam = course.assignments?.some(a => a.title === "FINAL_EXAM");

    //  Teacher Logic
    const pendingGrades = course.testResults?.filter(r => r.status === 'Pending').length || 0;
    const totalEnrolled = course.enrollments?.length || 0;

    const toggleSection = (sectionName) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
    };

    const handleFileAction = (path) => {
        if (!path) return alert("File path not found!");
        const finalUrl = `${API_URL}${path.replace(/\\/g, '/')}`;
        window.open(finalUrl, '_blank');
    };

    // Helper to slice data
    const getVisibleItems = (items, sectionName) => {
        if (!items) return [];
        return expandedSections[sectionName] ? items : items.slice(0, 2);
    };

    return (
        <div className="bg-[#080a0f] min-h-screen text-white pb-[50px] font-sans">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 px-4 md:px-12 py-[15px] bg-[#0f172a]/95 backdrop-blur-[15px] border-b border-[#a855f7]/20 sticky top-0 z-[1000]">
                <button onClick={onBack} className="w-full md:w-auto flex justify-center items-center gap-2.5 bg-transparent border border-[#a855f7] text-[#a855f7] px-4 py-2 md:px-5 md:py-2.5 rounded-[10px] font-semibold cursor-pointer transition-all hover:bg-[#a855f710]">
                    <FiArrowLeft /> <span>Back to Dashboard</span>
                </button>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
                    <span className="bg-[#a855f720] text-[#a855f7] px-2 md:px-3 py-1 rounded-full border border-[#a855f740] text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Instructor Mode</span>
                    <span className="text-slate-600 hidden sm:inline">|</span>
                    <span className="truncate max-w-[150px] sm:max-w-xs">Preview: {course.title}</span>
                    <span className="bg-[#22c55e1a] text-[#22c55e] px-2 py-1 md:px-2.5 rounded-full flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs">
                        <FiRefreshCw className="animate-spin" /> <span className="hidden sm:inline">Live Sync</span>
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 md:gap-[50px] px-4 md:px-12 py-6 md:py-10 max-w-[1500px] mx-auto">
                <aside>
                    <div className="sticky top-[110px]">
                        <div className="rounded-[20px] overflow-hidden border border-[#1f2937] bg-[#111827]">
                            <img src={`${API_URL}${course.thumbnail?.replace(/\\/g, '/')}`} alt="Thumbnail" className="w-full h-[220px] object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/400x250?text=No+Thumbnail'} />
                        </div>

                        <div className="bg-[#a855f70a] mt-5 p-5 rounded-[15px] border border-[#a855f720] space-y-[12px]">
                            <h4 className="text-[#a855f7] font-bold text-[11px] uppercase tracking-[2px]">Insights</h4>
                            <div className="flex justify-between text-sm"><span className="text-slate-400 flex items-center gap-2"><FiUsers size={14}/> Enrolled</span><span className="font-bold">{totalEnrolled}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400 flex items-center gap-2"><FiClock size={14}/> Pending Grades</span><span className={`font-bold ${pendingGrades > 0 ? 'text-yellow-500' : 'text-slate-500'}`}>{pendingGrades}</span></div>
                        </div>

                        <div className="mt-5 p-5 rounded-[15px] bg-[#a855f70d] border border-[#a855f71a] space-y-2">
                            <h4 className="text-white font-bold mb-3 text-sm">Curriculum Stats</h4>
                            <StatLine icon={<FiPlayCircle/>} label="Videos" count={totalVideos} />
                            <StatLine icon={<FiFileText/>} label="PDFs" count={totalPDFs} />
                            <StatLine icon={<FiLayout/>} label="Slides" count={totalPPTs} />
                            <StatLine icon={<FiEdit3/>} label="Tasks" count={totalAssignments} />
                        </div>
                    </div>
                </aside>

                <main>
                    <section className="mb-10">
                        <div className="flex gap-2 mb-4">
                            <span className="bg-[#a855f720] text-[#a855f7] px-3 py-1 rounded-full text-[0.7rem] font-bold border border-[#a855f740] uppercase">{course.category}</span>
                            {course.status === 'Completed' && <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[0.7rem] font-bold border border-green-500/30 uppercase flex items-center gap-1"><FiCheckCircle size={10}/> Finalized</span>}
                        </div>
                        <h1 className="text-3xl md:text-[3rem] font-extrabold my-3 md:my-[15px] bg-gradient-to-r from-white to-[#a855f7] bg-clip-text text-transparent leading-tight">{course.title}</h1>
                        <p className="text-[#94a3b8] leading-relaxed text-sm md:text-[1.1rem] max-w-[800px]">{course.description}</p>
                    </section>

                    {hasFinalExam && (
                        <div className="mb-10 p-6 bg-gradient-to-r from-[#a855f71a] to-transparent border-l-4 border-[#a855f7] rounded-r-2xl">
                            <h3 className="text-[#a855f7] font-bold flex items-center gap-2 mb-2"><FiAward/> FINAL ASSESSMENT READY</h3>
                            <p className="text-xs text-slate-400">Instructor managed final exam file is active for this curriculum.</p>
                        </div>
                    )}

                    {/* Section 1: Video Lectures */}
                    <MaterialSection 
                        title="Video Lectures" 
                        icon={<FiPlayCircle />} 
                        count={`${totalVideos} Lessons`}
                        showViewAll={totalVideos > 2}
                        isExpanded={expandedSections['videos']}
                        onToggle={() => toggleSection('videos')}
                    >
                        {totalVideos > 0 ? getVisibleItems(course.videoLectures, 'videos').map((video, idx) => (
                            <MaterialItem key={idx} index={idx + 1} title={video.title} type="MP4 Video" onAction={() => handleFileAction(video.filePath)} actionLabel="Preview" actionIcon={<FiPlayCircle />} />
                        )) : <EmptyMsg msg="No videos yet." />}
                    </MaterialSection>

                    {/* Section 2: PPT Slides */}
                    <MaterialSection 
                        title="PPT Slides" 
                        icon={<FiLayout />} 
                        count={`${totalPPTs} Presentations`}
                        showViewAll={totalPPTs > 2}
                        isExpanded={expandedSections['ppt']}
                        onToggle={() => toggleSection('ppt')}
                    >
                        {totalPPTs > 0 ? getVisibleItems(course.pptSlides, 'ppt').map((ppt, idx) => (
                            <MaterialItem key={idx} title={ppt.title} type="PowerPoint" icon={<FiLayout className="text-orange-400" />} onAction={() => handleFileAction(ppt.filePath)} actionLabel="View" actionIcon={<FiExternalLink />} />
                        )) : <EmptyMsg msg="No slides uploaded." />}
                    </MaterialSection>

                    {/* Section 3: PDF Resources */}
                    <MaterialSection 
                        title="PDF Resources" 
                        icon={<FiFileText />} 
                        count={`${totalPDFs} Documents`}
                        showViewAll={totalPDFs > 2}
                        isExpanded={expandedSections['pdf']}
                        onToggle={() => toggleSection('pdf')}
                    >
                        {totalPDFs > 0 ? getVisibleItems(course.pdfNotes, 'pdf').map((pdf, idx) => (
                            <MaterialItem key={idx} title={pdf.title} type="PDF" icon={<FiFileText className="text-red-400" />} onAction={() => handleFileAction(pdf.filePath)} actionLabel="Open" actionIcon={<FiExternalLink />} />
                        )) : <EmptyMsg msg="No documents available." />}
                    </MaterialSection>

                    {/* Section 4: Course Assignments */}
                    <MaterialSection 
                        title="Course Assignments" 
                        icon={<FiEdit3 />} 
                        count={`${totalAssignments} Tasks`}
                        showViewAll={totalAssignments > 2}
                        isExpanded={expandedSections['assignments']}
                        onToggle={() => toggleSection('assignments')}
                    >
                        {totalAssignments > 0 ? getVisibleItems(course.assignments?.filter(a => a.title !== "FINAL_EXAM"), 'assignments').map((task, idx) => (
                            <MaterialItem key={idx} title={task.title} type="Assignment" icon={<FiEdit3 className="text-blue-400" />} onAction={() => handleFileAction(task.filePath)} actionLabel="Inspect" actionIcon={<FiExternalLink />} />
                        )) : <EmptyMsg msg="No regular assignments yet." />}
                    </MaterialSection>
                </main>
            </div>
        </div>
    );
};

// --- Reusable Components ---
const StatLine = ({ icon, label, count }) => (
    <div className="flex justify-between items-center py-1 text-[#94a3b8] text-[0.85rem]">
        <span className="flex items-center gap-2">{icon} {label}</span><b>{count}</b>
    </div>
);

const MaterialSection = ({ title, icon, count, children, showViewAll, isExpanded, onToggle }) => (
    <section className="bg-[#111827] p-4 md:p-[25px] rounded-[20px] border border-[#1f2937] mb-[30px] shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <h3 className="flex items-center gap-3 text-white font-bold text-base md:text-lg"><span className="text-[#a855f7]">{icon}</span> {title}</h3>
            <span className="bg-[#080a0f] px-2.5 py-1 rounded-lg text-[#64748b] text-[0.8rem] self-start sm:self-auto">{count}</span>
        </div>
        <div className="flex flex-col gap-3">
            {children}
        </div>
        {showViewAll && (
            <button 
                onClick={onToggle}
                className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-[#a855f7] hover:bg-[#a855f710] rounded-xl transition-all border border-transparent hover:border-[#a855f730]"
            >
                {isExpanded ? <><FiChevronUp /> Show Less</> : <><FiChevronDown /> View All Content</>}
            </button>
        )}
    </section>
);

const MaterialItem = ({ index, title, type, icon, onAction, actionLabel, actionIcon }) => (
    <div className="bg-[#080a0f] p-[15px_20px] rounded-xl flex justify-between items-center transition-all border border-transparent hover:border-[#a855f7] hover:bg-[#161b22] hover:translate-x-1 animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center gap-5">
            {index && <span className="text-[#a855f7] font-extrabold">{index}</span>}
            {icon || <FiPlayCircle className="text-[#a855f7] text-[1.4rem]" />}
            <div className="max-w-[150px] sm:max-w-md">
                <p className="font-semibold text-[#e2e8f0] truncate">{title}</p>
                <span className="text-[0.75rem] text-[#4b5563]">{type}</span>
            </div>
        </div>
        <button onClick={onAction} className="bg-[#1e293b] text-[#94a3b8] px-[15px] py-2 rounded-lg text-[0.85rem] flex items-center gap-1.5 transition-colors hover:bg-[#a855f7] hover:text-white">
            {actionIcon} <span className="hidden sm:inline">{actionLabel}</span>
        </button>
    </div>
);

const EmptyMsg = ({ msg }) => <p className="text-[#4b5563] italic text-center py-5">{msg}</p>;

export default CourseDetailsView;