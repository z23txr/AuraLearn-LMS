
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiSearch, FiEye, FiChevronLeft, FiChevronRight, FiMapPin, FiBarChart2 } from 'react-icons/fi';
import StudentInsight from './StudentInsight'; //  Detail component

const StudentDirectory = () => {
    const { searchQuery } = useOutletContext(); //  Navbar search support
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null); // Detail view trigger

    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 6;

    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');

    useEffect(() => {
        fetchInstructorStudents();
    }, []);

    const fetchInstructorStudents = async () => {
        try {
            const instructorId = user.id || user._id;
            const res = await axios.get(`http://localhost:5000/api/enrollments/instructor/${instructorId}`);
            
            setStudents(res.data.filter(s => s.status === 'Approved'));
            setLoading(false);
        } catch (err) {
            console.error("Error loading students", err);
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.studentDetails?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLast = currentPage * studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfLast - studentsPerPage, indexOfLast);
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);


    if (selectedStudent) {
        return <StudentInsight student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
    }

    return (
        <div className="p-2 animate-in fade-in duration-500 font-['Poppins']">
            <div className="mb-10">
                <h2 className="text-white text-3xl font-bold">Student <span className="text-[#a855f7]">Directory</span></h2>
                <p className="text-slate-500 text-sm mt-1">Found {filteredStudents.length} active students in your curriculum.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-[#a855f7] animate-pulse font-bold tracking-widest">ACCESSING ARCHIVES...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentStudents.map(data => (
                            <div key={data._id} className="bg-[#1e293b]/30 backdrop-blur-md border border-white/5 p-8 rounded-[35px] hover:border-[#a855f7]/50 transition-all group relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#38bdf8] flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                        {data.studentDetails?.fullName?.charAt(0)}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-[#38bdf8] font-black uppercase tracking-widest">{data.regNumber || 'AURA-NEW'}</span>
                                        <div className="text-[10px] text-green-500 font-bold mt-1 bg-green-500/10 px-2 py-0.5 rounded-full uppercase">Verified</div>
                                    </div>
                                </div>

                                <h3 className="text-white font-bold text-lg mb-1">{data.studentDetails?.fullName}</h3>
                                <p className="text-slate-500 text-xs font-medium mb-6 italic">{data.courseTitle}</p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 tracking-tighter">
                                        <span>Current Progress</span>
                                        <span className="text-white">75%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#38bdf8]" style={{ width: '75%' }}></div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedStudent(data)}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-[#a855f7] group-hover:border-[#a855f7] transition-all"
                                >
                                    <FiEye /> View Student Insight
                                </button>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-6 mt-16 py-10 border-t border-white/5">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-3 bg-white/5 rounded-xl text-white disabled:opacity-20 hover:bg-[#a855f7]"><FiChevronLeft size={24}/></button>
                            <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">{currentPage} / {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 bg-white/5 rounded-xl text-white disabled:opacity-20 hover:bg-[#a855f7]"><FiChevronRight size={24}/></button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentDirectory;