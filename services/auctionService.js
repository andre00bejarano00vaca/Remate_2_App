import apiClient from "../api/apiClient";

export const getAuctions = async () => {
  const response = await apiClient.get("/remates");
  return response.data;
};

export const createAuction = async (payload) => {
  const response = await apiClient.post("/remates", payload);
  return response.data;
};

export const deleteAuction = async (id) => {
  await apiClient.delete(`/remates/${id}`);
};
