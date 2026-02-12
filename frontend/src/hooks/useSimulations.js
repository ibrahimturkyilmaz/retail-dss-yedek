import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axios';

// Fetch Simulation Stats
const fetchStats = async () => {
    const { data } = await axiosClient.get('/api/simulate/stats');
    return data;
};

// Reset Simulation
const resetSimulation = async () => {
    const { data } = await axiosClient.post('/api/simulate/reset');
    return data;
};

// Run Scenario (Boom, Recession, Supply Shock)
const runScenario = async (scenarioType) => {
    let endpoint = '';
    switch (scenarioType) {
        case 'boom': endpoint = 'sales-boom'; break;
        case 'recession': endpoint = 'recession'; break;
        case 'shock': endpoint = 'supply-shock'; break;
        default: throw new Error('Invalid scenario type');
    }
    const { data } = await axiosClient.post(`/api/simulate/${endpoint}`);
    return data;
};

// Run What-If Analysis
const runWhatIf = async (payload) => {
    const { data } = await axiosClient.post('/api/simulate/what-if', payload);
    return data;
};

export const useSimulationStats = () => {
    return useQuery({
        queryKey: ['simulation-stats'],
        queryFn: fetchStats,
        keepPreviousData: true,
        staleTime: 1000 * 60, // 1 dakika cache
    });
};

export const useSimulationActions = () => {
    const queryClient = useQueryClient();

    const resetMutation = useMutation({
        mutationFn: resetSimulation,
        onSuccess: () => {
            queryClient.invalidateQueries(['simulation-stats']);
        },
    });

    const scenarioMutation = useMutation({
        mutationFn: runScenario,
        onSuccess: () => {
            queryClient.invalidateQueries(['simulation-stats']);
        },
    });

    const whatIfMutation = useMutation({
        mutationFn: runWhatIf,
        onSuccess: () => {
            queryClient.invalidateQueries(['simulation-stats']);
        },
    });

    return {
        reset: resetMutation,
        runScenario: scenarioMutation,
        runWhatIf: whatIfMutation
    };
};
