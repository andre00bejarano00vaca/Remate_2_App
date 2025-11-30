import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
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

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={remates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={ async () => {
            await AsyncStorage.setItem("remate",`${item.id}`)
            navigation.navigate("LotesList", { remate: item });
}}>
            <Card style={{ marginVertical: 5 }}>
              <Card.Title title={item.nombre} subtitle={`Fecha: ${item.fecha}`} />
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
