import React, { useEffect, useState } from 'react';
import { FiSearch, FiBell, FiUser } from 'react-icons/fi';
import axios from 'axios';
import NotificationPanel from '../dashboard/NotificationPanel';

const Navbar = ({ onProfileClick, onMenuClick, isMobile, searchQuery, setSearchQuery }) => {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem('auraUser'));

    //  Fetch Notifications Logic
    const fetchNotifs = async () => {
        try {
            const userId = user?.id || user?._id;
            if (!userId) return;

            // 
            const res = await axios.get(`http://localhost:5000/api/notifications/${userId}?role=student`);
            
            // Backend data mapping
            const formatted = res.data.map(n => ({
                ...n,
                id: n._id, // 
                time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"
            }));

            setNotifications(formatted);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifs();
        }
        // 
        const interval = setInterval(fetchNotifs, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <nav className="h-20 px-4 lg:px-10 flex items-center justify-between bg-[#0f172a]/60 backdrop-blur-[10px] border-b border-white/5 sticky top-0 z-[900]">
                
                {/* Menu Button (Mobile) & Search Box */}
                <div className="flex items-center gap-3 md:gap-4">
                    {isMobile && onMenuClick && (
                        <button 
                            onClick={onMenuClick}
                            className="p-2.5 text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                        >
                            <svg className="w-5 h-5 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}
                    
                    <div className="bg-[#1e293b]/50 border border-white/10 px-4 py-2 rounded-[10px] flex items-center gap-2.5 w-[160px] sm:w-[220px] md:w-[350px]">
                        <FiSearch className="text-[#94a3b8] shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Search courses..." 
                            value={searchQuery || ""}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-white text-xs md:text-sm w-full placeholder:text-slate-500" 
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 sm:gap-8">
                    
                    {/*  Notification Bell with Badge */}
                    <div 
                        className="relative text-[1.4rem] text-[#94a3b8] cursor-pointer p-2 rounded-lg hover:bg-[#38bdf81a] transition-all"
                        onClick={() => setIsNotifOpen(true)} 
                    >
                        <FiBell />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#ef4444] text-white text-[9px] flex items-center justify-center rounded-full border-2 border-[#0b0e14] font-bold shadow-[0_0_8px_#ef4444] animate-bounce">
                                {notifications.length}
                            </span>
                        )}
                    </div>

                    {/* Profile Trigger */}
                    <div 
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
                        onClick={onProfileClick} 
                    >
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[0.75rem] text-[#94a3b8]">Welcome,</span>
                            <b className="text-white text-[0.95rem] tracking-tight group-hover:text-[#38bdf8] uppercase transition-colors">
                                {user?.name || 'Scholar'}
                            </b>
                        </div>
                        
                        <div className="w-10 h-10 bg-gradient-to-br from-[#38bdf8] to-[#a855f7] rounded-[10px] flex items-center justify-center text-white border border-white/20 shadow-lg group-hover:scale-110 transition-all overflow-hidden">
                            {user?.name ? (
                                <span className="font-bold text-lg uppercase">{user.name.charAt(0)}</span>
                            ) : (
                                <FiUser className="text-lg" />
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/*  Notification Panel Integration */}
            <NotificationPanel 
                isOpen={isNotifOpen} 
                onClose={() => setIsNotifOpen(false)} 
                notifications={notifications} 
                setNotifications={setNotifications}
                userId={user?.id || user?._id}
            />
        </>
    );
};

export default Navbar;