import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiUser, FiBriefcase, FiArrowRight, FiCpu, 
  FiBarChart2, FiAward, FiCheckCircle, FiMenu, FiX
} from 'react-icons/fi';
import heroImg from '../../assets/images/hero-vector.png'; 
import Footer from '../../components/common/Footer/Footer';
import PageTransition from '../../components/common/PageTransition/PageTransition';

const LandingPage = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscriberEmail) return toast.warn("AuraLearn needs an email!");
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/newsletter/subscribe', { email: subscriberEmail });
      if (response.status === 201) {
        toast.success(response.data.message || "Welcome aboard!");
        setSubscriberEmail("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col bg-[#05070a] text-white font-['Poppins'] overflow-x-hidden landing-page-wrap">
        <style>{`
          .landing-page-wrap::-webkit-scrollbar { display: none; }
          .landing-page-wrap { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        

        {/* Background Blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full blur-[120px] opacity-40 mix-blend-screen w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[#6c30d4] -top-[10%] -left-[10%]" />
          <div className="absolute rounded-full blur-[120px] opacity-40 mix-blend-screen w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-[#2563eb] top-[5%] -right-[10%]" />
          <div className="absolute rounded-full blur-[120px] opacity-25 mix-blend-screen w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] bg-[#05c8eb] top-[35%] -left-[5%]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1.5px,transparent_1.5px)] bg-[length:50px_50px]" />
        </div>

        {/* ── STICKY NAV ── */}
        <nav className="sticky top-0 z-[1000] bg-[#05070a]/80 backdrop-blur-[20px] border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <div className="text-[1.5rem] sm:text-[1.8rem] font-bold text-white">
              Aura<span className="text-[#38bdf8]">Learn</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-8 md:gap-[70px]">
              <button onClick={() => scrollTo('features')} className="text-[#94a3b8] text-[0.95rem] hover:text-[#38bdf8] transition-colors bg-transparent border-none cursor-pointer">Features</button>
              <button onClick={() => scrollTo('roles')} className="text-[#94a3b8] text-[0.95rem] hover:text-[#38bdf8] transition-colors bg-transparent border-none cursor-pointer">Roles</button>
              <button onClick={() => navigate('/login')} className="bg-[#38bdf8] text-black border-none px-5 sm:px-[30px] py-2 sm:py-3 rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all text-sm sm:text-base">
                Login
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button className="sm:hidden text-white text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden bg-[#0f172a]/95 backdrop-blur border-t border-white/10 px-6 pb-4 flex flex-col gap-4"
              >
                <button onClick={() => scrollTo('features')} className="text-[#94a3b8] hover:text-[#38bdf8] text-left py-2 bg-transparent border-none cursor-pointer text-base transition-colors">Features</button>
                <button onClick={() => scrollTo('roles')} className="text-[#94a3b8] hover:text-[#38bdf8] text-left py-2 bg-transparent border-none cursor-pointer text-base transition-colors">Roles</button>
                <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="bg-[#38bdf8] text-black px-6 py-3 rounded-xl font-bold w-full text-base">Login</button>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="relative z-10 flex-1">
          {/* ── HERO SECTION ── */}
          <section className="flex flex-col lg:flex-row items-center px-4 sm:px-8 lg:px-[8%] pt-10 pb-10 gap-8 lg:gap-[60px] text-center lg:text-left">
            <div className="flex-[1.2] w-full">
              <div className="inline-block bg-[#38bdf8]/10 text-[#38bdf8] px-4 py-2 rounded-full text-[0.8rem] sm:text-[0.85rem] mb-6 border border-[#38bdf8]/30">
                Next-Gen AI Learning
              </div>
              <h1 className="text-[2.4rem] sm:text-[3.5rem] lg:text-[4.8rem] font-bold leading-[1.1] mb-5">
                Revolutionize Your <br />
                <span className="bg-gradient-to-r from-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent">Learning Journey</span>
              </h1>
              <p className="text-[#94a3b8] text-base sm:text-lg lg:text-xl mb-8 max-w-[600px] mx-auto lg:mx-0 leading-[1.6]">
                Experience an AI-driven LMS where instructors create smart content and students get personalized career pathways through advanced analytics.
              </p>
              <div className="flex flex-col items-center lg:items-start gap-3">
                <button
                  onClick={() => scrollTo('roles')}
                  className="w-fit bg-[#2563eb] text-white px-8 sm:px-[45px] py-4 sm:py-5 rounded-2xl text-base sm:text-[1.15rem] font-bold flex items-center gap-3 transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-1"
                >
                  Start for Free <FiArrowRight />
                </button>
                <div className="text-[#475569] font-medium text-sm">Join 10,000+ Global Students</div>
              </div>
            </div>
            <div className="flex-1 flex justify-center w-full">
              <motion.img
                src={heroImg}
                alt="Education Illustration"
                className="w-[80%] sm:w-[70%] lg:w-full max-w-[500px] lg:max-w-[750px] drop-shadow-[0_0_50px_rgba(56,189,248,0.25)]"
                animate={{ y: [0, -20, 0], rotate: [0, 1, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </section>

          {/* ── FEATURES GRID ── */}
          <section id="features" className="px-4 sm:px-8 lg:px-[8%] py-10 sm:py-16 text-center">
            <h2 className="text-[2rem] sm:text-[2.5rem] lg:text-[3rem] font-bold mb-10 sm:mb-16 tracking-tighter">Why Choose AuraLearn?</h2>
            <motion.div
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
            >
              {[
                { icon: <FiCpu />, title: "AI Quiz Generator", desc: "Instructors upload documents; AI creates specialized MCQs instantly.", points: ["Automatic Sourcing", "Smart Scaling"] },
                { icon: <FiBarChart2 />, title: "Smart Analytics", desc: "Real-time tracking of student performance with AI insights.", points: ["Performance Heatmaps", "Growth Plans"] },
                { icon: <FiAward />, title: "Auto-Certificates", desc: "Verified digital certificates generated instantly upon completion.", points: ["Blockchain Verified", "Instant Sharing"] }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
                  className="bg-[#0f172a]/60 backdrop-blur-[30px] border border-white/10 rounded-[30px] sm:rounded-[40px] p-6 sm:p-[30px] text-left transition-all hover:-translate-y-2 hover:border-[#38bdf8]"
                >
                  <div className="text-[2.5rem] sm:text-[3rem] text-[#38bdf8] mb-5">{feature.icon}</div>
                  <h3 className="text-[1.4rem] sm:text-[1.8rem] mb-3 font-semibold">{feature.title}</h3>
                  <p className="text-[#94a3b8] leading-[1.6] mb-6 text-sm sm:text-base">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.points.map((p, i) => (
                      <li key={i} className="flex items-center gap-3 text-[#cbd5e1] text-[0.9rem] sm:text-[0.95rem]">
                        <FiCheckCircle className="text-[#38bdf8] shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ── ROLE SELECTION ── */}
          <section id="roles" className="px-4 sm:px-8 lg:px-[8%] py-16 sm:py-[120px] text-center">
            <h2 className="text-[2rem] sm:text-[2.5rem] lg:text-[3rem] font-bold mb-10 sm:mb-20 tracking-tighter">Select Your Role</h2>
            <motion.div
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-10"
            >
              {/* Student Card */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                whileHover={{ y: -10 }}
                onClick={() => navigate('/register?role=student')}
                className="bg-[#0f172a]/70 backdrop-blur-[30px] border-2 border-white/5 rounded-[35px] sm:rounded-[45px] p-8 sm:p-[60px_45px] w-full sm:max-w-[480px] text-left cursor-pointer group hover:border-[#38bdf8] transition-all"
              >
                <div className="flex items-center gap-4 sm:gap-6 mb-6">
                  <div className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-[12px] sm:rounded-[15px] bg-white/5 border border-white/10 flex items-center justify-center text-[1.5rem] sm:text-[1.8rem] text-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all shrink-0">
                    <FiUser />
                  </div>
                  <div>
                    <h3 className="text-[1.5rem] sm:text-[2rem] font-semibold">Become a Student</h3>
                    <p className="text-[#38bdf8] font-semibold uppercase tracking-widest text-[0.75rem] sm:text-[0.85rem]">Learn, Test, Grow</p>
                  </div>
                </div>
                <p className="text-[#94a3b8] text-sm sm:text-[1.05rem] leading-[1.7] mb-8">Access high-quality study materials, join interactive classes, and get AI-powered insights.</p>
                <button className="w-full py-4 sm:py-[18px] bg-[#38bdf8] text-black font-extrabold text-base sm:text-[1.1rem] rounded-[16px] sm:rounded-[20px] hover:brightness-110 transition-all">Register as Student</button>
              </motion.div>

              {/* Instructor Card */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                whileHover={{ y: -10 }}
                onClick={() => navigate('/register?role=instructor')}
                className="bg-[#0f172a]/70 backdrop-blur-[30px] border-2 border-white/5 rounded-[35px] sm:rounded-[45px] p-8 sm:p-[60px_45px] w-full sm:max-w-[480px] text-left cursor-pointer group hover:border-[#7c3aed] transition-all"
              >
                <div className="flex items-center gap-4 sm:gap-6 mb-6">
                  <div className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-[12px] sm:rounded-[15px] bg-white/5 border border-white/10 flex items-center justify-center text-[1.5rem] sm:text-[1.8rem] text-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all shrink-0">
                    <FiBriefcase />
                  </div>
                  <div>
                    <h3 className="text-[1.5rem] sm:text-[2rem] font-semibold">Become an Instructor</h3>
                    <p className="text-[#38bdf8] font-semibold uppercase tracking-widest text-[0.75rem] sm:text-[0.85rem]">Teach, Manage, Inspire</p>
                  </div>
                </div>
                <p className="text-[#94a3b8] text-sm sm:text-[1.05rem] leading-[1.7] mb-8">Create comprehensive courses, manage student approvals, and automate exams using AI tools.</p>
                <button className="w-full py-4 sm:py-[18px] bg-[#7c3aed] text-white font-extrabold text-base sm:text-[1.1rem] rounded-[16px] sm:rounded-[20px] hover:brightness-110 transition-all">Register as Instructor</button>
              </motion.div>
            </motion.div>
          </section>
        </main>

        <div className="relative z-10 px-4 sm:px-6 pb-6">
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default LandingPage;