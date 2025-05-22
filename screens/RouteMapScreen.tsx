import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { API_GOOGLE } from '@/config/api';
import * as Location from 'expo-location';

interface RouteMapScreenParams {
  places: Array<{
    name: string;
    order: number;
  }>;
}

type RouteMapScreenRouteProp = RouteProp<{
  params: RouteMapScreenParams;
}, 'params'>;

interface LocationType {
  latitude: number;
  longitude: number;
}

interface PlaceLocation extends LocationType {
  name: string;
  order: number;
}

export default function RouteMapScreen() {
  const route = useRoute<RouteMapScreenRouteProp>();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [placeLocations, setPlaceLocations] = useState<PlaceLocation[]>([]);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [routes, setRoutes] = useState<LocationType[][]>([]);

  useEffect(() => {
    const getUserLocation = async (): Promise<LocationType | null> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return null;
        }
        const location = await Location.getCurrentPositionAsync({});
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } catch (error) {
        console.error('Error getting user location:', error);
        return null;
      }
    };

    const getPlaceCoordinates = async (
      placeName: string,
      userLoc: LocationType,
      order: number
    ): Promise<PlaceLocation | null> => {
      try {
        // Obtener ciudad de la ubicación del usuario
        const reverseGeocodeRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userLoc.latitude},${userLoc.longitude}&key=${API_GOOGLE}`
        );
        const reverseData = await reverseGeocodeRes.json();

        let cityName = '';
        if (reverseData.results && reverseData.results.length > 0) {
          const addrComponents = reverseData.results[0].address_components;
          const cityComp = addrComponents.find((c: any) => c.types.includes('locality'));
          if (cityComp) cityName = cityComp.long_name;
        }

        const searchQuery = cityName ? `${placeName}, ${cityName}` : placeName;

        // Amplío el radio a 5000 metros
        const placeRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
            searchQuery
          )}&location=${userLoc.latitude},${userLoc.longitude}&radius=5000&key=${API_GOOGLE}`
        );
        const data = await placeRes.json();

        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          console.log(`Encontrado lugar: ${placeName} -> ${lat},${lng}`);
          return { latitude: lat, longitude: lng, name: placeName, order };
        } else {
          console.warn(`No se encontró el lugar: ${placeName}`);
        }
        return null;
      } catch (error) {
        console.error('Error getting coordinates:', error);
        return null;
      }
    };

    const decodePolyline = (t: string): LocationType[] => {
      let points: LocationType[] = [];
      let index = 0,
        len = t.length;
      let lat = 0,
        lng = 0;

      while (index < len) {
        let b,
          shift = 0,
          result = 0;
        do {
          b = t.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        const dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;
        do {
          b = t.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        const dlng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
      }
      return points;
    };

    const getRouteBetweenPoints = async (
      start: LocationType,
      end: LocationType
    ): Promise<LocationType[]> => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${API_GOOGLE}`
        );
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          return decodePolyline(data.routes[0].overview_polyline.points);
        }
        return [];
      } catch (error) {
        console.error('Error fetching directions:', error);
        return [];
      }
    };

    const fetchRoutes = async (locations: PlaceLocation[]) => {
      const allRoutes: LocationType[][] = [];
      for (let i = 0; i < locations.length - 1; i++) {
        const routePoints = await getRouteBetweenPoints(locations[i], locations[i + 1]);
        console.log(`Ruta entre ${locations[i].name} y ${locations[i + 1].name} tiene ${routePoints.length} puntos`);
        allRoutes.push(routePoints);
      }
      setRoutes(allRoutes);
    };

    const fetchCoordinates = async () => {
      setLoading(true);
      const userLoc = await getUserLocation();
      if (!userLoc) {
        setLoading(false);
        return;
      }
      setUserLocation(userLoc);

      const sortedPlaces = [...route.params.places].sort((a, b) => a.order - b.order);

      const locations = await Promise.all(
        sortedPlaces.map((place) => getPlaceCoordinates(place.name, userLoc, place.order))
      );

      const validLocations = locations
        .filter((loc): loc is PlaceLocation => loc !== null)
        .sort((a, b) => a.order - b.order);

      console.log('Lugares válidos encontrados:', validLocations);

      setPlaceLocations(validLocations);

      await fetchRoutes(validLocations);

      console.log('Rutas obtenidas:', routes);

      setLoading(false);
    };

    fetchCoordinates();
  }, [route.params.places]);

  if (loading || placeLocations.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const centerLat =
    placeLocations.reduce((sum, loc) => sum + loc.latitude, 0) / placeLocations.length;
  const centerLng =
    placeLocations.reduce((sum, loc) => sum + loc.longitude, 0) / placeLocations.length;

  const maxLatDiff =
    Math.max(...placeLocations.map((loc) => loc.latitude)) -
    Math.min(...placeLocations.map((loc) => loc.latitude));
  const maxLngDiff =
    Math.max(...placeLocations.map((loc) => loc.longitude)) -
    Math.min(...placeLocations.map((loc) => loc.longitude));

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: maxLatDiff * 1.5 || 0.05,
          longitudeDelta: maxLngDiff * 1.5 || 0.05,
        }}
        customMapStyle={isDarkMode ? darkMapStyle : []}
      >
        {userLocation && (
          <Marker coordinate={userLocation} title="Tu ubicación" pinColor="blue" />
        )}

        {placeLocations.map((location, index) => (
          <Marker
            key={location.order}
            coordinate={location}
            title={`${location.order}. ${location.name}`}
            description={
              index === 0
                ? 'Punto de inicio'
                : index === placeLocations.length - 1
                ? 'Punto final'
                : `Parada ${index + 1}`
            }
            pinColor={index === 0 ? 'green' : index === placeLocations.length - 1 ? 'red' : 'orange'}
          />
        ))}

        {routes.map((routePoints, index) => (
          <Polyline
            key={`route-${index}`}
            coordinates={routePoints}
            strokeColor="#3b82f6"
            strokeWidth={3}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
});

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
