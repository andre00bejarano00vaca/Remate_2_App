import React, { useEffect, useState } from "react";
import { Button, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generarReporteRemate } from "./generarReporteRemate";

export default function ReporteScreen() {
  const [datos, setDatos] = useState(null);

  const remateNombre = "Remate Otoño";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const remateId = await AsyncStorage.getItem("remate");

        const res = await fetch(
          `http://192.168.0.116:8080/api/pujas/informe/${remateId}`
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
