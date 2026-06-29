import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiSmartphone, FiMapPin, FiBook, FiCheckCircle, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactDOM from 'react-dom';

const EnrollmentModal = ({ isOpen, onClose, course, onSuccess }) => {
    const user = JSON.parse(localStorage.getItem('auraUser'));
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.name || "",
        fatherName: "",
        email: user?.email || "",
        contact: "",
        address: "",
        cnic: "",
        city: ""
    });

    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            if (user && course?._id && course?.category) {
                const studentId = user.id || user._id;
                axios.post("http://localhost:5000/api/courses/view", {
                    userId: studentId,
                    courseId: course._id,
                    category: course.category
                }).catch(err => console.error("Error logging course view:", err));
            }
        }
    }, [isOpen, course?._id]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. IDs extraction
        const studentId = user?.id || user?._id;
        const teacherId = course?.instructor || course?.teacherId || course?.userId;

        // 2. Critical Validation
        if (!studentId || !teacherId || !course?._id) {
            toast.error("User session or course data missing. Please re-login.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Processing your application...");

        // 3. Constructing Payload for Backend
        const payload = {
            studentId,
            courseId: course._id,
            teacherId,
            courseTitle: course.title,
            studentDetails: {
                fullName: formData.fullName,
                fatherName: formData.fatherName,
                contact: formData.contact,
                cnic: formData.cnic,
                address: formData.address,
                city: formData.city
            }
        };

        try {
            const res = await axios.post("http://localhost:5000/api/enrollments/apply", payload);

            if (res.status === 201 || res.status === 200) {
                toast.update(toastId, { 
                    render: "Application submitted! Pending approval. ⏳", 
                    type: "success", 
                    isLoading: false, 
                    autoClose: 3000 
                });
                
                // sabse zaroori
                if (onSuccess) onSuccess(); 
                setIsSuccess(true);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Application failed";
            toast.update(toastId, { 
                render: errorMsg, 
                type: err.response?.status === 400 ? "warning" : "error", 
                isLoading: false, 
                autoClose: 3000 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            
            <div 
                className="bg-[#0f172a] w-full max-w-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#38bdf8]/10 rounded-xl text-[#38bdf8]"><FiBook size={20} /></div>
                        <div>
                            <h2 className="text-white text-xl font-bold">Course Registration</h2>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{course?.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-all p-2 bg-white/5 rounded-full"><FiX size={20} /></button>
                </div>

                {isSuccess ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-bounce mb-2">
                            <FiCheckCircle size={44} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white text-2xl font-black">Application Submitted!</h3>
                            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                                Your registration request for <b>{course?.title}</b> has been received and is currently awaiting instructor approval.
                            </p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="px-8 py-3.5 bg-gradient-to-r from-[#38bdf8] to-[#2563eb] text-white hover:opacity-90 transition-all rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95"
                        >
                            Got It!
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <FormInput label="Full Name" icon={<FiUser/>} value={formData.fullName} onChange={(v) => setFormData({...formData, fullName: v})} pattern="[A-Za-z\s]+" title="Name must contain only letters and spaces" />
                            <FormInput label="Father's Name" icon={<FiUser/>} value={formData.fatherName} onChange={(v) => setFormData({...formData, fatherName: v})} pattern="[A-Za-z\s]+" title="Name must contain only letters and spaces" />
                            <FormInput label="Contact No" icon={<FiSmartphone/>} value={formData.contact} onChange={(v) => setFormData({...formData, contact: v.replace(/\D/g, '')})} pattern="[0-9]{11}" title="Contact number must be exactly 11 digits (e.g., 03001234567)" maxLength={11} placeholder="e.g. 03001234567" />
                            <FormInput label="CNIC / ID" icon={<FiBook/>} value={formData.cnic} onChange={(v) => setFormData({...formData, cnic: v.replace(/\D/g, '')})} pattern="[0-9]{13}" title="CNIC / ID must be exactly 13 digits" maxLength={13} placeholder="e.g. 3520112345678" />
                            <FormInput label="City" icon={<FiMapPin/>} value={formData.city} onChange={(v) => setFormData({...formData, city: v})} pattern="[A-Za-z\s]+" title="City must contain only letters and spaces" />
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-slate-500 text-[0.7rem] font-bold uppercase tracking-wider">Home Address</label>
                                <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#38bdf8]/50 text-sm shadow-inner" rows="3" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="House #, Street, Area..."></textarea>
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#38bdf8] to-[#2563eb] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-lg">
                            {isSubmitting ? <><FiLoader className="animate-spin" /> Submitting...</> : <><FiCheckCircle /> Confirm Registration</>}
                        </button>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
};

const FormInput = ({ label, icon, value, onChange, ...rest }) => (
    <div className="space-y-2">
        <label className="text-slate-500 text-[0.7rem] font-bold uppercase tracking-wider">{label}</label>
        <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#38bdf8]">{icon}</span>
            <input 
                type="text" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-[#38bdf8]/50 text-sm shadow-inner" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                {...rest}
            />
        </div>
    </div>
);

export default EnrollmentModal;