import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AuthContext from '../context/AuthContext';
import { getUserSongs, deleteSong } from '../api/songs';
import styles from '../styles/ProfileStyles';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [userSongs, setUserSongs] = useState([]);

  useEffect(() => {
    fetchUserSongs();
  }, []);

  const fetchUserSongs = async () => {
    try {
      const data = await getUserSongs(user.id);
      setUserSongs(data);
    } catch (error) {
      console.error('Errore nel recupero delle canzoni dell’utente:', error);
    }
  };

  // ? Funzione per eliminare una canzone
  const handleDeleteSong = async (song_id) => {
    try {
      console.log(`Eliminazione canzone ID: ${song_id}`);
      await deleteSong(song_id, user?.id);
      setUserSongs(prevSongs => prevSongs.filter(song => song.id !== song_id)); // ? Rimuove subito la canzone dalla UI
    } catch (error) {
      console.error("? Errore nell'eliminazione della canzone:", error);
      alert("Errore nell'eliminazione della canzone.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Si', onPress: logout }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
    <View style={styles.topBar}>
  <Text style={styles.profileTitle}>
    Canzoni aggiunte da {user?.username}
  </Text>
  <TouchableOpacity onPress={handleLogout}>
    <Ionicons name="log-out-outline" size={24} color="black" />
  </TouchableOpacity>
</View>
      <FlatList
        data={userSongs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.songItem}>
            <Text>{item.song_name} - {item.artist}</Text>
            <TouchableOpacity onPress={() => handleDeleteSong(item.id)}>
              <Text style={styles.deleteButton}>?? Rimuovi</Text>
            </TouchableOpacity>



          </View>
        )}
      />
    </View>
  );
};


export default ProfileScreen;

