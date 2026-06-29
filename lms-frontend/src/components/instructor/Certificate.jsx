import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { FiDownload, FiAward, FiShield, FiLoader } from 'react-icons/fi';

const Certificate = ({ studentName, courseName, instructorName, regNo }) => {
    const certificateRef = useRef();
    const [isDownloading, setIsDownloading] = useState(false);

    //  PDF Download Function
    const downloadPDF = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const input = certificateRef.current;
            
            const dataUrl = await htmlToImage.toPng(input, { 
                quality: 1,
                pixelRatio: 3,
                style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });

            const pdf = new jsPDF('l', 'mm', 'a4'); 
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${studentName}_${courseName}_Certificate.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 sm:gap-8 my-4 sm:my-8 animate-[fadeIn_0.5s_ease-out] w-full">
            
            {/* --- Responsive Scaling Wrapper --- */}
            <div className="w-full flex justify-center overflow-hidden h-[210px] sm:h-[300px] md:h-[390px] lg:h-[390px] xl:h-[416px] 2xl:h-[505px]">
                <div className="origin-top transform scale-[0.35] sm:scale-[0.50] md:scale-[0.65] lg:scale-[0.65] xl:scale-[0.70] 2xl:scale-[0.85] shrink-0 transition-transform duration-300">
                    
                    {/* --- Certificate Design Container --- */}
                    <div 
                        ref={certificateRef} 
                        className="w-[842px] h-[595px] bg-white border-[15px] border-[#a855f7] p-16 text-center text-slate-900 relative shadow-2xl overflow-hidden"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7]/5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a855f7]/5 rounded-full -ml-32 -mb-32"></div>
                
                {/* Header Icon */}
                <div className="flex justify-center mb-4">
                    <FiAward className="text-[#a855f7] text-7xl" />
                </div>
                
                <h1 className="text-6xl font-black text-[#a855f7] mb-2 tracking-tight">CERTIFICATE</h1>
                <h3 className="text-xl tracking-[8px] uppercase mb-12 text-slate-400 font-light">OF COMPLETION</h3>
                
                <p className="text-lg italic mb-2 text-slate-600">This is to certify that</p>
                <h2 className="text-5xl font-bold border-b-2 border-slate-200 inline-block px-12 mb-4 text-slate-800 uppercase tracking-tighter">
                    {studentName || "Student Name"}
                </h2>
                <p className="text-sm text-slate-400 mb-10 font-mono tracking-widest">REG NO: {regNo || "AURA-9900"}</p>
                
                <p className="text-xl mb-12 max-w-[650px] mx-auto leading-relaxed text-slate-700 font-medium">
                    Has successfully cleared the final assessment and demonstrated proficiency in the course <br/>
                    <span className="text-[#a855f7] italic font-serif text-2xl">"{courseName || "Course Title"}"</span> <br/>
                    delivered by <b className="text-slate-900">AuraLearn LMS</b>.
                </p>
                
                {/* Signatures Section */}
                <div className="flex justify-between items-end mt-12 px-10">
                    <div className="text-center">
                        <div className="w-44 border-b-2 border-slate-900 mb-2 font-serif italic text-xl text-slate-800">
                            {instructorName || "The Instructor"}
                        </div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Course Instructor</p>
                    </div>
                    
                    {/*  */}
                    <div className="w-24 h-24 border-4 border-[#a855f7] rounded-full flex items-center justify-center relative shadow-inner">
                        <div className="w-20 h-20 bg-[#a855f7] rounded-full flex flex-col items-center justify-center text-white shadow-xl">
                            <FiShield size={24} />
                            <span className="font-black text-[12px] leading-tight mt-1">AURA</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="w-44 border-b-2 border-slate-900 mb-2 font-serif italic text-xl text-slate-800">
                            F. Zainab
                        </div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Platform Director</p>
                    </div>
                </div>
                </div>
            </div>
            </div>
            
            {/* Action Button */}
            <button 
                onClick={downloadPDF} 
                disabled={isDownloading}
                className={`group relative bg-[#a855f7] hover:bg-[#9333ea] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(168,85,247,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 overflow-hidden w-[90%] sm:w-auto mt-4 sm:mt-0 ${isDownloading ? 'opacity-80 cursor-wait' : ''}`}
            >
                <div className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700"></div>
                {isDownloading ? (
                    <FiLoader size={24} className="animate-spin" />
                ) : (
                    <FiDownload size={24} className="animate-bounce" /> 
                )}
                <span className="text-sm sm:text-lg">
                    {isDownloading ? "Generating High-Res PDF..." : "Download Official Certificate"}
                </span>
            </button>
        </div>
    );
};

export default Certificate;