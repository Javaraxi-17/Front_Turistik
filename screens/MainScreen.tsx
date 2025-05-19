import React, { useState, useRef, useEffect  } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocationAndPlaces } from '../hooks/useLocationAndPlaces';
import { usePanelAnimation } from '../hooks/usePanelAnimation';
import { useSearchBar } from '../hooks/useSearchBar';
import { useTheme } from '@/context/ThemeContext';
import { getRecommendedPlaces, PlaceResult } from '../services/placesService';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import PlaceCard from '../components/PlaceCard';
import SelectedPlacesPanel from '../components/SelectedPlacesPanel';
import { useAuth } from '@/context/AuthContext';
import * as Location from 'expo-location';

import { NavigationProp } from '@react-navigation/native';

import { getRecomendacionFromUserAnswers, getRandomPlaceTypeFromResponse } from '../services/aiService';
import { RootStackParamList } from '../types/navigation';
// Traducción simple para mapear búsqueda a tipo Google Places:
const typeMap: Record<string, string> = {
  'contabilidad': 'accounting',
  'aeropuerto': 'airport',
  'parque de diversiones': 'amusement_park',
  'acuario': 'aquarium',
  'galería de arte': 'art_gallery',
  'cajero automático': 'atm',
  'panadería': 'bakery',
  'banco': 'bank',
  'bar': 'bar',
  'salón de belleza': 'beauty_salon',
  'tienda de bicicletas': 'bicycle_store',
  'librería': 'book_store',
  'bolera': 'bowling_alley',
  'estación de autobuses': 'bus_station',
  'cafetería': 'cafe',
  'campamento': 'campground',
  'concesionario de autos': 'car_dealer',
  'alquiler de autos': 'car_rental',
  'taller mecánico': 'car_repair',
  'lavado de autos': 'car_wash',
  'cementerio': 'cemetery',
  'iglesia': 'church',
  'ayuntamiento': 'city_hall',
  'tienda de ropa': 'clothing_store',
  'tienda de conveniencia': 'convenience_store',
  'palacio de justicia': 'courthouse',
  'dentista': 'dentist',
  'tienda departamental': 'department_store',
  'doctor': 'doctor',
  'electricista': 'electrician',
  'tienda de electrónica': 'electronics_store',
  'embajada': 'embassy',
  'estación de bomberos': 'fire_station',
  'floristería': 'florist',
  'funeraria': 'funeral_home',
  'tienda de muebles': 'furniture_store',
  'gasolinera': 'gas_station',
  'gimnasio': 'gym',
  'cuidado del cabello': 'hair_care',
  'ferretería': 'hardware_store',
  'templo hindú': 'hindu_temple',
  'tienda de artículos para el hogar': 'home_goods_store',
  'hospital': 'hospital',
  'agencia de seguros': 'insurance_agency',
  'joyería': 'jewelry_store',
  'lavandería': 'laundry',
  'abogado': 'lawyer',
  'biblioteca': 'library',
  'estación de tren ligero': 'light_rail_station',
  'licorería': 'liquor_store',
  'oficina de gobierno local': 'local_government_office',
  'cerrajero': 'locksmith',
  'alojamiento': 'lodging',
  'entrega de comida': 'meal_delivery',
  'comida para llevar': 'meal_takeaway',
  'mezquita': 'mosque',
  'renta de películas': 'movie_rental',
  'cine': 'movie_theater',
  'empresa de mudanzas': 'moving_company',
  'museo': 'museum',
  'club nocturno': 'night_club',
  'pintor': 'painter',
  'parque': 'park',
  'estacionamiento': 'parking',
  'tienda de mascotas': 'pet_store',
  'farmacia': 'pharmacy',
  'fisioterapeuta': 'physiotherapist',
  'plomero': 'plumber',
  'policía': 'police',
  'oficina de correos': 'post_office',
  'escuela primaria': 'primary_school',
  'agencia inmobiliaria': 'real_estate_agency',
  'restaurante': 'restaurant',
  'contratista de techos': 'roofing_contractor',
  'parque de casas rodantes': 'rv_park',
  'escuela': 'school',
  'escuela secundaria': 'secondary_school',
  'tienda de zapatos': 'shoe_store',
  'centro comercial': 'shopping_mall',
  'spa': 'spa',
  'estadio': 'stadium',
  'almacenamiento': 'storage',
  'tienda': 'store',
  'estación de metro': 'subway_station',
  'supermercado': 'supermarket',
  'sinagoga': 'synagogue',
  'parada de taxi': 'taxi_stand',
  'atracción turística': 'tourist_attraction',
  'estación de tren': 'train_station',
  'estación de tránsito': 'transit_station',
  'agencia de viajes': 'travel_agency',
  'universidad': 'university',
  'cuidado veterinario': 'veterinary_care',
  'zoologico': 'zoo',
};

/* ---------- Estilos de mapa oscuro ---------- */
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f2f2f' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
];

/* ---------- Componente de Mapa ------------ */
type MapProps = { userLocation: { latitude: number; longitude: number } | null; places: PlaceResult[] };

const MapComponent: React.FC<MapProps> = ({ userLocation, places }) => {
  const { isDarkMode } = useTheme();

  /* región que se actualiza cuando cambia userLocation */
  const region = userLocation
    ? { ...userLocation, latitudeDelta: 0.0122, longitudeDelta: 0.0121 }
    : { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      region={region}
      showsUserLocation
      customMapStyle={isDarkMode ? darkMapStyle : []}
    >
      {/* marcador manual (opcional) */}
      {userLocation && (
        <Marker
          coordinate={userLocation}
          title="Tu ubicación actual"
        />
      )}

      {/* marcadores de lugares */}
      {places.map(p => (
        <Marker key={p.id} coordinate={p.location}>
          <Callout tooltip>
            <View style={{ width: 200 }}>
              {p.photoUrl && (
                <Image
                  source={{ uri: p.photoUrl }}
                  style={{ width: '100%', height: 90, borderTopLeftRadius: 6, borderTopRightRadius: 6 }}
                />
              )}
              <View style={{ padding: 6, backgroundColor: '#fff', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
                <Text style={{ fontWeight: '600' }}>{p.name}</Text>
                <Text>{p.description}</Text>
                {p.rating && <Text>⭐ {p.rating}</Text>}
                <Text>{p.distance}</Text>
              </View>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
};

/* ---------- Pantalla Principal ------------- */
import { PanResponder } from 'react-native';

type RootStackParamList = {
  ItineraryDetail: { selectedPlaces: PlaceResult[] };
  ItineraryHistory: undefined;
  // otras rutas que tengas...
};

export default function MainScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { colors, isDarkMode } = useTheme();

  const handleCloseSearchBar = () => {
  setSearchQuery(''); // limpia búsqueda
  closeSearchBar();   // cierra barra
};

  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedPlaces, setSelectedPlaces] = useState<PlaceResult[]>([]);
  const [showChecklistPanel, setShowChecklistPanel] = useState(false);

  const { isPanelOpen, togglePanel, placesContainerHeight } = usePanelAnimation();
  const { isSearchVisible, openSearchBar, closeSearchBar, searchBarWidth } = useSearchBar();

  const itineraryAnim = useRef(new Animated.Value(0)).current;

  // Obtener la ubicación del usuario para centrar mapa y petición
  const [userLocation, setUserLocation] = useState<{latitude:number, longitude:number} | null>(null);

  // Solicitar ubicación una sola vez al montar
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const { coords } = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
      } catch {
        setUserLocation(null);
      }
    })();
  }, []);

  // Traduce búsqueda a tipo Google Places
  const getTypeFromSearch = async (query: string): Promise<string> => {
    if (!query.trim()) {
      try {
        const recomendacion = await getRecomendacionFromUserAnswers();
        console.log(recomendacion);
        const recomendado = getRandomPlaceTypeFromResponse(recomendacion);
        if (recomendado) return recomendado;
        else return 'restaurant,grocery_or_supermarket,museum';
      } catch (e) {
        console.warn('No se pudo obtener tipo recomendado, usando default:', e);
        return 'restaurant,grocery_or_supermarket,museum';
      }
    }
    const lower = query.toLowerCase().trim();
    return typeMap[lower] || lower;
  };

  // Llamar getRecommendedPlaces cada vez que cambia searchQuery o userLocation
  useEffect(() => {
    let isCancelled = false;
    if (searchQuery.trim() !== '' && !isPanelOpen) {
    togglePanel();
    }
    if (!userLocation) return;

    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const type = await getTypeFromSearch(searchQuery);
        const results = await getRecommendedPlaces(1500, type, 15);
        if (!isCancelled) setPlaces(results);
      } catch (e) {
        if (!isCancelled) setPlaces([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchPlaces();

    return () => { isCancelled = true; };
  }, [searchQuery, userLocation]);

  // Navegar a detalle de itinerario
  const handleCreateItinerary = () => {
    navigation.navigate('ItineraryDetail', { selectedPlaces });
    console.log(selectedPlaces);
  };

  // Añadir lugar a selección
  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedPlaces(prev => [...prev, place]);
  };

  const handleClearPlaces = () => {
    setSelectedPlaces([]);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <SelectedPlacesPanel
          visible={showChecklistPanel}
          onClose={() => setShowChecklistPanel(false)}
          selectedPlaces={selectedPlaces}
          onCreateItinerary={handleCreateItinerary}
          onClearPlaces={handleClearPlaces}
        />

        {/* FABs */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={openSearchBar}
            activeOpacity={0.85}
            accessibilityLabel="Buscar lugares"
          >
            <MaterialCommunityIcons name="magnify" size={28} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.miniFab}
            onPress={() => setShowChecklistPanel(true)}
            activeOpacity={0.85}
            accessibilityLabel="Abrir checklist"
          >
            <MaterialCommunityIcons name="checkbox-marked" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {isSearchVisible && (
          <Animated.View
            style={[
              styles.fabSearchBarContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary,
                borderWidth: 1,
                width: searchBarWidth,
              },
            ]}
          >
            <TextInput
              style={[styles.fabSearchInput, { color: colors.text }]}
              placeholder="Buscar lugares..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.fabSearchAction}
              onPress={() => {}}
              activeOpacity={0.85}
              accessibilityLabel="Buscar"
            >
              <MaterialCommunityIcons name="arrow-right" size={22} color="white" />
            </TouchableOpacity>
           <TouchableOpacity style={styles.fabSearchClose} onPress={handleCloseSearchBar}>
         <MaterialCommunityIcons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          </Animated.View>
        )}

        {/* Mapa con marcadores */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          region={
            userLocation
              ? { ...userLocation, latitudeDelta: 0.0122, longitudeDelta: 0.0121 }
              : { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 }
          }
          showsUserLocation
          customMapStyle={isDarkMode ? darkMapStyle : []}
        >
          {userLocation && <Marker coordinate={userLocation} title="Tu ubicación actual" />}

          {places.map(p => (
            <Marker key={p.id} coordinate={p.location}>
              <Callout tooltip onPress={() => handlePlaceSelect(p)}>
                <View style={{ width: 200 }}>
                  {p.photoUrl && (
                    <Image
                      source={{ uri: p.photoUrl }}
                      style={{ width: '100%', height: 90, borderTopLeftRadius: 6, borderTopRightRadius: 6 }}
                    />
                  )}
                  <View style={{ padding: 6, backgroundColor: '#fff', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
                    <Text style={{ fontWeight: '600' }}>{p.name}</Text>
                    <Text>{p.description}</Text>
                    {p.rating && <Text>⭐ {p.rating}</Text>}
                    <Text>{p.distance}</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Panel con lista de lugares */}
        <View style={[styles.panel, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.panelHeader} onPress={!isSearchVisible ? togglePanel : undefined}>
            <View style={styles.headerContent}>
              <Text style={[styles.panelTitle, { color: colors.text }]}>Lugares Recomendados</Text>
              <MaterialCommunityIcons
                name={isPanelOpen ? 'chevron-down' : 'chevron-up'}
                size={24}
                color={colors.text}
              />
            </View>
          </TouchableOpacity>

          <Animated.View style={[styles.placesContainer, { height: placesContainerHeight }]}>
            {isPanelOpen && (
              loading
                ? <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                : (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {places.map(place => (
                      <PlaceCard key={place.id} place={place} onAdd={() => handlePlaceSelect(place)} />
                    ))}
                  </ScrollView>
                )
            )}
          </Animated.View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fabSearchBarContainer: {
    position: 'absolute' as const,
    top: 40,
    left: 24,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    zIndex: 40,
    maxWidth: 320,
    minWidth: 160,
  },
  fabSearchInput: {
    flex: 1,
    fontSize: 17,
    marginLeft: 8,
    marginRight: 4,
    backgroundColor: 'transparent',
    color: 'black',
  },
  fabSearchAction: {
    backgroundColor: '#FF385C',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginLeft: 8,
  },
  fabSearchClose: {
    marginLeft: 4,
    padding: 8,
  },
  fabContainer: {
    position: 'absolute' as const,
    top: 40,
    left: 24,
    alignItems: 'center',
    zIndex: 30,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 16,
  },
  miniFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF385C',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  centeredButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
    width: '100%',
    // Responsive position: place above the panel title
    position: 'absolute',
    top: undefined, // will be set in parent container
    left: 0,
    zIndex: 20,
    paddingVertical: 4,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  aggregatorOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  aggregatorPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  aggregatorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#FF385C',
  },
  aggregatorContentBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: 270,
    minHeight: 80,
  },
  aggregatorContentText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
  closeAggregatorButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 22,
  },
  closeAggregatorButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    left: 20,
  },
  floatingSearchContainer: {
    position: 'absolute',
    left: 16,
    top: 100,
    alignItems: 'flex-start',
    zIndex: 20,
    width: '80%',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    width: '90%',
    alignSelf: 'center',
    height: 48,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    marginLeft: 10,
    marginRight: 10,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  closeButton: {
    padding: 8,
    marginRight: 4,
  },
  searchBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: 'absolute',
    left: 16,
    top: 100,
    zIndex: 10,
  },
  checklistButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panelHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  placesContainer: {
    overflow: 'hidden',
  },
  itineraryFab: {
    position: 'absolute',
    left: 24,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF385C',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 50,
  },
  selectedPanel: {
    position: 'absolute',
    left: 24,
    bottom: 110,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    elevation: 5,
    zIndex: 100,
    overflow: 'hidden',
  }
});