import apiClient from "../api/apiClient";

export const getCabanas = async () => {
  const response = await apiClient.get("/cabanas");
  return response.data;
};

/** Respuesta: { content, page, size, totalElements, totalPages, first, last } */
export const getCabanasPaginado = async ({ page = 0, size = 20 } = {}) => {
  const response = await apiClient.get("/cabanas/paginado", {
    params: { page, size },
  });
  return response.data;
};

export const createCabana = async (payload) => {
  const response = await apiClient.post("/cabanas", payload);
  return response.data;
};

export const updateCabana = async (id, payload) => {
  console.log("🟢 Enviando actualización de usuario:");
  console.log("ID:", id);
  console.log("Payload:", payload);
  
  const response = await apiClient.put(`/cabanas/${id}`, payload);

  console.log("✅ Respuesta del servidor:", response.data);
  return response.data;
};

export const deleteCabana = async (id) => {
  await apiClient.delete(`/cabanas/${id}`);
};
