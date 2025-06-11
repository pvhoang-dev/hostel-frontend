import api from './axios';

const configService = {
  getConfigs: async (params = {}) => {
    const response = await api.get('/configs', { params });
    return response.data;
  },

  getConfig: async (id) => {
    const response = await api.get(`/configs/${id}`);
    return response.data;
  },

  createConfig: async (configData) => {
    const response = await api.post('/configs', configData);
    return response.data;
  },

  updateConfig: async (id, configData) => {
    const response = await api.put(`/configs/${id}`, configData);
    return response.data;
  },

  deleteConfig: async (id) => {
    const response = await api.delete(`/configs/${id}`);
    return response.data;
  },

  getPayosConfigs: async () => {
    const response = await api.get('/configs/group/payos');
    return response.data;
  }
};

export default configService; 