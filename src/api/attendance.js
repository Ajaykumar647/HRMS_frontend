import api from './axios';

export const getAttendance = (params = {}) => api.get('/api/attendance/', { params });

export const markAttendance = (data) => api.post('/api/attendance/', data);

export const updateAttendance = (id, data) => api.patch(`/api/attendance/${id}/`, data);

export const deleteAttendance = (id) => api.delete(`/api/attendance/${id}/`);

export const getDashboard = () => api.get('/api/dashboard/');
