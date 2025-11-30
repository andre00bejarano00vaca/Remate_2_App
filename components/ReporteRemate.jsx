import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const ReporteRemate = ({ data }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>{data.remate}</Text>
      <Text style={styles.subtitulo}>{data.lugar}</Text>
      <Text style={styles.fecha}>📅 {data.fecha}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐃 Detalle del Lote</Text>
        <Text>Lote N° {data.lote.numero}</Text>
        <Text>Tipo: {data.lote.tipo}</Text>
        <Text>Cantidad: {data.lote.cantidad}</Text>
        <Text>Peso promedio: {data.lote.pesoPromedio} kg</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Prelances</Text>
        {data.prelances.map((p, i) => (
          <View key={i} style={styles.row}>
            <Text>{p.postor}</Text>
            <Text>${p.monto.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Resultado Final</Text>
        <Text style={styles.ganador}>Ganador: {data.ganador}</Text>
        <Text style={styles.precioFinal}>
          Precio Final: ${data.precioFinal.toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  titulo: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#2d3436" },
  subtitulo: { fontSize: 16, textAlign: "center", color: "#636e72" },
  fecha: { textAlign: "center", marginBottom: 20, color: "#636e72" },
  section: { marginBottom: 20, padding: 10, borderWidth: 1, borderColor: "#dfe6e9", borderRadius: 10 },
  sectionTitle: { fontWeight: "bold", marginBottom: 8, fontSize: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  ganador: { fontSize: 16, fontWeight: "bold", color: "#0984e3" },
  precioFinal: { fontSize: 18, fontWeight: "bold", color: "#00b894", marginTop: 4 },
});

export default ReporteRemate;
