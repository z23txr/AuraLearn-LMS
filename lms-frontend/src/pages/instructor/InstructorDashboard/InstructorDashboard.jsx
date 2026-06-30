import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../../components/instructor/navbar';
import Sidebar from '../../../components/instructor/sidebar';
import StatCard from '../../../components/instructor/statcard';
import { FiUsers, FiBook, FiClock, FiActivity, FiStar, FiTrendingUp } from 'react-icons/fi';
import ChatWidget from '../../../components/ChatWidget';

const InstructorDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalStudents: 0, activeCourses: 0, pending: 0, graded: 0 });
    const [activities, setActivities] = useState([]);
    const [topCourses, setTopCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem('auraUser')); 
    const isOverview = location.pathname === '/instructor-dashboard' || location.pathname === '/instructor-dashboard/';

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                const instructorId = user.id || user._id; 
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/enrollments/instructor/${instructorId}`);
                const data = res.data;

                const pendingCount = data.filter(app => app.status === 'Pending').length;
                const approvedCount = data.filter(app => app.status === 'Approved').length;

                const today = new Date().setHours(0, 0, 0, 0);
                const todaysData = data.filter(item => new Date(item.createdAt).setHours(0, 0, 0, 0) === today);

                const recentActivities = todaysData.slice(0, 5).map(item => ({
                    id: item._id,
                    user: item.studentDetails?.fullName || "New Student",
                    action: item.status === 'Pending' ? "requested enrollment in" : "joined",
                    course: item.courseTitle,
                    time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: item.status
                }));

                const courseCounts = data.reduce((acc, curr) => {
                    acc[curr.courseTitle] = (acc[curr.courseTitle] || 0) + 1;
                    return acc;
                }, {});

                const sortedCourses = Object.entries(courseCounts)
                    .map(([name, count]) => ({ 
                        name, 
                        count, 
                        percentage: Math.min(Math.round((count / (approvedCount || 1)) * 100), 100) 
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3);

                setStats({
                    totalStudents: approvedCount.toString().padStart(2, '0'),
                    activeCourses: Object.keys(courseCounts).length.toString().padStart(2, '0'),
                    pending: pendingCount.toString().padStart(2, '0'),
                    graded: (approvedCount * 5).toString() 
                });

                setActivities(recentActivities);
                setTopCourses(sortedCourses);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard Error:", err);
                setLoading(false);
            }
        };

        if (isOverview) fetchInstructorData();
    }, [isOverview, user.id, user._id]);

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-[230px_1fr] h-screen w-screen bg-[#0b0e14] overflow-hidden font-['Poppins']">
           
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

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 w-[230px] border-r border-[#1e293b] bg-[#0f172a] z-[101] transform transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <Navbar setSearchQuery={setSearchQuery} onToggleSidebar={() => setIsSidebarOpen(true)} />

                <div className="flex-1 overflow-y-scroll hide-scrollbar p-4 md:p-8 lg:p-[30px_40px]">
                    {isOverview && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="mb-[30px]">
                                <h2 className="text-white text-[1.8rem] font-bold mb-[5px]">Instructor <span className="text-[#a855f7]">Overview</span></h2>
                                <p className="text-[#64748b]">Welcome back, {user?.name}!</p>
                            </div>
                                
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                <StatCard title="Total Students" value={stats.totalStudents} icon={<FiUsers />} color="#38bdf8" />
                                <StatCard title="Active Courses" value={stats.activeCourses} icon={<FiBook />} color="#a855f7" />
                                <StatCard title="Pending Approvals" value={stats.pending} icon={<FiClock />} color="#f59e0b" />
                                <StatCard title="Aura Points Issued" value={stats.graded} icon={<FiTrendingUp />} color="#22c55e" />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-[25px] pb-10">
                                <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="flex items-center gap-3 text-lg text-white font-bold">
                                            <FiActivity className="text-[#a855f7]" /> Today's Activity
                                        </h3>
                                        <button onClick={() => navigate('/instructor-dashboard/approvals')} className="text-[#a855f7] text-sm font-bold hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-6">
                                        {activities.length > 0 ? activities.map(item => (
                                            <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-none">
                                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${item.status === 'Pending' ? 'bg-orange-500' : 'bg-[#a855f7]'}`}></div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-slate-400">
                                                        <b className="text-white">{item.user}</b> {item.action} <span className="text-[#38bdf8] font-bold">{item.course}</span>
                                                    </p>
                                                    <small className="text-[#64748b] font-medium">{item.time}</small>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-slate-500 italic text-center py-10">No activity today.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl flex flex-col">
                                    <h3 className="flex items-center gap-3 text-lg text-white font-bold mb-8">
                                        <FiStar className="text-[#f59e0b]" /> Course Popularity
                                    </h3>
                                    <div className="space-y-8 flex-1">
                                        {topCourses.map((course, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between mb-2 text-sm text-white/80">
                                                    <span>{course.name}</span>
                                                    <b>{course.count} Students</b>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#38bdf8]" style={{ width: `${course.percentage}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <Outlet context={{ searchQuery }} />
                </div>
            </main>

            {/* Global Chat Widget */}
            <ChatWidget />
        </div>
    );
};

export default InstructorDashboard;