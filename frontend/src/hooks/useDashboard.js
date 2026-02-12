import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axios';

const fetchAnalytics = async () => {
    const { data } = await axiosClient.get('/api/sales/analytics');
    return data;
};

const fetchRecentSales = async () => {
    const { data } = await axiosClient.get('/api/sales?limit=5');
    return data;
};

const fetchForecasts = async () => {
    const { data } = await axiosClient.get('/api/forecast');
    return data;
};

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchAnalytics,
        staleTime: 1000 * 60, // 1 dakika
    });
};

export const useRecentSales = () => {
    return useQuery({
        queryKey: ['recent-sales'],
        queryFn: fetchRecentSales,
        staleTime: 1000 * 30, // 30 saniye
    });
};

export const useForecasts = () => {
    return useQuery({
        queryKey: ['forecasts'],
        queryFn: fetchForecasts,
        staleTime: 1000 * 60,
    });
};
