import apiClient from "./apiClient";

export interface Port {
  _id: string;
  code: string;
  name: string;
}

export const portService = {
  /**
   * Fetch all ports
   */
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: Port[] }>("/api/ports");
    return res.data;
  },

  /**
   * Add a new port
   */
  create: async (code: string, name: string) => {
    const res = await apiClient.post<{ success: boolean; data: Port }>("/api/ports", { code, name });
    return res.data;
  },

  /**
   * Update an existing port
   */
  update: async (id: string, code: string, name: string) => {
    const res = await apiClient.put<{ success: boolean; data: Port }>(`/api/ports/${id}`, { code, name });
    return res.data;
  },

  /**
   * Delete a port
   */
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean }>(`/api/ports/${id}`);
    return res.data;
  }
};

export default portService;
