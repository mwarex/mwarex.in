import axios from "axios";
import { fakeAnalyzeVideo } from "./fakeGeminiProxy";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_FAKE_GEMINI_PROXY = (process.env.NEXT_PUBLIC_FAKE_GEMINI_PROXY ?? "true") !== "false";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  // User (Creator) auth
  userSignup: (data: { email: string; password: string; name: string; creatorId?: string; role?: string }) =>
    api.post("/api/v1/user/signup", data),

  userSignin: (data: { email: string; password: string }) =>
    api.post("/api/v1/user/signin", data),

  // Admin auth
  adminSignup: (data: { email: string; password: string; name: string }) =>
    api.post("/api/v1/admin/signup", data),

  adminSignin: (data: { email: string; password: string }) =>
    api.post("/api/v1/admin/signin", data),

  // Editor auth
  editorSignup: (data: { email: string; password: string; name?: string }) =>
    api.post("/api/editor/signup", data),

  // Password Reset
  forgotPassword: (data: { email: string }) =>
    api.post("/api/v1/user/forgot-password", data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post("/api/v1/user/verify-otp", data),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post("/api/v1/user/reset-password", data),
};

// Video APIs
export const videoAPI = {
  upload: (formData: FormData) =>
    api.post("/api/v1/videos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getVideos: (params?: any) => api.get("/api/v1/videos", { params }),

  getPending: () => api.get("/api/v1/videos/pending"),

  approve: (id: string) => api.post(`/api/v1/videos/${id}/approve`),

  reject: (id: string, reason?: string) => api.post(`/api/v1/videos/${id}/reject`, { reason }),

  deleteForMe: (id: string) => api.delete(`/api/v1/videos/${id}/delete-for-me`),

  deleteForEveryone: (id: string) => api.delete(`/api/v1/videos/${id}/delete-for-everyone`),

  storeYouTubeTokens: (data: { accessToken: string; refreshToken?: string }) =>
    api.post("/api/v1/videos/store-youtube-tokens", data),

  getYouTubeStatus: () => api.get("/api/v1/videos/youtube-status"),

  updateThumbnail: (id: string, thumbnailUrl: string) =>
    api.put(`/api/v1/videos/${id}/thumbnail`, { thumbnailUrl }),

  updateSettings: (id: string, editSettings: any) =>
    api.put(`/api/v1/videos/${id}/edit-settings`, { editSettings }),

  addComment: (id: string, text: string) =>
    api.post(`/api/v1/videos/${id}/comments`, { text }),

  getVideo: (id: string) => api.get(`/api/v1/videos/${id}`),

  // Raw Video Workflow
  uploadRaw: (formData: FormData) =>
    api.post("/api/v1/videos/upload-raw", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  reviewRaw: (id: string, action: "accept" | "reject", reason?: string) =>
    api.post(`/api/v1/videos/${id}/raw-review`, { action, reason }),

  uploadEdit: (id: string, formData: FormData) =>
    api.post(`/api/v1/videos/${id}/upload-edit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Register a video that was already uploaded directly to S3
  registerFromS3: (data: {
    fileUrl: string;
    s3Key?: string;
    title: string;
    description?: string;
    roomId?: string;
    editorId?: string;
    isRaw?: boolean;
    thumbnailUrl?: string;
    creatorId?: string;
  }) => api.post("/api/v1/videos/register-s3", data),

  extractClips: (data: {
    youtubeUrl?: string;
    videoId?: string;
    roomId?: string;
  }) => api.post("/api/v1/videos/extract-clips", data),
};



// AI APIs
export const aiAPI = {
  generateTitles: (data: { keywords: string }) => api.post("/api/v1/ai/generate-titles", data),
  generateThumbnails: (data: { topic: string }) => api.post("/api/v1/ai/generate-thumbnails", data),
  analyzeScore: (data: { title: string; description: string }) => api.post("/api/v1/ai/analyze-score", data),
  chat: (data: { messages: { role: string; text: string }[] }) => api.post("/api/v1/ai/chat", data),
  analyzeVideo: (data: { videoUrl: string; title?: string; description?: string; videoId?: string }) => 
    USE_FAKE_GEMINI_PROXY ? fakeAnalyzeVideo(data) : api.post("/api/v1/ai/analyze-video", data),
};

// User APIs
export const userAPI = {
  getMe: () => api.get("/api/v1/user/me"),
  getSettings: () => api.get("/api/v1/user/get-settings"),
  updateSettings: (settings: any) => api.put("/api/v1/user/settings", { settings }),
  getEditors: () => api.get("/api/v1/user/editors"),
  removeEditor: (id: string) => api.delete(`/api/v1/user/editors/${id}`),
};

// Invite APIs
export const inviteAPI = {
  sendInvite: (email: string, inviteLink?: string) => api.post("/api/v1/invite", { email, inviteLink }),

  verifyInvite: (token: string) => api.get(`/api/v1/verify?token=${token}`),
};

// Google OAuth
export const getGoogleAuthUrl = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${API_BASE_URL}/auth/google?origin=${encodeURIComponent(origin)}`;
};

// Health check to warm up the server
export const healthCheck = async (): Promise<boolean> => {
  try {
    // Try multiple endpoints to wake up the server
    const response = await api.get("/api/v1/health", { timeout: 60000 });
    return response.status === 200;
  } catch (error) {
    // Even if health endpoint doesn't exist, a 404 means server is awake
    return true;
  }
};

// Warm up server before Google OAuth redirect
export const warmAndRedirectToGoogle = async (
  onWarmingUp: () => void,
  onReady: () => void,
  onError: (error: string) => void
): Promise<void> => {
  onWarmingUp();

  const maxAttempts = 30; // 30 attempts
  const delayBetweenAttempts = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Make a simple request to wake up the server
      await api.get("/api/v1/health", { timeout: 10000 });
      onReady();
      // Server is awake, redirect to Google OAuth
      window.location.href = getGoogleAuthUrl();
      return;
    } catch (error: any) {
      // If we get any response (even error), server is likely awake
      if (error.response) {
        onReady();
        window.location.href = getGoogleAuthUrl();
        return;
      }
      // Network error - server still waking up
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }
  }

  // After all attempts, try to redirect anyway
  onReady();
  window.location.href = getGoogleAuthUrl();
};

// Payment APIs
export const paymentAPI = {
  createOrder: (plan: string) => api.post("/api/v1/payment/create-order", { plan }),

  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string
  }) => api.post("/api/v1/payment/verify", data),

  getSubscription: () => api.get("/api/v1/payment/subscription"),

  getPaymentHistory: () => api.get("/api/v1/payment/history"),

  createCryptoCharge: (plan: string) => api.post("/api/v1/payment/crypto/create-charge", { plan }),
};

// Room APIs
export const roomAPI = {
  create: (name: string) => api.post("/api/v1/rooms/create", { name }),
  list: () => api.get("/api/v1/rooms/list"),
  join: (token: string) => api.post("/api/v1/rooms/join", { token }),
  get: (id: string) => api.get(`/api/v1/rooms/${id}`),
  verify: (token: string) => api.get(`/api/v1/rooms/verify/${token}`),
};

// Marketplace APIs
export const marketplaceAPI = {
  // Creator routes
  createProject: (data: any) => api.post("/api/v1/marketplace/projects", data),
  getCreatorProjects: () => api.get("/api/v1/marketplace/projects/my"),
  getProjectApplications: (projectId: string) => api.get(`/api/v1/marketplace/projects/${projectId}/applications`),
  acceptApplication: (applicationId: string) => api.post(`/api/v1/marketplace/applications/${applicationId}/accept`),
  
  // Editor routes
  getMarketplaceProjects: (filters?: any) => api.get("/api/v1/marketplace/projects", { params: filters }),
  applyToProject: (projectId: string, data: { pitchMessage: string, expectedPrice: number, email: string }) => api.post(`/api/v1/marketplace/projects/${projectId}/apply`, data),
  getEditorApplications: () => api.get("/api/v1/marketplace/applications/my"),
  
  // Common/Chat routes
  getApplicationMessages: (applicationId: string) => api.get(`/api/v1/marketplace/applications/${applicationId}/messages`),
  sendMessage: (applicationId: string, content: string) => api.post(`/api/v1/marketplace/applications/${applicationId}/messages`, { content }),
};


// S3 Direct Upload APIs
export const s3API = {
  getPresignedUrl: (data: { filename: string; contentType: string; folder?: string }) =>
    api.post("/api/v1/s3/presign", data),

  // Get a signed download URL for a video stored on S3 (by video ID)
  getDownloadUrl: (videoId: string, raw = true) =>
    api.get(`/api/v1/s3/download-url/${videoId}?raw=${raw}`),
};

// Feedback APIs
export const feedbackAPI = {
  addFeedback: (data: { name: string; role: string; rating: number; message: string; avatarUrl?: string }) =>
    api.post("/api/v1/feedback", data),
  getFeedbacks: () => api.get("/api/v1/feedback"),
};

// Support APIs
export const supportAPI = {
  submitTicket: (data: { name: string; email: string; message: string }) =>
    api.post("/api/v1/support", data),
};

// Razorpay Key for frontend
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_S9APuUYcsOCve3";

export default api;
