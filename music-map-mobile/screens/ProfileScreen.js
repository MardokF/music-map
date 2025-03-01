import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AuthContext from '../context/AuthContext';
import { getUserSongs, deleteSong } from '../api/songs';

const ProfileScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>?? Canzoni aggiunte da {user.username}</Text>
      <FlatList
        data={userSongs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.songItem}>
            <Text>{item.song_name} - {item.artist}</Text>
            <TouchableOpacity onPress={() => deleteSong(item.id)}>
              <Text style={styles.deleteButton}>?? Rimuovi</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  songItem: { padding: 15, backgroundColor: '#ddd', marginBottom: 10, borderRadius: 5 },
  deleteButton: { color: 'red', fontWeight: 'bold' },
});

export default ProfileScreen;

