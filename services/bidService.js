import apiClient from "../api/apiClient";

export const getBids = () => apiClient.get("/pujas");
export const createBid = (data) => apiClient.post("/pujas", data);
export const updateBid = (id, data) => apiClient.put(`/pujas/${id}`, data);
export const deleteBid = (id) => apiClient.delete(`/pujas/${id}`);
