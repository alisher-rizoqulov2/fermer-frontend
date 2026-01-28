const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== "undefined" && !authToken) {
    authToken = localStorage.getItem("auth_token");
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
};

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

export const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    console.log("token",token)
    headers["Authorization"] = `Bearer ${token}`;
  }
console.log('env', API_BASE_URL)
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.href = "/login";
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Cattle APIs
export const cattleAPI = {
  getAll: () => apiCall("/cattle"),
  getById: (id: number) => apiCall(`/cattle/${id}`),
  create: (data: any) => apiCall("/cattle", { method: "POST", body: data }),
  update: (id: number, data: any) =>
    apiCall(`/cattle/${id}`, { method: "PATCH", body: data }),
  delete: (id: number) => apiCall(`/cattle/${id}`, { method: "DELETE" }),
};

// Expenses APIs
export const expensesAPI = {
  getAll: () => apiCall("/expenses"),
  getById: (id: number) => apiCall(`/expenses/${id}`),
  getTotalByAnimal: (id: number) => apiCall(`/expenses/total/${id}`),
  create: (data: any) => apiCall("/expenses", { method: "POST", body: data }),
  update: (id: number, data: any) =>
    apiCall(`/expenses/${id}`, { method: "PATCH", body: data }),
  delete: (id: number) => apiCall(`/expenses/${id}`, { method: "DELETE" }),
};

// Farm Wallet APIs
export const walletAPI = {
  getAll: () => apiCall("/farm-wallet"),
  getById: (id: number) => apiCall(`/farm-wallet/${id}`),
  create: (data: any) =>
    apiCall("/farm-wallet", { method: "POST", body: data }),
  update: (id: number, data: any) =>
    apiCall(`/farm-wallet/${id}`, { method: "PATCH", body: data }),
  delete: (id: number) => apiCall(`/farm-wallet/${id}`, { method: "DELETE" }),
};

// Cattle Health APIs
export const healthAPI = {
  getAll: () => apiCall("/cattle-health"),
  getById: (id: number) => apiCall(`/cattle-health/${id}`),
  create: (data: any) =>
    apiCall("/cattle-health", { method: "POST", body: data }),
  update: (id: number, data: any) =>
    apiCall(`/cattle-health/${id}`, { method: "PATCH", body: data }),
  delete: (id: number) => apiCall(`/cattle-health/${id}`, { method: "DELETE" }),
};

// Cattle Feeding APIs
export const feedingAPI = {
  getAll: () => apiCall("/cattle-feeding"),
  getById: (id: number) => apiCall(`/cattle-feeding/${id}`),
  create: (data: any) =>
    apiCall("/cattle-feeding", { method: "POST", body: data }),
  update: (id: number, data: any) =>
    apiCall(`/cattle-feeding/${id}`, { method: "PATCH", body: data }),
  delete: (id: number) =>
    apiCall(`/cattle-feeding/${id}`, { method: "DELETE" }),
};

// Inventory APIs
export const inventoryAPI = {
  getAll: () => apiCall("/inventory"),
  getById: (id: number) => apiCall(`/inventory/${id}`),
  create: (data: any) => apiCall("/inventory", { method: "POST", body: data }),
  update: (id: number, data: any) =>
    apiCall(`/inventory/${id}`, { method: "PATCH", body: data }),
  delete: (id: number) => apiCall(`/inventory/${id}`, { method: "DELETE" }),
};

// Profit/Loss APIs
export const profitLossAPI = {
  getAll: () => apiCall("/cattle-profit-loss"),
  getById: (id: number) => apiCall(`/cattle-profit-loss/${id}`),
  create: (data: any) =>
    apiCall("/cattle-profit-loss", { method: "POST", body: data }),
  update: (id: number, data: any) =>
    apiCall(`/cattle-profit-loss/${id}`, { method: "PATCH", body: data }),
  delete: (id: number) =>
    apiCall(`/cattle-profit-loss/${id}`, { method: "DELETE" }),
};

// Admin APIs
export const adminAPI = {
  getAll: () => apiCall("/admin"),
  getById: (id: number) => apiCall(`/admin/${id}`),
  create: (data: any) => apiCall("/admin", { method: "POST", body: data }),
  update: (id: number, data: any) =>
    apiCall(`/admin/${id}`, { method: "PATCH", body: data }),
  delete: (id: number) => apiCall(`/admin/${id}`, { method: "DELETE" }),
};
