import React from 'react';

const StatCard = ({ title, value, icon, trend, color }) => {
    return (
        <div 
            className="flex justify-between items-center p-5 bg-[#1e293b60] backdrop-blur-[10px] border border-[#334155] rounded-2xl transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:border-[#475569]"
            style={{ borderLeft: `4px solid ${color}` }}
        >
            <div className="flex flex-col">
                <p className="text-[#94a3b8] text-[0.85rem] mb-[5px] font-medium">
                    {title}
                </p>
                <h3 className="text-white text-[1.5rem] font-bold">
                    {value}
                </h3>
                {trend && (
                    <span className="text-[0.75rem] text-[#22c55e] mt-1 font-semibold">
                        {trend} this month
                    </span>
                )}
            </div>

            {/* Icon Wrapper with dynamic background and color */}
            <div 
                className="w-[45px] h-[45px] rounded-xl flex items-center justify-center text-[1.2rem]"
                style={{ 
                    backgroundColor: `${color}20`, 
                    color: color 
                }}
            >
                {icon}
            </div>
        </div>
    );
};

export default StatCard;