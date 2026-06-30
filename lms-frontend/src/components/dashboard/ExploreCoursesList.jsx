import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CourseCard from './CourseCard';
import { FiLoader, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { useOutletContext } from 'react-router-dom';

const ExploreCoursesList = ({ limit, showPagination = false, sortBy }) => {
    const { searchQuery } = useOutletContext() || {};
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 8;
    const user = JSON.parse(localStorage.getItem('auraUser'));

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const studentId = user?.id || user?._id;
                
                //  Backend call with sorting support
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/enrollments/all-with-status?studentId=${studentId}&sortBy=${sortBy || ''}`);
                
                console.log("Aura Library Data:", res.data);

                //  FLEXIBLE FILTER LOGIC:
               
                const nonEnrolledCourses = res.data.filter(course => {
                    const status = course.enrollmentStatus;
                    return status !== 'Approved' && status !== 'Pending';
                });
                
                setCourses(nonEnrolledCourses);
            } catch (err) {
                console.error("Aura Sync Error:", err);
            } finally {
                setLoading(false); 
            }
        };
        fetchCourses();
    }, [user?.id, user?._id, sortBy]);

    const updateStatusLocally = (courseId) => {
        setCourses(prev => prev.filter(c => c._id !== courseId));
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-40 gap-4">
                <FiLoader className="w-12 h-12 text-[#38bdf8] animate-spin" />
                <div className="text-[#38bdf8] font-black animate-pulse tracking-[0.3em] text-xs uppercase">
                    Accessing Aura Library...
                </div>
            </div>
        );
    }

    // Filter courses based on search query
    const filteredCourses = courses.filter(course => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            course.title?.toLowerCase().includes(query) ||
            course.category?.toLowerCase().includes(query) ||
            course.description?.toLowerCase().includes(query) ||
            (course.instructorName || course.teacherId?.name)?.toLowerCase().includes(query)
        );
    });

    // Pagination Logic
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = limit 
        ? filteredCourses.slice(0, limit) 
        : filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    return (
        <div className="w-full animate-in fade-in duration-700">
            {/* Library Header Info */}
            <div className="flex justify-end mb-8">
                <span className="text-[#38bdf8] bg-[#38bdf8]/10 px-5 py-2 rounded-full border border-[#38bdf8]/20 text-[10px] font-black tracking-[2px] uppercase shadow-lg">
                    {filteredCourses.length} New Paths Found
                </span>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-8 lg:gap-10 justify-items-center">
                {filteredCourses.length > 0 ? (
                    currentCourses.map((course) => (
                        <CourseCard 
                            key={course._id} 
                            course={course} 
                            onEnrollSuccess={() => updateStatusLocally(course._id)}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-32 flex flex-col items-center gap-4 text-slate-600">
                        <FiSearch size={50} className="opacity-20 text-[#a855f7]" />
                        <p className="font-bold italic uppercase tracking-[4px] text-[10px] text-center max-w-xs">
                            No courses match your search.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {showPagination && totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mt-12 sm:mt-20 py-6 sm:py-10 border-t border-white/5">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                        className="px-6 py-3 bg-white/5 rounded-2xl text-[#38bdf8] font-black uppercase text-[10px] tracking-widest disabled:opacity-20 hover:bg-[#38bdf8] hover:text-[#0f172a] transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-slate-500 font-bold text-xs">
                        {currentPage} / {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                        className="px-6 py-3 bg-white/5 rounded-2xl text-[#38bdf8] font-black uppercase text-[10px] tracking-widest disabled:opacity-20 hover:bg-[#38bdf8] hover:text-[#0f172a] transition-all"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExploreCoursesList;