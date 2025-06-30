import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5101/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface DocumentData {
  title: string;
  content: string;
  visibility?: string;
}

export const authAPI = {
  register: (userData: RegisterData): Promise<AxiosResponse> =>
    api.post("/auth/register", userData),
  login: (credentials: LoginCredentials): Promise<AxiosResponse> =>
    api.post("/auth/login", credentials),
  forgotPassword: (email: string): Promise<AxiosResponse> =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string): Promise<AxiosResponse> =>
    api.post("/auth/reset-password", { token, password }),
  verifyEmail: (token: string): Promise<AxiosResponse> =>
    api.get(`/auth/verify-email/${token}`),
  resendVerification: (email: string): Promise<AxiosResponse> =>
    api.post("/auth/resend-verification", { email }),
};

export const documentsAPI = {
  getAll: (): Promise<AxiosResponse> => api.get("/documents"),
  getById: (id: string): Promise<AxiosResponse> => api.get(`/documents/${id}`),
  create: (documentData: DocumentData): Promise<AxiosResponse> =>
    api.post("/documents", documentData),
  update: (id: string, documentData: DocumentData): Promise<AxiosResponse> =>
    api.put(`/documents/${id}`, documentData),
  delete: (id: string): Promise<AxiosResponse> =>
    api.delete(`/documents/${id}`),
  search: (query: string): Promise<AxiosResponse> =>
    api.get(`/documents/search?q=${encodeURIComponent(query)}`),
  updateVisibility: (id: string, visibility: string): Promise<AxiosResponse> =>
    api.put(`/documents/${id}/visibility`, { visibility }),
  share: (
    id: string,
    userId: string,
    permission: string,
  ): Promise<AxiosResponse> =>
    api.post(`/documents/${id}/share`, { userId, permission }),
  removeAccess: (id: string, userId: string): Promise<AxiosResponse> =>
    api.delete(`/documents/${id}/share`, { data: { userId } }),
};

export const versionsAPI = {
  getVersions: (documentId: string): Promise<AxiosResponse> =>
    api.get(`/documents/${documentId}/versions`),
  getVersion: (documentId: string, versionId: string): Promise<AxiosResponse> =>
    api.get(`/documents/${documentId}/versions/${versionId}`),
  compareVersions: (
    documentId: string,
    versionId: string,
    compareWith?: string,
  ): Promise<AxiosResponse> =>
    api.get(
      `/documents/${documentId}/versions/${versionId}/diff${
        compareWith ? `?compareWith=${compareWith}` : ""
      }`,
    ),
};

export default api;
