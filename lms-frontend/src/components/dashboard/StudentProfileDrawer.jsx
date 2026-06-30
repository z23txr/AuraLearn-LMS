import React, { useEffect, useState } from 'react';
import { 
    FiX, FiUser, FiAward, FiBook, FiHexagon, FiSave, FiEdit2, FiInfo 
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentProfileDrawer = ({ isOpen, onClose }) => {
    const [userData, setUserData] = useState(null);
    const [profile, setProfile] = useState({
        fullName: "",
        fatherName: "",
        regNumber: "Pending",
        contact: "",
        address: "",
        cnic: ""
    });
    const [completedCourses, setCompletedCourses] = useState([]);
    const [isEditP, setIsEditP] = useState(false);
    const [isEditA, setIsEditA] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const PF = import.meta.env.VITE_API_URL + "/";

    const fetchProfileAndEnrollments = async (userId) => {
        try {
            // 1. Fetch live student profile
            const profileRes = await axios.get(`${PF}api/auth/profile/${userId}`);
            setProfile(profileRes.data);

            // 2. Fetch live enrollments to verify achievements
            const enrollRes = await axios.get(`${PF}api/enrollments/student/${userId}`);
            const completed = enrollRes.data.filter(e => e.status === 'Approved' && e.progress === 100);
            setCompletedCourses(completed);
        } catch (err) {
            console.error("Error loading student profile:", err);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('auraUser');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUserData(parsed);
            if (isOpen) {
                fetchProfileAndEnrollments(parsed.id || parsed._id);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleEdit = (section) => {
        if (section === 'personal') {
            setIsEditP(true);
            toast.info("Editing personal details allowed", { autoClose: 1000 });
        } else {
            setIsEditA(true);
            toast.info("Editing academic details allowed", { autoClose: 1000 });
        }
    };

    const handleSave = async (section) => {
        setIsLoading(true);
        const toastId = toast.loading("Updating Profile...");
        try {
            const userId = userData?.id || userData?._id;
            const res = await axios.put(`${PF}api/auth/profile/${userId}`, profile);
            setProfile(res.data.student);
            if (section === 'personal') {
                setIsEditP(false);
            } else {
                setIsEditA(false);
            }
            toast.update(toastId, { render: "Profile Successfully updated", type: "success", isLoading: false, autoClose: 2500 });
        } catch (err) {
            console.error("Error updating profile:", err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed. Try again.";
            toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 2500 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000] flex justify-end transition-all duration-500"
            onClick={onClose}
        >
            
            
            {/* Main Drawer Container */}
            <div 
                className="w-full sm:max-w-[500px] h-screen bg-[#05070a]/95 backdrop-blur-[25px] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-right duration-500 flex flex-col overflow-hidden font-['Poppins'] text-white"
                onClick={(e) => e.stopPropagation()}
            >
                {styleTag}
                
                {/* Header Section */}
                <div className="p-6 sm:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-tr from-[#38bdf8] to-[#a855f7] rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg">
                            {profile.fullName?.charAt(0).toUpperCase() || userData?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                            <h3 className="text-white text-xl font-bold tracking-tight uppercase">{profile.fullName || userData?.name || 'Student Profile'}</h3>
                            <p className="text-[#38bdf8] text-xs font-bold tracking-[2px] uppercase opacity-80">
                                Aura ID: #{profile.regNumber || "Pending"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-all cursor-pointer">
                        <FiX size={28} />
                    </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-10 custom-scrollbar pb-24">
                    
                    {/* Header Card Section */}
                    <div className="bg-[#1e293b] rounded-[30px] p-8 border border-white/20 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#38bdf8]/10 blur-[80px] rounded-full -mr-10 -mt-10"></div>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#38bdf8] to-[#a855f7] flex items-center justify-center text-4xl font-black text-white mx-auto border-4 border-[#05070a] mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            {profile.fullName?.charAt(0).toUpperCase() || userData?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
                            {profile.fullName || userData?.name || 'Scholar'}
                        </h2>
                        <div className="inline-block px-4 py-1 mt-3 bg-[#38bdf8]/10 border border-[#38bdf8]/30 rounded-full text-[#38bdf8] text-[10px] font-black uppercase tracking-[2px]">
                            Verified Student
                        </div>
                    </div>

                    {/* --- 1. PERSONAL DETAILS --- */}
                    <div className="bg-[#0f172a] border border-white/10 rounded-[35px] p-6 sm:p-8 shadow-xl transition-all">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                            <h3 className="text-md font-bold text-white flex items-center gap-3">
                                <FiUser className="text-[#a855f7] text-xl" /> 
                                <span className="uppercase tracking-widest text-xs sm:text-sm">Personal Profile</span>
                            </h3>
                            <button 
                                onClick={() => isEditP ? handleSave('personal') : toggleEdit('personal')} 
                                className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${isEditP ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-900/20' : 'bg-[#a855f7] text-white hover:bg-[#9333ea]'}`}
                            >
                                {isEditP ? <><FiSave /> Save Details</> : <><FiEdit2 /> Edit Details</>}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField label="Full Identity Name" value={profile.fullName} isEdit={isEditP} onChange={(v)=>setProfile({...profile, fullName:v})} />
                            <InputField label="Authorized Email" value={profile.userId?.email || userData?.email || "student@aura.edu"} isEdit={false} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Father's Name" value={profile.fatherName} isEdit={isEditP} onChange={(v)=>setProfile({...profile, fatherName:v})} />
                                <InputField label="CNIC / ID Number" value={profile.cnic} isEdit={isEditP} onChange={(v)=>setProfile({...profile, cnic:v})} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Contact Number" value={profile.contact} isEdit={isEditP} onChange={(v)=>setProfile({...profile, contact:v})} />
                                <InputField label="Residential Address" value={profile.address} isEdit={isEditP} onChange={(v)=>setProfile({...profile, address:v})} />
                            </div>
                        </div>
                    </div>

                    {/* --- 2. ACADEMIC DETAILS --- */}
                    <div className="bg-[#0f172a] border border-white/10 rounded-[35px] p-6 sm:p-8 shadow-xl transition-all">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                            <h3 className="text-md font-bold text-white flex items-center gap-3">
                                <FiBook className="text-[#38bdf8] text-xl" /> 
                                <span className="uppercase tracking-widest text-xs sm:text-sm">Academic Module</span>
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField label="Registration Number" value={profile.regNumber || "Pending"} isEdit={false} />
                        </div>
                    </div>

                    {/* --- 3. CERTIFICATIONS --- */}
                    <div className="bg-[#0f172a] border border-white/10 rounded-[35px] p-6 sm:p-8 shadow-xl transition-all">
                        <h4 className="text-white text-xs sm:text-sm font-bold uppercase tracking-[3px] mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
                            <FiAward className="text-[#a855f7] text-xl" /> Achieved Certifications
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                            {completedCourses.length > 0 ? (
                                completedCourses.map((item, index) => (
                                    <CertificateCard 
                                        key={index} 
                                        title={item.courseTitle} 
                                        date={new Date(item.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} 
                                        issuer="AuraLearn LMS" 
                                    />
                                ))
                            ) : (
                                <div className="p-6 border border-dashed border-white/10 rounded-2xl flex items-center gap-3 text-slate-500 italic text-xs leading-relaxed">
                                    <FiInfo size={18} className="text-[#a855f7] shrink-0" />
                                    <span>Complete programs with 100% curriculum progress to earn verified certificates here.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- 4. DYNAMIC BADGES --- */}
                    <div className="bg-[#0f172a] border border-white/10 rounded-[35px] p-6 sm:p-8 shadow-xl transition-all">
                        <h4 className="text-white text-xs sm:text-sm font-bold uppercase tracking-[3px] mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
                            <FiHexagon className="text-yellow-500 text-xl" /> Dynamic Badges
                        </h4>
                        <div className="flex flex-wrap gap-4">
                            {profile.fullName && (
                                <Badge label="Verified Scholar" color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
                            )}
                            {completedCourses.length > 0 ? (
                                <Badge label="Course Finisher" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
                            ) : (
                                <Badge label="Active Learner" color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
                            )}
                        </div>
                    </div>
                </div>

               
            </div>
        </div>
    );
};

/* Helper Components */
const InputField = ({ label, value, isEdit, onChange, isTextArea }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-slate-400 text-[11px] font-black uppercase tracking-widest ml-1">{label}</label>
        {isTextArea ? (
            <textarea 
                value={value || ''} 
                disabled={!isEdit}
                onChange={(e) => onChange(e.target.value)}
                rows="4"
                className={`w-full p-4 rounded-2xl text-sm font-bold transition-all ${
                    isEdit 
                    ? 'bg-[#1e293b] border border-[#a855f7] text-white focus:ring-4 focus:ring-[#a855f71a] outline-none' 
                    : 'bg-white/5 border border-transparent text-white/90 cursor-default shadow-inner outline-none'
                }`}
                placeholder={`No ${label} provided`}
            />
        ) : (
            <input 
                value={value || ''} 
                disabled={!isEdit}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full p-4 rounded-2xl text-sm font-bold transition-all ${
                    isEdit 
                    ? 'bg-[#1e293b] border border-[#a855f7] text-white focus:ring-4 focus:ring-[#a855f71a] outline-none' 
                    : 'bg-white/5 border border-transparent text-white/90 cursor-default shadow-inner outline-none'
                }`}
                placeholder={`No ${label} provided`}
            />
        )}
    </div>
);

const CertificateCard = ({ title, date, issuer }) => (
    <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-[#a855f7]/30 transition-all group">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-[#a855f7]/10 rounded-xl text-[#a855f7] group-hover:bg-[#a855f7] group-hover:text-white transition-all">
                <FiAward size={20} />
            </div>
            <div>
                <h5 className="text-white text-xs sm:text-sm font-bold">{title}</h5>
                <p className="text-slate-500 text-[0.7rem]">{issuer} • {date}</p>
            </div>
        </div>
        <button className="text-[#38bdf8] text-xs font-bold hover:underline cursor-pointer">Verify</button>
    </div>
);

const Badge = ({ label, color }) => (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 ${color} backdrop-blur-md text-[11px] font-bold`}>
        <span>{label}</span>
    </div>
);

const styleTag = (
    <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            display: none !important;
        }
        .custom-scrollbar {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
        }
    `}</style>
);

export default StudentProfileDrawer;