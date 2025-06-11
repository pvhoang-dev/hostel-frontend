import api from "./axios";

export const statisticsService = {
    // Lấy tổng quan thống kê
    getOverview: async (filters = {}) => {
        const response = await api.get("/statistics/overview", { params: filters });
        return response.data;
    },

    // Lấy thống kê hợp đồng
    getContractsStats: async (filters = {}) => {
        const response = await api.get("/statistics/contracts", { params: filters });
        return response.data;
    },

    // Lấy thống kê doanh thu
    getRevenueStats: async (filters = {}) => {
        const response = await api.get("/statistics/revenue", { params: filters });
        return response.data;
    },

    // Lấy thống kê thiết bị
    getEquipmentStats: async (filters = {}) => {
        const response = await api.get("/statistics/equipment", { params: filters });
        return response.data;
    }
}; 