import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const formatearFechaPuja = (fecha) => {
  if (!fecha) return "—";

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) {
    const [dia, hora] = String(fecha).split("T");
    if (!dia) return String(fecha);
    const [y, m, d] = dia.split("-");
    const horaCorta = (hora || "").slice(0, 8);
    return horaCorta ? `${d}/${m}/${y} ${horaCorta}` : `${d}/${m}/${y}`;
  }

  return date.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const generarReporteRemate = async (remateNombre, pujas) => {
  try {
    if (!Array.isArray(pujas) || pujas.length === 0) {
      console.log("No hay pujas para el reporte");
      return;
    }

    const lotesMap = {};

    pujas.forEach((p) => {
      const loteId = p.lote?.id;
      if (loteId == null) return;

      const user = p.usuario || {};

      if (!lotesMap[loteId]) {
        const numero =
          p.lote?.numLote != null && String(p.lote.numLote).trim() !== ""
            ? String(p.lote.numLote)
            : String(loteId);
        lotesMap[loteId] = {
          numeroLote: numero,
          pujas: [],
        };
      }

      lotesMap[loteId].pujas.push({
        nombre: user.nombre || "Sin Nombre",
        ci: user.ci || "S/CI",
        correo: user.username || "S/D",
        celular: user.celular || "S/C",
        monto: Number(p.monto) || 0,
        fecha: formatearFechaPuja(p.fecha),
      });
    });

    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 15px; }
          h1 { text-align: center; color: #2c3e50; font-size: 22px; }
          h2 { color: #7f8c8d; font-size: 16px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8f9fa; color: #333; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; font-size: 11px; }
          .lote-header { background-color: #ffffff; font-weight: bold; vertical-align: middle; width: 12%; }
          .posicion { text-align: center; width: 36px; }
          .fecha { white-space: nowrap; font-size: 10px; color: #555; }
          .monto { font-weight: bold; color: #27ae60; white-space: nowrap; }
        </style>
      </head>
      <body>
          <h1>Reporte de Adjudicación</h1>
          <h2>Prelance: ${remateNombre || ""}</h2>

          <table>
            <thead>
              <tr>
                <th>Lote</th>
                <th>Pos.</th>
                <th>Nombre Completo</th>
                <th>C.I.</th>
                <th>Correo / User</th>
                <th>Celular</th>
                <th>Fecha / Hora</th>
                <th>Monto Puja</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(lotesMap)
                .map((lote) =>
                  lote.pujas
                    .map(
                      (p, index) => `
                  <tr>
                    ${
                      index === 0
                        ? `<td rowspan="${lote.pujas.length}" class="lote-header">${lote.numeroLote}</td>`
                        : ""
                    }
                    <td class="posicion">${index + 1}º</td>
                    <td>${p.nombre}</td>
                    <td>${p.ci}</td>
                    <td>${p.correo}</td>
                    <td>${p.celular}</td>
                    <td class="fecha">${p.fecha}</td>
                    <td class="monto">$${p.monto.toLocaleString()}</td>
                  </tr>
                `
                    )
                    .join("")
                )
                .join("")}
            </tbody>
          </table>
      </body>
      </html>
    `;

    // En Expo Go el archivo de Print no es legible. Pedimos el PDF en base64
    // y lo escribimos nosotros en cache de la app para poder compartirlo.
    const { base64 } = await Print.printToFileAsync({ html, base64: true });
    if (!base64) {
      throw new Error("No se recibió el PDF en base64");
    }

    const safeName = `Reporte_${String(remateNombre || "remate").replace(/[^\w\-]+/g, "_")}.pdf`;
    const localUri = `${FileSystem.cacheDirectory}${safeName}`;

    await FileSystem.writeAsStringAsync(localUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      await Print.printAsync({ html });
      return localUri;
    }

    // expo-sharing espera file:// (no content://)
    await Sharing.shareAsync(localUri, {
      mimeType: "application/pdf",
      dialogTitle: "Enviar Reporte de Prelance",
      UTI: "com.adobe.pdf",
    });

    return localUri;
  } catch (error) {
    console.error("Error al generar PDF:", error);
  }
};
