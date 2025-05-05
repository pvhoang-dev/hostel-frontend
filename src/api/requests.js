import api from "./axios";

export const requestService = {
  getRequests: async (params = {}) => {
    const response = await api.get("/requests", { params });
    return response.data;
  },

  getRequest: async (id, params = {}) => {
    const response = await api.get(`/requests/${id}`, { params });
    return response.data;
  },

  createRequest: async (requestData) => {
    const response = await api.post("/requests", requestData);
    return response.data;
  },

  updateRequest: async (id, requestData) => {
    const response = await api.put(`/requests/${id}`, requestData);
    return response.data;
  },

  deleteRequest: async (id) => {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  },

  // Lấy danh sách yêu cầu theo phòng
  getRequestsByRoom: async (roomId, params = {}) => {
    const requestParams = { ...params, room_id: roomId };
    const response = await api.get("/requests", { params: requestParams });
    return response.data;
  },

  // Lấy danh sách yêu cầu theo nhà
  getRequestsByHouse: async (houseId, params = {}) => {
    const requestParams = { ...params, house_id: houseId };
    const response = await api.get("/requests", { params: requestParams });
    return response.data;
  },

  // Comments
  getRequestComments: async (requestId, params = {}) => {
    const requestParams = { ...params, request_id: requestId };
    const response = await api.get("/request-comments", {
      params: requestParams,
    });
    return response.data;
  },

  createRequestComment: async (commentData) => {
    const response = await api.post("/request-comments", commentData);
    return response.data;
  },

  updateRequestComment: async (id, commentData) => {
    const response = await api.put(`/request-comments/${id}`, commentData);
    return response.data;
  },

  deleteRequestComment: async (id) => {
    const response = await api.delete(`/request-comments/${id}`);
    return response.data;
  },
};
