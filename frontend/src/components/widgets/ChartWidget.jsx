import React from 'react';
import OverviewChart from '../OverviewChart';

import Tilt from 'react-parallax-tilt';

const ChartWidget = ({ style, className, ...props }) => {
    return (
        <Tilt
            glareEnable={true}
            glareMaxOpacity={0.1}
            glareColor="#ffffff"
            glarePosition="all"
            scale={1.01}
            transitionSpeed={2500}
            tiltMaxAngleX={3}
            tiltMaxAngleY={3}
            style={style}
            className={`h-full ${className}`}
            {...props}
        >
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 h-full flex flex-col relative group border border-white/60 shadow-sm">
                {/* Drag Handle */}
                <div className="absolute top-4 right-4 z-20 cursor-move text-slate-300 hover:text-slate-500 drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>

                {/* Chart Content - Assuming OverviewChart is responsive */}
                <div className="flex-1 min-h-0">
                    <OverviewChart />
                </div>
            </div>
        </Tilt>
    );
};

export default ChartWidget;
