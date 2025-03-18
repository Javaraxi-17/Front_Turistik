import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, MapType } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// Datos de ejemplo para las recomendaciones
const mockRecommendations = [
  {
    id: '1',
    name: 'Parque Nacional Sierra Nevada',
    rating: 4.8,
    reviews: 128,
    description: 'Espectacular parque nacional con vistas panorámicas y senderos para todos los niveles.',
    image: 'https://api.a0.dev/assets/image?text=beautiful%20mountain%20national%20park%20with%20hiking%20trails&aspect=16:9'
  },
  {
    id: '2',
    name: 'Restaurante El Mirador',
    rating: 4.5,
    reviews: 256,
    description: 'Cocina local con las mejores vistas de la ciudad. Perfecto para parejas.',
    image: 'https://api.a0.dev/assets/image?text=romantic%20restaurant%20with%20city%20view&aspect=16:9'
  },
  {
    id: '3',
    name: 'Museo de Arte Contemporáneo',
    rating: 4.6,
    reviews: 89,
    description: 'Exposiciones únicas de artistas locales e internacionales en un edificio histórico.',
    image: 'https://api.a0.dev/assets/image?text=modern%20art%20museum%20interior&aspect=16:9'
  }
];

const Header = () => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <View style={styles.logoContainer}>
        <MaterialCommunityIcons name="compass-outline" size={24} color="#FF385C" />
        <Text style={styles.logoText}>Turistik</Text>
      </View>
      <TouchableOpacity style={styles.profileButton}>
        <MaterialCommunityIcons name="account-circle" size={24} color="#333" />
        <Text style={styles.profileText}>Juan</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const PlaceCard = ({ place }) => (
  <TouchableOpacity style={styles.card}>
    <Image
      source={{ uri: place.image }}
      style={styles.cardImage}
    />
    <View style={styles.cardContent}>
      <Text style={styles.placeName}>{place.name}</Text>
      <View style={styles.ratingContainer}>
        <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
        <Text style={styles.rating}>{place.rating}</Text>
        <Text style={styles.reviews}>({place.reviews} reseñas)</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {place.description}
      </Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Agregar al itinerario</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function MainHomeScreen() {
  const [mapType, setMapType] = useState<MapType>('standard');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header />
      
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[0]}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            mapType={mapType}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
          <TouchableOpacity
            style={styles.mapTypeButton}
            onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          >
            <MaterialCommunityIcons 
              name={mapType === 'standard' ? 'satellite-variant' : 'map'} 
              size={24} 
              color="#FF385C" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.recommendationsContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'white']}
            style={styles.recommendationsGradient}
          />
          <Text style={styles.sectionTitle}>Recomendaciones para ti</Text>
          <View style={styles.recommendationsList}>
            {mockRecommendations.map(place => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#FF385C',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 20,
  },
  profileText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapTypeButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendationsContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  recommendationsGradient: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    height: 50,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  recommendationsList: {
    gap: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#FF385C',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});