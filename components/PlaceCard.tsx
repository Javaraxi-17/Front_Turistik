import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    description: string;
    rating: number;
    image: string;
    distance?: string;
  };
  onPress: () => void;
  style?: any;
}

export default function PlaceCard({ place, onPress, style }: PlaceCardProps) {
  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Image
          source={{ uri: place.image }}
          style={styles.image}
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{place.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{place.rating}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {place.description}
          </Text>

          {place.distance && (
            <View style={styles.distanceContainer}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
              <Text style={styles.distance}>{place.distance}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.addButton} onPress={onPress}>
            <Text style={styles.addButtonText}>Agregar al itinerario</Text>
            <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    height: 200,
    width: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    color: '#333',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#FF385C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});