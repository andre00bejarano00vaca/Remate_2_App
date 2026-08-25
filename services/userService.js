import apiClient from "../api/apiClient";

export const getUsers = async () => {
  const response = await apiClient.get("/usuarios");
  return response.data;
};

/** Respuesta: { content, page, size, totalElements, totalPages, first, last } */
export const getUsersPaginado = async ({ page = 0, size = 20 } = {}) => {
  const response = await apiClient.get("/usuarios/paginado", {
    params: { page, size },
  });
  return response.data;
};

export const createteUser = async (payload) => {
  const response = await apiClient.post(`/usuarios/registrar`, payload);
  return response.data;
};

export const updateUser = async (id, payload) => {
  console.log("🟢 Enviando actualización de usuario:");
  console.log("ID:", id);
  console.log("Payload:", payload);

  const response = await apiClient.put(`/usuarios/${id}`, payload);

  console.log("✅ Respuesta del servidor:", response.data);
  return response.data;
};


export const deleteUser = async (id) => {
  await apiClient.delete(`/usuarios/${id}`);
};
