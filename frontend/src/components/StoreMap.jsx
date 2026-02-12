import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet Default Icon Issue in Vite/Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Component to recenter map when selected store changes
const MapRecenter = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lon) {
            map.flyTo([lat, lon], 13);
        }
    }, [lat, lon, map]);
    return null;
};

const StoreMap = ({ stores, selectedStore, activeTransfer, onSelect, onViewDetails }) => {
    // İstanbul merkezli varsayılan konum
    const defaultCenter = [41.0082, 28.9784];

    return (
        <MapContainer center={defaultCenter} zoom={10} className="w-full h-full rounded-2xl z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {selectedStore && <MapRecenter lat={selectedStore.lat} lon={selectedStore.lon} />}

            {/* Transfer Hattı Animasyonu (Varsa) */}
            {activeTransfer && (
                <Polyline
                    positions={[
                        [activeTransfer.source.lat, activeTransfer.source.lon],
                        [activeTransfer.target.lat, activeTransfer.target.lon]
                    ]}
                    color="#3b82f6"
                    weight={4}
                    dashArray="10, 10"
                    className="animate-dash" // Custom CSS animation needed
                />
            )}

            {stores.map((store) => (
                <React.Fragment key={store.id}>
                    <Marker
                        position={[store.lat, store.lon]}
                        eventHandlers={{
                            click: () => onSelect && onSelect(store),
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2 w-52">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">{store.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{store.store_type}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${store.risk_status === 'High Risk' ? 'bg-red-100 text-red-600' :
                                        store.risk_status === 'Moderate' ? 'bg-orange-100 text-orange-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                        {store.risk_status || 'Normal'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                        <span className="block text-[10px] text-slate-400">Toplam Stok</span>
                                        <span className="block text-sm font-bold text-slate-700">{store.stock}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                        <span className="block text-[10px] text-slate-400">Güvenlik Stoğu</span>
                                        <span className="block text-sm font-bold text-slate-700">{store.safety_stock}</span>
                                    </div>
                                </div>

                                {onViewDetails && (
                                    <>
                                        {/* Detaylı Analiz Button Removed */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(store);
                                            }}
                                            className="w-full py-1.5 mt-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                                            </svg>
                                            Envanter Tablosu
                                        </button>
                                    </>
                                )}
                            </div>
                        </Popup>
                    </Marker>

                    {/* Circle for Hubs or Danger zones */}
                    {(store.store_type === 'HUB' || store.store_type === 'CENTER') && (
                        <Circle
                            center={[store.lat, store.lon]}
                            radius={store.store_type === 'CENTER' ? 8000 : 4000}
                            pathOptions={{
                                color: store.store_type === 'CENTER' ? 'purple' : 'blue',
                                fillColor: store.store_type === 'CENTER' ? 'purple' : 'blue',
                                fillOpacity: 0.1
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </MapContainer>
    );
};

export default StoreMap;
