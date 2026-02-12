import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [isCalendarDrawerOpen, setIsCalendarDrawerOpen] = useState(false);

    const toggleCalendarDrawer = () => setIsCalendarDrawerOpen(prev => !prev);
    const openCalendarDrawer = () => setIsCalendarDrawerOpen(true);
    const closeCalendarDrawer = () => setIsCalendarDrawerOpen(false);

    return (
        <UIContext.Provider value={{
            isCalendarDrawerOpen,
            toggleCalendarDrawer,
            openCalendarDrawer,
            closeCalendarDrawer
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);
