import apiClient from "../api/apiClient";

/** Finaliza el prelance completo (ya no requiere loteId). */
export default async function finalizarLote(remateId) {
  const response = await apiClient.put(`/remates/${remateId}/finalizar`);
  return response.data;
}
