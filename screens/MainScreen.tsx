import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const screenHeight = Dimensions.get('window').height;
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Callout } from 'react-native-maps';
import { Image } from 'react-native';

import PlaceCard from '../components/PlaceCard';
import { getRecommendedPlaces, PlaceResult } from '../services/placesService';

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
      /** <- ¡aquí la pasamos siempre! */
      region={region}
      showsUserLocation   /* punto azul nativo */
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

export default function MainScreen() {
  const { colors, isDarkMode } = useTheme();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(true);

  const panelAnimation = useRef(new Animated.Value(0)).current;
  const panelAggregatorAnimation = useRef(new Animated.Value(0)).current;

  const aggregatorPanelHeight = panelAggregatorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400], // 400 es la altura máxima del panel
  });

  // Estado para mostrar el panel Lugares agregador
  const [showAggregator, setShowAggregator] = useState(false);

  // Función para abrir el panel de lugares agregados
  const openAggregatorPanel = () => {
    setShowAggregator(true);
    Animated.timing(panelAggregatorAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  const closeAggregatorPanel = () => {
    Animated.timing(panelAggregatorAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setShowAggregator(false));
  };

  // Animación de ancho para la barra de búsqueda
  const searchBarWidth = useRef(new Animated.Value(0)).current;
  const maxSearchBarWidth = '85%'; // Usado para el estilo final
  const [searchBarWidthNum, setSearchBarWidthNum] = useState(0);

  useEffect(() => {
    const width = Dimensions.get('window').width * 0.85;
    setSearchBarWidthNum(width);
  }, []);

  const openSearchBar = () => {
    setIsSearchVisible(true);
    Animated.timing(searchBarWidth, {
      toValue: searchBarWidthNum || 320,
      duration: 260,
      useNativeDriver: false,
    }).start();
  };

  const closeSearchBar = () => {
    Animated.timing(searchBarWidth, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setIsSearchVisible(false));
  };


  /* ----- Carga inicial: ubicación + lugares ----- */
  useEffect(() => {
    (async () => {
      /* 1. Permiso y coordenadas del usuario */
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const current = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(current);

      /* 2. Consulta lugares cercanos */
      const results = await getRecommendedPlaces();
      setPlaces(results);
      setLoading(false);
    })();
  }, []);

  /* -------- Animación del panel inferior -------- */
  const togglePanel = () => {
    const toValue = isPanelOpen ? 0 : 1;
    setIsPanelOpen(!isPanelOpen);
    Animated.spring(panelAnimation, { toValue, useNativeDriver: false, tension: 50, friction: 7 }).start();
  };

  const placesContainerHeight = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* ---------- Mapa ---------- */}
        <MapComponent userLocation={userLocation} places={places} />

        {/* ---------- Botón flotante fuera y arriba del panel ---------- */}
        {!isSearchVisible && (
          <Animated.View
            style={[
              styles.searchBubble,
              {
                backgroundColor: colors.card,
                left: 16,
                top: Animated.subtract(
                  new Animated.Value(screenHeight - 400 - -200), // 400 = altura máxima del panel, 64 = altura del botón + margen extra
                  panelAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 400] })
                ),
                right: undefined,
                alignSelf: 'flex-start',
                bottom: undefined,
                position: 'absolute',
                zIndex: 15,
              },
            ]}
          >
            <TouchableOpacity
              onPress={openSearchBar}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="magnify" size={28} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ---------- Barra de búsqueda flotante con animación ---------- */}
        {isSearchVisible && (
          <Animated.View
            style={[
              styles.floatingSearchContainer,
              {
                left: 16,
                top: Animated.subtract(
                  new Animated.Value(screenHeight - 400 - 64),
                  panelAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 400] })
                ),
                width: searchBarWidth,
                overflow: 'hidden',
                alignItems: 'flex-start',
                zIndex: 20,
                position: 'absolute',
              },
            ]}
          >
            <View
              style={[
                styles.searchBarContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.primary,
                  borderWidth: 1,
                  width: '100%',
                },
              ]}
            >
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Buscar lugares..."
                placeholderTextColor={colors.text + '99'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => {/* lógica de búsqueda */}}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#FF385C',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 22,
                  marginRight: 4,
                }}
                onPress={() => {/* lógica de búsqueda */}}
                activeOpacity={0.85}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 4 }}>Iniciar</Text>
                <MaterialCommunityIcons name="arrow-right" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={closeSearchBar}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* ---------- Botón de checklist ---------- */}
        <Animated.View
          style={[
            styles.checklistButton,
            {
              backgroundColor: '#FF385C',
              right: 16,
              top: Animated.subtract(
                new Animated.Value(screenHeight - 400 - -200),
                panelAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 400] })
              ),
              position: 'absolute',
              zIndex: 15,
            },
          ]}
        >
          <TouchableOpacity
            onPress={openAggregatorPanel}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="checkbox-marked" size={28} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* ---------- Panel inferior con lista ---------- */}
        <View style={[styles.panel, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={styles.panelHeader}
            onPress={!isSearchVisible ? togglePanel : undefined}
            activeOpacity={isSearchVisible ? 1 : 0.7}
            disabled={isSearchVisible}
          >
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
              loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {places.map(place => (
                    <PlaceCard key={place.id} place={place} onPress={() => {}} />
                  ))}
                </ScrollView>
              )
            )}
          </Animated.View>
        </View>

        {/* Panel Lugares agregador */}
        {showAggregator && (
            <View style={styles.aggregatorOverlay}>
            <Animated.View
              style={[styles.aggregatorPanel, { height: aggregatorPanelHeight }]}
            >
              <Text style={styles.aggregatorTitle}>Lugares Agregados</Text>
              <View style={styles.aggregatorContentBox}>
                <Text style={styles.aggregatorContentText}>
                  Aquí aparecerán los lugares agregados a tu itinerario
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeAggregatorButton}
                onPress={closeAggregatorPanel}
              >
                <Text style={styles.closeAggregatorButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
});