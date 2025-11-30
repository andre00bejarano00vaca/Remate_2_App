import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export const generarReporteRemate = async (remateNombre, pujas) => {
  try {
    // agrupar por lote
    const lotesMap = {};

    pujas.forEach((p) => {
      const loteId = p.lote.id;
      if (!lotesMap[loteId]) {
        lotesMap[loteId] = {
          nombre: p.lote.nombre,
          comprador: p.usuario.username,
          monto: p.monto,
        };
      } else {
        // seleccionar el monto mayor (ganador)
        if (p.monto > lotesMap[loteId].monto) {
          lotesMap[loteId] = {
            nombre: p.lote.nombre,
            comprador: p.usuario.username,
            monto: p.monto,
          };
        }
      }
    });

    const lotesArray = Object.values(lotesMap);

    // HTML del reporte
    const html = `
      <html>
      <body style="font-family: Arial; padding:20px;">
          <h1>Reporte del Remate</h1>
          <h2>${remateNombre}</h2>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 8px;">Lote</th>
                <th style="border: 1px solid black; padding: 8px;">Comprador</th>
                <th style="border: 1px solid black; padding: 8px;">Monto Ganador</th>
              </tr>
            </thead>
            <tbody>
              ${lotesArray
                .map(
                  (l) => `
                <tr>
                    <td style="border: 1px solid black; padding: 8px;">${l.nombre}</td>
                    <td style="border: 1px solid black; padding: 8px;">${l.comprador}</td>
                    <td style="border: 1px solid black; padding: 8px;">${l.monto}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
      </body>
      </html>
    `;

    // Generar el PDF
    const { uri } = await Print.printToFileAsync({ html });

    const pdfName =
      FileSystem.documentDirectory + `Reporte_${remateNombre}.pdf`;

    await FileSystem.moveAsync({
      from: uri,
      to: pdfName,
    });

    // Compartir el PDF
    await Sharing.shareAsync(pdfName, {
      mimeType: "application/pdf",
      dialogTitle: "Compartir reporte",
    });

    return pdfName;
  } catch (error) {
    console.error("Error PDF:", error);
  }
};
