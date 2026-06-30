import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiBook, FiUsers, FiCheckSquare, FiCpu, FiFileText, FiLogOut, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Sidebar = ({ onClose }) => {
    const navigate = useNavigate();

    //  Logout Functionality
    const handleLogout = () => {
        localStorage.clear(); 
        toast.info("Logout successfully");
        
        setTimeout(() => {
            navigate('/');
        }, 1200);
    };

   
    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-[18px] py-[14px] rounded-xl transition-all duration-300 mb-2 group ${
            isActive
                ? "bg-gradient-to-r from-[#a855f720] to-transparent text-[#a855f7] border-l-[3px] border-[#a855f7] shadow-[inset_10px_0_20px_-10px_rgba(168,85,247,0.3)]"
                : "text-[#94a3b8] border-transparent hover:bg-[#a855f71a] hover:text-white"
        }`;

    return (
        <nav className="h-full flex flex-col p-[25px_15px] bg-[#0f172a] border-r border-[#1e293b] font-['Poppins']">
            {/* Logo Section */}
            <div className="text-[1.5rem] font-extrabold text-white mb-10 pl-[10px] tracking-tight">
                <span className="text-[#a855f7] [text-shadow:0_0_10px_rgba(168,85,247,0.5)]">Aura</span> Instructor
            </div>
            
            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <NavLink to="/instructor-dashboard" end className={linkClasses} onClick={() => onClose && onClose()}>
                    <FiGrid className="text-[1.2rem]" /> <span>Overview</span>
                </NavLink>
                
                <NavLink to="/instructor-dashboard/my-courses" className={linkClasses} onClick={() => onClose && onClose()}>
                    <FiBook className="text-[1.2rem]" /> <span>My Courses</span>
                </NavLink>

                <NavLink to="/instructor-dashboard/approvals" className={linkClasses} onClick={() => onClose && onClose()}>
                    <FiCheckSquare className="text-[1.2rem]" /> <span>Enrollment Requests</span>
                </NavLink>

                <NavLink to="/instructor-dashboard/students" className={linkClasses} onClick={() => onClose && onClose()}>
                    <FiUsers className="text-[1.2rem]" /> <span>Performance Analytics</span>
                </NavLink>

                <NavLink to="/instructor-dashboard/grading-center" className={linkClasses} onClick={() => onClose && onClose()}>
                    <FiFileText className="text-[1.2rem]" /> <span>Grading Center</span>
                </NavLink>

            </div>

            {/* Logout Section */}
            <div className="mt-auto pt-4 border-t border-white/5">
                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full p-3.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold cursor-pointer transition-all hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/5 group"
                >
                    <FiLogOut className="group-hover:-translate-x-1 transition-transform" /> 
                    <span>Sign Out</span>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;