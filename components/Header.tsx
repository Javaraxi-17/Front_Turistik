import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const handleLogout = async () => {
    await logout();
    setIsMenuVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="compass-outline" size={28} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.primary }]}>Turistik</Text>
        </View>

        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: colors.secondary }]} 
          onPress={() => setIsMenuVisible(!isMenuVisible)}
        >
          <MaterialCommunityIcons name="account-circle" size={24} color={colors.text} />
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Usuario'}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.text} />
        </TouchableOpacity>

        <Modal
          visible={isMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsMenuVisible(false)}
          >
            <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleTheme}
              >
                <Ionicons
                  name={isDarkMode ? 'sunny' : 'moon'}
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.menuText, { color: colors.text }]}>
                  {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={20} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginLeft: 8,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
  },
  userName: {
    marginLeft: 8,
    marginRight: 4,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 10,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
  },
});