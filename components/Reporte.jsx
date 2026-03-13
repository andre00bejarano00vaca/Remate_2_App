import React, { useEffect, useState } from "react";
import { Button, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generarReporteRemate } from "./generarReporteRemate";

export default function ReporteScreen({remateId, remateName}) {
  const [datos, setDatos] = useState(null);

  const remateNombre = `${remateName}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("remate id: " , remateId)

        const res = await fetch(
          `https://testapp.digitaltelecom.net/api/pujas/informe/npujas/${remateId}`
        );
        const data = await res.json();
        setDatos(data)
        console.log("Datos cargados:", data);
      } catch (error) {
        console.log("Error cargando datos:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={{ marginTop: 50 }}>
      <Button
        title="Generar Reporte PDF"
        onPress={() => {
          if (!datos) {
            console.log("Todavía no hay datos cargados");
            return;
          }
          generarReporteRemate(remateNombre, datos);
        }}
      />
    </View>
  );
}
