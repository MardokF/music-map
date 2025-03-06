import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Modal, Button, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AuthContext from '../context/AuthContext';
import { getSongs, addSong, voteSong, deleteSong } from '../api/songs';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/MapStyles';

const MapScreen = () => {
  const [songs, setSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [popupLocation, setPopupLocation] = useState(null);
  const [newSong, setNewSong] = useState({ song_name: '', artist: '', spotify_url: '' });
  const [newLocation, setNewLocation] = useState(null);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAllSongs();
  }, []);

  const fetchAllSongs = async () => {
    try {
      const data = await getSongs();
      setSongs(data);
    } catch (error) {
      console.error('? Errore nel recupero delle canzoni:', error);
    }
  };

  const handleMarkerPress = (lat, lon) => {
    console.log(`?? Hai cliccato su un marker: ${lat}, ${lon}`);
    const songsAtLocation = songs.filter(song => 
      parseFloat(song.lat) === lat && parseFloat(song.lon) === lon
    );
    setSelectedSongs(songsAtLocation);
    setPopupLocation({ lat, lon });
  };

  const closeModal = () => {
    setSelectedSongs([]);
    setPopupLocation(null);
  };

    const handleMapPress = (e) => {
    setNewLocation({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    });
    setShowAddSongModal(true);
  };

  const handleVote = async (song_id, vote) => {
    try {
      const existingSong = songs.find(s => s.id === song_id);
      const existingVote = existingSong?.user_vote || 0;
      const newVote = (existingVote === vote) ? 0 : vote;
      const voteData = { user_id: user?.id, song_id, vote: newVote };
      await voteSong(voteData);
      fetchAllSongs();
    } catch (error) {
      console.error('? Errore durante la votazione:', error);
    }
  };

  const handleDeleteSong = async (song_id) => {
    try {
      await deleteSong(song_id, user?.id);
      fetchAllSongs();
    } catch (error) {
      console.error("? Errore nella rimozione della canzone:", error);
      alert('Non hai i permessi per rimuovere questa canzone');
    }
  };

  const handleAddSongAtLocation = async () => {
    if (!newLocation || !user) {
      alert("? Seleziona un punto sulla mappa e accedi prima di aggiungere una canzone.");
      return;
    }

    const songData = {
      user_id: user.id,
      song_name: newSong.song_name,
      artist: newSong.artist,
      lat: newLocation.latitude,
      lon: newLocation.longitude,
      spotify_url: newSong.spotify_url,
    };

    try {
      await addSong(songData);
      setNewSong({ song_name: '', artist: '', spotify_url: '' });
      setNewLocation(null);
      fetchAllSongs();
    } catch (error) {
      alert(error.response?.data?.error || '? Errore nell’aggiunta della canzone');
    }
  };

  const handleAddSongInline = async (lat, lon) => {
    if (!user) {
      alert("? Devi essere loggato per aggiungere una canzone.");
      return;
    }

    if (!newSong.song_name || !newSong.artist || !newSong.spotify_url) {
      alert("? Compila tutti i campi!");
      return;
    }

    const songData = {
      user_id: user.id,
      song_name: newSong.song_name,
      artist: newSong.artist,
      lat,
      lon,
      spotify_url: newSong.spotify_url,
    };

    try {
      await addSong(songData);
      setNewSong({ song_name: '', artist: '', spotify_url: '' });
      fetchAllSongs();
    } catch (error) {
      alert(error.response?.data?.error || '? Errore nell’aggiunta della canzone');
    }
  };

  const renderPopup = () => (
    <Modal animationType="slide" transparent={true} visible={popupLocation !== null} onRequestClose={closeModal}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ width: 320, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>?? Canzoni in questa posizione</Text>
          <ScrollView style={{ maxHeight: 300, width: '100%' }}>
            {selectedSongs.map((song) => (
              <View key={song.id} style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10, marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>{song.song_name}</Text>
                <Text>?? {song.artist}</Text>
                <Text>?? Aggiunto da: {song.creator_username}</Text>
                <Text>? {song.total_votes} voti</Text>
                <TouchableOpacity style={{ backgroundColor: 'green', padding: 10, marginTop: 10 }} onPress={() => handleVote(song.id, 1)}>
                  <Text style={{ color: 'white' }}>?? Vota</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: 'red', padding: 10, marginTop: 10 }} onPress={() => handleVote(song.id, -1)}>
                  <Text style={{ color: 'white' }}>?? Vota</Text>
                </TouchableOpacity>
                {song.user_vote !== 0 && (
                  <TouchableOpacity onPress={() => handleVote(song.id, 0)} style={{ marginTop: 10, backgroundColor: 'gray', padding: 10 }}>
                    <Text style={{ color: 'white' }}>? Rimuovi Voto</Text>
                  </TouchableOpacity>
                )}
                {user?.username === song.creator_username && (
                  <TouchableOpacity onPress={() => handleDeleteSong(song.id)} style={{ marginTop: 10, backgroundColor: 'red', padding: 10 }}>
                    <Text style={{ color: 'white' }}>??? Rimuovi Canzone</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
          
          {/* ? Aggiungi canzone inline */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>? Aggiungi una Canzone</Text>
          <TextInput placeholder="Nome Canzone" value={newSong.song_name} onChangeText={(text) => setNewSong({ ...newSong, song_name: text })} style={styles.input} />
          <TextInput placeholder="Artista" value={newSong.artist} onChangeText={(text) => setNewSong({ ...newSong, artist: text })} style={styles.input} />
          <TextInput placeholder="Spotify URL" value={newSong.spotify_url} onChangeText={(text) => setNewSong({ ...newSong, spotify_url: text })} style={styles.input} />
          <TouchableOpacity onPress={() => handleAddSongInline(popupLocation.lat, popupLocation.lon)} style={styles.addSongButton}>
            <Text style={{ color: 'white' }}>?? Aggiungi Canzone</Text>
          </TouchableOpacity>

          <Button title="Chiudi" onPress={closeModal} />
        </View>
      </View>
    </Modal>
  );

  return (
      
    <View style={{ flex: 1 }}>
    {/* ?? Pulsante per il profilo */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'blue', padding: 10, borderRadius: 5 }}
        onPress={() => navigation.navigate('ProfileScreen')}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>?? Profilo</Text>
      </TouchableOpacity>
      <MapView style={{ flex: 1 }} initialRegion={{ latitude: 45.4642, longitude: 9.1900, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
      onPress={handleMapPress}>
        {songs.map((song, index) => (
          <Marker key={`${song.lat}-${song.lon}-${index}`} coordinate={{ latitude: parseFloat(song.lat), longitude: parseFloat(song.lon) }} onPress={() => handleMarkerPress(parseFloat(song.lat), parseFloat(song.lon))} />
        ))}
      </MapView>
      {popupLocation && renderPopup()}
      {newLocation && (
        <View style={styles.newSongContainer}>
          <Text style={styles.newSongTitle}>? Aggiungi una Canzone</Text>
          <TextInput placeholder="Nome Canzone" value={newSong.song_name} onChangeText={(text) => setNewSong({ ...newSong, song_name: text })} style={styles.input} />
          <TextInput placeholder="Artista" value={newSong.artist} onChangeText={(text) => setNewSong({ ...newSong, artist: text })} style={styles.input} />
          <TextInput placeholder="Spotify URL" value={newSong.spotify_url} onChangeText={(text) => setNewSong({ ...newSong, spotify_url: text })} style={styles.input} />
          <TouchableOpacity onPress={handleAddSongAtLocation} style={styles.addSongButton}>
            <Text style={{ color: 'white' }}>?? Aggiungi Canzone</Text>
          </TouchableOpacity>
          <Button title="Chiudi" onPress={() => setShowAddSongModal(false)} />
        </View>
        )}
    </View>
  );
};

export default MapScreen;
