import api from "./axios";

export const dashboardService = {
    getStats: async () => {
        const response = await api.get("/dashboard/stats");
        return response.data;
    }
};