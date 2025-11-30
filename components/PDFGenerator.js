import React from "react";
import { Button } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function PDFGenerator({ data }) {
  const generarPDF = async () => {
    const prelancesHTML = data.prelances
      .map(p => `<tr><td>${p.postor}</td><td style="text-align:right;">$${p.monto.toLocaleString()}</td></tr>`)
      .join("");

    const html = `
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1 style="text-align:center; color:#2d3436;">${data.remate}</h1>
          <p style="text-align:center; color:#636e72;">${data.lugar} - ${data.fecha}</p>

          <h2>🐃 Detalle del Lote</h2>
          <p><strong>Lote N°:</strong> ${data.lote.numero}</p>
          <p><strong>Tipo:</strong> ${data.lote.tipo}</p>
          <p><strong>Cantidad:</strong> ${data.lote.cantidad}</p>
          <p><strong>Peso promedio:</strong> ${data.lote.pesoPromedio} kg</p>

          <h2>💰 Prelances</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr><th style="text-align:left;">Postor</th><th style="text-align:right;">Monto</th></tr>
            ${prelancesHTML}
          </table>

          <h2>🏆 Resultado Final</h2>
          <p><strong>Ganador:</strong> ${data.ganador}</p>
          <p style="font-size:18px; font-weight:bold; color:#00b894;">
            Precio Final: $${data.precioFinal.toLocaleString()}
          </p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return <Button title="Exportar PDF" onPress={generarPDF} />;
}
