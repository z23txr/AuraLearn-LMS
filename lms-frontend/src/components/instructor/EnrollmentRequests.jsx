import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiUser, FiMapPin, FiPhone, FiCreditCard, FiBookOpen, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const EnrollmentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('auraUser'));

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const instructorId = user.id || user._id;
            const res = await axios.get(`http://localhost:5000/api/enrollments/instructor/${instructorId}`);

            setRequests(res.data.filter(req => req.status === 'Pending'));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleApprove = async (id, studentName) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/enrollments/approve/${id}`);
            
            toast.success(`${studentName} Approved! ID: ${res.data.regNumber}`);
            
            setRequests(prev => prev.filter(req => req._id !== id));
        } catch (err) {
            toast.error("Approval process failed!");
        }
    };

    const handleReject = async (id, studentName) => {
        const result = await Swal.fire({
            title: 'Reject Request?',
            text: `Are you sure you want to reject ${studentName}'s application?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Yes, reject',
            background: '#0f172a',
            color: '#fff',
            borderRadius: '20px'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:5000/api/enrollments/reject/${id}`);
            toast.error(`${studentName}'s request was rejected.`);
            setRequests(prev => prev.filter(req => req._id !== id));
        } catch (err) {
            toast.error("Rejection process failed!");
        }
    };

    //  Updated Filter Logic
    const filteredRequests = requests.filter(req => 
        req.studentDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-[#a855f7] text-center py-20 font-bold animate-pulse">Scanning Requests...</div>;

    return (
        <div className="p-2 animate-in fade-in duration-500 font-['Poppins']">
            
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-white text-2xl font-bold mb-1 tracking-tight">Enrollment <span className="text-[#a855f7]">Requests</span></h2>
                    <p className="text-slate-500 text-sm">Find students by name and assign AU-IDs.</p>
                </div>
                
                {/* Search Box */}
                <div className="bg-[#1e293b] rounded-xl px-4 py-2.5 flex items-center gap-2 w-full sm:w-80 border border-white/5 shadow-inner">
                    <FiSearch  />
                    <input 
                        type="text" 
                        placeholder="Type student name..." 
                        className="bg-transparent border-none text-white outline-none text-sm w-full placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-[#1e293b]/30 backdrop-blur-xl border border-white/5 rounded-[28px] overflow-x-auto shadow-2xl">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-white/5 text-[#94a3b8] text-[11px] uppercase tracking-[2px] font-bold">
                        <tr>
                            <th className="p-6">Student Info</th>
                            <th className="p-6">Course Applied</th>
                            <th className="p-6">Verification Details</th>
                            <th className="p-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300">
                        <AnimatePresence mode='popLayout'>
                            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                <motion.tr 
                                    key={req._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-b border-white/5 hover:bg-white/[0.02] transition-all group"
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-[#a855f7]/20 flex items-center justify-center text-[#a855f7] font-bold text-lg shadow-inner group-hover:bg-[#a855f7] group-hover:text-white transition-all duration-300">
                                                {req.studentDetails?.fullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold group-hover:text-[#a855f7] transition-colors">{req.studentDetails?.fullName}</div>
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                                    <FiMapPin size={10} /> {req.studentDetails?.city}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold flex items-center gap-2">
                                                <FiBookOpen className="text-[#38bdf8]" /> {req.courseTitle}
                                            </span>
                                            <span className="text-[10px] text-slate-500 mt-1 italic uppercase tracking-tighter">Applied on {new Date(req.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-sm text-slate-200 mb-1 flex items-center gap-2">
                                            <FiPhone className="text-green-500" size={14}/> {req.studentDetails?.contact}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                            <FiCreditCard className="text-slate-600" size={14}/> {req.studentDetails?.cnic}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-3">
                                            <button 
                                                onClick={() => handleApprove(req._id, req.studentDetails?.fullName)}
                                                className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-lg hover:shadow-green-500/20"
                                                title="Approve Student"
                                            >
                                                <FiCheck size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleReject(req._id, req.studentDetails?.fullName)}
                                                className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                                                title="Reject Student"
                                            >
                                                <FiX size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : (
                                <motion.tr initial={{ opacity: 0 }}>
                                    <td colSpan="4" className="py-24 text-center text-slate-600 italic">
                                        No student found matching "{searchTerm}"
                                    </td>
                                </motion.tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EnrollmentRequests;