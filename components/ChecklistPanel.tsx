import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ChecklistPanelProps {
  visible: boolean;
  onClose: () => void;
}

const ChecklistPanel: React.FC<ChecklistPanelProps> = ({ visible, onClose }) => {
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
          <Text style={styles.title}>Checklist</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#FF385C" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.placeholder}>Aquí irá tu checklist...</Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: '#bbb',
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
  },
});

export default ChecklistPanel;
