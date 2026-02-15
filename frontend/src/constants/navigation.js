import {
    HomeIcon,
    ShoppingBagIcon,
    TruckIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    BoltIcon,
    CalendarDaysIcon,
    CommandLineIcon,
} from '@heroicons/react/24/outline';

// Menü yapısını buradan kolayca değiştirebilirsiniz.
export const NAVIGATION_ITEMS = [
    {
        name: 'Genel Bakış',
        path: '/',
        icon: HomeIcon,
    },
    {
        name: 'Takvim',
        path: '/calendar',
        icon: CalendarDaysIcon,
    },
    {
        name: 'Simülasyon',
        path: '/simulations',
        icon: BoltIcon,
    },
    {
        name: 'Mağazalar',
        path: '/stores',
        icon: ShoppingBagIcon,
    },
    {
        name: 'Transferler',
        path: '/transfers',
        icon: TruckIcon,
    },
    {
        name: 'Analiz & Tahmin',
        path: '/analytics',
        icon: ChartBarIcon,
    },
    {
        name: 'SQL Oyun Alanı',
        path: '/playground',
        icon: CommandLineIcon,
    },
];

export const BOTTOM_NAVIGATION_ITEMS = [
    {
        name: 'Ayarlar',
        path: '/settings',
        icon: Cog6ToothIcon,
    },
];
