import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axios';

const fetchCriticalStock = async () => {
    const { data } = await axiosClient.get('/api/dashboard/critical-stock');
    return data;
};

const fetchAiVoice = async () => {
    const { data } = await axiosClient.get('/api/dashboard/ai-voice');
    return data;
};

export const useDashboardExtras = () => {
    const criticalStockQuery = useQuery({
        queryKey: ['dashboard-critical-stock'],
        queryFn: fetchCriticalStock,
        staleTime: 1000 * 60 * 2, // 2 dk
    });

    const aiVoiceQuery = useQuery({
        queryKey: ['dashboard-ai-voice'],
        queryFn: fetchAiVoice,
        staleTime: 1000 * 60 * 5, // 5 dk
    });

    return {
        criticalStock: criticalStockQuery.data || [],
        aiVoice: aiVoiceQuery.data || { summary: '', confidence: '' },
        isLoading: criticalStockQuery.isLoading || aiVoiceQuery.isLoading
    };
};
