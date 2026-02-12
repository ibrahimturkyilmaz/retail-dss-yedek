import React from 'react';
import CountUp from 'react-countup';
import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import Tilt from 'react-parallax-tilt';

// RiskWidget.jsx
import { useDashboardStats } from '../../hooks/useDashboard';

const RiskWidget = ({ style, className, ...props }) => {
    const navigate = useNavigate();
    const { data: stats } = useDashboardStats();
    const riskyCount = stats?.critical_stores || 0;

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
            <div
                className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-3xl p-6 cursor-pointer hover:shadow-xl hover:shadow-red-100/50 transition-all group relative overflow-hidden flex flex-col justify-between h-full"
                onClick={() => navigate('/transfers?filter=critical')}
            >
                {/* Drag Handle */}
                <div className="absolute top-4 right-4 z-20 cursor-move text-red-300 hover:text-red-500 drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>

                {/* Notification Badge */}
                {riskyCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-600 rounded-full text-white flex items-center justify-center text-sm font-bold border-4 border-white shadow-lg z-30 animate-bounce">
                        {riskyCount}
                    </div>
                )}

                <div className="absolute -right-12 -top-12 w-40 h-40 bg-red-100 rounded-full blur-3xl group-hover:bg-red-200 transition-colors pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div className="p-3 bg-white/80 rounded-2xl shadow-sm">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <h3 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight mb-2">
                        <CountUp end={riskyCount} duration={2} />
                    </h3>
                    <p className="text-sm lg:text-lg font-bold text-red-600">Riskli Mağaza</p>
                    <div className="flex items-center gap-2 mt-2 text-xs lg:text-sm text-red-500 font-medium group-hover:translate-x-1 transition-transform">
                        <span>Aksiyon Al</span>
                        <ArrowRightIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                    </div>
                </div>
            </div>
        </Tilt>
    );
};

export default RiskWidget;
