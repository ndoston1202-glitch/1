import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — token yangilash
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post('/api/auth/token/refresh/', { refresh });
          localStorage.setItem('access_token', res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data: { username: string; password: string }) => api.post('/auth/login/', data),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  me: () => api.get('/auth/me/'),
  changePassword: (data: any) => api.post('/auth/change-password/', data),
  getUsers: (params?: any) => api.get('/auth/users/', { params }),
  createUser: (data: any) => api.post('/auth/users/', data),
  updateUser: (id: number, data: any) => api.patch(`/auth/users/${id}/`, data),
  deleteUser: (id: number) => api.delete(`/auth/users/${id}/`),
};

// Menu
export const menuApi = {
  getCategories: () => api.get('/menu/categories/'),
  createCategory: (data: any) => api.post('/menu/categories/', data),
  updateCategory: (id: number, data: any) => api.patch(`/menu/categories/${id}/`, data),
  deleteCategory: (id: number) => api.delete(`/menu/categories/${id}/`),
  getItems: (params?: any) => api.get('/menu/items/', { params }),
  getItem: (id: number) => api.get(`/menu/items/${id}/`),
  createItem: (data: any) => api.post('/menu/items/', data),
  updateItem: (id: number, data: any) => api.patch(`/menu/items/${id}/`, data),
  deleteItem: (id: number) => api.delete(`/menu/items/${id}/`),
  getByCategory: () => api.get('/menu/by-category/'),
};

// Tables
export const tablesApi = {
  getTables: (params?: any) => api.get('/tables/', { params }),
  createTable: (data: any) => api.post('/tables/', data),
  updateTable: (id: number, data: any) => api.patch(`/tables/${id}/`, data),
  changeStatus: (id: number, status: string) => api.patch(`/tables/${id}/status/`, { status }),
  getReservations: (params?: any) => api.get('/tables/reservations/', { params }),
  createReservation: (data: any) => api.post('/tables/reservations/', data),
  updateReservation: (id: number, data: any) => api.patch(`/tables/reservations/${id}/`, data),
};

// Orders
export const ordersApi = {
  getOrders: (params?: any) => api.get('/orders/', { params }),
  getOrder: (id: number) => api.get(`/orders/${id}/`),
  createOrder: (data: any) => api.post('/orders/', data),
  updateOrder: (id: number, data: any) => api.patch(`/orders/${id}/`, data),
  changeStatus: (id: number, status: string) => api.patch(`/orders/${id}/status/`, { status }),
  addItem: (orderId: number, data: any) => api.post(`/orders/${orderId}/items/`, data),
  removeItem: (orderId: number, itemId: number) => api.delete(`/orders/${orderId}/items/${itemId}/`),
};

// Payments
export const paymentsApi = {
  getPayments: (params?: any) => api.get('/payments/', { params }),
  createPayment: (data: any) => api.post('/payments/', data),
  refund: (id: number) => api.post(`/payments/${id}/refund/`),
};

// Kitchen
export const kitchenApi = {
  getOrders: () => api.get('/kitchen/orders/'),
  updateItemStatus: (itemId: number, status: string) =>
    api.patch(`/kitchen/items/${itemId}/status/`, { status }),
  markPreparing: (orderId: number) => api.patch(`/kitchen/orders/${orderId}/preparing/`),
  getStats: () => api.get('/kitchen/stats/'),
};

// Staff
export const staffApi = {
  getShifts: (params?: any) => api.get('/staff/shifts/', { params }),
  startShift: () => api.post('/staff/shifts/start/'),
  endShift: () => api.post('/staff/shifts/end/'),
  getAttendance: (params?: any) => api.get('/staff/attendance/', { params }),
  createAttendance: (data: any) => api.post('/staff/attendance/', data),
};

// Reports
export const reportsApi = {
  getDashboard: () => api.get('/reports/dashboard/'),
  getSales: (period: string) => api.get('/reports/sales/', { params: { period } }),
  getTopMenu: (params?: any) => api.get('/reports/menu/', { params }),
  getOrders: (period: string) => api.get('/reports/orders/', { params: { period } }),
  getStaff: (params?: any) => api.get('/reports/staff/', { params }),
};

// Delivery
export const deliveryApi = {
  getZones: () => api.get('/delivery/zones/'),
  createZone: (data: any) => api.post('/delivery/zones/', data),
  updateZone: (id: number, data: any) => api.patch(`/delivery/zones/${id}/`, data),
  getDeliveries: (params?: any) => api.get('/delivery/', { params }),
  createDelivery: (data: any) => api.post('/delivery/', data),
  updateStatus: (id: number, status: string) => api.patch(`/delivery/${id}/status/`, { status }),
  myDeliveries: () => api.get('/delivery/my/'),
};

export default api;
