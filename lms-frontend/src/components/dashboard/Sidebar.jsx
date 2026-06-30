import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    FiHome, FiBookOpen, FiCpu, FiAward, 
    FiCheckSquare, FiSettings, FiLogOut, FiPlayCircle,
    FiChevronLeft, FiChevronRight, FiMessageSquare
} from 'react-icons/fi';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    // Nav Link Styling Logic
    const navItemClass = ({ isActive }) => 
        `flex items-center gap-3 px-[18px] py-[14px] rounded-xl transition-all duration-300 mb-2 group ${
            isActive 
            ? "bg-gradient-to-r from-[#38bdf81a] to-transparent text-[#38bdf8] border-l-[3px] border-[#38bdf8] shadow-[inset_10px_0_20px_-10px_rgba(56,189,248,0.3)]" 
            : "text-[#94a3b8] border-transparent hover:bg-[#38bdf81a] hover:text-white"
        } ${isCollapsed ? "justify-center px-0 border-l-0" : ""}`;

    return (
        <aside className={`w-full h-full flex flex-col bg-[#0b0e14] font-['Poppins'] transition-all duration-300 border-r border-white/5 ${isCollapsed ? 'p-[25px_10px]' : 'p-[25px_15px]'}`}>
            
            {/* Logo Section & Toggle Button */}
            <div className={`mb-10 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center pl-0' : 'justify-between pl-[10px]'}`}>
                <div className="flex items-center">
                    {!isCollapsed ? (
                        <div className="text-[1.5rem] font-extrabold text-white tracking-tight animate-in fade-in duration-500 whitespace-nowrap">
                            Aura<span className="text-[#38bdf8] [text-shadow:0_0_10px_rgba(56,189,248,0.5)]">Learn</span>
                        </div>
                    ) : (
                        <span className="text-[#38bdf8] [text-shadow:0_0_10px_rgba(56,189,248,0.5)] font-black text-2xl">A</span>
                    )}
                </div>

                {/* Arrow Button */}
                {!isCollapsed && (
                    <button 
                        onClick={() => setIsCollapsed(true)}
                        className="text-[#94a3b8] hover:text-[#38bdf8] transition-all p-1.5 hover:bg-white/5 rounded-xl shadow-inner"
                    >
                        <FiChevronLeft size={20} />
                    </button>
                )}
            </div>

            {/* Expand Button */}
            {isCollapsed && (
                <button 
                    onClick={() => setIsCollapsed(false)}
                    className="mx-auto mb-8 text-[#38bdf8] bg-white/5 p-2 rounded-xl hover:scale-110 transition-all border border-white/5"
                >
                    <FiChevronRight size={20} />
                </button>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
                <NavItem to="/student-dashboard" end icon={<FiHome size={18}/>} label="Dashboard" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/my-courses" icon={<FiPlayCircle size={18}/>} label="My Courses" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/full-explore" icon={<FiBookOpen size={18}/>} label="Explore Library" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/ai-assistant" icon={<FiCpu size={18}/>} label="AI Assistant" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/certificates" icon={<FiAward size={18}/>} label="Certificates" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/quizzes" icon={<FiCheckSquare size={18}/>} label="Quizzes" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/settings" icon={<FiSettings size={18}/>} label="Settings" isCollapsed={isCollapsed} className={navItemClass} />
            </nav>

            {/* Sign Out */}
            <div className="mt-auto pt-4 border-t border-white/5">
                <button 
                    onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                    className={`flex items-center justify-center gap-2 w-full p-3.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold cursor-pointer transition-all hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/5 group ${isCollapsed ? 'p-3.5 justify-center w-12 h-12 mx-auto' : ''}`}
                    title={isCollapsed ? "Sign Out" : ""}
                >
                    <FiLogOut size={18} className="group-hover:-translate-x-1 transition-transform shrink-0" /> 
                    {!isCollapsed && <span className="animate-in fade-in duration-300">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

// NavItem Component
const NavItem = ({ to, end, icon, label, isCollapsed, className }) => (
    <NavLink to={to} end={end} className={className} title={isCollapsed ? label : ""}>
        <span className="shrink-0">{icon}</span>
        {!isCollapsed && (
            <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                {label}
            </span>
        )}
    </NavLink>
);

export default Sidebar;