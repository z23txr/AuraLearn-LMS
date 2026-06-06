import React, { useState, useEffect } from 'react';
import { FiBell, FiSearch, FiUser, FiX } from 'react-icons/fi';
import axios from 'axios';
import InstructorProfile from './InstructorProfile'; 
import NotificationPanel from '../dashboard/NotificationPanel';

const Navbar = ({ setSearchQuery }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false); 
    const [userName, setUserName] = useState('Instructor');
    const [notifications, setNotifications] = useState([]);

    const user = JSON.parse(localStorage.getItem('auraUser'));

    useEffect(() => {
        if (user) {
            setUserName(user.name || 'Instructor');
            fetchNotifications();
        }
       
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const userId = user.id || user._id;
           
            const res = await axios.get(`http://localhost:5000/api/notifications/${userId}?role=${user.role || 'instructor'}`);
          
            const formattedNotifs = res.data.map(n => ({
                ...n,
                id: n._id, 
                time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"
            }));

            setNotifications(formattedNotifs);
        } catch (err) { 
            console.error("Error fetching notifications:", err); 
        }
    };

    return (
        <>
            <header className="h-[70px] px-[30px] flex justify-between items-center border-b border-[#1e293b] bg-[#0b0e14] z-[100]">
                {/* Functional Search Box */}
                <div className="bg-[#1e293b] rounded-[10px] px-[15px] py-2 flex items-center gap-2.5 w-[350px]">
                    <FiSearch className="text-[#94a3b8]" />
                    <input 
                        type="text" 
                        placeholder="Search students, courses..." 
                        className="bg-transparent border-none text-white outline-none w-full text-sm placeholder:text-[#64748b]"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-5">
                    {/* Notification Bell Icon */}
                    <div className="relative text-[#94a3b8] text-[1.3rem] cursor-pointer hover:text-[#38bdf8] transition-colors" onClick={() => setIsNotifOpen(true)}>
                        <FiBell />
                        {notifications.length > 0 && (
                            <span className="absolute -top-[2px] -right-[2px] w-4 h-4 bg-[#ef4444] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[#0b0e14] font-bold animate-pulse">
                                {notifications.length}
                            </span>
                        )}
                    </div>
                    
                    {/* User Profile Trigger */}
                    <div className="bg-[#1e293b] p-[6px_15px_6px_6px] rounded-[30px] flex items-center gap-2.5 text-white text-[0.9rem] cursor-pointer hover:bg-[#2d3a4f] transition-all border border-transparent hover:border-[#a855f7]/30" onClick={() => setIsProfileOpen(true)}>
                        <div className="bg-[#a855f7] rounded-full p-[5px] w-7 h-7 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                            <FiUser className="text-white" />
                        </div>
                        <span className="font-medium">{userName}</span>
                    </div>
                </div>
            </header>

            {/*  Updated NotificationPanel with userId prop */}
            <NotificationPanel 
                isOpen={isNotifOpen} 
                onClose={() => setIsNotifOpen(false)} 
                notifications={notifications} 
                setNotifications={setNotifications} 
                userId={user?.id || user?._id}
            />

            {/* Profile Drawer */}
            <div className={`fixed inset-0 w-full h-full bg-black/70 backdrop-blur-[4px] z-[1000] transition-all duration-400 ${isProfileOpen ? 'visible opacity-100' : 'invisible opacity-0'}`} onClick={() => setIsProfileOpen(false)}>
                <div className={`fixed top-0 h-full w-[500px] bg-[#0f172a] z-[1001] border-l border-[#1e293b] flex flex-col transition-all duration-400 ${isProfileOpen ? 'right-0' : '-right-[700px]'}`} onClick={(e) => e.stopPropagation()}>
                    <div className="p-5 border-b border-[#1e293b] flex justify-between items-center bg-[#1e293b]/50">
                        <h3 className="text-white m-0 text-[1.2rem] font-semibold tracking-tight">Instructor <span className="text-[#a855f7]">Profile</span></h3>
                        <button className="text-[#94a3b8] hover:text-[#ef4444]" onClick={() => setIsProfileOpen(false)}><FiX size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2.5">
                        <InstructorProfile />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;