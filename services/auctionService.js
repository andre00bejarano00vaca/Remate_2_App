import apiClient from "../api/apiClient";

export const getAuctions = async (token) => {
  const response = await apiClient.get("/remates", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/** Respuesta: { content, page, size, totalElements, totalPages, first, last } */
export const getAuctionsPaginado = async ({ page = 0, size = 20 } = {}) => {
  const response = await apiClient.get("/remates/paginado", {
    params: { page, size },
  });
  return response.data;
};

export const createAuction = async (payload) => {
  const response = await apiClient.post("/remates", payload);
  return response.data;
};

export const updateAuction = async (id, payload) => {
  console.log(payload)
  const response = await apiClient.put(`/remates/${id}`, payload);
  return response.data;
};

export const deleteAuction = async (id) => {
  await apiClient.delete(`/remates/${id}`);
};
