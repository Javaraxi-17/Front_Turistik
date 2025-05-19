import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

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

type ItineraryHistoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'ItineraryHistoryDetail'>;

export default function ItineraryHistoryDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ItineraryHistoryDetailScreenRouteProp>();
  const [loading, setLoading] = React.useState(false);
  const itinerary = route.params?.itinerary as ItineraryHistoryItem;

  // Handler para el botón Iniciar
  const handleStart = async () => {
    setLoading(true);
    try {
      // Leer userId de AsyncStorage (React Native)
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        alert('No se encontró el usuario logueado.');
        setLoading(false);
        return;
      }
      const result = await generateItineraryAIFromPlaces(places, Number(userId));
      const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiText) {
        // @ts-ignore
        navigation.navigate('ItineraryResultScreen', { aiResult: aiText });
      } else {
        alert('No se pudo obtener el itinerario.');
      }
    } catch (e) {
      alert('Error al iniciar itinerario');
    } finally {
      setLoading(false);
    }
  };



  const handleRemove = (id: string) => {
    setPlaces(prev => prev.filter(p => p.id !== id));
  };



  return (
    <View style={styles.container}>
      {loading && (
        <View style={{
          position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center'
        }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {itinerary ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{itinerary.route.name}</Text>
              <Text style={styles.date}>{new Date(itinerary.route.registration_date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.sectionContent}>{itinerary.route.description}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalles del Recorrido</Text>
              <View style={styles.stats}>
                <Text style={styles.stat}>Duración: {itinerary.route.duration}</Text>
                <Text style={styles.stat}>Distancia: {itinerary.route.distance}</Text>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lugares en el Recorrido</Text>
              {Object.values(itinerary.place.data).map((place, index) => (
                <View key={index} style={styles.placeItem}>
                  <Text style={styles.placeNumber}>{index + 1}.</Text>
                  <View style={styles.placeDetails}>
                    <Text style={styles.placeName}>{place.nombre}</Text>
                    <Text style={styles.placeNote}>{place.notas}</Text>
                    <Text style={styles.placeRecommendation}>{place.recomendaciones}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.empty}>No se encontraron detalles del itinerario.</Text>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.footerBtnText}>Regresar</Text>
        </TouchableOpacity>
      </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  empty: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  header: {
    marginBottom: 24,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    fontSize: 14,
    color: '#666',
  },
  placeItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  placeNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  placeDetails: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  placeRecommendation: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },
  footerBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});
