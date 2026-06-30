
// ======================================Imports====================================

import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiUpload, FiCheckCircle, FiBookOpen, FiType, FiLayers, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { uploadToCloudinary } from '../../utils/uploadCloudinary.js';

// ===================================Component==============================
const AddCourseModal = ({ isOpen, onClose, refreshCourses }) => {

// ===============================States===============================

    const [formData, setFormData] = useState({ title: '', description: '', category: '' });
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

// ===================================HandleSubmit==================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token')?.replace(/"/g, '');
        let fileUrl = '';
        if (thumbnail) {
            try {
                fileUrl = await uploadToCloudinary(thumbnail);
            } catch (err) {
                toast.error("Thumbnail upload failed.");
                setLoading(false);
                return;
            }
        }

        const payload = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            fileUrl
        };

        try {
            const res = await axios.post(import.meta.env.VITE_API_URL + '/api/courses/create', payload, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.status === 200 || res.status === 201) {
                await refreshCourses(); 
                toast.success("Course Added successfully");
                onClose();
                setFormData({ title: '', description: '', category: '' });
                setThumbnail(null);
            }
        } catch (err) {
            toast.error("Submission failed.");
        } finally {
            setLoading(false);
        }
    };

    // ==============================Return Statemnt===============================

    return (
        <div className="fixed inset-0 w-full h-full bg-black/90 backdrop-blur-md flex items-center justify-center z-[5000] p-4 font-['Outfit']">
            <style>
                {`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
            <div className="bg-[#0f172a] w-full max-w-[850px] h-[85vh] rounded-[32px] relative border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
                
                <button className="absolute top-6 right-8 text-[#94a3b8] hover:text-red-500 transition-all z-[60]" onClick={onClose}>
                    <FiX size={26} />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                  
                    <div className="hidden md:flex w-[300px] bg-gradient-to-br from-[#a855f7] to-[#38bdf8] p-12 flex-col justify-between text-white flex-shrink-0">
                        <div>
                            <FiBookOpen size={48} className="mb-6 opacity-90 shadow-lg" />
                            <h2 className="text-3xl font-bold leading-tight mb-4 tracking-tighter uppercase">Launch Aura</h2>
                            <p className="text-white/80 text-xs font-bold leading-relaxed tracking-wider uppercase">Expand your learning Aura by publishing a new curriculum today.</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black bg-black/20 w-fit p-3 rounded-2xl border border-white/20 uppercase tracking-[2px]">
                            <FiCheckCircle /> Launch
                        </div>
                    </div>

             {/* =====================================Right side form============================ */}

                    <div className="flex-1 flex flex-col bg-[#0b0e14] ">
                        <form onSubmit={handleSubmit} className="p-10 md:p-14 overflow-y-auto hide-scrollbar custom-scrollbar flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
                                <span className="w-8 h-1 bg-[#a855f7] rounded-full"></span> Course Specifications
                            </h3>
                            
                            <div className="space-y-8 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col">
                                        <label className="text-[#a855f7] text-[10px] font-black uppercase tracking-[3px] mb-3 ml-2">Title</label>
                                        <input required type="text" className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#a855f7] transition-all text-sm font-medium" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-[#a855f7] text-[10px] font-black uppercase tracking-[3px] mb-3 ml-2">Category</label>
                                        <input required type="text" className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#a855f7] transition-all text-sm font-medium" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#a855f7] text-[10px] font-black uppercase tracking-[3px] mb-3 ml-2">Full Description</label>
                                    <textarea required className="hide-scrollbar bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#a855f7] transition-all min-h-[160px] text-sm resize-none font-medium leading-relaxed" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                                </div>

                                <div>
                                    <input type="file" id="modal-thumb" hidden onChange={(e) => setThumbnail(e.target.files[0])} />
                                    <label htmlFor="modal-thumb" className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer text-slate-500 hover:border-[#a855f7] hover:text-[#a855f7] hover:bg-[#a855f7]/5 transition-all text-xs font-bold uppercase truncate">
                                        <FiUpload size={20} /> {thumbnail ? thumbnail.name : "Choose Thumbnail Asset (JPG/PNG)"}
                                    </label>
                                </div>
                            </div>

                          
                            <button type="submit" disabled={loading} className="mt-12 w-full bg-white text-black py-5 rounded-[24px] font-black text-xs uppercase tracking-[4px] shadow-2xl hover:bg-[#a855f7] hover:text-white disabled:opacity-30 transition-all flex-shrink-0">
                                {loading ? "Establishing Connection..." : "Sync & Launch Course"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCourseModal;