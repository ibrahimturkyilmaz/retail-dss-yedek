import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, BOTTOM_NAVIGATION_ITEMS } from '../constants/navigation';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex flex-col w-64 h-screen bg-card text-card-foreground border-r border-border transition-all duration-300 ease-in-out">
            {/* Logo Area */}
            <div className="flex items-center justify-center h-20 border-b border-border">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Retail DSS
                </h1>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-2 px-3">
                    {NAVIGATION_ITEMS.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    // Modern hover & active states with glassmorphism feel
                                    `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-primary/10 text-primary font-medium shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`
                                }
                            >
                                <item.icon className="w-6 h-6 mr-3" />
                                <span className="text-sm tracking-wide">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border">
                <ul className="space-y-2">
                    {BOTTOM_NAVIGATION_ITEMS.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'bg-muted text-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span className="text-sm font-medium">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Dark Mode Toggle - Integrated Style */}
                <div className="mx-4 my-2 p-1 bg-muted rounded-lg flex items-center justify-between cursor-pointer border border-border" onClick={toggleTheme}>
                    <div className={`flex-1 py-1.5 flex items-center justify-center rounded-md transition-all ${theme === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                        <SunIcon className="w-4 h-4" />
                    </div>
                    <div className={`flex-1 py-1.5 flex items-center justify-center rounded-md transition-all ${theme === 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                        <MoonIcon className="w-4 h-4" />
                    </div>
                </div>

                <div className="mt-4 flex items-center px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        IT
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">İbrahim T.</p>
                        <p className="text-xs text-muted-foreground">Yönetici</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
