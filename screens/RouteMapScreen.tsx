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

interface Location {
  latitude: number;
  longitude: number;
}

interface PlaceLocation extends Location {
  name: string;
  order: number;
}

export default function RouteMapScreen() {
  const route = useRoute<RouteMapScreenRouteProp>();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [placeLocations, setPlaceLocations] = useState<PlaceLocation[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return null;
        }

        const location = await Location.getCurrentPositionAsync({});
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
      } catch (error) {
        console.error('Error getting user location:', error);
        return null;
      }
    };

    const getPlaceCoordinates = async (placeName: string, userLoc: Location, order: number) => {
      try {
        // First, get the city name from user's location
        const reverseGeocode = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userLoc.latitude},${userLoc.longitude}&key=${API_GOOGLE}`
        );
        const reverseData = await reverseGeocode.json();
        
        let cityName = '';
        if (reverseData.results && reverseData.results.length > 0) {
          const addressComponents = reverseData.results[0].address_components;
          const cityComponent = addressComponents.find(
            (component: any) => component.types.includes('locality')
          );
          if (cityComponent) {
            cityName = cityComponent.long_name;
          }
        }

        // Then search for the place within the city
        const searchQuery = `${placeName}, ${cityName}`;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${userLoc.latitude},${userLoc.longitude}&radius=1500&key=${API_GOOGLE}`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          return {
            latitude: lat,
            longitude: lng,
            name: placeName,
            order
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting coordinates:', error);
        return null;
      }
    };

    const fetchCoordinates = async () => {
      setLoading(true);
      const userLoc = await getUserLocation();
      if (!userLoc) {
        setLoading(false);
        return;
      }
      
      setUserLocation(userLoc);

      // Sort places by order
      const sortedPlaces = [...route.params.places].sort((a, b) => a.order - b.order);
      
      // Get coordinates for each place
      const locations = await Promise.all(
        sortedPlaces.map(place => getPlaceCoordinates(place.name, userLoc, place.order))
      );

      // Filter out any null results and sort by order
      const validLocations = locations
        .filter((loc): loc is PlaceLocation => loc !== null)
        .sort((a, b) => a.order - b.order);

      setPlaceLocations(validLocations);
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

  // Calculate center point for initial region
  const centerLat = placeLocations.reduce((sum, loc) => sum + loc.latitude, 0) / placeLocations.length;
  const centerLng = placeLocations.reduce((sum, loc) => sum + loc.longitude, 0) / placeLocations.length;

  // Calculate the maximum distance between any two points to set the zoom level
  const maxLatDiff = Math.max(...placeLocations.map(loc => loc.latitude)) - Math.min(...placeLocations.map(loc => loc.latitude));
  const maxLngDiff = Math.max(...placeLocations.map(loc => loc.longitude)) - Math.min(...placeLocations.map(loc => loc.longitude));

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: maxLatDiff * 1.5,
          longitudeDelta: maxLngDiff * 1.5,
        }}
        customMapStyle={isDarkMode ? darkMapStyle : []}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Tu ubicación"
            pinColor="blue"
          />
        )}
        
        {placeLocations.map((location, index) => (
          <Marker
            key={location.order}
            coordinate={location}
            title={`${location.order}. ${location.name}`}
            description={index === 0 ? "Punto de inicio" : index === placeLocations.length - 1 ? "Punto final" : `Parada ${index + 1}`}
            pinColor={index === 0 ? "green" : index === placeLocations.length - 1 ? "red" : "orange"}
          />
        ))}

        {/* Draw lines between consecutive points */}
        {placeLocations.slice(0, -1).map((location, index) => (
          <Polyline
            key={`${location.order}-${placeLocations[index + 1].order}`}
            coordinates={[location, placeLocations[index + 1]]}
            strokeColor="#3b82f6"
            strokeWidth={3}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Dark map style
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