export default async function finalizarLote(remateId, loteId) {
  const url = `https://testapp.digitaltelecom.net/api/remates/${remateId}/finalizar/${loteId}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la petición: ${response.status} - ${errorText}`);
    }

    // Detectamos el tipo de respuesta
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();  // evita el error "Unexpected character"
    }
  } catch (error) {
    console.error("Ocurrió un error al finalizar el lote:", error);
    throw error;
  }
}
