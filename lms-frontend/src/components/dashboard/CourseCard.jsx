import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiUser, FiArrowRight, FiClock, FiCheckCircle } from 'react-icons/fi';
import EnrollmentModal from './EnrollmentModal';

const CourseCard = ({ course, onEnrollSuccess }) => {
    const PF = import.meta.env.VITE_API_URL + "/";
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [localStatus, setLocalStatus] = useState(course.enrollmentStatus || course.status);

    //  Teacher ID and Status priority check
    const teacherId = course.instructor || course.teacherId || course.userId;
    
    // Status prioritization
    const currentStatus = localStatus;

    // Resource counting logic
    const totalResources = (course.videoLectures?.length || 0) + (course.pdfNotes?.length || 0);

    const handleAction = () => {
        if (currentStatus === 'Approved') {
            window.location.href = `/student-dashboard/course-details/${course._id}`;
        } else if (currentStatus === 'Pending') {
            return; 
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <motion.div 
                whileHover={{ y: -10 }}
                className="w-full bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-[28px] overflow-hidden group shadow-xl transition-all hover:border-[#38bdf8]/50 font-['Poppins']"
            >
                {/* Thumbnail Section */}
                <div className="relative h-[160px] sm:h-[200px] w-full overflow-hidden">
                    <img 
                        src={course.thumbnail ? `${PF}${course.thumbnail.replace(/\\/g, '/')}` : `https://placehold.co/600x400/0f172a/38bdf8?text=${encodeURIComponent(course.title || course.courseTitle || 'Course')}`} 
                        alt={course.title || course.courseTitle} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src = `https://placehold.co/600x400/0f172a/38bdf8?text=Course` }}
                    />
                    <div className="absolute top-4 left-4 bg-[#38bdf8] text-[#0f172a] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                        {course.category || 'Curriculum'}
                    </div>
                    
                    {currentStatus === 'Approved' && (
                        <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiCheckCircle size={40} className="text-white drop-shadow-lg" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                    <h3 className="text-white text-xl font-bold mb-2 line-clamp-1 group-hover:text-[#38bdf8] transition-colors">
                        {course.title || course.courseTitle}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                        <FiUser className="text-[#a855f7]" />
                        <span className="truncate">by {course.instructorName || "Instructor"}</span>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                            <FiBook className="text-[#38bdf8]" />
                            <span>{totalResources > 0 ? totalResources : course.lessonCount || 0} Resources</span>
                        </div>
                        
                        <div className={`text-[10px] font-black uppercase px-2 py-1 rounded tracking-tighter transition-colors ${
                            currentStatus === 'Pending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                            currentStatus === 'Approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                            'bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20'
                        }`}>
                            {currentStatus === 'Pending' ? "Request Pending" : 
                             currentStatus === 'Approved' ? "Enrolled" : 
                             course.level || "Beginner"}
                        </div>
                    </div>

                    {/*  PROGRESS BAR SECTION (Sirf Approved Students ke liye) */}
                    {currentStatus === 'Approved' && (
                        <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Course Progress</span>
                                <span className="text-[#38bdf8]">{course.progress || 0}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${course.progress || 0}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#a855f7] to-[#38bdf8] rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                    )}

                    {/*  Dynamic Action Button */}
                    <button 
                        onClick={handleAction}
                        disabled={currentStatus === 'Pending'}
                        className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-lg ${
                            currentStatus === 'Approved' ? "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-[#38bdf8]/50" :
                            currentStatus === 'Pending' ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 opacity-80" :
                            "bg-gradient-to-r from-[#38bdf8] to-[#2563eb] text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                        }`}
                    >
                        {currentStatus === 'Approved' ? (
                            <>View Resources <FiArrowRight /></>
                        ) : currentStatus === 'Pending' ? (
                            <><FiClock className="animate-pulse"/> Approval Pending</>
                        ) : (
                            <>Enroll Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>
            </motion.div>

            <EnrollmentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                course={{ ...course, teacherId: teacherId }} 
                onSuccess={() => {
                    setLocalStatus('Pending');
                    if (onEnrollSuccess) onEnrollSuccess();
                }}
            />
        </>
    );
};

export default CourseCard;