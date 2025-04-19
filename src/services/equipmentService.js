import api from "./api";

export const getEquipments = (params) => api.get("/equipments", { params });
export const getEquipment = (id) => api.get(`/equipments/${id}`);
export const createEquipment = (data) => api.post("/equipments", data);
export const updateEquipment = (id, data) => api.put(`/equipments/${id}`, data);
export const deleteEquipment = (id) => api.delete(`/equipments/${id}`);
