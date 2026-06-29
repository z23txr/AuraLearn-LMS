import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import AddCourseModal from './AddCourseModal.jsx'; 
import CourseBuilder from './CourseBuilder.jsx';
import CourseDetailsView from './CourseDetailView.jsx';

const MyCourses = () => {
    const { searchQuery } = useOutletContext();
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [viewingCourse, setViewingCourse] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 6;

    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const instructorId = user.id || user._id;
    const token = localStorage.getItem('token')?.replace(/"/g, '');

    const fetchInstructorCourses = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/courses");
            // Fixed Comparison using toString()
            const filtered = res.data.filter(c => c.instructor?.toString() === instructorId?.toString());
            setMyCourses(filtered);
            setLoading(false);
        } catch (err) { 
            toast.error("Failed to load courses"); 
            setLoading(false); 
        }
    };

    useEffect(() => { if (instructorId) fetchInstructorCourses(); }, [instructorId]);

    const handleDelete = async (courseId) => {
        const result = await Swal.fire({
            title: 'Delete this course?',
            text: "This action is permanent. All resources and enrollments will be lost.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Yes, delete it',
            background: '#0f172a',
            color: '#fff',
            borderRadius: '20px'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:5000/api/courses/delete/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyCourses(prev => prev.filter(c => c._id !== courseId));
            toast.success("Course Deleted!");
        } catch (err) { toast.error("Delete failed."); }
    };

    const filteredCourses = myCourses.filter(course => 
        course.title?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
    );

    const currentCourses = filteredCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    if (selectedCourse) return <CourseBuilder course={selectedCourse} onBack={() => { fetchInstructorCourses(); setSelectedCourse(null); }} refreshData={fetchInstructorCourses} />;
    if (viewingCourse) return <CourseDetailsView course={viewingCourse} onBack={() => setViewingCourse(null)} />;

    return (
        <div className="p-4 md:p-12 bg-[#05070a] min-h-screen text-slate-50 font-['Outfit']">
            
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">My Courses</h2>
                    <p className="text-slate-400 mt-2 md:mt-0">Manage your active curriculum</p>
                </div>
                <button className="w-full md:w-auto bg-[#a855f7] text-white px-8 py-4 rounded-2xl font-bold flex justify-center items-center gap-3" onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> New Course
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-[#a855f7] font-bold animate-pulse">SYNCHRONIZING...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentCourses.map(course => (
                        <div key={course._id} className="bg-[#0f1218] rounded-[28px] border border-white/10 overflow-hidden group hover:border-[#a855f7] transition-all">
                            <div className="h-48 m-2 rounded-2xl overflow-hidden bg-slate-800">
                                <img src={`http://localhost:5000/${course.thumbnail?.replace(/\\/g, '/')}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white truncate mb-4">{course.title}</h3>
                                <div className="flex gap-3">
                                    <button className="flex-1 p-3 bg-slate-800 rounded-xl hover:bg-[#a855f7] transition-all" onClick={() => setSelectedCourse(course)}><FiEdit2 className="mx-auto"/></button>
                                    <button className="flex-1 p-3 bg-slate-800 rounded-xl hover:bg-[#38bdf8] transition-all" onClick={() => setViewingCourse(course)}><FiEye className="mx-auto"/></button>
                                    <button className="flex-1 p-3 bg-slate-800 rounded-xl hover:bg-red-500 transition-all" onClick={() => handleDelete(course._id)}><FiTrash2 className="mx-auto"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Pagination logic  */}
            <AddCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} refreshCourses={fetchInstructorCourses} />
        </div>
    );
};

export default MyCourses;