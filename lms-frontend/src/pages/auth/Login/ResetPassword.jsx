import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import Footer from '../../../components/common/Footer/Footer';

const ResetPassword = () => {
    const { token } = useParams(); 
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
        if (value.length === 0) setError('');
        else if (value.length < 8) setError('Minimum 8 characters required');
        else if (!strongPasswordRegex.test(value)) setError('Must include Upper, Lower, Number & Special Character');
        else setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error || password.length < 8) return;
        const currentToastId = toast.loading("Updating your password...");
        setIsSubmitting(true);
        try {
            await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            toast.update(currentToastId, { render: "Password Reset Successfully!", type: "success", isLoading: false, autoClose: 2000 });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.update(currentToastId, { render: err.response?.data?.message || "Invalid Link!", type: "error", isLoading: false, autoClose: 3000 });
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="relative min-h-screen flex flex-col bg-[#05070a] font-['Poppins'] overflow-hidden">
            <ToastContainer position="top-center" theme="colored" />
            <div className="absolute inset-0 pointer-events-none z-0"><div className="absolute w-[300px] h-[300px] bg-[#06b6d4] blur-[90px] opacity-30 rounded-full top-[20%] right-[10%] animate-[float_15s_infinite_alternate_ease-in-out]" /></div>
            <div className="flex-1 flex justify-center items-center p-4 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[500px] bg-[#0f172a]/75 backdrop-blur-[20px] border border-white/10 rounded-[40px] p-10 lg:p-[60px_80px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-white text-[2.4rem] font-bold mb-2">Set New Password</h2>
                        <p className="text-[#64748b]">Must be at least 8 characters with symbols</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} required value={password} onChange={handlePasswordChange} className={`peer w-full py-2 bg-transparent border-b-2 outline-none transition-all ${error ? 'border-[#ff0055]' : 'border-[#334155] focus:border-[#38bdf8]'} text-white text-lg`} />
                            <label className={`absolute left-0 top-2 pointer-events-none transition-all peer-focus:-top-5 peer-focus:text-[0.85rem] peer-valid:-top-5 peer-valid:text-[0.85rem] ${error ? 'text-[#ff0055]' : 'text-[#64748b] peer-focus:text-[#38bdf8]'}`}>New Password</label>
                            <span className="absolute right-2 top-2 cursor-pointer text-[#38bdf8] text-xl" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</span>
                            {error && <span className="absolute -bottom-6 left-0 text-[#ff0055] text-xs font-medium">{error}</span>}
                        </div>
                        <button disabled={isSubmitting || !!error || password.length < 8} className="w-full py-5 rounded-[15px] bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-bold text-lg shadow-[0_0_20px_rgba(56,189,248,0.4)] disabled:opacity-50" type="submit">
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};
export default ResetPassword;