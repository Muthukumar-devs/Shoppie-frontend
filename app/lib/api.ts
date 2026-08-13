import axios from "axios";

const BASE_URL = import.meta.env["VITE_API_URL"] as string || "http://localhost:8000/api";

const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

console.log("[API] Connecting to:", BASE_URL);

const STATE_CHANGING = ["post", "put", "patch", "delete"];

api.interceptors.request.use(async (config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("shoppie_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const method = config.method?.toLowerCase() ?? "";
  const isCsrf = config.url?.includes("/csrf-token");

  if (STATE_CHANGING.includes(method) && !isCsrf) {
    // Always fetch a fresh CSRF token for every state-changing request
    // (auth endpoints also require CSRF via the global middleware)
    try {
      const res = await api.get("/csrf-token");
      const t: string = res.data.csrfToken;
      if (typeof window !== "undefined") localStorage.setItem("shoppie_csrf", t);
      config.headers["x-csrf-token"] = t;
    } catch {
      const stored = typeof window !== "undefined" ? localStorage.getItem("shoppie_csrf") : null;
      if (stored) config.headers["x-csrf-token"] = stored;
    }
  }

  return config;
});

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? "";
    const isAuthEndpoint = url.includes("/auth/") || url.includes("/admin/login");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("shoppie_token");
      localStorage.removeItem("shoppie_csrf");
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

// ── CSRF ──────────────────────────────────────────────────
export const fetchCsrfToken = async () => {
  const res = await api.get("/csrf-token");
  const t: string = res.data.csrfToken;
  if (typeof window !== "undefined") localStorage.setItem("shoppie_csrf", t);
  return t;
};

// ── Auth ──────────────────────────────────────────────────
export const initiateSignup = (data: { fullName: string; phoneNumber: string; email: string }) =>
  api.post("/auth/signup", data);

export const verifySignup = (data: { email: string; otp: string }) =>
  api.post("/auth/verify-signup", data);

export const initiateLogin = (data: { email: string }) =>
  api.post("/auth/login", data);

export const verifyLogin = (data: { email: string; otp: string }) =>
  api.post("/auth/verify-login", data);

export const resendOtp = (data: { email: string; type: "signup" | "login" }) =>
  api.post("/auth/resend-otp", data);

// ── User ──────────────────────────────────────────────────
export const getMyProfile = () => api.get("/users/me");

export const updateMyProfile = (data: { fullName?: string; phoneNumber?: string }) =>
  api.patch("/users/me", data);

// ── Products ──────────────────────────────────────────────
export const getProducts = (params?: Record<string, string | number>) =>
  api.get("/products", { params });

export const getProduct = (id: string) => api.get(`/products/${id}`);

// ── Categories ────────────────────────────────────────────
export const getCategories = () => api.get("/categories");

export const getSubCategories = (categoryId?: string) =>
  categoryId ? api.get(`/categories/${categoryId}/subcategories`) : api.get("/categories/subcategories");

// ── Cart ──────────────────────────────────────────────────
export const getCart = () => api.get("/cart");

export const addToCart = (productId: string, quantity = 1) =>
  api.post("/cart", { productId, quantity });

export const updateCartItem = (productId: string, quantity: number) =>
  api.patch(`/cart/items/${productId}`, { quantity });

export const removeCartItem = (productId: string) =>
  api.delete(`/cart/items/${productId}`);

export const clearCart = () => api.delete("/cart");

// ── Orders ────────────────────────────────────────────────
export const getMyOrders = () => api.get("/orders/my-orders");

export const getOrderById = (id: string) => api.get(`/orders/${id}`);

export const cancelOrder = (id: string) => api.patch(`/orders/${id}/cancel`);

// ── Payments ──────────────────────────────────────────────
export const createRazorpayOrder = (shippingAddress: object) =>
  api.post("/payments/create-order", { shippingAddress });

export const verifyPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  shippingAddress: object;
}) => api.post("/payments/verify-payment", data);

export const placeOrderCOD = (shippingAddress: object) =>
  api.post("/payments/place-order-cod", { shippingAddress });

// ── Offers ────────────────────────────────────────────────
export const getOffers = () => api.get("/offers");

export default api;
