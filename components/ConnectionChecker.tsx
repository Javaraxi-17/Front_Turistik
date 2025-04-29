import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pingServer, checkServerAvailability } from '../services/networkService';
import { API_BASE_URL } from '../config/api';

interface ConnectionCheckerProps {
  onClose: () => void;
}

export default function ConnectionChecker({ onClose }: ConnectionCheckerProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  const checkConnection = async () => {
    setStatus('checking');
    addLog('Iniciando prueba de conexión...');
    addLog(`URL del servidor: ${API_BASE_URL}`);
    
    try {
      // Método 1: Ping básico
      addLog('Realizando ping básico...');
      const pingResult = await pingServer(5000);
      
      if (pingResult) {
        addLog('✅ Ping exitoso!');
      } else {
        addLog('❌ Ping fallido');
      }
      
      // Método 2: Verificación completa
      addLog('Verificando disponibilidad del servidor...');
      const serverAvailable = await checkServerAvailability(10000);
      
      if (serverAvailable) {
        addLog('✅ Servidor disponible y respondiendo!');
        setStatus('success');
      } else {
        addLog('❌ Servidor no disponible');
        setStatus('error');
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message || 'Desconocido'}`);
      setStatus('error');
    }
    
    // Resultado final
    if (status !== 'error') {
      addLog('✅ Prueba completada con éxito');
    } else {
      addLog('❌ Prueba completada con errores');
      addLog('Sugerencias:');
      addLog('1. Verifica que el servidor esté en ejecución');
      addLog(`2. Asegúrate de que la URL ${API_BASE_URL} sea correcta`);
      addLog('3. Si usas emulador Android, usa la IP 10.0.2.2 para localhost');
      addLog('4. Si usas un dispositivo físico, usa la IP de tu computadora en la red');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verificador de Conexión</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.statusContainer}>
        {status === 'idle' && (
          <Text style={styles.statusText}>Presiona el botón para verificar la conexión</Text>
        )}
        
        {status === 'checking' && (
          <View style={styles.statusRow}>
            <ActivityIndicator color="#FF385C" size="small" />
            <Text style={styles.statusText}>Verificando conexión...</Text>
          </View>
        )}
        
        {status === 'success' && (
          <View style={styles.statusRow}>
            <MaterialCommunityIcons name="check-circle" size={24} color="green" />
            <Text style={[styles.statusText, { color: 'green' }]}>Conexión establecida</Text>
          </View>
        )}
        
        {status === 'error' && (
          <View style={styles.statusRow}>
            <MaterialCommunityIcons name="close-circle" size={24} color="#D32F2F" />
            <Text style={[styles.statusText, { color: '#D32F2F' }]}>Error de conexión</Text>
          </View>
        )}
      </View>

      <View style={styles.serverInfo}>
        <Text style={styles.serverInfoText}>URL del servidor: {API_BASE_URL}</Text>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.checkButton, status === 'checking' && styles.disabledButton]}
        onPress={checkConnection}
        disabled={status === 'checking'}
      >
        {status === 'checking' ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.checkButtonText}>Verificar Conexión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  serverInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  serverInfoText: {
    fontSize: 14,
    color: '#555',
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  logText: {
    color: '#ddd',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    marginBottom: 5,
  },
  checkButton: {
    backgroundColor: '#FF385C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#FFB3C0',
  },
  checkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 