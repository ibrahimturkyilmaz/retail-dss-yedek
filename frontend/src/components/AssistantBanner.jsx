import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axios';

import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    SparklesIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const AssistantBanner = () => {
    const navigate = useNavigate();
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    const iconMap = {
        'ExclamationTriangleIcon': ExclamationTriangleIcon,
        'InformationCircleIcon': InformationCircleIcon,
        'CheckCircleIcon': CheckCircleIcon
    };

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const { data } = await axiosClient.get('/api/dashboard/insights');
                setInsights(data);
            } catch (error) {
                console.error("Insights fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading) return (
        <div className="h-24 bg-slate-50 rounded-xl animate-pulse border border-slate-100 mb-6 flex items-center justify-center text-slate-400 text-xs">
            Asistan analizleri yükleniyor...
        </div>
    );

    return (
        <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-800">
                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-sm tracking-tight uppercase">Proaktif Karar Asistanı</h3>
                </div>
                <div className="text-[10px] font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full animate-pulse">
                    CANLI ANALİZ AKTİF
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {insights.map((insight) => {
                    const Icon = iconMap[insight.icon] || (insight.type === 'critical' ? ExclamationTriangleIcon : CheckCircleIcon);
                    return (
                        <div
                            key={insight.id}
                            onClick={() => {
                                if (insight.type === 'critical') {
                                    navigate('/transfers?filter=critical');
                                }
                            }}
                            className={`flex items-start gap-3 p-4 rounded-xl border ${insight.bg} ${insight.border} transition-all hover:scale-[1.02] group ${insight.type === 'critical' ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}`}
                        >
                            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${insight.color}`} />
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${insight.color} leading-snug`}>
                                    {insight.message}
                                </p>
                            </div>
                            {insight.type === 'critical' && (
                                <ArrowRightIcon className={`w-4 h-4 ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity ${insight.color}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AssistantBanner;
