import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from '../../../components/dashboard/Sidebar';
import Navbar from '../../../components/dashboard/Navbar';
import NotificationPanel from '../../../components/dashboard/NotificationPanel';
import StudentProfileDrawer from '../../../components/dashboard/StudentProfileDrawer';
import { applyTheme } from '../../../utils/themeHelper';
import ChatWidget from '../../../components/ChatWidget';

const StudentDashboard = () => {
    const location = useLocation();
    const isAIPage = location.pathname.includes('ai-assistant');
    const [activePanel, setActivePanel] = useState(null); 
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const user = JSON.parse(localStorage.getItem('auraUser') || '{}');
    const userId = user?.id || user?._id;

    useEffect(() => {
        applyTheme(null, userId);
    }, [userId]);
    
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem('sidebar_collapsed');
        return savedState === 'true';
    });

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', isCollapsed);
    }, [isCollapsed]);

    const closeAll = () => setActivePanel(null);

    return (
        <div className="flex h-screen w-screen bg-[#05070a] overflow-hidden font-['Poppins'] relative">
         
            <style>{`
                *::-webkit-scrollbar { display: none !important; }
                * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
            `}</style>
            
            {/* --- SIDEBAR CONTAINER --- */}
            <aside 
                className={`h-full z-50 transition-all duration-300 ease-in-out shrink-0 
                    ${isMobile 
                        ? `fixed top-0 left-0 h-full w-[230px] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl bg-[#0b0e14]` 
                        : `${isCollapsed ? 'w-[72px]' : 'w-[230px]'}`
                    }`}
            >
                <Sidebar 
                    isCollapsed={isMobile ? false : isCollapsed} 
                    setIsCollapsed={setIsCollapsed} 
                />
            </aside>

            {/* Mobile Sidebar overlay backdrop */}
            {isMobile && isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
                />
            )}

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <Navbar 
                    onProfileClick={() => setActivePanel('profile')} 
                    onNotifyClick={() => setActivePanel('notify')} 
                    onMenuClick={isMobile ? () => setIsSidebarOpen(!isSidebarOpen) : null}
                    isMobile={isMobile}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
                
                <NotificationPanel isOpen={activePanel === 'notify'} onClose={closeAll} />
                <StudentProfileDrawer isOpen={activePanel === 'profile'} onClose={closeAll} />

                <main className={`flex-1 min-h-0 bg-[#05070a] ${isAIPage ? 'overflow-hidden flex flex-col' : 'overflow-y-auto no-scrollbar'}`}>
                    {isAIPage ? (
                        <div className="flex-1 min-h-0 h-full p-4 lg:p-6 flex flex-col">
                            <Outlet context={{ searchQuery }} />
                        </div>
                    ) : (
                        <div className="p-4 lg:p-10">
                            <div className="max-w-[1400px] mx-auto pb-20">
                                <Outlet context={{ searchQuery }} />
                            </div>
                        </div>
                    )}
                </main>
            </div>
            
            {/* Global Chat Widget */}
            <ChatWidget />
        </div>
    );
};

export default StudentDashboard;