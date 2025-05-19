import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PlaceResult } from '../services/placesService';

interface SelectedPlacesPanelProps {
  visible: boolean;
  onClose: () => void;
  selectedPlaces: PlaceResult[];
  onCreateItinerary?: () => void;
  onClearPlaces?: () => void;
}

const SelectedPlacesPanel: React.FC<SelectedPlacesPanelProps> = ({ visible, onClose, selectedPlaces, onCreateItinerary, onClearPlaces }) => {
  const panelAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(panelAnim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [visible]);

  const panelHeight = panelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 320],
  });

  return (
    <View style={[styles.overlay, { opacity: visible ? 1 : 0 }]} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.panel, { height: panelHeight }]}> 
        <View style={styles.header}>
          <Text style={styles.title}>Lugares Seleccionados</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#FF385C" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          {selectedPlaces.length === 0 ? (
            <Text style={styles.placeholder}>No has seleccionado ningún lugar aún.</Text>
          ) : (
            selectedPlaces.map(place => (
              <View key={place.id} style={styles.placeItem}>
                {place.photoUrl && (
                  <Image source={{ uri: place.photoUrl }} style={styles.placeImage} />
                )}
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeDesc}>{place.description}</Text>
                  {place.rating && <Text style={styles.placeRating}>⭐ {place.rating}</Text>}
                  <Text style={styles.placeDistance}>{place.distance}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
        {selectedPlaces.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={onClearPlaces}>
              <MaterialCommunityIcons name="trash-can" size={24} color="#fff" />
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={onCreateItinerary}>
              <Text style={styles.createButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.22)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  panel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF385C',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    marginTop: 8,
  },
  placeholder: {
    color: '#bbb',
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
  },
  placeImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 10,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  placeDesc: {
    color: '#666',
    fontSize: 14,
  },
  placeRating: {
    fontSize: 13,
    color: '#FFB300',
  },
  placeDistance: {
    fontSize: 13,
    color: '#888',
  },
  createButton: {
    backgroundColor: '#FF385C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default SelectedPlacesPanel;
