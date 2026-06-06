import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import authImg from '../../../assets/images/auth-vector.png';
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Footer from '../../../components/common/Footer/Footer';

const Login = () => {
  const navigate = useNavigate();
  const [logindata, setLogindata] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getvalue = (e) => setLogindata({ ...logindata, [e.target.name]: e.target.value });

  const handlesubmit = async (e) => {
    e.preventDefault();
    const currentToastId = toast.loading("Verifying your profile");
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', logindata);
      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('auraUser', JSON.stringify(user));
        toast.update(currentToastId, { render: `Welcome back, ${user.name} `, type: "success", isLoading: false, autoClose: 2000 });
        setTimeout(() => navigate(user.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard'), 1500);
      }
    } catch (error) {
      toast.update(currentToastId, { render: error.response?.data?.message || "Login Failed!", type: "error", isLoading: false, autoClose: 3000 });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#05070a] font-['Poppins'] overflow-hidden">
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
      
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-[450px] h-[450px] bg-[#7c3aed] blur-[90px] opacity-30 rounded-full -top-[10%] -left-[5%] animate-[float_15s_infinite_alternate_ease-in-out]" />
        <div className="absolute w-[550px] h-[550px] bg-[#2563eb] blur-[90px] opacity-30 rounded-full -bottom-[10%] -right-[5%] animate-[float_15s_infinite_alternate_ease-in-out] [animation-delay:-5s]" />
      </div>

      <div className="flex-1 flex justify-center items-center p-4 relative z-10 mt-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full max-w-[850px] bg-[#0f172a]/75 backdrop-blur-[20px] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex-col items-center justify-center p-10 border-r border-white/5">
            <motion.img src={authImg} className="w-[85%]" animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <div className="text-center mt-8">
              <h3 className="text-white text-[1.9rem] font-bold mb-2">Welcome Back!</h3>
              <p className="text-[#94a3b8]">Your learning journey continues here.</p>
            </div>
          </div>

          <div className="flex-[1.2] p-10 lg:p-[60px_80px] bg-[#0f172a] flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-white text-[2.6rem] font-bold mb-2">Login</h2>
              <p className="text-[#64748b]">Access your dashboard and courses</p>
            </div>
            <form onSubmit={handlesubmit} className="space-y-9">
              <div className="relative">
                <input type="email" name="email" required value={logindata.email} onChange={getvalue} placeholder=" " className="peer w-full py-2 bg-transparent border-b-2 border-[#334155] text-white text-lg outline-none focus:border-[#38bdf8] transition-all" />
                <label className="absolute left-0 top-2 text-[#64748b] text-lg pointer-events-none transition-all duration-400 peer-focus:-top-5 peer-focus:text-[0.85rem] peer-focus:text-[#38bdf8] peer-valid:-top-5 peer-valid:text-[0.85rem]">Email Address</label>
                <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#38bdf8] transition-all duration-400 -translate-x-1/2 peer-focus:w-full" />
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" required value={logindata.password} onChange={getvalue} className="peer w-full py-2 bg-transparent border-b-2 border-[#334155] text-white text-lg outline-none focus:border-[#38bdf8] transition-all" />
                <label className="absolute left-0 top-2 text-[#64748b] text-lg pointer-events-none transition-all duration-400 peer-focus:-top-5 peer-focus:text-[0.85rem] peer-focus:text-[#38bdf8] peer-valid:-top-5 peer-valid:text-[0.85rem]">Password</label>
                <span className="absolute right-2 top-2 cursor-pointer text-[#38bdf8] text-xl" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</span>
                <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#38bdf8] transition-all duration-400 -translate-x-1/2 peer-focus:w-full" />
              </div>
              <div className="text-right -mt-5">
                <span onClick={() => navigate('/forgot-password')} className="text-[#64748b] text-[0.85rem] cursor-pointer hover:text-[#38bdf8]">Forgot Password?</span>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-[18px] rounded-[15px] bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-bold text-lg shadow-[0_0_20px_rgba(56,189,248,0.3)]" disabled={isSubmitting}>{isSubmitting ? "Wait..." : "Sign In"}</motion.button>
            </form>
            <p className="mt-8 text-center text-[#64748b]">Don't have an account? <span onClick={() => navigate('/#roles')} className="text-[#38bdf8] cursor-pointer font-semibold hover:underline">Sign up</span></p>
          </div>
        </motion.div>
      </div>
      <div className='mt-10'></div>
      <Footer />
    </div>
  );
};
export default Login;