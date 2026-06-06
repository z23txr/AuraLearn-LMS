import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Footer from '../../../components/common/Footer/Footer';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Sending recovery email...");
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            toast.update(toastId, { render: "Reset link sent! Check your inbox ", type: "success", isLoading: false, autoClose: 3000 });
        } catch (err) {
            toast.update(toastId, { render: err.response?.data?.message || "Error sending email", type: "error", isLoading: false, autoClose: 3000 });
        } finally { setLoading(false); }
    };

    return (
        <div className="relative min-h-screen flex flex-col bg-[#05070a] font-['Poppins'] overflow-hidden">
            <ToastContainer position="top-center" theme="colored" />
            <div className="absolute inset-0 pointer-events-none"><div className="absolute w-[450px] h-[450px] bg-[#7c3aed] blur-[90px] opacity-30 rounded-full top-0 left-0 animate-[float_15s_infinite_alternate_ease-in-out]" /></div>
            <div className="flex-1 flex justify-center items-center p-4 relative z-10">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[500px] bg-[#0f172a]/75 backdrop-blur-[20px] border border-white/10 rounded-[40px] p-10 lg:p-[60px_80px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-white text-[2.4rem] font-bold mb-2">Recover Password</h2>
                        <p className="text-[#64748b]">Enter your email to receive a reset link</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="relative">
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="peer w-full py-2 bg-transparent border-b-2 border-[#334155] text-white text-lg outline-none focus:border-[#38bdf8] transition-all" />
                            <label className="absolute left-0 top-2 text-[#64748b] text-lg pointer-events-none transition-all peer-focus:-top-5 peer-focus:text-[0.85rem] peer-focus:text-[#38bdf8] peer-valid:-top-5 peer-valid:text-[0.85rem]">Email Address</label>
                        </div>
                        <button disabled={loading} className="w-full py-5 rounded-[15px] bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-bold text-lg shadow-[0_0_20px_rgba(56,189,248,0.4)] disabled:opacity-50" type="submit">
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};
export default ForgotPassword;