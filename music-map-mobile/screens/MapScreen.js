import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Modal, Button, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AuthContext from '../context/AuthContext';
import { getSongs, addSong, voteSong, deleteSong} from '../api/songs';
import { useNavigation } from '@react-navigation/native';

const MapScreen = () => {
  const [songs, setSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]); // ?? Array di canzoni nella stessa posizione
  const [newSong, setNewSong] = useState({ song_name: '', artist: '', spotify_url: '' });
  const [newLocation, setNewLocation] = useState(null);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAllSongs();
  }, []);

  // ? Recupera le canzoni dal backend
  const fetchAllSongs = async () => {
    try {
      const data = await getSongs();
      setSongs(data);
    } catch (error) {
      console.error('Errore nel recupero delle canzoni:', error);
    }
  };

  // ? Seleziona le canzoni nella stessa posizione e apre il Modal
  const handleMarkerPress = (lat, lon) => {
    const songsAtLocation = songs.filter(song => 
      parseFloat(song.lat) === lat && parseFloat(song.lon) === lon
    );
    setSelectedSongs(songsAtLocation);
  };

  // ? Chiude il Modal
  const closeModal = () => {
    setSelectedSongs([]);
  };

  // ? Vota una canzone
 const handleVote = async (song_id, vote) => {
    try {
      const existingSong = songs.find(s => s.id === song_id);
      const existingVote = existingSong?.user_vote || 0;
      const newVote = (existingVote === vote) ? 0 : vote;
      const voteData = { user_id: user?.id, song_id, vote: newVote };
      await voteSong(voteData);
      fetchAllSongs();
    } catch (error) {
      console.error('Errore durante la votazione:', error);
    }
  };

  // ? Imposta la posizione per aggiungere una nuova canzone
  const handleMapPress = (e) => {
    setNewLocation({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    });
  };

  // ? Aggiunge una nuova canzone nel punto selezionato
  const handleAddSong = async (e) => {
      e.preventDefault();
    if (!newLocation || !user) {
      alert("Seleziona un punto sulla mappa e accedi prima di aggiungere una canzone.");
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
      alert(error.response?.data?.error || 'Errore nell’aggiunta della canzone');
    }
  };

    if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>?? Devi effettuare l'accesso per vedere la mappa.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Vai al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

    const handleDeleteSong = async (song_id) => {
    try {
      const requestUrl = `http://192.168.1.53:5000/api/songs/delete/${song_id}/${user?.id}`;
      console.log("??? Tentativo di eliminare la canzone con URL:", requestUrl);
      await deleteSong(song_id, user?.id);
      fetchAllSongs();
    } catch (error) {
                console.error("? Errore nella rimozione della canzone:", error);
      alert('Non hai i permessi per rimuovere questa canzone');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ?? Pulsante per il profilo */}
      <TouchableOpacity
        style={{
          position: 'absolute', top: 40, right: 20, zIndex: 10,
          backgroundColor: 'blue', padding: 10, borderRadius: 5
        }}
        onPress={() => navigation.navigate('ProfileScreen')}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>?? Profilo</Text>
      </TouchableOpacity>

      {/* ??? Mappa */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 45.4642,
          longitude: 9.1900,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onPress={handleMapPress} // ? Seleziona il punto per aggiungere una canzone
      >
        {/* ?? Marker delle canzoni */}
        {songs.map((song, index) => (
          <Marker
            key={`${song.lat}-${song.lon}-${index}`}
            coordinate={{
              latitude: parseFloat(song.lat),
              longitude: parseFloat(song.lon),
            }}
            title="Canzoni disponibili"
            onPress={() => handleMarkerPress(parseFloat(song.lat), parseFloat(song.lon))} // ? Apre il Modal con le canzoni della posizione
          />
        ))}
      </MapView>

      {/* ?? Modal con le canzoni raggruppate */}
      {selectedSongs.length > 0 && (
        <Modal animationType="slide" transparent={true} visible={true} onRequestClose={closeModal}>
          <View style={{
            flex: 1, justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}>
            <View style={{
              width: 320, backgroundColor: 'white', padding: 20,
              borderRadius: 10, alignItems: 'center'
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Canzoni in questa posizione</Text>
              <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                {selectedSongs.map((song) => (
                  <View key={song.id} style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10, marginBottom: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>{song.song_name}</Text>
                    <Text>?? {song.artist}</Text>
                    <Text>?? Aggiunto da: {song.creator_username}</Text>
                    <Text>?? {song.total_votes} voti</Text>
                    <TouchableOpacity
                      style={{ backgroundColor: 'green', padding: 10, marginTop: 10 }}
                      onPress={() => handleVote(song.id, 1)}
                    >
                      <Text style={{ color: 'white' }}>?? Vota</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ backgroundColor: 'red', padding: 10, marginTop: 10 }}
                      onPress={() => handleVote(song.id, -1)}
                    >
                      <Text style={{ color: 'white' }}>?? Vota</Text>
                    </TouchableOpacity>
                    {song.user_vote !== 0 && (
                    <TouchableOpacity onPress={() => handleVote(song.id, 0)} style={{ marginLeft: 10 }}>
                      <Text style={{ color: 'gray' }}>? Rimuovi Voto</Text>
                    </TouchableOpacity>
                  )}
                  {user?.username === song.creator_username && (
                    <TouchableOpacity onPress={() => handleDeleteSong(song.id)} style={{ marginLeft: 10 }}>
                      <Text style={{ color: 'red' }}>??? Rimuovi Canzone</Text>
                    </TouchableOpacity>
                  )}
                  </View>
                ))}
              </ScrollView>
              <Button title="Chiudi" onPress={closeModal} />
            </View>
          </View>
        </Modal>
      )}

      {/* ?? Aggiunta di una nuova canzone */}
      {newLocation && (
        <View style={{
          position: 'absolute', bottom: 20, left: 20, right: 20,
          backgroundColor: 'white', padding: 15, borderRadius: 10
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Aggiungi Canzone</Text>
          <TextInput placeholder="Nome Canzone" value={newSong.song_name} onChangeText={(text) => setNewSong({ ...newSong, song_name: text })} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
          <TextInput placeholder="Artista" value={newSong.artist} onChangeText={(text) => setNewSong({ ...newSong, artist: text })} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
          <TextInput placeholder="Spotify URL" value={newSong.spotify_url} onChangeText={(text) => setNewSong({ ...newSong, spotify_url: text })} style={{ borderBottomWidth: 1, marginBottom: 10 }} />
          <Button title="Aggiungi ??" onPress={handleAddSong} />
        </View>
      )}
    </View>
  );
};

export default MapScreen;
