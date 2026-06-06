import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiUser, FiBriefcase, FiArrowRight, FiCpu, 
  FiBarChart2, FiAward, FiCheckCircle 
} from 'react-icons/fi';
import heroImg from '../../assets/images/hero-vector.png'; 
import Footer from '../../components/common/Footer/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscriberEmail) return toast.warn("AuraLearn needs an email!");
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/newsletter/subscribe', {
        email: subscriberEmail
      });
      if (response.status === 201) {
        toast.success("Welcome aboard!");
        setSubscriberEmail(""); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#05070a] text-white font-['Poppins'] overflow-x-hidden scroll-smooth">
      <ToastContainer position="top-center" autoClose={3000} />

    
<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
  {/* Purple Blob */}
  <div className="absolute rounded-full blur-[120px] opacity-40 mix-blend-screen animate-[auraFloat_25s_infinite_alternate_ease-in-out] w-[600px] h-[600px] bg-[#6c30d4] -top-[10%] -left-[10%]" />
  
  {/* Blue Blob */}
  <div className="absolute rounded-full blur-[120px] opacity-40 mix-blend-screen animate-[auraFloat_25s_infinite_alternate_ease-in-out] [animation-delay:-2s] w-[400px] h-[400px] bg-[#2563eb] top-[5%] -right-[15%]" />
  
  {/* Cyan Blob */}
  <div className="absolute rounded-full blur-[120px] opacity-[0.25] mix-blend-screen animate-[auraFloat_25s_infinite_alternate_ease-in-out] [animation-delay:-5s] w-[250px] h-[250px] bg-[#05c8eb] top-[35%] -left-[10%]" />

  {/* Center Tiny Blob */}
  <div className="absolute rounded-full blur-[120px] opacity-[0.15] w-[120px] h-[120px] bg-[#2563eb] top-[50%] left-[45%]" />

  {/* Grid Layer */}
  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1.5px,transparent_1.5px)] bg-[length:50px_50px]" />
</div>
        {/* Grid Layer */}
      

      {/* --- STICKY NAV --- */}
      <nav className="sticky top-0 z-[1000] bg-[#05070a]/75 backdrop-blur-[20px] border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-[22px] py-5 flex justify-between items-center">
          <div className="text-[1.8rem] font-bold text-white">
            Aura<span className="text-[#38bdf8]">Learn</span>
          </div>
          <div className="flex items-center gap-[70px]">
            <a href="#features" className="text-[#94a3b8] text-[0.95rem] hover:text-[#38bdf8] transition-colors">Features</a>
            <a href="#roles" className="text-[#94a3b8] text-[0.95rem] hover:text-[#38bdf8] transition-colors">Roles</a>
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#38bdf8] text-black border-none px-[30px] py-3 rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1">
        {/* --- HERO SECTION --- */}
        <section className="flex flex-col lg:flex-row items-center px-[8%] pt-[30px] pb-[40px] gap-[60px]">
          <div className="flex-[1.2]">
            <div className="inline-block bg-[#38bdf8]/10 text-[#38bdf8] px-5 py-2 rounded-full text-[0.85rem] mb-[30px] border border-[#38bdf8]/30">
              Next-Gen AI Learning
            </div>
            <h1 className="text-6xl lg:text-[4.8rem] font-bold leading-[1] mb-[25px]">
              Revolutionize Your <br />
              <span className="bg-gradient-to-r from-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent">Learning Journey</span>
            </h1>
            <p className="text-[#94a3b8] text-xl mb-[45px] max-w-[600px] leading-[1.6]">
              Experience an AI-driven LMS where instructors create smart content and students get personalized career pathways through advanced analytics.
            </p>
            <div className="flex flex-col gap-6">
              <button 
                onClick={() => document.getElementById('roles').scrollIntoView({behavior:'smooth'})}
                className="w-fit bg-[#2563eb] text-white px-[45px] py-5 rounded-2xl text-[1.15rem] font-bold flex items-center gap-3 transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-1"
              >
                Start for Free <FiArrowRight />
              </button>
              <div className="text-[#475569] font-medium mt-1">Join 10,000+ Global Students</div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <motion.img 
              src={heroImg} 
              alt="Education Illustration"
              className="w-full max-w-[750px] drop-shadow-[0_0_50px_rgba(56,189,248,0.25)]"
              animate={{ y: [0, -25, 0], rotate: [0, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="features" className="px-[8%] py-[10px] text-center">
          <h2 className="text-[3rem] font-bold mb-20 tracking-tighter">Why Choose AuraLearn?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature Card Component */}
            {[
              { icon: <FiCpu />, title: "AI Quiz Generator", desc: "Instructors upload documents; AI creates specialized MCQs instantly.", points: ["Automatic Sourcing", "Smart Scaling"] },
              { icon: <FiBarChart2 />, title: "Smart Analytics", desc: "Real-time tracking of student performance with AI insights.", points: ["Performance Heatmaps", "Growth Plans"] },
              { icon: <FiAward />, title: "Auto-Certificates", desc: "Verified digital certificates generated instantly upon completion.", points: ["Blockchain Verified", "Instant Sharing"] }
            ].map((feature, index) => (
              <div key={index} className="bg-[#0f172a]/60 backdrop-blur-[30px] border border-white/10 rounded-[40px] p-[30px] text-left transition-all hover:-translate-y-2 hover:border-[#38bdf8]">
                <div className="text-[3rem] text-[#38bdf8] mb-[25px]">{feature.icon}</div>
                <h3 className="text-[1.8rem] mb-[15px] font-semibold">{feature.title}</h3>
                <p className="text-[#94a3b8] leading-[1.6] mb-[30px]">{feature.desc}</p>
                <ul className="space-y-3">
                  {feature.points.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#cbd5e1] text-[0.95rem]">
                      <FiCheckCircle className="text-[#38bdf8]" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* --- ROLE SELECTION --- */}
        <section id="roles" className="px-[8%] py-[120px] text-center">
          <h2 className="text-[3rem] font-bold mb-20 tracking-tighter">Select Your Role</h2>
          <div className="flex flex-wrap justify-center gap-10">
            
            {/* Student Card */}
            <motion.div 
              whileHover={{ y: -15 }}
              onClick={() => navigate('/register?role=student')}
              className="bg-[#0f172a]/70 backdrop-blur-[30px] border-2 border-white/5 rounded-[45px] p-[60px_45px] w-full max-w-[480px] text-left cursor-pointer group hover:border-[#38bdf8] transition-all"
            >
              <div className="flex items-center gap-6 mb-[30px]">
                <div className="w-[60px] h-[60px] rounded-[15px] bg-white/5 border border-white/10 flex items-center justify-center text-[1.8rem] text-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all">
                  <FiUser />
                </div>
                <div>
                  <h3 className="text-[2rem] font-semibold">Become a Student</h3>
                  <p className="text-[#38bdf8] font-semibold uppercase tracking-widest text-[0.85rem]">Learn, Test, Grow</p>
                </div>
              </div>
              <p className="text-[#94a3b8] text-[1.05rem] leading-[1.7] mb-10">Access high-quality study materials, join interactive classes, and get AI-powered insights.</p>
              <button className="w-full py-[18px] bg-[#38bdf8] text-black font-extrabold text-[1.1rem] rounded-[20px] hover:brightness-110 transition-all">Register as Student</button>
            </motion.div>

            {/* Instructor Card */}
            <motion.div 
              whileHover={{ y: -15 }}
              onClick={() => navigate('/register?role=instructor')}
              className="bg-[#0f172a]/70 backdrop-blur-[30px] border-2 border-white/5 rounded-[45px] p-[60px_45px] w-full max-w-[480px] text-left cursor-pointer group hover:border-[#7c3aed] transition-all"
            >
              <div className="flex items-center gap-6 mb-[30px]">
                <div className="w-[60px] h-[60px] rounded-[15px] bg-white/5 border border-white/10 flex items-center justify-center text-[1.8rem] text-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all">
                  <FiBriefcase />
                </div>
                <div>
                  <h3 className="text-[2rem] font-semibold">Become an Instructor</h3>
                  <p className="text-[#38bdf8] font-semibold uppercase tracking-widest text-[0.85rem]">Teach, Manage, Inspire</p>
                </div>
              </div>
              <p className="text-[#94a3b8] text-[1.05rem] leading-[1.7] mb-10">Create comprehensive courses, manage student approvals, and automate exams using AI tools.</p>
              <button className="w-full py-[18px] bg-[#7c3aed] text-white font-extrabold text-[1.1rem] rounded-[20px] hover:brightness-110 transition-all">Register as Instructor</button>
            </motion.div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;