import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiEye, FiEyeOff, FiLock, FiArrowLeft } from "react-icons/fi";
import { toast } from 'react-toastify';
import Footer from '../../../components/common/Footer/Footer';
import PageTransition from '../../../components/common/PageTransition/PageTransition';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const getStrength = (val) => {
    if (!val) return { label: '', color: '', width: '0%' };
    if (val.length < 6) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (val.length < 8) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (!strongPasswordRegex.test(val)) return { label: 'Good', color: '#3b82f6', width: '75%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
};

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const strength = getStrength(password);

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (value.length === 0) setError('');
        else if (value.length < 8) setError('Minimum 8 characters required');
        else if (!strongPasswordRegex.test(value)) setError('Must include Upper, Lower, Number & Special Character');
        else setError('');
        // Re-validate confirm
        if (confirmPassword && value !== confirmPassword) setConfirmError("Passwords do not match");
        else setConfirmError('');
    };

    const handleConfirmChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (value && value !== password) setConfirmError("Passwords do not match");
        else setConfirmError('');
    };

    const isValid = !error && !confirmError && password.length >= 8 && confirmPassword === password;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;
        const currentToastId = toast.loading("Updating your password...");
        setIsSubmitting(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { password });
            toast.update(currentToastId, {
                render: "Password reset successfully! Redirecting to login...",
                type: "success",
                isLoading: false,
                autoClose: 2500,
            });
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            toast.update(currentToastId, {
                render: err.response?.data?.message || "Link is invalid or has expired!",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageTransition>
            <div
                className="relative bg-[#05070a] font-['Poppins'] reset-page-wrap"
                style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
                <style>{`
                  .reset-page-wrap::-webkit-scrollbar { display: none; }
                  .reset-page-wrap { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                

                {/* Background blobs */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute w-[350px] h-[350px] bg-[#06b6d4] blur-[90px] opacity-25 rounded-full top-[10%] right-[5%]" />
                    <div className="absolute w-[300px] h-[300px] bg-[#7c3aed] blur-[90px] opacity-20 rounded-full bottom-[10%] left-[5%]" />
                </div>

                <div className="flex-1 flex justify-center items-center relative z-10 px-4 pt-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.93, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
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
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(14,165,233,0.4)]">
                            <FiLock className="text-white text-2xl" />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-white text-[2rem] font-bold mb-2">Set New Password</h2>
                            <p className="text-[#64748b] text-sm">
                                Choose a strong password with at least 8 characters.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* New Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder=" "
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`peer w-full py-3 bg-transparent border-b-2 outline-none transition-all text-white text-base ${
                                        error ? 'border-[#ef4444]' : 'border-[#334155] focus:border-[#38bdf8]'
                                    }`}
                                />
                                <label className={`absolute left-0 top-3 pointer-events-none transition-all duration-300 peer-focus:-top-5 peer-focus:text-xs peer-valid:-top-5 peer-valid:text-xs ${
                                    error ? 'text-[#ef4444]' : 'text-[#64748b] peer-focus:text-[#38bdf8]'
                                }`}>
                                    New Password
                                </label>
                                <span
                                    className="absolute right-2 top-3 cursor-pointer text-[#38bdf8] text-lg"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </span>
                                {!error && <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#38bdf8] transition-all duration-300 -translate-x-1/2 peer-focus:w-full" />}
                                {error && <span className="absolute -bottom-5 left-0 text-[#ef4444] text-xs">{error}</span>}
                            </div>

                            {/* Strength Bar */}
                            {password.length > 0 && (
                                <div className="-mt-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[#475569] text-xs">Password strength</span>
                                        <span className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                                    </div>
                                    <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: strength.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: strength.width }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Confirm Password */}
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    placeholder=" "
                                    value={confirmPassword}
                                    onChange={handleConfirmChange}
                                    className={`peer w-full py-3 bg-transparent border-b-2 outline-none transition-all text-white text-base ${
                                        confirmError ? 'border-[#ef4444]' : 'border-[#334155] focus:border-[#38bdf8]'
                                    }`}
                                />
                                <label className={`absolute left-0 top-3 pointer-events-none transition-all duration-300 peer-focus:-top-5 peer-focus:text-xs peer-valid:-top-5 peer-valid:text-xs ${
                                    confirmError ? 'text-[#ef4444]' : 'text-[#64748b] peer-focus:text-[#38bdf8]'
                                }`}>
                                    Confirm Password
                                </label>
                                <span
                                    className="absolute right-2 top-3 cursor-pointer text-[#38bdf8] text-lg"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                                </span>
                                {!confirmError && <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#38bdf8] transition-all duration-300 -translate-x-1/2 peer-focus:w-full" />}
                                {confirmError && <span className="absolute -bottom-5 left-0 text-[#ef4444] text-xs">{confirmError}</span>}
                            </div>

                            <motion.button
                                whileHover={{ scale: isValid ? 1.02 : 1 }}
                                whileTap={{ scale: isValid ? 0.98 : 1 }}
                                disabled={isSubmitting || !isValid}
                                className="w-full py-4 rounded-[14px] bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-white font-bold text-base shadow-[0_0_25px_rgba(56,189,248,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                type="submit"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Updating...
                                    </span>
                                ) : "Update Password"}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>

                <div className="relative z-10 px-6 pb-4">
                    <Footer />
                </div>
            </div>
        </PageTransition>
    );
};

export default ResetPassword;