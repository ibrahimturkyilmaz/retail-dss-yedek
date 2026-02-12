import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axios';

export const useInventory = (storeId) => {
    return useQuery({
        queryKey: ['inventory', storeId],
        queryFn: async () => {
            const { data } = await axiosClient.get(`/api/stores/${storeId}/inventory`);
            return data;
        },
        enabled: !!storeId, // Sadece storeId varsa çalış
        staleTime: 1000 * 60 * 5, // 5 dakika boyunca cache'den oku
        keepPreviousData: true, // ID değişirken eski veriyi göster (UX)
    });
};
