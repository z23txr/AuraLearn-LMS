import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import authImg from '../../../assets/images/auth-vector.png';
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '../../../components/common/Footer/Footer';
import PageTransition from '../../../components/common/PageTransition/PageTransition';

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
    <PageTransition>
      <div className="relative bg-[#05070a] font-['Poppins'] login-page-wrap"
        style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <style>{`
          .login-page-wrap::-webkit-scrollbar { display: none; }
          .login-page-wrap { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        

        {/* Background Blobs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[400px] h-[400px] bg-[#7c3aed] blur-[90px] opacity-30 rounded-full -top-[10%] -left-[5%]" />
          <div className="absolute w-[450px] h-[450px] bg-[#2563eb] blur-[90px] opacity-30 rounded-full -bottom-[10%] -right-[5%]" />
        </div>

        {/* Center: Form */}
        <div className="flex-1 flex justify-center items-center relative z-10 px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
            className="flex w-full bg-[#0f172a]/75 backdrop-blur-[20px] border border-white/10 rounded-[20px] sm:rounded-[30px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            style={{ maxWidth: 720 }}
          >
            {/* Left Image Panel */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex-col items-center justify-center p-8 border-r border-white/5">
              <motion.img
                src={authImg}
                className="w-[80%]"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="text-center mt-5">
                <h3 className="text-white text-[1.5rem] font-bold mb-1">Welcome Back!</h3>
                <p className="text-[#94a3b8] text-sm">Your learning journey continues here.</p>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-[1.2] p-6 sm:p-8 lg:p-[40px_60px] bg-[#0f172a] flex flex-col justify-center">
              <div className="mb-7">
                <h2 className="text-white text-[2rem] font-bold mb-1">Login</h2>
                <p className="text-[#64748b] text-sm">Access your dashboard and courses</p>
              </div>

              <form onSubmit={handlesubmit} className="space-y-7">
                <div className="relative">
                  <input
                    type="email" name="email" required
                    value={logindata.email} onChange={getvalue} placeholder=" "
                    className="peer w-full py-2 bg-transparent border-b-2 border-[#334155] text-white outline-none focus:border-[#38bdf8] transition-all"
                  />
                  <label className="absolute left-0 top-2 text-[#64748b] pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#38bdf8] peer-valid:-top-4 peer-valid:text-xs">
                    Email Address
                  </label>
                  <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#38bdf8] transition-all duration-300 -translate-x-1/2 peer-focus:w-full" />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} name="password" required
                    value={logindata.password} onChange={getvalue}
                    className="peer w-full py-2 bg-transparent border-b-2 border-[#334155] text-white outline-none focus:border-[#38bdf8] transition-all"
                  />
                  <label className="absolute left-0 top-2 text-[#64748b] pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#38bdf8] peer-valid:-top-4 peer-valid:text-xs">
                    Password
                  </label>
                  <span className="absolute right-2 top-2 cursor-pointer text-[#38bdf8]" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                  <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#38bdf8] transition-all duration-300 -translate-x-1/2 peer-focus:w-full" />
                </div>

                <div className="text-right -mt-3">
                  <span onClick={() => navigate('/forgot-password')} className="text-[#64748b] text-xs cursor-pointer hover:text-[#38bdf8]">
                    Forgot Password?
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={isSubmitting}
                  className="w-full py-[14px] rounded-[12px] bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                >
                  {isSubmitting ? "Wait..." : "Sign In"}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-[#64748b] text-sm">
                Don't have an account?{' '}
                <span onClick={() => navigate('/#roles')} className="text-[#38bdf8] cursor-pointer font-semibold hover:underline">
                  Sign up
                </span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer at bottom */}
        <div className="relative z-10 px-6 pb-4">
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;