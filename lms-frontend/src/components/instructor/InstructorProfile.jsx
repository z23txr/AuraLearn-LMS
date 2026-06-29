import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { 
    FiEdit2, FiSave, FiUser, FiBookOpen, FiActivity, FiLoader 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InstructorProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        fullName: '', email: '', phone: '', dob: '', gender: '', address: '', city: '', country: '', bio: '',
        degree: '', university: '', passingYear: '', cgpa: '', specialization: '', experience: '', skills: '', 
        certificates: '', researchWork: '', myCourses: []
    });

    const [isEditP, setIsEditP] = useState(false);
    const [isEditA, setIsEditA] = useState(false);
    const [loading, setLoading] = useState(true);

    const API_URL = "http://localhost:5000/"; 

    const fetchProfileData = async () => {
        try {
            const rawToken = localStorage.getItem('token');
            if (!rawToken) return setLoading(false);
            const cleanToken = rawToken.replace(/"/g, '');

            const res = await axios.get(`${API_URL}api/instructor/profile`, {
                headers: { Authorization: `Bearer ${cleanToken}` }
            });
            setProfile({ ...res.data, email: res.data.userId?.email || '' });
            setLoading(false);
        } catch (err) {
            console.error("Fetch error:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    //  Edit Toggle with Toast
    const toggleEdit = (section) => {
        if (section === 'personal') {
            setIsEditP(true);
            toast.info("Editting allowed", { autoClose: 1000 });
        } else {
            setIsEditA(true);
            toast.info("updated successfully", { autoClose: 1500 });
        }
    };

    const handleSave = async (section) => {
        const id = toast.loading("Updating Records...");
        try {
            const cleanToken = localStorage.getItem('token')?.replace(/"/g, '');
            await axios.put(`${API_URL}api/instructor/profile/update`, profile, {
                headers: { Authorization: `Bearer ${cleanToken}` }
            });
            section === 'personal' ? setIsEditP(false) : setIsEditA(false);
            await fetchProfileData();
            toast.update(id, { render: "Profile Successfully updatd", type: "success", isLoading: false, autoClose: 2500 });
        } catch (err) {
            toast.update(id, { render: " Failed Try again.", type: "error", isLoading: false, autoClose: 2500 });
        }
    };

    if (loading) return (
        <div className="h-full flex justify-center items-center py-20">
            <FiLoader className="animate-spin text-[#a855f7] text-4xl" />
        </div>
    );

    return (
        <div className="w-full px-4 pb-12 no-scrollbar overflow-y-auto max-h-full font-['Poppins'] bg-[#0b0e14]">
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none !important; } .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }`}</style>
            
            

            {/* Header section */}
            <div className="bg-[#1e293b] rounded-[30px] p-10 mb-8 border border-white/20 text-center shadow-2xl">
                <div className="w-24 h-24 rounded-full bg-[#a855f7] flex items-center justify-center text-4xl font-black text-white mx-auto border-4 border-[#0b0e14] mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    {profile.fullName?.charAt(0) || 'I'}
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{profile.fullName || 'Expert'}</h2>
                <div className="inline-block px-4 py-1 mt-2 bg-[#38bdf8]/10 border border-[#38bdf8]/30 rounded-full text-[#38bdf8] text-[10px] font-black uppercase tracking-[2px]">
                    Verified Instructor
                </div>
            </div>

            {/* --- 1. PERSONAL DETAILS --- */}
            <div className="bg-[#0f172a] border border-white/10 rounded-[35px] p-8 mb-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <FiUser className="text-[#a855f7] text-xl" /> 
                        <span className="uppercase tracking-widest text-sm">Personal Profile</span>
                    </h3>
                    <button 
                        onClick={() => isEditP ? handleSave('personal') : toggleEdit('personal')} 
                        className={`px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${isEditP ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-900/20' : 'bg-[#a855f7] text-white hover:bg-[#9333ea]'}`}
                    >
                        {isEditP ? <><FiSave /> Save Details</> : <><FiEdit2 /> Edit Details</>}
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <InputField label="Full Identity Name" value={profile.fullName} isEdit={isEditP} onChange={(v)=>setProfile({...profile, fullName:v})} />
                    <InputField label="Authorized Email" value={profile.email} isEdit={false} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Phone Number" value={profile.phone} isEdit={isEditP} onChange={(v)=>setProfile({...profile, phone:v})} />
                        <InputField label="Date of Birth" value={profile.dob} isEdit={isEditP} onChange={(v)=>setProfile({...profile, dob:v})} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Gender" value={profile.gender} isEdit={isEditP} onChange={(v)=>setProfile({...profile, gender:v})} />
                        <InputField label="Current City" value={profile.city} isEdit={isEditP} onChange={(v)=>setProfile({...profile, city:v})} />
                    </div>

                    <InputField label="Country" value={profile.country} isEdit={isEditP} onChange={(v)=>setProfile({...profile, country:v})} />
                    <InputField label="Residential Address" value={profile.address} isEdit={isEditP} onChange={(v)=>setProfile({...profile, address:v})} />
                    <InputField label="Professional Bio" value={profile.bio} isEdit={isEditP} isTextArea onChange={(v)=>setProfile({...profile, bio:v})} />
                </div>
            </div>

            {/* --- 2. ACADEMIC DETAILS --- */}
            <div className="bg-[#0f172a] border border-white/10 rounded-[35px] p-8 mb-10 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <FiBookOpen className="text-[#38bdf8] text-xl" /> 
                        <span className="uppercase tracking-widest text-sm">Academic Module</span>
                    </h3>
                    <button 
                        onClick={() => isEditA ? handleSave('academic') : toggleEdit('academic')} 
                        className={`px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${isEditA ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-900/20' : 'bg-[#38bdf8] text-[#0f172a] hover:bg-[#0ea5e9]'}`}
                    >
                        {isEditA ? <><FiSave /> Save Academic</> : <><FiEdit2 /> Edit Academic</>}
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <InputField label="Highest Qualification" value={profile.degree} isEdit={isEditA} onChange={(v)=>setProfile({...profile, degree:v})} />
                    <InputField label="University / Institute" value={profile.university} isEdit={isEditA} onChange={(v)=>setProfile({...profile, university:v})} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Passing Year" value={profile.passingYear} isEdit={isEditA} onChange={(v)=>setProfile({...profile, passingYear:v})} />
                        <InputField label="Final CGPA" value={profile.cgpa} isEdit={isEditA} onChange={(v)=>setProfile({...profile, cgpa:v})} />
                    </div>

                    <InputField label="Specialization" value={profile.specialization} isEdit={isEditA} onChange={(v)=>setProfile({...profile, specialization:v})} />
                    <InputField label="Professional Experience" value={profile.experience} isEdit={isEditA} onChange={(v)=>setProfile({...profile, experience:v})} />
                    <InputField label="Technical Skills" value={profile.skills} isEdit={isEditA} onChange={(v)=>setProfile({...profile, skills:v})} />
                    <InputField label="Certificates" value={profile.certificates} isEdit={isEditA} onChange={(v)=>setProfile({...profile, certificates:v})} />
                    <InputField label="Research Work / Projects" value={profile.researchWork} isEdit={isEditA} isTextArea onChange={(v)=>setProfile({...profile, researchWork:v})} />
                </div>
            </div>

            {/* --- 3. COURSES SECTION --- */}
            <div className="mb-20">
                <h3 className="text-sm font-black uppercase tracking-[4px] text-white/50 mb-8 ml-2 flex items-center gap-3">
                    <FiActivity className="text-[#a855f7]" /> Active Curriculum
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-2">
                    {profile.myCourses?.map(course => (
                        <div 
                            key={course._id} 
                            onClick={() => navigate('/instructor-dashboard/my-courses')} 
                            className="bg-[#1e293b]/50 border border-white/10 p-4 rounded-[2rem] cursor-pointer hover:border-[#a855f7] transition-all hover:bg-[#1e293b] group"
                        >
                            <div className="h-32 rounded-2xl overflow-hidden mb-4 border border-white/5 shadow-lg relative">
                                <img 
                                    src={`${API_URL}${course.thumbnail?.replace(/\\/g, '/')}`} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    alt={course.title}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                            </div>
                            <p className="text-sm font-bold text-white text-center px-2 truncate">
                                {course.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Custom Reusable Input ---
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
                    ? 'bg-[#1e293b] border border-[#a855f7] text-white focus:ring-4 focus:ring-[#a855f71a]' 
                    : 'bg-white/5 border border-transparent text-white/90 cursor-default shadow-inner'
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
                    ? 'bg-[#1e293b] border border-[#a855f7] text-white focus:ring-4 focus:ring-[#a855f71a]' 
                    : 'bg-white/5 border border-transparent text-white/90 cursor-default shadow-inner'
                }`}
                placeholder={`No ${label} provided`}
            />
        )}
    </div>
);

export default InstructorProfile;