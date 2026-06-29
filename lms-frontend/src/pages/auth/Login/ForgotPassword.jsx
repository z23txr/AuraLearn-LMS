import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Footer from '../../../components/common/Footer/Footer';
import PageTransition from '../../../components/common/PageTransition/PageTransition';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Sending recovery email...");
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            toast.update(toastId, {
                render: "Reset link sent! Check your inbox 📬",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
            setSent(true);
        } catch (err) {
            toast.update(toastId, {
                render: err.response?.data?.message || "Error sending email. Try again.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div
                className="relative bg-[#05070a] font-['Poppins'] forgot-page-wrap"
                style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
                <style>{`
                  .forgot-page-wrap::-webkit-scrollbar { display: none; }
                  .forgot-page-wrap { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                

                {/* Background blobs */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute w-[450px] h-[450px] bg-[#7c3aed] blur-[90px] opacity-30 rounded-full -top-[5%] -left-[5%]" />
                    <div className="absolute w-[350px] h-[350px] bg-[#0ea5e9] blur-[90px] opacity-20 rounded-full bottom-[5%] right-[5%]" />
                </div>

                <div className="flex-1 flex justify-center items-center relative z-10 px-4 pt-16">
                    <AnimatePresence mode="wait">
                        {!sent ? (
                            /* ── FORM STATE ── */
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.93, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.93, y: -15 }}
                                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                                className="w-full max-w-[500px] bg-[#0f172a]/80 backdrop-blur-[20px] border border-white/10 rounded-[25px] sm:rounded-[40px] p-6 sm:p-10 lg:p-[60px_70px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                            >
                                {/* Back link */}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex items-center gap-2 text-[#64748b] hover:text-[#38bdf8] text-sm mb-8 transition-colors"
                                >
                                    <FiArrowLeft /> Back to Login
                                </button>

                                {/* Icon */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#2563eb] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                                    <FiMail className="text-white text-2xl" />
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-white text-[2rem] font-bold mb-2">Forgot Password?</h2>
                                    <p className="text-[#64748b] text-sm leading-relaxed">
                                        No worries! Enter your registered email and we'll send you a secure reset link.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            placeholder=" "
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="peer w-full py-3 bg-transparent border-b-2 border-[#334155] text-white text-base outline-none focus:border-[#38bdf8] transition-all"
                                        />
                                        <label className="absolute left-0 top-3 text-[#64748b] text-base pointer-events-none transition-all duration-300 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-[#38bdf8] peer-valid:-top-5 peer-valid:text-xs peer-valid:text-[#64748b]">
                                            Email Address
                                        </label>
                                        <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#38bdf8] transition-all duration-300 -translate-x-1/2 peer-focus:w-full" />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading}
                                        className="w-full py-4 rounded-[14px] bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white font-bold text-base shadow-[0_0_25px_rgba(124,58,237,0.4)] disabled:opacity-50 transition-all"
                                        type="submit"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Sending...
                                            </span>
                                        ) : "Send Reset Link"}
                                    </motion.button>
                                </form>
                            </motion.div>
                        ) : (
                            /* ── SUCCESS STATE ── */
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.93, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                                className="w-full max-w-[500px] bg-[#0f172a]/80 backdrop-blur-[20px] border border-white/10 rounded-[25px] sm:rounded-[40px] p-6 sm:p-10 lg:p-[60px_70px] shadow-[0_40px_80px_rgba(0,0,0,0.6)] text-center"
                            >
                                {/* Animated checkmark */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.1 }}
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                                >
                                    <FiCheckCircle className="text-white text-4xl" />
                                </motion.div>

                                <h2 className="text-white text-[2rem] font-bold mb-3">Email Sent!</h2>
                                <p className="text-[#64748b] text-sm leading-relaxed mb-2">
                                    We've sent a password reset link to
                                </p>
                                <p className="text-[#38bdf8] font-semibold mb-6 break-all">{email}</p>
                                <p className="text-[#475569] text-xs mb-8">
                                    The link will expire in <span className="text-white font-medium">10 minutes</span>. Check your spam folder if you don't see it.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => { setSent(false); setEmail(''); }}
                                        className="w-full py-3 rounded-[12px] border border-white/10 text-[#94a3b8] hover:text-white hover:border-white/20 text-sm transition-all"
                                    >
                                        Try a different email
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/login')}
                                        className="w-full py-3 rounded-[12px] bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-semibold text-sm shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all"
                                    >
                                        Back to Login
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative z-10 px-6 pb-4">
                    <Footer />
                </div>
            </div>
        </PageTransition>
    );
};

export default ForgotPassword;