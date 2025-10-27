import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { getLotsByRemate } from '../services/lotService';

export default function RemateDetailScreen({ route, navigation }) {
  const { remate } = route.params;
  const [lotes, setLotes] = useState([]);

  useEffect(() => {
    loadLotes();
  }, []);

  const loadLotes = async () => {
    const data = await getLotsByRemate(remate.id);
    setLotes(data);
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Remate: {remate.nombre}
      </Text>
      <FlatList
        data={lotes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('LoteDetail', { lote: item })}>
            <Card style={{ marginVertical: 5 }}>
              <Card.Title title={item.nombre} subtitle={`Raza: ${item.raza} | Precio: ${item.precio}`} />
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
