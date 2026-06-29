import React from 'react';
import CourseCard from './CourseCard';
import { useOutletContext } from 'react-router-dom';

const AIRecommendationRow = ({ title, courses, enrolledCourses = [], aiPowered }) => {
    const { searchQuery } = useOutletContext() || {};

    // Filter Logic
    const recommendedCourses = courses.filter(course => 
        !enrolledCourses.some(enrolled => enrolled.courseId?._id === course._id || enrolled._id === course._id)
    ).filter(course => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            course.title?.toLowerCase().includes(query) ||
            course.category?.toLowerCase().includes(query) ||
            course.description?.toLowerCase().includes(query) ||
            course.instructorName?.toLowerCase().includes(query)
        );
    });

    if (recommendedCourses.length === 0 && courses.length > 0) return null;

    return (
        <section className="mb-12 group animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Row Header */}
            <div className="flex flex-row justify-between items-start sm:items-end mb-6 px-1 gap-2 sm:gap-4">
                <div className="space-y-1">
                    <h3 className="text-white text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
                        {title} 
                        {aiPowered && (
                            <span className="bg-gradient-to-r from-[#38bdf8] to-[#a855f7] text-white text-[0.65rem] uppercase font-black px-2.5 py-1 rounded-md tracking-[1px] shadow-[0_0_15px_rgba(56,189,248,0.3)] animate-pulse shrink-0">
                                AI Suggested
                            </span>
                        )}
                    </h3>
                    <div className="h-1 w-12 bg-[#a855f7] rounded-full transition-all duration-500 group-hover:w-24"></div>
                </div>
                
                <button className="text-[#38bdf8] text-xs sm:text-sm font-semibold hover:text-white transition-colors flex items-center gap-1 group/btn shrink-0 pt-1 sm:pt-0">
                    See All <span className="group-hover/btn:translate-x-1 transition-transform inline-block">→</span>
                </button>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scroll-smooth no-scrollbar select-none">
                {recommendedCourses.length > 0 ? (
                    recommendedCourses.map((course, index) => (
                        <div key={course._id || index} className="min-w-[260px] sm:min-w-[300px] max-w-[320px] transition-transform duration-300 hover:-translate-y-2">
                            <CourseCard course={course} />
                        </div>
                    ))
                ) : (
                    <div className="w-full py-10 border border-dashed border-white/10 rounded-[30px] flex items-center justify-center">
                        <p className="text-slate-500 italic text-sm">No new recommendations at the moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AIRecommendationRow;