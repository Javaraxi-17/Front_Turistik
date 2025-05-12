import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { generateItineraryAIFromPlaces } from '../services/aiService';
import * as authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PlaceResult } from '../services/placesService';
import { useAuth } from '../context/AuthContext';

interface ItineraryDetailScreenParams {
  selectedPlaces: PlaceResult[];
}

type ItineraryDetailScreenRouteProp = RouteProp<{
  params: ItineraryDetailScreenParams;
}, 'params'>;

export default function ItineraryDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ItineraryDetailScreenRouteProp>();
  const [places, setPlaces] = React.useState<PlaceResult[]>(route.params?.selectedPlaces || []);
  const [loading, setLoading] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<string | null>(null);

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
          <Text style={{marginTop: 10}}>Generando itinerario...</Text>
        </View>
      )}
      <Text style={styles.title}>Detalles del Itinerario</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {places.length === 0 ? (
          <Text style={styles.empty}>No hay lugares en tu itinerario.</Text>
        ) : (
          places.map(place => (
            <View key={place.id} style={styles.card}>
              {place.photoUrl && <Image source={{ uri: place.photoUrl }} style={styles.image} />}
              <View style={styles.info}>
                <Text style={styles.name}>{place.name}</Text>
                <Text style={styles.desc}>{place.description}</Text>
                {place.rating && <Text style={styles.rating}>⭐ {place.rating}</Text>}
                <Text style={styles.distance}>{place.distance}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(place.id)}>
                  <MaterialCommunityIcons name="delete" size={22} color="#fff" />
                  <Text style={styles.removeText}>Quitar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          <Text style={styles.footerBtnText}>Regresar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#3b82f6', marginLeft: 10 }]} onPress={handleStart}>

          <MaterialCommunityIcons name="map-marker-path" size={22} color="#fff" />
          <Text style={styles.footerBtnText}>Iniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF385C',
    marginBottom: 18,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  empty: {
    color: '#bbb',
    fontSize: 18,
    marginTop: 40,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    marginBottom: 18,
    padding: 10,
    alignItems: 'center',
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  desc: {
    color: '#666',
    fontSize: 15,
    marginBottom: 4,
  },
  rating: {
    fontSize: 15,
    color: '#FFB300',
  },
  distance: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 8,
  },
  footerBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});
