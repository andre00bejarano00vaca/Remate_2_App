import apiClient from "../api/apiClient";

export const getLots = async () => {
  const response = await apiClient.get("/lotes");
  return response.data;
};

export const createLot = async (payload) => {
  const response = await apiClient.post("/lotes", payload);
  return response.data;
};

export const deleteLot = async (id) => {
  await apiClient.delete(`/lotes/${id}`);
};
