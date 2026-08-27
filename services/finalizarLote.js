import apiClient from "../api/apiClient";

export default async function finalizarLote(remateId, loteId) {
  const response = await apiClient.put(
    `/remates/${remateId}/finalizar/${loteId}`
  );
  return response.data;
}
