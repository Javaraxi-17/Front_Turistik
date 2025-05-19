import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { getItineraryHistory } from '../services/itineraryHistoryService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extender el tipo RootStackParamList para incluir ItineraryDetail
export type ExtendedRootStackParamList = RootStackParamList & {
  ItineraryDetail: { itinerary: ItineraryHistoryItem };
};

interface Route {
  id: number;
  name: string;
  description: string;
  duration: string;
  distance: string;
  coordinates: string;
  registration_date: string;
  user: {
    id: number;
    name: string;
  };
}

interface Place {
  id: number;
  name: string;
  data: {
    [key: string]: {
      nombre: string;
      costo_promedio: string;
      recomendaciones: string;
      notas: string;
      coordenadas: string;
    };
  };
}

interface ItineraryHistoryItem {
  Route_ID: number;
  TouristPlace_ID: number;
  Order_Number: number;
  route: Route;
  place: Place;
}

export default function ItineraryHistoryScreen() {
  const navigation = useNavigation<ExtendedRootStackParamList>();
  const route = useRoute();
  const [itineraries, setItineraries] = useState<ItineraryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          throw new Error('No user ID found');
        }
        const data = await getItineraryHistory(parseInt(userId));
        setItineraries(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  const renderItineraryItem = ({ item }: { item: ItineraryHistoryItem }) => (
    <TouchableOpacity 
      style={styles.itineraryItem}
      onPress={() => {
        navigation.navigate({
          name: 'ItineraryHistoryDetail',
          params: { itinerary: item }
        });
      }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{item.route.name}</Text>
        <Text style={styles.date}>{new Date(item.route.registration_date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.stats}>
          <Text style={styles.stat}>Duración: {item.route.duration}</Text>
          <Text style={styles.stat}>Distancia: {item.route.distance}</Text>
        </View>
      </View>
      <View style={styles.places}>
        {Object.values(item.place.data).map((place, index) => (
          <Text key={index} style={styles.place}>
            {index + 1}. {place.nombre}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Historial de Itinerarios</Text>
      <FlatList
        data={itineraries}
        renderItem={renderItineraryItem}
        keyExtractor={(item) => item.Route_ID.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itineraryItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    fontSize: 14,
    color: '#666',
  },
  places: {
    marginTop: 8,
  },
  place: {
    fontSize: 14,
    color: '#333',
  },
});

export default ItineraryHistoryScreen;
