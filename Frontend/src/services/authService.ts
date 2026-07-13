import apiClient from "./apiClient";

export const authService = {
  /**
   * Log in an administrator
   */
  login: async (email: string, password: string) => {
    const res = await apiClient.post("/api/login", { email, password });
    return res.data;
  },

  /**
   * Verify the 6-digit 2FA token pin
   */
  verify2FA: async (adminId: string, token: string) => {
    const res = await apiClient.post("/api/verify-2fa", { adminId, token });
    return res.data;
  },

  /**
   * Set up/enable 2FA secret for an administrator
   */
  setup2FA: async (adminId: string) => {
    const res = await apiClient.post("/api/setup-2fa", { adminId });
    return res.data;
  }
};

export default authService;
