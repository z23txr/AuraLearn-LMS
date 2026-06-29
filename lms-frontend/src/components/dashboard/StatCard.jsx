import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color }) => {
    return (
        <motion.div 
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 15 },
              show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            className="aura-stat-card group relative flex items-center gap-6 p-6 rounded-[20px] bg-slate-800/40 backdrop-blur-md border border-white/5 overflow-hidden transition-all duration-300 hover:bg-slate-800/60 cursor-pointer"
            style={{ borderLeft: `4px solid ${color}` }} 
        >
            {/* Subtle glow overlay */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{ background: `radial-gradient(circle at top right, ${color} 0%, transparent 60%)` }}
            />

            {/* Icon Wrapper */}
            <div className="stat-icon-wrapper flex items-center justify-center w-[55px] h-[55px] rounded-[14px] bg-white/[0.03] shadow-inner text-[1.6rem] transition-transform group-hover:scale-110">
                <span style={{ color: color, filter: `drop-shadow(0 0 8px ${color})` }}>
                    {icon}
                </span>
            </div>

            {/* Content */}
            <div className="stat-content z-[1]">
                <h4 className="stat-value text-[#f8fafc] text-[1.8rem] font-extrabold leading-[1.2] m-0">
                    {value}
                </h4>
                <p className="stat-title text-[#94a3b8] text-[0.85rem] font-medium uppercase tracking-[0.5px] mt-[0.2rem] m-0">
                    {title}
                </p>
            </div>
        </motion.div>
    );
};

export default StatCard;