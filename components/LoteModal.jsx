import React, { useState, useEffect } from "react";
import { apiBaseUrl } from "../config/env";
import { View } from "react-native";
import { Modal, Portal, TextInput, Button, Title, List } from "react-native-paper";

const LoteModal = ({ visible, onDismiss, editingLot, onSave }) => {
  const [nombre, setNombre] = useState(editingLot?.nombre || "");
  const [precio, setPrecio] = useState(editingLot?.precio?.toString() || "");
  const [raza, setRaza] = useState(editingLot?.raza || "");
  const [remateSeleccionado, setRemateSeleccionado] = useState(editingLot?.remate || null);
  const [remates, setRemates] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/remates`) // 🔧 ajusta esta ruta
      .then(res => res.json())
      .then(data => setRemates(data))
      .catch(err => console.error("Error cargando remates:", err));
  }, []);

  const handleSave = () => {
    const nuevoLote = {
      nombre,
      precio: parseFloat(precio),
      raza,
      remate: remateSeleccionado,
      visible: true,
    };
    onSave(nuevoLote);
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ backgroundColor: "white", padding: 20, margin: 20, borderRadius: 12 }}>
        <Title>{editingLot ? "Editar Lote" : "Crear Lote"}</Title>

        <TextInput label="Nombre" value={nombre} onChangeText={setNombre} style={{ marginBottom: 10 }} />
        <TextInput label="Precio" value={precio} onChangeText={setPrecio} keyboardType="numeric" style={{ marginBottom: 10 }} />
        <TextInput label="Raza" value={raza} onChangeText={setRaza} style={{ marginBottom: 10 }} />

        {/* 🔽 Selector de Remate */}
        <List.Section title="Seleccionar Remate">
          <List.Accordion
            title={remateSeleccionado ? `Remate: ${remateSeleccionado.nombre}` : "Elegir un remate"}
            expanded={expanded}
            onPress={() => setExpanded(!expanded)}
          >
            {remates.map(r => (
              <List.Item
                key={r.id}
                title={r.nombre}
                onPress={() => {
                  setRemateSeleccionado(r);
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

export default LoteModal;
