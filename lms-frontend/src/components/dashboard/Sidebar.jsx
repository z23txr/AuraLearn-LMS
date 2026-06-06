import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    FiHome, FiBookOpen, FiCpu, FiAward, 
    FiCheckSquare, FiSettings, FiLogOut, FiPlayCircle,
    FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    // Nav Link Styling Logic
    const navItemClass = ({ isActive }) => 
        `flex items-center gap-4 px-6 py-4 text-[0.95rem] font-medium transition-all duration-300 border-l-[3px] group ${
            isActive 
            ? "bg-gradient-to-r from-[#38bdf81a] to-transparent text-[#38bdf8] border-[#38bdf8] shadow-[inset_10px_0_15px_-10px_#38bdf833]" 
            : "text-[#94a3b8] border-transparent hover:text-white hover:bg-white/[0.02]"
        } ${isCollapsed ? "justify-center px-0 border-l-0" : ""}`;

    return (
        <aside className="w-full h-full flex flex-col bg-[#0b0e14] py-8 font-['Poppins'] transition-all duration-300 border-r border-white/5">
            
            {/*  Logo Section & Toggle Button */}
            <div className={`px-6 mb-12 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center">
                    <div className={`bg-[#38bdf8] rounded-lg shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-8 h-8 mr-3'}`}>
                        <span className="text-[#0b0e14] font-black text-lg">A</span>
                    </div>
                    {!isCollapsed && (
                        <div className="text-[1.5rem] font-extrabold text-white tracking-tight animate-in fade-in duration-500 whitespace-nowrap">
                            Aura<span className="text-[#38bdf8]">Learn</span>
                        </div>
                    )}
                </div>

                {/* Arrow Button  */}
                {!isCollapsed && (
                    <button 
                        onClick={() => setIsCollapsed(true)}
                        className="text-[#94a3b8] hover:text-[#38bdf8] transition-all p-1.5 hover:bg-white/5 rounded-xl shadow-inner"
                    >
                        <FiChevronLeft size={20} />
                    </button>
                )}
            </div>

            {/* Expand Button  */}
            {isCollapsed && (
                <button 
                    onClick={() => setIsCollapsed(false)}
                    className="mx-auto mb-8 text-[#38bdf8] bg-white/5 p-2.5 rounded-2xl hover:scale-110 transition-all shadow-lg border border-white/5"
                >
                    <FiChevronRight size={22} />
                </button>
            )}

            {/*  Navigation Links */}
            <nav className="flex-1 flex flex-col space-y-1 overflow-y-auto no-scrollbar">
                <NavItem to="/student-dashboard" end icon={<FiHome size={20}/>} label="Dashboard" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/my-courses" icon={<FiPlayCircle size={20}/>} label="My Courses" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/full-explore" icon={<FiBookOpen size={20}/>} label="Explore Library" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/ai-assistant" icon={<FiCpu size={20}/>} label="AI Assistant" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/certificates" icon={<FiAward size={20}/>} label="Certificates" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/quizzes" icon={<FiCheckSquare size={20}/>} label="Quizzes" isCollapsed={isCollapsed} className={navItemClass} />
                <NavItem to="/student-dashboard/settings" icon={<FiSettings size={20}/>} label="Settings" isCollapsed={isCollapsed} className={navItemClass} />
            </nav>

            {/*  Sign Out */}
            <div className={`px-4 mt-auto transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <button 
                    className={`flex items-center gap-4 text-[#94a3b8] rounded-2xl transition-all hover:bg-red-500/10 hover:text-red-500 font-bold ${isCollapsed ? 'p-4 justify-center' : 'w-full px-6 py-4'}`}
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    title={isCollapsed ? "Sign Out" : ""}
                >
                    <FiLogOut size={20} className="shrink-0" /> 
                    {!isCollapsed && <span className="animate-in fade-in duration-300 whitespace-nowrap">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

// 
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