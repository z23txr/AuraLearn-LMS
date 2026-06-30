import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiGithub, FiLinkedin, FiTwitter, FiLoader, FiSend } from 'react-icons/fi';

const Footer = () => {
    const [subscriberEmail, setSubscriberEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!subscriberEmail) return toast.warn("AuraLearn needs an email to keep you updated!");
        setIsSubmitting(true);
        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + '/api/newsletter/subscribe', { email: subscriberEmail });
            if (response.status === 201) {
                toast.success(response.data.message || "Welcome aboard!");
                setSubscriberEmail("");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="bg-[#0f172a]/60 backdrop-blur-md py-10 px-4 sm:px-8 text-[#94a3b8] border border-white/10 rounded-[20px] sm:rounded-[30px] font-sans mt-10 sm:mt-16 shadow-2xl">
            <div className="max-w-[1200px] mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-8 sm:gap-10">

                {/* Brand — full width on mobile */}
                <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col space-y-4">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">
                        Aura<span className="text-[#38bdf8]">Learn</span>
                    </div>
                    <p className="text-sm leading-relaxed max-w-xs">
                        Empowering the next generation of software engineers with the world's most advanced AI-driven education ecosystem.
                    </p>
                    <div className="flex gap-4 text-xl sm:text-2xl pt-1">
                        <FiGithub className="cursor-pointer transition-all duration-300 hover:text-[#1da1f2] hover:scale-110" />
                        <FiLinkedin className="cursor-pointer transition-all duration-300 hover:text-[#1da1f2] hover:scale-110" />
                        <FiTwitter className="cursor-pointer transition-all duration-300 hover:text-[#1da1f2] hover:scale-110" />
                    </div>
                </div>

                {/* Platform Links */}
                <div>
                    <h4 className="text-white font-bold mb-4 text-sm sm:text-base">Platform</h4>
                    <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">AI Tools</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Course Library</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Certifications</a></li>
                    </ul>
                </div>

                {/* Company Links */}
                <div>
                    <h4 className="text-white font-bold mb-4 text-sm sm:text-base">Company</h4>
                    <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">About AuraLearn</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Terms & Conditions</a></li>
                    </ul>
                </div>

                {/* Resources Links */}
                <div>
                    <h4 className="text-white font-bold mb-4 text-sm sm:text-base">Resources</h4>
                    <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Documentation</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Help Center</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Community Forum</a></li>
                    </ul>
                </div>

                {/* Newsletter — full width on mobile */}
                <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col">
                    <h4 className="text-white font-bold mb-3 text-sm sm:text-base">Stay Connected</h4>
                    <p className="text-xs sm:text-sm mb-4">Get notified about new AI features.</p>
                    <form className="flex bg-white/5 p-1.5 sm:p-2 rounded-lg border border-white/10" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={subscriberEmail}
                            onChange={(e) => setSubscriberEmail(e.target.value)}
                            disabled={isSubmitting}
                            className="bg-transparent border-none text-white px-3 py-1.5 outline-none w-full text-xs sm:text-sm"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#38bdf8] text-white p-2 rounded-md transition-all hover:bg-[#0ea5e9] flex items-center justify-center min-w-[36px]"
                        >
                            {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSend />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Copyright */}
            <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-white/5 text-center text-xs sm:text-sm">
                <p>&copy; 2026 AuraLearn | Designed with passion by Zainab Sajid</p>
            </div>
        </footer>
    );
};

export default Footer;