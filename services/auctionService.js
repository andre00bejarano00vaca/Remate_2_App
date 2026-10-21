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

export const getAuctionById = async (id) => {
  const response = await apiClient.get(`/remates/${id}`);
  return response.data;
};

function apiError(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.error) return String(data.error);
  if (data?.message) return String(data.message);
  if (error?.response?.status === 403) {
    return "Acceso denegado (403). Si personalizaste incrementos, redeployá el backend o revisá el proxy.";
  }
  if (error?.response?.status === 401) {
    return "Sesión expirada. Volvé a iniciar sesión.";
  }
  return error?.message || fallback;
}

export const createAuction = async (payload) => {
  try {
    const response = await apiClient.post("/remates", payload);
    return response.data;
  } catch (error) {
    throw new Error(apiError(error, "No se pudo crear el prelance"));
  }
};

export const updateAuction = async (id, payload) => {
  try {
    const response = await apiClient.put(`/remates/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(apiError(error, "No se pudo actualizar el prelance"));
  }
};

/** Guarda solo la regla. null = incremento por defecto. */
export const updateAuctionRegla = async (id, reglaIncremento) => {
  try {
    const response = await apiClient.put(`/remates/${id}/regla-incremento`, {
      reglaIncremento:
        reglaIncremento == null ? null : JSON.stringify(reglaIncremento),
    });
    return response.data;
  } catch (error) {
    throw new Error(apiError(error, "No se pudo guardar la regla de incrementos"));
  }
};

export const deleteAuction = async (id) => {
  await apiClient.delete(`/remates/${id}`);
};
