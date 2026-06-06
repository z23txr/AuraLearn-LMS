import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CourseCard from './CourseCard';
import { FiPlayCircle } from 'react-icons/fi';
import { useOutletContext } from 'react-router-dom';

const MyCourses = () => {
    const { searchQuery } = useOutletContext() || {};
    const [enrolled, setEnrolled] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('auraUser'));

    useEffect(() => {
        const fetchEnrolled = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/enrollments/student/${user.id || user._id}`);
                const myEnrolled = res.data.filter(e => e.status === 'Approved' || e.status === 'Pending');
                setEnrolled(myEnrolled);
                setLoading(false);
            } catch (err) { 
                console.error(err); 
                setLoading(false); 
            }
        };
        fetchEnrolled();
    }, [user.id, user._id]);

    if (loading) return <div className="p-20 text-[#38bdf8] font-black animate-pulse text-center">ACCESSING YOUR LEARNING PATH...</div>;

    return (
        <div className="p-8 animate-in fade-in duration-500 font-['Poppins']">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-[#38bdf8]/10 rounded-2xl text-[#38bdf8]">
                    <FiPlayCircle size={32} />
                </div>
                <h2 className="text-white text-3xl font-bold">My Learning Journey</h2>
            </div>

            {/* Filter enrolled courses based on search query */}
            {(() => {
                const filteredEnrolled = enrolled.filter(item => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    const title = item.courseTitle || item.courseId?.title;
                    const category = item.courseId?.category;
                    const instructor = item.teacherId?.name || "Instructor";
                    return (
                        title?.toLowerCase().includes(query) ||
                        category?.toLowerCase().includes(query) ||
                        instructor?.toLowerCase().includes(query)
                    );
                });

                return filteredEnrolled.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredEnrolled.map(item => {
                            //  Dynamic lesson count calculation
                            const totalLessons = (item.courseId?.videoLectures?.length || 0) + 
                                                 (item.courseId?.pdfNotes?.length || 0);

                            return (
                                <CourseCard 
                                    key={item._id} 
                                    course={{ 
                                        ...item.courseId, 
                                        _id: item.courseId?._id, 
                                        title: item.courseTitle, 
                                        status: item.status,
                                        enrollmentStatus: item.status,
                                        instructorName: item.teacherId?.name || "Instructor", 
                                        lessonCount: totalLessons
                                    }} 
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white/[0.02] border border-white/5 p-20 rounded-[40px] text-center backdrop-blur-md">
                        <p className="text-slate-400 text-lg font-medium">
                            {searchQuery ? "No courses match your search." : "No courses enrolled or pending yet. Explore the library to begin!"}
                        </p>
                    </div>
                );
            })()}
        </div>
    );
};

export default MyCourses;