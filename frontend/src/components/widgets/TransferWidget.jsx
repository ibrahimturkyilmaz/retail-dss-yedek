import React from 'react';
import CountUp from 'react-countup';
import { TruckIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import Tilt from 'react-parallax-tilt';

const TransferWidget = ({ pendingCount = 0, style, className, ...props }) => {
    const navigate = useNavigate();

    return (
        <Tilt
            glareEnable={true}
            glareMaxOpacity={0.3}
            glareColor="#ffffff"
            glarePosition="all"
            scale={1.02}
            transitionSpeed={2000}
            tiltMaxAngleX={8}
            tiltMaxAngleY={8}
            style={style}
            className={`h-full ${className}`}
            {...props}
        >
            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-6 relative group hover:shadow-xl hover:shadow-blue-100/50 transition-all flex flex-col justify-between h-full">
                {/* Drag Handle */}
                <div className="absolute top-4 right-4 z-20 cursor-move text-slate-300 hover:text-slate-500 drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>

                {/* Notification Badge */}
                {pendingCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center text-sm font-bold border-4 border-white shadow-lg z-30 animate-pulse">
                        {pendingCount}
                    </div>
                )}

                <div className="flex justify-between items-start mb-2 pointer-events-none">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                        <TruckIcon className="w-6 h-6 text-blue-600" />
                    </div>
                </div>

                {/* Action Button - positioned absolutely to not interfere with drag mostly or just lower z-index if needed */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate('/transfers');
                    }}
                    className="absolute top-6 right-12 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors z-30"
                >
                    YÖNET
                </button>


                <div className="mt-auto pointer-events-none">
                    <h3 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight mb-2">
                        <CountUp end={pendingCount} duration={2} />
                    </h3>
                    <p className="text-sm lg:text-lg font-bold text-slate-500">Bekleyen Transfer</p>
                </div>

                {/* Decorative background element */}
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                    <TruckIcon className="w-32 h-32 -mr-6 -mb-6" />
                </div>
            </div>
        </Tilt>
    );
};

export default TransferWidget;
