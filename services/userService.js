import apiClient from "../api/apiClient";

export const getUsers = async () => {
  const response = await apiClient.get("/usuarios");
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await apiClient.put(`/usuarios/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id) => {
  await apiClient.delete(`/usuarios/${id}`);
};
