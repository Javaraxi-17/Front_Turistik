import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ItineraryResultScreenParams {
  aiResult: string;
}

interface Place {
  nombre: string;
  costo_promedio: string;
  recomendaciones: string;
  notas: string;
  coordenadas: string;
}

type ItineraryResultScreenRouteProp = RouteProp<{
  params: ItineraryResultScreenParams;
}, 'params'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ItineraryResultScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ItineraryResultScreenRouteProp>();
  let parsed: any = null;
  console.log("parsed",parsed);

  let parseError = '';
  let aiStr = route.params.aiResult.trim();
  // Elimina ```json y ``` si están presentes
  if (aiStr.startsWith('```json')) aiStr = aiStr.slice(7);
  if (aiStr.startsWith('```')) aiStr = aiStr.slice(3);
  if (aiStr.endsWith('```')) aiStr = aiStr.slice(0, -3);
  aiStr = aiStr.trim();
  try {
    console.log(aiStr);
    parsed = JSON.parse(aiStr);
    console.log("parsed",parsed);
  } catch (e: any) {
    parseError = e?.message || String(e);
    console.log('Error al parsear JSON:', e, route.params.aiResult);
  }

  if (!parsed || !parsed.metadata || !parsed.lugares) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={[styles.title, { maxWidth: '85%', textAlign: 'center', flexWrap: 'wrap' }]}>No se pudo mostrar el itinerario</Text>
        <Text style={[styles.errorText, { maxWidth: '85%', textAlign: 'center', flexWrap: 'wrap' }]}>El resultado no tiene el formato esperado.</Text>
        {parseError ? (
          <ScrollView style={{ maxHeight: 120, maxWidth: '85%', marginBottom: 8 }}>
            <Text style={{ color: 'red', fontSize: 13, textAlign: 'center', flexWrap: 'wrap' }}>{parseError}</Text>
          </ScrollView>
        ) : null}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [showDesc, setShowDesc] = React.useState(false);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={styles.title}>{parsed.metadata.titulo || 'Itinerario sugerido'}</Text>
        <TouchableOpacity onPress={() => setShowDesc(v => !v)} style={{ marginTop: 8, marginBottom: showDesc ? 8 : 0 }}>
          <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 15 }}>{showDesc ? 'Ocultar descripción' : 'Ver descripción'}</Text>
        </TouchableOpacity>
        {showDesc && (
          <Text style={styles.desc}>{parsed.metadata.descripcion_general}</Text>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={160} // Ajusta este valor según el ancho de la tarjeta + margen
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 12 }}
        style={{ marginBottom: 24 }}
      >
        <View style={[styles.metaCard, { marginRight: 12 }]}> 
          <Text style={styles.metaIcon}>⏱️</Text>
          <Text style={styles.metaBigLabel}>Duración</Text>
          <Text style={styles.metaBigValue}>{parsed.metadata.total_duracion}</Text>
        </View>
        <View style={styles.metaCard}> 
          <Text style={styles.metaIcon}>📏</Text>
          <Text style={styles.metaBigLabel}>Distancia</Text>
          <Text style={styles.metaBigValue}>{parsed.metadata.total_distancia}</Text>
        </View>
      </ScrollView>
      <Text style={styles.sectionTitle}>Lugares a visitar</Text>
      {Object.entries(parsed.lugares).map(([id, lugar]: any) => (
        <View key={id} style={styles.card}>
          <Text style={styles.cardTitle}>{id}. {lugar.nombre}</Text>
          <Text style={styles.cardDetail}>💸 Costo promedio: <Text style={styles.cardValue}>{lugar.costo_promedio}</Text></Text>
          <Text style={styles.cardDetail}>📝 Recomendaciones: <Text style={styles.cardValue}>{lugar.recomendaciones}</Text></Text>
          <Text style={styles.cardDetail}>🗒️ Notas: <Text style={styles.cardValue}>{lugar.notas}</Text></Text>
          <Text style={styles.cardDetail}>📍 Coordenadas: <Text style={styles.cardValue}>{lugar.coordenadas}</Text></Text>
        </View>
      ))}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.actionBtn, styles.mapBtn]}
          onPress={() => {
            const places = Object.entries(parsed.lugares) as [string, Place][];
            const sortedPlaces = places.map(([id, place]) => ({
              name: place.nombre,
              order: parseInt(id)
            })).sort((a, b) => a.order - b.order);

            navigation.navigate('RouteMap', {
              places: sortedPlaces
            });
          }}
        >
          <Text style={styles.actionBtnText}>Ver Ruta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.actionBtn, styles.backBtn]}
          onPress={() => navigation.navigate('MainScreen')}
        >
          <Text style={styles.actionBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f7f9fb',
    flexGrow: 1,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 0,
    color: '#2d3748',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: 12,
    maxWidth: '90%',
  },
  desc: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 0,
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  metaRowBig: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 24,
    gap: 12,
  },
  metaCard: {
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 120,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  metaIcon: {
    fontSize: 30,
    marginBottom: 6,
  },
  metaBigLabel: {
    fontWeight: 'bold',
    color: '#2b6cb0',
    fontSize: 15,
    marginBottom: 2,
  },
  metaBigValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  metaItem: {
    marginHorizontal: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  metaValue: {
    fontWeight: '400',
    color: '#1a202c',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
    color: '#2b6cb0',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2b6cb0',
  },
  cardDetail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  cardValue: {
    fontWeight: '400',
    color: '#222',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    marginBottom: 0,
  },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 36,
    elevation: 2,
    marginHorizontal: 4,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  mapBtn: {
    backgroundColor: '#10b981',
  },
  backBtn: {
    backgroundColor: '#3b82f6',
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginVertical: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});
