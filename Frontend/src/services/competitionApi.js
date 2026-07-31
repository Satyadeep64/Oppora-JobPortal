import apiClient from './apiClient';

/**
 * Clean URL search param builder
 */
const buildSearchParams = (pageNumber, pageSize, filters) => {
  const params = { pageNumber, pageSize };
  if (filters && typeof filters === 'object') {
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        params[key] = val;
      }
    });
  }
  return params;
};

/**
 * Competition Module REST API Service Client
 */
export const competitionApi = {
  getAdvancedSearch: (pageNumber = 1, pageSize = 50, filters = {}) =>
    apiClient.get('/competitions/advanced-search', {
      params: buildSearchParams(pageNumber, pageSize, filters)
    }),

  getById: (id) => (id ? apiClient.get(`/competitions/${id}`) : Promise.resolve(null)),

  getFeatured: () => apiClient.get('/competitions/featured'),

  getCategories: () => apiClient.get('/competitions/categories'),

  create: (payload) => apiClient.post('/competitions', payload),

  delete: (id) => apiClient.delete(`/competitions/${id}`),

  uploadFile: (formData) =>
    apiClient.post('/competitions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export default competitionApi;
