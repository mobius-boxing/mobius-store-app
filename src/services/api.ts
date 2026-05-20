import axios, { AxiosResponse } from 'axios';
import {
  ApiError,
  ApiResponse,
  CatalogBox,
  CatalogRoll,
  CreateOrderPayload,
  LoginCredentials,
  Order,
  StoreLoginResponse,
  StoreMeResponse,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Persisted localStorage keys
export const STORAGE_KEYS = {
  token: 'store_token',
  user: 'store_user',
  companyName: 'store_company_name',
  cart: 'store_cart',
};

const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.companyName);
  localStorage.removeItem(STORAGE_KEYS.cart);
};

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach store JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401 clear + redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStorage();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Centralized response unwrap. Codebase convention is `{ success, message, data }`.
 * Defensive: if the body is not wrapped, return the raw body. Single point of
 * change if the API ever returns bare bodies.
 */
function unwrap<T>(response: AxiosResponse<ApiResponse<T> | T>): T {
  const body = response.data as any;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

/** Normalize any thrown error into a display-friendly ApiError. */
export function toApiError(err: any): ApiError {
  const data = err?.response?.data;
  return {
    message: data?.message || err?.message || 'Unexpected error',
    code: data?.code,
    statusCode: err?.response?.status,
    details: data?.details,
  };
}

// ============================================================================
// Auth
// ============================================================================
export const storeAuthApi = {
  login: async (credentials: LoginCredentials): Promise<StoreLoginResponse> => {
    const response = await api.post<ApiResponse<StoreLoginResponse>>(
      '/api/store/auth/login',
      credentials
    );
    return unwrap<StoreLoginResponse>(response);
  },

  me: async (): Promise<StoreMeResponse> => {
    const response = await api.get<ApiResponse<StoreMeResponse>>('/api/store/me');
    return unwrap<StoreMeResponse>(response);
  },
};

// ============================================================================
// Catalog
// ============================================================================
export const storeCatalogApi = {
  getBoxes: async (): Promise<CatalogBox[]> => {
    const response = await api.get<ApiResponse<CatalogBox[]>>('/api/store/catalog/boxes');
    return unwrap<CatalogBox[]>(response) ?? [];
  },

  getRolls: async (): Promise<CatalogRoll[]> => {
    const response = await api.get<ApiResponse<CatalogRoll[]>>('/api/store/catalog/rolls');
    return unwrap<CatalogRoll[]>(response) ?? [];
  },
};

// ============================================================================
// Orders
// ============================================================================
export const storeOrdersApi = {
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>('/api/store/orders', payload);
    return unwrap<Order>(response);
  },

  getAll: async (): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/api/store/orders');
    return unwrap<Order[]>(response) ?? [];
  },

  getByUuid: async (uuid: string): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/api/store/orders/${uuid}`);
    return unwrap<Order>(response);
  },
};

export default api;
