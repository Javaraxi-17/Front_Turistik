import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Platform, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Header from '../components/Header';
import PlaceCard from '../components/PlaceCard';
import { WebView } from 'react-native-webview';

const MOCK_PLACES = [
  {
    id: '1',
    name: 'Parque Natural del Valle',
    description: 'Un hermoso parque natural con senderos para caminatas y vistas panorámicas impresionantes.',
    rating: 4.8,
    image: 'https://api.a0.dev/assets/image?text=beautiful%20natural%20park%20with%20hiking%20trails&aspect=16:9',
    distance: '2.5 km',
  },
  {
    id: '2',
    name: 'Restaurante La Vista',
    description: 'Restaurante con terraza panorámica y cocina local de alta calidad. Perfecto para ocasiones especiales.',
    rating: 4.5,
    image: 'https://api.a0.dev/assets/image?text=elegant%20restaurant%20with%20panoramic%20view&aspect=16:9',
    distance: '1.8 km',
  },
  {
    id: '3',
    name: 'Museo de Historia',
    description: 'Explora la rica historia de la región en este museo interactivo con exhibiciones fascinantes.',
    rating: 4.6,
    image: 'https://api.a0.dev/assets/image?text=modern%20history%20museum%20building&aspect=16:9',
    distance: '3.2 km',
  },
];

const MapComponent = () => {
  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body { margin: 0; }
          #map { height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([37.78825, -122.4324], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          L.marker([37.78825, -122.4324]).addTo(map)
            .bindPopup('Tu ubicación actual')
            .openPopup();
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      source={{ html: mapHTML }}
      style={{ height: 400 }}
      scrollEnabled={false}
    />
  );
};

export default function MainScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleProfilePress = () => {
    // Navegación al perfil del usuario
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Header
          userName="John Doe"
          onProfilePress={handleProfilePress}
        />

        <ScrollView
          style={styles.scrollView}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.mapContainer}>
            <MapComponent />
          </View>

          {MOCK_PLACES.map((place, index) => (
            <PlaceCard
              key={place.id}
              place={place}
              onPress={() => {}}
              style={{
                opacity: scrollY.interpolate({
                  inputRange: [
                    (index - 1) * 350,
                    index * 350,
                    (index + 1) * 350,
                  ],
                  outputRange: [0.7, 1, 0.7],
                  extrapolate: 'clamp',
                }),
                transform: [{
                  scale: scrollY.interpolate({
                    inputRange: [
                      (index - 1) * 350,
                      index * 350,
                      (index + 1) * 350,
                    ],
                    outputRange: [0.9, 1, 0.9],
                    extrapolate: 'clamp',
                  }),
                }],
              }}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 400,
    backgroundColor: '#fff',
  },
});