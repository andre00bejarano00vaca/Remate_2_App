import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Modal, Portal, TextInput, Button, Title, List } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

const RemateModal = ({ visible, onDismiss, editingAuction, onSave }) => {
  const [nombre, setNombre] = useState(editingAuction?.nombre || "");
  const [fecha, setFecha] = useState(
    editingAuction?.fecha ? new Date(editingAuction.fecha) : new Date()
  );
  const [urlListaLotes, setUrlListaLotes] = useState(editingAuction?.urlListaLotes || "");
  const [estado, setEstado] = useState(editingAuction?.estado || "");
  const [cabanaSeleccionada, setCabanaSeleccionada] = useState(editingAuction?.cabana || null);
  const [cabanas, setCabanas] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // 🔹 Fetch de cabañas desde el backend
  useEffect(() => {
    fetch("https://testapp.digitaltelecom.net/api/cabanas") // 🔧 ajusta esta ruta a tu API real
      .then(res => res.json())
      .then(data => setCabanas(data))
      .catch(err => console.error("Error cargando cabañas:", err));
  }, []);

  const handleSave = () => {
    const nuevoRemate = {
      nombre,
      fecha: fecha.toISOString().split("T")[0], // formato YYYY-MM-DD
      urlListaLotes,
      estado,
      visible: true,
      cabana: cabanaSeleccionada,
    };
    onSave(nuevoRemate);
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ backgroundColor: "white", padding: 20, margin: 20, borderRadius: 12 }}>
        <Title>{editingAuction ? "Editar Remate" : "Crear Remate"}</Title>

        <TextInput
          label="Nombre del remate"
          style={{ marginBottom: 10 }}
          value={nombre}
          onChangeText={setNombre}
        />

        {/* 📅 Fecha con DateTimePicker */}
        <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={{ marginBottom: 10 }}>
          {`Fecha: ${fecha.toISOString().split("T")[0]}`}
        </Button>

        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="calendar"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setFecha(selectedDate);
            }}
          />
        )}

        <TextInput
          label="URL de lista de lotes"
          style={{ marginBottom: 10 }}
          value={urlListaLotes}
          onChangeText={setUrlListaLotes}
        />

        <TextInput
          label="Estado"
          style={{ marginBottom: 10 }}
          value={estado}
          onChangeText={setEstado}
        />

        {/* 🏠 Selector de Cabaña */}
        <List.Section title="Seleccionar Cabaña">
          <List.Accordion
            title={
              cabanaSeleccionada
                ? `Cabaña seleccionada: ${cabanaSeleccionada.nombre}`
                : "Elegir una cabaña"
            }
            expanded={expanded}
            onPress={() => setExpanded(!expanded)}
          >
            {cabanas.map(c => (
              <List.Item
                key={c.id}
                title={c.nombre}
                onPress={() => {
                  setCabanaSeleccionada(c);
                  setExpanded(false);
                }}
              />
            ))}
          </List.Accordion>
        </List.Section>

        <Button mode="contained" onPress={handleSave}>
          Guardar
        </Button>
      </Modal>
    </Portal>
  );
};

export default RemateModal;
