import React from 'react';
import { BellIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-20 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 transition-colors">
            {/* Page Title */}
            <div>
                <h2 className="text-2xl font-bold text-card-foreground tracking-tight">{title}</h2>
                <p className="text-xs text-muted-foreground mt-1">Sistem Durumu: <span className="text-green-500 font-medium">Aktif</span></p>
            </div>
            {/* Actions Area */}
            <div className="flex items-center space-x-6">
                {/* Search Bar */}
                <div className="relative hidden md:block group">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Ara..."
                        className="pl-10 pr-4 py-2 bg-muted border-none rounded-full text-sm text-foreground focus:ring-2 focus:ring-blue-500 focus:bg-card transition-all w-64"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                {/* User Profile & Logout */}
                <div className="flex items-center space-x-3 border-l pl-6 border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-700">{user?.name || user?.username}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Çıkış Yap"
                    >
                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
