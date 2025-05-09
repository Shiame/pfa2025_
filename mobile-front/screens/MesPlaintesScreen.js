import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function MesPlaintesScreen({ navigation }) {
  const [plaintes, setPlaintes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchPlaintes();
  }, []);

  const fetchPlaintes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const res = await axios.get(`${BASE_URL}/plaintes/mes-plaintes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPlaintes(res.data);
    } catch (error) {
      console.error(error);
      setError("Impossible de récupérer les plaintes");
    } finally {
      setLoading(false);
    }
  }; 
  

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => navigation.navigate('Details de Plainte', { plainteId: item.id })}
    >
      <Text style={styles.description}>{item.description}</Text>
      <Text>
        Statut: 
        <Text style={{
          fontWeight: 'bold', 
          color: item.statut === "SOUMISE" ? 'orange' :
                item.statut === "EN_COURS" ? 'blue' :
                item.statut === "RESOLUE" ? 'green' : 'black'
        }}>
          {` ${item.statut}`}
        </Text>
      </Text>

      <Text>Date: {new Date(item.dateSoumission).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Vous n'avez pas encore soumis de plaintes</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Chargement de vos plaintes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPlaintes}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Plaintes</Text>

      <FlatList
        data={plaintes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyListComponent}
        refreshing={loading}
        onRefresh={fetchPlaintes}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Soumettre une plainte')}
      >
        <Text style={styles.buttonText}>Ajouter une plainte</Text>
      </TouchableOpacity>
    </View>
  );

}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    marginTop: 30 
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  listContent: { 
    paddingBottom: 100,
    flexGrow: 1
  },
  item: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 5
  },
  description: { 
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 5
  },
  button: { 
    backgroundColor: '#4A6572', 
    padding: 15, 
    borderRadius: 10, 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20,
    elevation: 5
  },
  buttonText: { 
    color: '#fff', 
    backgroundColor: "#4A6572",
    fontSize: 18, 
    textAlign: 'center' 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#4A6572',
    padding: 10,
    borderRadius: 5
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16
  }
});