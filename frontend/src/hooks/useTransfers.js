import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axios';

// Transfer Önerilerini Getir
const fetchRecommendations = async () => {
    const { data } = await axiosClient.get('/api/transfers/recommendations');
    return data;
};

// Transferi Gerçekleştir
const executeTransfer = async (transferData) => {
    const { data } = await axiosClient.post('/api/transfer', {
        source_store_id: transferData.source.id,
        target_store_id: transferData.target.id,
        product_id: transferData.product_id,
        amount: transferData.amount
    });
    return data;
};

export const useTransfers = () => {
    const queryClient = useQueryClient();

    const recommendationsQuery = useQuery({
        queryKey: ['transfer-recommendations'],
        queryFn: fetchRecommendations,
        staleTime: 1000 * 60 * 2, // 2 dakika boyunca taze
    });

    const transferMutation = useMutation({
        mutationFn: executeTransfer,
        // --- OPTIMISTIC UPDATE ---
        onMutate: async (newTransfer) => {
            // 1. Önceki sorguları iptal et
            await queryClient.cancelQueries({ queryKey: ['transfer-recommendations'] });

            // 2. Mevcut veriyi sakla (Snapshot)
            const previousRecommendations = queryClient.getQueryData(['transfer-recommendations']);

            // 3. Veriyi iyimser olarak güncelle (Öneriyi listeden sil)
            queryClient.setQueryData(['transfer-recommendations'], (old) => {
                return old ? old.filter(rec => rec.transfer_id !== newTransfer.transfer_id) : [];
            });

            return { previousRecommendations };
        },
        onError: (err, newTransfer, context) => {
            // Hata olursa eski veriyi geri yükle
            queryClient.setQueryData(['transfer-recommendations'], context.previousRecommendations);
            alert("Transfer başarısız oldu: " + err.message);
        },
        onSettled: () => {
            // Her durumda güncel veriyi çek
            queryClient.invalidateQueries({ queryKey: ['transfer-recommendations'] });
            // Stokları ve Satışları da yenile
            queryClient.invalidateQueries({ queryKey: ['stores'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });

    return {
        recommendations: recommendationsQuery.data,
        isLoading: recommendationsQuery.isLoading,
        executeTransfer: transferMutation.mutate,
        isTransferring: transferMutation.isPending
    };
};
