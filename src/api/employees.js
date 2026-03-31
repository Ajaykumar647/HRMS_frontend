import api from './axios';

export const getEmployees = () => api.get('/api/employees/');

export const createEmployee = (data) => api.post('/api/employees/', data);

export const deleteEmployee = (id) => api.delete(`/api/employees/${id}/`);
