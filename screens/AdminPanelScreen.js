import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Title, IconButton, Text } from "react-native-paper";
import { CattleColors } from "../styles/colors";

export default function AdminPanelScreen() {
  const [url, setUrl] = useState("");
  const [epmuras, setEpmuras] = useState("");
  const [raza, setRaza] = useState("");
  const [pesoPromedio, setPesoPromedio] = useState("");
  const [genetica, setGenetica] = useState("");
  const [vacunas, setVacunas] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [montoPuja, setMontoPuja] = useState("");
  const [prelance, setPrelance] = useState("");
  const [familiares, setFamiliares] = useState([]);
  const [loading, setLoading] = useState(false);

  const agregarFamiliar = () => {
    setFamiliares([...familiares, { tipo: "", nombre: "", url: "" }]);
  };

  const actualizarFamiliar = (index, field, value) => {
    const nuevos = [...familiares];
    nuevos[index][field] = value;
    setFamiliares(nuevos);
  };

  const eliminarFamiliar = (index) => {
    const nuevos = [...familiares];
    nuevos.splice(index, 1);
    setFamiliares(nuevos);
  };

  const handleGuardar = async () => {
    if (!url || !raza || !pesoPromedio || !youtubeLink || !montoPuja) {
      Alert.alert("Error", "Completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        url,
        epmuras,
        raza,
        pesoPromedio: parseFloat(pesoPromedio),
        genetica,
        vacunas,
        youtubeLink,
        montoPuja: parseFloat(montoPuja),
        prelance: parseFloat(prelance || 0),
        familiares, // array de objetos { tipo, nombre, url }
      };

      const response = await fetch("http://192.168.1.100:8080/admin/crear-vaca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la información");
      }

      Alert.alert("Éxito", "Información guardada correctamente");
      // Limpiar formulario
      setUrl(""); setEpmuras(""); setRaza(""); setPesoPromedio("");
      setGenetica(""); setVacunas(""); setYoutubeLink(""); setMontoPuja("");
      setPrelance(""); setFamiliares([]);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Panel Administrador - Subir Vaca</Title>

      <TextInput label="URL" value={url} onChangeText={setUrl} style={styles.input} />
      <TextInput label="Epmuras / Estadísticas" value={epmuras} onChangeText={setEpmuras} style={styles.input} multiline />
      <TextInput label="Raza" value={raza} onChangeText={setRaza} style={styles.input} />
      <TextInput label="Peso promedio" value={pesoPromedio} onChangeText={setPesoPromedio} style={styles.input} keyboardType="numeric" />
      <TextInput label="Genética" value={genetica} onChangeText={setGenetica} style={styles.input} />
      <TextInput label="Vacunas" value={vacunas} onChangeText={setVacunas} style={styles.input} />
      <TextInput label="Link de YouTube" value={youtubeLink} onChangeText={setYoutubeLink} style={styles.input} />
      <TextInput label="Monto puja inicial" value={montoPuja} onChangeText={setMontoPuja} style={styles.input} keyboardType="numeric" />
      <TextInput label="Prelance" value={prelance} onChangeText={setPrelance} style={styles.input} keyboardType="numeric" />

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Familiares</Text>
        {familiares.map((f, index) => (
          <View key={index} style={{ marginBottom: 10, borderWidth: 1, borderColor: CattleColors.mediumLightGray, padding: 10, borderRadius: 8 }}>
            <TextInput
              label="Tipo (padre, madre, abuelo, primo, hermano/a)"
              value={f.tipo}
              onChangeText={(val) => actualizarFamiliar(index, "tipo", val)}
              style={styles.input}
            />
            <TextInput
              label="Nombre"
              value={f.nombre}
              onChangeText={(val) => actualizarFamiliar(index, "nombre", val)}
              style={styles.input}
            />
            <TextInput
              label="URL"
              value={f.url}
              onChangeText={(val) => actualizarFamiliar(index, "url", val)}
              style={styles.input}
            />
            <Button mode="outlined" onPress={() => eliminarFamiliar(index)} style={{ marginTop: 5 }}>Eliminar</Button>
          </View>
        ))}
        <Button mode="contained" onPress={agregarFamiliar} style={{ marginTop: 10 }}>Agregar Familiar</Button>
      </View>

      <Button mode="contained" onPress={handleGuardar} loading={loading} style={styles.button}>
        Guardar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: CattleColors.primary, textAlign: "center" },
  input: { marginBottom: 10, backgroundColor: CattleColors.white },
  button: { marginTop: 20, paddingVertical: 12, backgroundColor: CattleColors.primary },
});
