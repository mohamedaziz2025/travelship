import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { data } = await api.post('/auth/refresh')
        localStorage.setItem('accessToken', data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  adminLogin: (data: any) => api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
}

// Users API
export const usersApi = {
  getMe: () => api.get('/users/me'),
  getById: (id: string) => api.get(`/users/${id}`),
  updateMe: (data: any) => api.patch('/users/me', data),
  verify: (data: any) => api.post('/users/verify', data),
}

// Announcements API
export const announcementsApi = {
  create: (data: any) => api.post('/announcements', data),
  getAll: (params?: any) => api.get('/announcements', { params }),
  getMy: () => api.get('/announcements/my'),
  getById: (id: string) => api.get(`/announcements/${id}`),
  update: (id: string, data: any) => api.patch(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
}

// Trips API
export const tripsApi = {
  create: (data: any) => api.post('/trips', data),
  getAll: (params?: any) => api.get('/trips', { params }),
  getMy: () => api.get('/trips/my'),
  getById: (id: string) => api.get(`/trips/${id}`),
  update: (id: string, data: any) => api.patch(`/trips/${id}`, data),
  delete: (id: string) => api.delete(`/trips/${id}`),
}

// Matching API
export const matchingApi = {
  getMatchesForAnnouncement: (id: string) => api.get(`/matches/announcements/${id}`),
  getMatchesForTrip: (id: string) => api.get(`/matches/trips/${id}`),
}

// Conversations API
export const conversationsApi = {
  getAll: () => api.get('/conversations'),
  getById: (id: string) => api.get(`/conversations/${id}`),
  create: (participantId: string) => api.post('/conversations', { participantId }),
  getMessages: (id: string, params?: any) => api.get(`/conversations/${id}/messages`, { params }),
  sendMessage: (id: string, content: string) => api.post(`/conversations/${id}/messages`, { content }),
  markAsRead: (id: string) => api.patch(`/conversations/${id}/read`),
  archive: (id: string) => api.patch(`/conversations/${id}/archive`),
  unarchive: (id: string) => api.patch(`/conversations/${id}/unarchive`),
  delete: (id: string) => api.delete(`/conversations/${id}`),
}

// Chat API (legacy)
export const chatApi = {
  getConversations: () => conversationsApi.getAll(),
  getMessages: (conversationId: string) => conversationsApi.getMessages(conversationId),
}

// Admin API
export const adminApi = {
  // Dashboard Stats (Module A)
  getDashboardStats: () => api.get('/admin/stats/dashboard'),
  getAdvancedStats: () => api.get('/admin/stats/advanced'),
  
  // Users Management (Module B)
  getUsers: (params?: any) => api.get('/admin/users/list', { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  getUserProfile: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  updateUserStatus: (id: string, status: string) => api.patch(`/admin/users/${id}/status`, { status }),
  blockUser: (id: string, reason?: string) => api.post(`/admin/users/${id}/block`, { reason }),
  unblockUser: (id: string) => api.post(`/admin/users/${id}/unblock`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}/delete`),
  
  // Announcements Management (Module C)
  getAnnouncements: (params?: any) => api.get('/admin/posts/list', { params }),
  getAnnouncementById: (id: string) => api.get(`/admin/posts/${id}`),
  updateAnnouncement: (id: string, data: any) => api.patch(`/admin/posts/${id}`, data),
  approveAnnouncement: (id: string) => api.post(`/admin/posts/${id}/approve`),
  rejectAnnouncement: (id: string, reason: string) => api.post(`/admin/posts/${id}/reject`, { reason }),
  toggleFeaturedAnnouncement: (id: string) => api.post(`/admin/posts/${id}/feature`),
  featureAnnouncement: (id: string, featured: boolean) => api.post(`/admin/posts/${id}/feature`, { featured }),
  archiveAnnouncement: (id: string) => api.post(`/admin/posts/${id}/archive`),
  unarchiveAnnouncement: (id: string) => api.post(`/admin/posts/${id}/unarchive`),
  deleteAnnouncement: (id: string) => api.delete(`/admin/posts/${id}/delete`),
  
  // Reports Management (Module D)
  getReports: (params?: any) => api.get('/admin/reports/list', { params }),
  getReportById: (id: string) => api.get(`/admin/reports/${id}`),
  handleReport: (id: string, action: string) => api.post(`/admin/reports/${id}/handle`, { action }),
  closeReport: (id: string, data: any) => api.post(`/admin/reports/${id}/close`, data),
  archiveReport: (id: string) => api.post(`/admin/reports/${id}/archive`),
  deleteReportedPost: (id: string) => api.post(`/admin/reports/${id}/deletePost`),
  
  // System Settings (Module F)
  getSettings: (params?: any) => api.get('/admin/settings', { params }),
  updateSetting: (data: any) => api.post('/admin/settings', data),
  getAdmins: () => api.get('/admin/admins'),
  updateAdminRole: (id: string, adminRole: string) => api.put(`/admin/admins/${id}/role`, { adminRole }),
  
  // Static Pages (Module G)
  getPages: (params?: any) => api.get('/admin/pages', { params }),
  getPage: (key: string) => api.get(`/admin/pages/${key}`),
  updatePage: (key: string, data: any) => api.put(`/admin/pages/${key}`, data),
  createPage: (data: any) => api.post('/admin/pages', data),
}

// Upload API
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset!)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await response.json()
  return data.secure_url
}
