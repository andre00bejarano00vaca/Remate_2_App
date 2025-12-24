import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { getAuctions } from '../services/auctionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RematesListScreen({ navigation }) {
  const [remates, setRemates] = useState([]);

  useEffect(() => {
    loadRemates();
  }, []);

  const loadRemates = async () => {
    const data = await getAuctions();
    setRemates(data);
  };

  const renderItem = ({ item }) => {
    const [fecha, hora] = item.fecha.split('T');

    return (
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.setItem('remate', `${item.id}`);
          navigation.navigate('LotesList', { remate: item });
        }}
      >
        <Card style={{ marginVertical: 5 }}>
          <Card.Title
            title={item.nombre}
            subtitle={`Fecha Inicio: ${fecha} | Hora de Inicio: ${hora}`}
          />
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={remates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}
