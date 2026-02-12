
import React, { useState, useEffect, useRef } from 'react';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboardStats, useRecentSales } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axios';
import _ from 'lodash';

// Widgets
import RiskWidget from './widgets/RiskWidget';
import TransferWidget from './widgets/TransferWidget';
import StoreWidget from './widgets/StoreWidget';
import ChartWidget from './widgets/ChartWidget';
import AssistantWidget from './widgets/AssistantWidget';
import TableWidget from './widgets/TableWidget';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// ----------------------------------------------------------------------------
// Custom WidthProvider Implementation
// (Necessary because RGL v1.4+ ESM build often misses WidthProvider export)
// ----------------------------------------------------------------------------
const WidthProvider = (ComposedComponent) => {
    return (props) => {
        const [width, setWidth] = useState(1200);
        const elementRef = useRef(null);

        useEffect(() => {
            const handleResize = () => {
                if (elementRef.current) {
                    setWidth(elementRef.current.offsetWidth);
                }
            };

            // Initial measure
            handleResize();

            // Add resize listener
            window.addEventListener('resize', handleResize);

            // Optional: ResizeObserver for more robust element resizing
            let resizeObserver;
            if (window.ResizeObserver && elementRef.current) {
                resizeObserver = new ResizeObserver(() => handleResize());
                resizeObserver.observe(elementRef.current);
            }

            return () => {
                window.removeEventListener('resize', handleResize);
                if (resizeObserver) resizeObserver.disconnect();
            };
        }, []);

        return (
            <div ref={elementRef} className={props.className} style={props.style}>
                <ComposedComponent {...props} width={width} />
            </div>
        );
    };
};

const ResponsiveGridLayout = WidthProvider(Responsive);
// ----------------------------------------------------------------------------

const DraggableDashboard = () => {
    // Data Fetching: Sadece ana sayfa yüklenme durumunu kontrol etmek için çağırıyoruz.
    // Detaylı veriler widget'ların kendi içinde useQuery ile çekiliyor (Cache avantajı)
    const { isLoading: statsLoading } = useDashboardStats();

    // eslint-disable-next-line no-unused-vars
    const { isLoading: salesLoading } = useRecentSales();

    // Layout State
    // Default Layouts for different breakpoints
    const defaultLayouts = {
        lg: [
            { i: 'risk', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
            { i: 'transfer', x: 4, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
            { i: 'store', x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
            { i: 'chart', x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3 },
            { i: 'assistant', x: 8, y: 2, w: 4, h: 4, minW: 2, minH: 3 },
            { i: 'table', x: 0, y: 6, w: 12, h: 3, minW: 4, minH: 2 }
        ],
        md: [
            { i: 'risk', x: 0, y: 0, w: 2, h: 2 },
            { i: 'transfer', x: 2, y: 0, w: 2, h: 2 },
            { i: 'store', x: 4, y: 0, w: 2, h: 2 },
            { i: 'chart', x: 0, y: 2, w: 6, h: 3 },
            { i: 'assistant', x: 0, y: 5, w: 6, h: 2 },
            { i: 'table', x: 0, y: 7, w: 6, h: 3 }
        ]
    };

    const [layouts, setLayouts] = useState(defaultLayouts);

    const { user } = useAuth(); // Get user from context
    const layoutKey = `dashboardLayouts_${user?.username || 'default'}`;

    // Load layout from localStorage on mount
    useEffect(() => {
        const savedLayouts = localStorage.getItem(layoutKey);
        if (savedLayouts) {
            try {
                setLayouts(JSON.parse(savedLayouts));
            } catch (e) {
                console.error("Failed to parse layouts", e);
            }
        } else {
            // If no saved layout for this user, reset to default
            setLayouts(defaultLayouts);
        }
    }, [user?.username]); // Reload when user changes

    // Save layout on change
    const onLayoutChange = (layout, allLayouts) => {
        setLayouts(allLayouts);
        localStorage.setItem(layoutKey, JSON.stringify(allLayouts));
    };

    const resetLayout = () => {
        setLayouts(defaultLayouts);
        localStorage.removeItem(layoutKey);
        window.location.reload();
    };

    if (statsLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Analiz motoru hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="pb-8">
            {/* Dashboard Controls Header */}
            <div className="flex justify-between items-center mb-8 px-2">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Genel Bakış</h1>
                    <p className="text-sm text-slate-500 font-medium">Hoş geldin, {user?.name || user?.username || 'Misafir'}. Mağaza performansın özetleniyor.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={resetLayout} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors" title="Varsayılan Düzen">
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Draggable Grid Area */}
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 6, sm: 4, xs: 2, xxs: 1 }}
                rowHeight={150}
                margin={[24, 24]}
                draggableHandle=".drag-handle"
                onLayoutChange={onLayoutChange}
                isResizable={true}
                isDraggable={true}
            >
                <div key="risk">
                    <RiskWidget />
                </div>
                <div key="transfer">
                    <TransferWidget pendingCount={12} />
                </div>
                <div key="store">
                    <StoreWidget
                        activeStoreCount={5}
                        storeDetails={[
                            { name: 'Kadıköy', stock: 450, demand: 800, fillRate: 56 },
                            { name: 'Beşiktaş', stock: 1200, demand: 950, fillRate: 126 },
                            { name: 'Şişli', stock: 600, demand: 620, fillRate: 96 },
                        ]} // Mock data or could be fetched
                    />
                </div>
                <div key="chart">
                    <ChartWidget />
                </div>
                <div key="assistant">
                    <AssistantWidget />
                </div>
                <div key="table">
                    <TableWidget />
                </div>

            </ResponsiveGridLayout>
        </div>
    );
};


export default DraggableDashboard;
