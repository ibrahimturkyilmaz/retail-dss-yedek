import React, { useState } from 'react';
import { useTransfers } from '../hooks/useTransfers';
import { useStores } from '../hooks/useStores';
import StoreMap from '../components/StoreMap';
import { ArrowRightIcon, TruckIcon, LightBulbIcon, CheckCircleIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import RejectionModal from '../components/RejectionModal';

const XAICard = ({ recommendation, onExecute, onReject, isExecuting }) => {
    const { source, target, product, amount, xai_explanation } = recommendation;
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all mb-3 group"
            onMouseEnter={() => matchMedia('(min-width: 768px)').matches && setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                    {xai_explanation.type === 'PROACTIVE' && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded uppercase tracking-wider">
                            Proaktif
                        </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                        {xai_explanation.score}% Acil
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]" title={product}>{product}</h3>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{amount} Adet</span>
                </div>
            </div>

            {/* Route */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-700 mb-2">
                <div className="text-left">
                    <p className="text-[10px] text-slate-400">Kaynak</p>
                    <p className="text-xs font-medium text-slate-700 truncate max-w-[80px]" title={source.name}>{source.name}</p>
                </div>
                <ArrowRightIcon className="w-3 h-3 text-slate-300" />
                <div className="text-right">
                    <p className="text-[10px] text-slate-400">Hedef</p>
                    <p className="text-xs font-medium text-slate-700 truncate max-w-[80px]" title={target.name}>{target.name}</p>
                </div>
            </div>

            {/* XAI Explanation (Always Visible Summary) */}
            <div className="flex items-start space-x-2 mb-2">
                <LightBulbIcon className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-600 dark:text-slate-400 italic line-clamp-2">
                    {xai_explanation.summary}
                </p>
            </div>

            {/* Detailed Reasons (Expandable) */}
            {expanded && (
                <div className="mb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <ul className="space-y-1">
                        {xai_explanation.reasons.map((reason, idx) => (
                            <li key={idx} className="text-[10px] text-slate-500 flex items-center">
                                <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                                {reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={onReject}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                    Reddet
                </button>
                <button
                    onClick={() => onExecute(recommendation)}
                    disabled={isExecuting}
                    className="flex-[2] flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExecuting ? (
                        <span>...</span>
                    ) : (
                        <>
                            <TruckIcon className="w-3 h-3" />
                            <span>Onayla</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};


import { useLocation, useNavigate } from 'react-router-dom';

const Transfers = () => {
    const { recommendations, isLoading, executeTransfer, isExecuting } = useTransfers();
    const { data: stores } = useStores();
    const [hoveredTransfer, setHoveredTransfer] = useState(null);
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [selectedTransferForRejection, setSelectedTransferForRejection] = useState(null);

    // URL Filter Logic
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const filterType = queryParams.get('filter');

    // Filter Logic: If filter=critical, show only items with score > 70 or type PROACTIVE
    const filteredRecommendations = recommendations?.filter(rec => {
        if (filterType === 'critical') {
            return rec.xai_explanation?.score >= 70 || rec.xai_explanation?.type === 'PROACTIVE';
        }
        return true;
    });

    const activeRecommendations = filteredRecommendations || [];

    const handleRejectClick = (rec) => {
        setSelectedTransferForRejection(rec);
        setRejectionModalOpen(true);
    };



    // Merge recommendation logic to find lat/lon for map animation
    // We need to match store IDs from recommendations with full store objects (which have lat/lon)
    const getActiveTransferData = () => {
        if (!hoveredTransfer || !stores) return null;

        const source = stores.find(s => s.id === hoveredTransfer.source.id);
        const target = stores.find(s => s.id === hoveredTransfer.target.id);

        if (source && target) {
            return { source, target };
        }
        return null;
    };

    if (isLoading) return <div className="p-10 text-center">Yükleniyor...</div>;

    return (
        <div className="h-[calc(100vh-200px)] flex gap-4">
            {/* Left: Recommendation List - Fixed narrower width */}
            <div className="w-80 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">Transfer Önerileri</h2>
                        <div className="flex items-center space-x-2">
                            <ArrowPathIcon className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[10px] text-slate-500">Stok dengeleme sistemi.</span>
                        </div>
                        {filterType === 'critical' && (
                            <div className="mt-1 flex items-center space-x-2">
                                <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                                    KRİTİK
                                </span>
                                <button
                                    onClick={() => navigate('/transfers')}
                                    className="text-[9px] text-blue-600 hover:underline cursor-pointer"
                                >
                                    Temizle
                                </button>
                            </div>
                        )}
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {activeRecommendations.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {activeRecommendations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                            <CheckCircleIcon className="w-10 h-10 mb-2 text-green-500" />
                            <p className="text-sm">
                                {filterType === 'critical'
                                    ? "Risk yok."
                                    : "Stoklar dengeli!"}
                            </p>
                        </div>
                    ) : (
                        activeRecommendations.map((rec) => (
                            <div
                                key={rec.transfer_id}
                                onMouseEnter={() => setHoveredTransfer(rec)}
                                onMouseLeave={() => setHoveredTransfer(null)}
                            >
                                <XAICard
                                    recommendation={rec}
                                    onExecute={(r) => {
                                        executeTransfer(r);
                                    }}
                                    onReject={() => handleRejectClick(rec)}
                                    isExecuting={isExecuting}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Map - Fluid width */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-1 relative min-w-0">
                {stores && (
                    <StoreMap
                        stores={stores}
                        activeTransfer={getActiveTransferData()}
                    />
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-3 rounded-lg shadow border border-slate-200 dark:border-slate-700 z-[400] text-xs text-slate-700 dark:text-slate-200">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-purple-500 opacity-20 border border-purple-500"></span>
                        <span>Merkez Depo Alanı</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-0.5 bg-blue-500 border-t border-dashed border-blue-500"></span>
                        <span>Transfer Hattı</span>
                    </div>
                </div>
            </div>
            <RejectionModal
                isOpen={rejectionModalOpen}
                onClose={() => setRejectionModalOpen(false)}
                transfer={selectedTransferForRejection}
                onRejectSuccess={() => {
                    // Refresh logic here, e.g. reload window or refetch
                    window.location.reload();
                }}
            />
        </div>
    );
};

export default Transfers;
