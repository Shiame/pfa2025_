import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function DetailPlainteScreen({ route }) {
  const { plainteId } = route.params;
  const [plainte, setPlainte] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlainte();
  }, []);

  const fetchPlainte = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const res = await axios.get(`http://192.168.0.110:8080/plaintes/${plainteId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPlainte(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!plainte) {
    return (
      <View style={styles.centered}>
        <Text>Impossible de charger la plainte</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
    {plainte.imgUrl && (
      <Image source={{ uri: plainte.imgUrl }} style={styles.image} />
    )}
  
    <Text style={styles.title}>{plainte.description}</Text>
  
    <View style={styles.detailRow}>
      <Text style={styles.label}>Statut :</Text>
      <View style={[styles.badge, { 
        backgroundColor: 
          plainte.statut.trim().toUpperCase() === "SOUMISE" ? 'orange' :
          plainte.statut.trim().toUpperCase() === "EN_COURS" ? 'blue' :
          plainte.statut.trim().toUpperCase() === "RESOLUE" ? 'green' : 'grey'
      }]}>
        <Text style={styles.badgeText}>{plainte.statut.trim()}</Text>
      </View>
    </View>
  
    <View style={styles.detailRow}>
      <Text style={styles.label}>Date :</Text>
      <Text>{new Date(plainte.dateSoumission).toLocaleDateString()}</Text>
    </View>
  
    {plainte.categorie && (
      <View style={styles.detailRow}>
        <Text style={styles.label}>Catégorie :</Text>
        <Text>{plainte.categorie.nom}</Text>
      </View>
    )}
  
    <View style={styles.detailRow}>
      <Text style={styles.label}>Localisation :</Text>
      <Text>{plainte.localisation ?? "N/A"}</Text>
    
    </View>
  </ScrollView>
  
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: 5
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  }
});
