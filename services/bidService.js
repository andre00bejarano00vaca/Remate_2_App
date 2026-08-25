import apiClient from "../api/apiClient";

export const getBids = () => apiClient.get("/pujas");

/** Respuesta: { content, page, size, totalElements, totalPages, first, last } */
export const getBidsPaginado = async ({ page = 0, size = 20 } = {}) => {
  const response = await apiClient.get("/pujas/paginado", {
    params: { page, size },
  });
  return response.data;
};

export const createBid = (data) => apiClient.post("/pujas", data);
export const updateBid = (id, data) => apiClient.put(`/pujas/${id}`, data);
export const deleteBid = (id) => apiClient.delete(`/pujas/${id}`);
