import React from 'react';
import ExploreCoursesList from './ExploreCoursesList'; 

const FullExplorePage = () => {
    return (
        <div className="py-5 px-2.5 bg-transparent animate-in fade-in duration-700 font-['Poppins']">
            <header className="mb-11 relative">
                <div className="flex flex-col">
                    <h2 className="text-4xl font-extrabold bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent leading-tight tracking-tight">
                        Explore Our Aura Library
                    </h2>
                    <p className="text-[#94a3b8] mt-2.5 text-lg font-medium opacity-90">
                        Unlock your potential with our AI-driven specialized courses.
                    </p>
                    <div className="h-1 w-16 bg-[#38bdf8] mt-4 rounded-sm shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
                </div>
            </header>
            
            <div className="mt-8">
                {/*  */}
                <ExploreCoursesList showPagination={true} /> 
            </div>
        </div>
    );
};

export default FullExplorePage;