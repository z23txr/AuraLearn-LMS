import React from 'react';
import { FiX, FiCheckCircle, FiCpu, FiMessageCircle, FiClock, FiCheck, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationPanel = ({ isOpen, onClose, notifications = [], setNotifications, userId }) => {
    if (!isOpen) return null;

    const markAsRead = async (id, isDynamic) => {
        if (isDynamic) {
            
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.info("Request hidden from view.");
        } else {
            try {
                // Database update
                await axios.put(`http://localhost:5000/api/notifications/read/${id}`);
                setNotifications(prev => prev.filter(n => n._id !== id));
                toast.success("Notification cleared!");
            } catch (err) { toast.error("Update failed"); }
        }
    };

   // markAllAsRead function 
const markAllAsRead = async () => {
    if (!userId) {
        toast.error("User ID missing!");
        return;
    }
    try {
        // 
        await axios.put(`http://localhost:5000/api/notifications/mark-all/${userId}`);
        setNotifications([]);
        toast.info("Cleared!");
    } catch (err) {
        console.log(err.response?.data); // 
    }
};

    const getIcon = (type) => {
        switch(type) {
            case 'success': return <FiCheckCircle className="text-green-400" />;
            case 'request': return <FiClock className="text-orange-400" />;
            default: return <FiMessageCircle className="text-blue-400" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[5000] flex justify-end shadow-2xl" onClick={onClose}>
            <div 
                className="w-full max-w-[380px] h-screen bg-[#0f172a]/98 backdrop-blur-[20px] border-l border-[#38bdf833] p-6 sm:p-8 flex flex-col animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-white text-xl font-bold tracking-tight">Updates & Alerts</h3>
                    <button onClick={onClose} className="text-[#94a3b8] hover:text-red-500 transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-1">
                    <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                    {notifications.length > 0 ? notifications.map((n) => (
                        <div key={n._id} className="group relative p-4 rounded-[15px] bg-white/[0.03] flex gap-3 border-l-4 border-blue-500 hover:bg-white/[0.05] transition-all">
                            <div className="text-xl pt-1">{getIcon(n.type)}</div>
                            <div className="flex flex-col flex-1 pr-6">
                                <p className="text-slate-200 text-sm font-medium leading-relaxed">{n.text}</p>
                                <span className="text-slate-500 text-[0.7rem] mt-2 font-bold uppercase tracking-wider">
                                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : "Just Now"}
                                </span>
                            </div>
                            <button 
                                onClick={() => markAsRead(n._id, n.isDynamic)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[#94a3b8] hover:text-[#38bdf8]"
                            >
                                <FiCheck size={18} />
                            </button>
                        </div>
                    )) : (
                        <div className="text-center py-20 text-slate-500 italic font-['Poppins']">No pending notifications</div>
                    )}
                </div>

                <button 
                    onClick={markAllAsRead}
                    disabled={notifications.length === 0}
                    className="mt-6 w-full py-4 bg-[#38bdf81a] border border-[#38bdf833] text-[#38bdf8] rounded-2xl text-sm font-bold hover:bg-[#38bdf8] hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                >
                    <FiTrash2 /> Mark All as Read
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;