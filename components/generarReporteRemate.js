import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export const generarReporteRemate = async (remateNombre, pujas) => {
  try {
    const lotesMap = {};

    // 1. Agrupar y extraer datos según tu JSON
    pujas.forEach((p) => {
      const loteId = p.lote.id;
      const user = p.usuario; // Objeto usuario del JSON

      if (!lotesMap[loteId]) {
        lotesMap[loteId] = {
          nombreLote: p.lote.nombre,
          pujas: [] 
        };
      }
      
      lotesMap[loteId].pujas.push({
        nombre: user.nombre || "Sin Nombre",
        ci: user.ci || "S/CI",
        correo: user.username || "S/D",
        celular: user.celular || "S/C",
        monto: p.monto
      });
    });

    // 2. Construcción del HTML
    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 15px; }
          h1 { text-align: center; color: #2c3e50; font-size: 22px; }
          h2 { color: #7f8c8d; font-size: 16px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8f9fa; color: #333; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
          .lote-header { background-color: #ffffff; font-weight: bold; vertical-align: middle; width: 15%; }
          .posicion { text-align: center; width: 40px; }
          .monto { font-weight: bold; color: #27ae60; }
        </style>
      </head>
      <body>
          <h1>Reporte de Adjudicación</h1>
          <h2>Remate: ${remateNombre}</h2>

          <table>
            <thead>
              <tr>
                <th>Lote</th>
                <th>Pos.</th>
                <th>Nombre Completo</th>
                <th>C.I.</th>
                <th>Correo / User</th>
                <th>Celular</th>
                <th>Monto Puja</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(lotesMap).map((lote) => 
                lote.pujas.map((p, index) => `
                  <tr>
                    ${index === 0 
                      ? `<td rowspan="${lote.pujas.length}" class="lote-header">${lote.nombreLote}</td>` 
                      : "" 
                    }
                    <td class="posicion">${index + 1}º</td>
                    <td>${p.nombre}</td>
                    <td>${p.ci}</td>
                    <td>${p.correo}</td>
                    <td>${p.celular}</td>
                    <td class="monto">$${p.monto.toLocaleString()}</td>
                  </tr>
                `).join("")
              ).join("")}
            </tbody>
          </table>
      </body>
      </html>
    `;

    // 3. Generación y Envío del PDF
    const { uri } = await Print.printToFileAsync({ html });
    const pdfName = FileSystem.documentDirectory + `Reporte_${remateNombre.replace(/\s+/g, '_')}.pdf`;

    await FileSystem.moveAsync({ from: uri, to: pdfName });
    await Sharing.shareAsync(pdfName, {
      mimeType: "application/pdf",
      dialogTitle: "Enviar Reporte de Remate",
    });

    return pdfName;
  } catch (error) {
    console.error("Error al generar PDF:", error);
  }
};
