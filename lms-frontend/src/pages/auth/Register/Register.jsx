import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import authImg from '../../../assets/images/auth-vector.png';
import Footer from '../../../components/common/Footer/Footer';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =======================================States====================================
  const roleFromUrl = searchParams.get('role') || 'student';
  const [formdata, setformdata] = useState({
    name: '',
    email: '',
    password: '',
    role: roleFromUrl
  });
  const [emailError, setEmailError] = useState(false);    
  const [errors, setErrors] = useState({ name: '', password: '', email: '' });
  const [showPassword, setShowPassword] = useState(false);

  // =======================================Get Value====================================
  const getvalue = (e) => {
    const { name, value } = e.target;
    setformdata({ ...formdata, [name]: value });

    if (name === 'name') {
      setErrors(prev => ({ ...prev, name: value.length > 0 && value.length < 3 ? 'Name must be at least 3 letters' : '' }));
    }

    if (name === 'password') {
      const strongPasswordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
      if (value.length === 0) setErrors(prev => ({ ...prev, password: '' }));
      else if (value.length < 8) setErrors(prev => ({ ...prev, password: 'Minimum 8 characters required' }));
      else if (!strongPasswordRegex.test(value)) setErrors(prev => ({ ...prev, password: 'Include at least one number and special character (@, #, $)' }));
      else setErrors(prev => ({ ...prev, password: '' }));
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value.length === 0) setErrors(prev => ({ ...prev, email: '' }));
      else if (!emailRegex.test(value)) setErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
      else setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  // =======================================Handle Submit====================================
  const handlesubmit = async (e) => {
    e.preventDefault();
    const currentToastId = toast.loading("Creating your account...");
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formdata);
      if (response.status === 201) {
        toast.update(currentToastId, { render: "Account Created Successfully! ", type: "success", isLoading: false, autoClose: 3000 });
        setformdata({ name: '', email: '', password: '', role: roleFromUrl });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const serverMsg = error.response?.data?.message || "Registration Failed!";
      if (serverMsg.toLowerCase().includes("exist")) setEmailError(true);
      toast.update(currentToastId, { render: serverMsg, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#05070a] font-['Poppins'] overflow-hidden">
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
      
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-[450px] h-[450px] bg-[#7c3aed] blur-[90px] opacity-30 rounded-full -top-[10%] -left-[5%] animate-[float_15s_infinite_alternate_ease-in-out]" />
        <div className="absolute w-[550px] h-[550px] bg-[#2563eb] blur-[90px] opacity-30 rounded-full -bottom-[10%] -right-[5%] animate-[float_15s_infinite_alternate_ease-in-out] [animation-delay:-5s]" />
        <div className="absolute w-[300px] h-[300px] bg-[#06b6d4] blur-[90px] opacity-30 rounded-full top-[40%] left-[20%] animate-[float_15s_infinite_alternate_ease-in-out] [animation-delay:-7s]" />
      </div>

      <div className="flex-1 flex justify-center items-center p-4 relative z-10 mt-10">
        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } }} 
          className="flex w-full max-w-[850px] bg-[#0f172a]/75 backdrop-blur-[20px] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
        >
          {/* Image Side */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex-col items-center justify-center p-10 border-r border-white/5">
            <motion.img src={authImg} className="w-[85%] z-10" animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <div className="text-center mt-8 text-white">
              <h3 className="text-[1.9rem] font-bold mb-2">Master New Skills</h3>
              <p className="text-[#94a3b8] text-[0.95rem]">Join 10,000+ students worldwide.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="flex-[1.2] p-10 lg:p-[60px_80px] bg-[#0f172a] flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-white text-[2.6rem] font-bold mb-2">Get Started</h2>
              <p className="text-[#64748b]">Create your account in seconds</p>
            </div>

            <form onSubmit={handlesubmit} className="space-y-12">
              {/* Full Name Input */}
              <div className="relative group mb-8">
                <input type="text" name="name" required placeholder=" " value={formdata.name} onChange={getvalue}
                  className="peer w-full pt-4 pb-1 bg-transparent border-b-2 border-[#334155] text-white text-lg outline-none focus:border-[#38bdf8] transition-all" />
                <label className="absolute left-0 top-4 text-[#64748b] text-lg pointer-events-none transition-all duration-300 peer-focus:-top-3 peer-focus:text-[0.85rem] peer-focus:text-[#38bdf8] peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-[0.85rem]">Full Name</label>
                <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#38bdf8] transition-all duration-400 -translate-x-1/2 peer-focus:w-full peer-[:not(:placeholder-shown)]:w-full" />
                {errors.name && <span className="absolute left-0 top-[100%] mt-1 text-[#ff4d4d] text-[0.75rem] font-medium animate-[fadeIn_0.3s_ease-in-out]">{errors.name}</span>}
              </div>

              {/* Email Input */}
              <div className={`relative group mb-8 ${emailError ? 'animate-[shake_0.2s_ease-in-out_0s_2]' : ''}`}>
                <input type="email" name="email" required placeholder=" " autoComplete="new-password" value={formdata.email} onChange={e => { getvalue(e); setEmailError(false); }}
                  className={`peer w-full pt-4 pb-1 bg-transparent border-b-2 text-white text-lg outline-none transition-all ${emailError ? 'border-[#ff0055]' : 'border-[#334155] focus:border-[#38bdf8]'}`} />
                <label className={`absolute left-0 top-4 text-lg pointer-events-none transition-all duration-300 peer-focus:-top-3 peer-focus:text-[0.85rem] peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-[0.85rem] ${emailError ? 'text-[#ff0055]' : 'text-[#64748b] peer-focus:text-[#38bdf8]'}`}>Email Address</label>
                <div className={`absolute bottom-0 left-1/2 w-0 h-[2px] transition-all duration-400 -translate-x-1/2 peer-focus:w-full peer-[:not(:placeholder-shown)]:w-full ${emailError ? 'bg-[#ff0055]' : 'bg-[#38bdf8]'}`} />
                {(errors.email || emailError) && <span className="absolute left-0 top-[100%] mt-1 text-[#ff4d4d] text-[0.75rem] font-medium animate-[fadeIn_0.3s_ease-in-out]">{errors.email || "Email already exists"}</span>}
              </div>

              {/* Password Input */}
              <div className="relative group mb-8">
                <input type={showPassword ? "text" : "password"} name="password" required placeholder=" " autoComplete="new-password" value={formdata.password} onChange={getvalue}
                  className="peer w-full pt-4 pb-1 bg-transparent border-b-2 border-[#334155] text-white text-lg outline-none focus:border-[#38bdf8] transition-all" />
                <label className="absolute left-0 top-4 text-[#64748b] text-lg pointer-events-none transition-all duration-300 peer-focus:-top-3 peer-focus:text-[0.85rem] peer-focus:text-[#38bdf8] peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-[0.85rem]">Password</label>
                <span className="absolute right-0 top-4 cursor-pointer text-xl text-[#94a3b8] hover:text-[#38bdf8] transition-colors" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</span>
                <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#38bdf8] transition-all duration-400 -translate-x-1/2 peer-focus:w-full peer-[:not(:placeholder-shown)]:w-full" />
                {errors.password && <span className="absolute left-0 top-[100%] mt-1 text-[#ff4d4d] text-[0.75rem] font-medium animate-[fadeIn_0.3s_ease-in-out]">{errors.password}</span>}
              </div>

              <motion.button 
                disabled={errors.name || errors.password || !formdata.email || !formdata.name || !formdata.password}
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(56, 189, 248, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-[18px] rounded-[15px] bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create Account
              </motion.button>
            </form>

            <p className="mt-8 text-center text-[#64748b]">Already a member? <span onClick={() => navigate('/login')} className="text-[#38bdf8] cursor-pointer font-semibold hover:underline">Login here</span></p>
          </div>
        </motion.div>
      </div>
      <div className='mt-10'></div>
      <Footer />
    </div>
  );
};

export default Register;