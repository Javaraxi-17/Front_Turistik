import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  userName?: string;
  onProfilePress: () => void;
}

export default function Header({ userName = 'Usuario', onProfilePress }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="compass-outline" size={28} color="#FF385C" />
          <Text style={styles.logoText}>Turistik</Text>
        </View>

        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          <MaterialCommunityIcons name="account-circle" size={24} color="#666" />
          <Text style={styles.userName}>{userName}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF385C',
    marginLeft: 8,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  userName: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
});