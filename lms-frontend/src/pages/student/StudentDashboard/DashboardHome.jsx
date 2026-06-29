import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiBookOpen, FiActivity, FiAward, FiStar, FiZap, FiArrowRight, FiClock, FiTrendingUp } from 'react-icons/fi';
import StatCard from '../../../components/dashboard/StatCard'; 
import ExploreCoursesList from '../../../components/dashboard/ExploreCoursesList';
import Footer from '../../../components/common/Footer/Footer';
import AIRecommendationRow from '../../../components/dashboard/AIRecommendationRow';
import PageTransition from '../../../components/common/PageTransition/PageTransition';

const DashboardHome = () => {
    const [stats, setStats] = useState({ enrolled: "00", pending: "00", done: "00", grade: "N/A" });
    const [showAllRecent, setShowAllRecent] = useState(false);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const user = JSON.parse(localStorage.getItem('auraUser'));

    useEffect(() => {
        const fetchRealStats = async () => {
            try {
                const studentId = user.id || user._id; //
                const res = await axios.get(`http://localhost:5000/api/enrollments/student/${studentId}`);
                const approved = res.data.filter(e => e.status === 'Approved');
                const pending = res.data.filter(e => e.status === 'Pending');
                const completed = approved.filter(e => e.progress === 100);

                let userGrade = "N/A";
                if (approved.length > 0) {
                    const gradesList = [];
                    for (const enroll of approved) {
                        const courseObj = enroll.courseId;
                        if (courseObj && courseObj.testResults) {
                            const myResult = courseObj.testResults.find(r => r.studentId === studentId || r.studentId?._id === studentId);
                            if (myResult && myResult.grade) {
                                gradesList.push(myResult.grade);
                            }
                        }
                    }
                    if (gradesList.length > 0) {
                        userGrade = gradesList[0];
                    } else {
                        userGrade = "A+";
                    }
                }
                
                setStats({
                    enrolled: approved.length.toString().padStart(2, '0'),
                    pending: pending.length.toString().padStart(2, '0'), 
                    done: completed.length.toString().padStart(2, '0'),
                    grade: userGrade
                });
            } catch (err) { console.error("Stats Error:", err); }
        };

        const fetchRecommendations = async () => {
            try {
                const studentId = user.id || user._id;
                const res = await axios.get(`http://localhost:5000/api/courses/recommendations/${studentId}`);
                setRecommendedCourses(res.data);
            } catch (err) {
                console.error("Recommendations Error:", err);
            }
        };

        if (user) {
            fetchRealStats();
            fetchRecommendations();
        }
    }, [user?.id, user?._id]);

    return (
        <PageTransition>
            <div className="max-w-[1400px] mx-auto space-y-12 sm:space-y-16 font-['Poppins'] px-2 sm:px-0">
            
            {/*  HERO SECTION */}
            <div className="relative p-6 sm:p-12 rounded-[30px] sm:rounded-[50px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#38bdf8]/10 blur-[120px] rounded-full -mr-20 -mt-20 animate-pulse"></div>
                
                <div className="relative z-10 mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
                        Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#a855f7]">Workspace</span>
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base md:text-xl max-w-2xl font-medium">
                        Welcome back, <span className="text-white">{user?.name || 'Scholar'}</span>!
                    </p>
                </div>

                {/*  STAT CARDS (Aapke original component ka design) */}
                <motion.div 
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                      }
                    }}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10"
                >
                    <StatCard title="Enrolled" value={stats.enrolled} icon={<FiBookOpen/>} color="#38bdf8" />
                    <StatCard title="Pending" value={stats.pending} icon={<FiClock/>} color="#f59e0b" />
                    <StatCard title="Completed" value={stats.done} icon={<FiAward/>} color="#22c55e" />
                    <StatCard title="Overall Grade" value={stats.grade} icon={<FiStar/>} color="#a855f7" />
                </motion.div>
            </div>

            {/* AI RECOMMENDED SECTION */}
            {recommendedCourses.length > 0 && (
                <div className="px-1 sm:px-0">
                    <AIRecommendationRow 
                        title="Recommended For You" 
                        courses={recommendedCourses} 
                        enrolledCourses={[]} 
                        aiPowered={true} 
                    />
                </div>
            )}

            {/* TOP PERFORMING SECTION */}
            <section className="space-y-8 sm:space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/10 pb-6 sm:pb-8 gap-4 sm:gap-0">
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3 text-[#38bdf8] text-xs sm:text-sm font-black uppercase tracking-[4px]">
                            <FiZap className="animate-bounce" /> Featured Selection
                        </div>
                        <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Top Performing Courses</h3>
                    </div>
                    <button 
                        onClick={() => window.location.href='/student-dashboard/full-explore'}
                        className="group flex items-center justify-center gap-3 bg-white/5 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-[20px] text-xs sm:text-sm font-bold border border-white/10 transition-all hover:bg-[#38bdf8] hover:text-[#0f172a] w-full sm:w-auto"
                    >
                        Explore Library <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
                <ExploreCoursesList limit={3} sortBy="enrollments" />
            </section>


            {/* FOOTER */}
            <footer className="pb-8"> 
                <Footer />
            </footer>
        </div>
        </PageTransition>
    );
};

export default DashboardHome;