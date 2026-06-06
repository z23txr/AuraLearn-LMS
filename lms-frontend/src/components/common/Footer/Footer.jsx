import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiGithub, FiLinkedin, FiTwitter, FiLoader, FiSend } from 'react-icons/fi';

const Footer = () => {
    const [subscriberEmail, setSubscriberEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!subscriberEmail) {
            return toast.warn("AuraLearn needs an email to keep you updated!");
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:5000/api/newsletter/subscribe', {
                email: subscriberEmail
            });

            if (response.status === 201) {
                toast.success("Welcome aboard! Check your inbox for the aura.");
                setSubscriberEmail(""); 
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Something went wrong!";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="bg-[#0f172a]/60 backdrop-blur-md py-12 px-8 text-[#94a3b8] border border-white/10 rounded-[30px] font-sans mt-16 shadow-2xl">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-8">
                
                {/* Brand Section */}
                <div className="flex flex-col space-y-4">
                    <div className="text-3xl font-extrabold text-white">
                        Aura<span className="text-[#38bdf8]">Learn</span>
                    </div>
                    <p className="text-sm leading-relaxed max-w-xs">
                        Empowering the next generation of software engineers with the world's most advanced AI-driven education ecosystem.
                    </p>
                    <div className="flex gap-4 text-2xl pt-2">
                        <FiGithub className="cursor-pointer transition-all duration-300 hover:text-[#1da1f2] hover:scale-110" />
                        <FiLinkedin className="cursor-pointer transition-all duration-300 hover:text-[#1da1f2] hover:scale-110" />
                        <FiTwitter className="cursor-pointer transition-all duration-300 hover:text-[#1da1f2] hover:scale-110" />
                    </div>
                </div>

                {/* Platform Links */}
                <div>
                    <h4 className="text-white font-bold mb-6">Platform</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">AI Tools</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Course Library</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Certifications</a></li>
                    </ul>
                </div>

                {/* Company Links */}
                <div>
                    <h4 className="text-white font-bold mb-6">Company</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">About AuraLearn</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Terms & Conditions</a></li>
                    </ul>
                </div>

                {/* Resources Links */}
                <div>
                    <h4 className="text-white font-bold mb-6">Resources</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Documentation</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Help Center</a></li>
                        <li><a href="#" className="hover:text-[#38bdf8] transition-all hover:translate-x-1 block">Community Forum</a></li>
                    </ul>
                </div>

                {/* Subscription Section */}
                <div className="flex flex-col">
                    <h4 className="text-white font-bold mb-4">Stay Connected</h4>
                    <p className="text-sm mb-6">Get notified about new AI features.</p>
                    <form className="flex bg-white/5 p-2 rounded-lg border border-white/10" onSubmit={handleSubscribe}>
                        <input 
                            type="email" 
                            placeholder="Email Address"
                            required
                            value={subscriberEmail}
                            onChange={(e) => setSubscriberEmail(e.target.value)}
                            disabled={isSubmitting} 
                            className="bg-transparent border-none text-white px-3 py-2 outline-none w-full text-sm"
                        />
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-[#38bdf8] text-white p-2 rounded-md transition-all hover:bg-[#0ea5e9] flex items-center justify-center min-w-[40px]"
                        >
                            {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSend />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Copyright Bottom */}
            <div className="mt-16 pt-8 border-t border-white/5 text-center text-sm">
                <p>&copy; 2026 AuraLearn | Designed with passion by Zainab Sajid</p>
            </div>
        </footer>
    );
};

export default Footer;