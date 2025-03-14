import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Modal, Button, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE  } from 'react-native-maps';
import AuthContext from '../context/AuthContext';
import { getSongs, addSong, voteSong, deleteSong } from '../api/songs';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/MapStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';



const MapScreen = () => {
  const [songs, setSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [popupLocation, setPopupLocation] = useState(null);
  const [newSong, setNewSong] = useState({ song_name: '', artist: '', spotify_url: '' });
  const [newLocation, setNewLocation] = useState(null);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [mapTheme, setMapTheme] = useState('light');

  useEffect(() => {
    fetchAllSongs();
  }, []);

  const fetchSpotifyToken = async () => {
  const clientId = '6ba89b0fdd14421099493bd2a188e4e7';
  const clientSecret = '1403967ce7044f218a2f9c85fb219901';

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
};

const searchSpotifyTracks = async (query) => {
  try {
    const token = await fetchSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error('Errore nella ricerca su Spotify:', error);
    return [];
  }
};


const fetchAllSongs = async () => {
    try {
        const cachedSongs = await AsyncStorage.getItem('songsCache');
        if (cachedSongs) {
            setSongs(JSON.parse(cachedSongs)); // Usa i dati cache immediatamente
        }

        const data = await getSongs();
        setSongs(data);
        await AsyncStorage.setItem('songsCache', JSON.stringify(data)); // Aggiorna la cache
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
        setSongs(prevSongs => 
            prevSongs.map(song =>
                song.id === song_id
                    ? { ...song, total_votes: (song.user_vote === vote ? song.total_votes - vote : song.total_votes + (vote - song.user_vote)), user_vote: (song.user_vote === vote ? 0 : vote) }
                    : song
            )
        );

        const voteData = { user_id: user?.id, song_id, vote: vote === songs.find(s => s.id === song_id)?.user_vote ? 0 : vote };
        await voteSong(voteData);
        fetchAllSongs(); // Mantieni il fetch per sicurezza, ma i dati vengono aggiornati subito
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
    } catch (error) {
      alert(error.response?.data?.error || '? Errore nell’aggiunta della canzone');
    }
  };

   const handleSearch = async () => {
  try {
    const encodedQuery = encodeURIComponent(searchQuery.trim());
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}`, {
      headers: {
        'User-Agent': 'MusicMapApp/1.0 (marco.frau69@example.com)' // ?? Sostituisci con la tua email
      }
    });


    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("?? Risultato della ricerca:", data);

    if (data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const locationSongs = songs.filter(song => 
        Math.abs(song.lat - lat) < 0.001 && Math.abs(song.lon - lon) < 0.001
      );

      setSearchResults({
        name: display_name,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        songs: locationSongs
      });

      // Aggiorna lo stato con le canzoni trovate in quella posizione
  const songsAtLocation = songs.filter(song => 
    parseFloat(song.lat) === lat && parseFloat(song.lon) === lon
  );


      // Se l'utente non ha già aggiunto una canzone qui, permette di aggiungerne una
  const userAlreadyAdded = songsAtLocation.some(song => song.user_id === user?.id);

  if (!userAlreadyAdded) {
    setNewLocation({ latitude: lat, longitude: lon });
  }
    } else {
      alert("? Nessun risultato trovato.");
    }
  } catch (error) {
    console.error("? Errore durante la ricerca:", error);
    alert("Errore durante la ricerca. Controlla la connessione o riprova più tardi.");
  }
};

const handleThemeChange = (theme) => {
    setMapTheme(theme);
  };

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#383838" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
  ];

const handleListenSong = (song) => {
  navigation.navigate("VotesScreen", { songUrl: song.spotify_url });
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
                <Text 
                    style={{ color: "green", textDecorationLine: "underline", marginTop: 5 }} 
                    onPress={() => Linking.openURL(song.spotify_url)}
                >
                ?? Ascolta su Spotify
                </Text>
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
     <View style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 10, backgroundColor: 'white', padding: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          placeholder="Cerca un luogo (es: Colosseo)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5 }}
        />
        <Button title="Cerca" onPress={handleSearch} />
      </View>
    {/* ?? Pulsante per il profilo */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 80, right: 100, zIndex: 10, backgroundColor: 'blue', padding: 10, borderRadius: 5 }}
        onPress={() => navigation.navigate('ProfileScreen')}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>?? Profilo</Text>
      </TouchableOpacity>
      
    {/* ?? Pulsante per il Logout */}
      <TouchableOpacity 
        style={{ position: 'absolute', top: 80, right: 10, zIndex: 10, backgroundColor: 'red', padding: 10, borderRadius: 5 }}
        onPress={logout}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>?? Logout</Text>
      </TouchableOpacity>

      {/* Pulsanti Giorno/Notte */}
      <View style={{ position: 'absolute', top: 80, left: 20, zIndex: 10 }}>
        <TouchableOpacity
          style={{ backgroundColor: mapTheme === 'light' ? 'yellow' : 'gray', padding: 10, marginBottom: 5, borderRadius: 5 }}
          onPress={() => handleThemeChange('light')}
        >
          <Text style={{ color: 'black', fontWeight: 'bold' }}>?? Giorno</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: mapTheme === 'dark' ? 'black' : 'gray', padding: 10, borderRadius: 5 }}
          onPress={() => handleThemeChange('dark')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>?? Notte</Text>
        </TouchableOpacity>
      </View>

      <MapView  
      provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }} 
        initialRegion={{ latitude: 45.4642, longitude: 9.1900, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
        customMapStyle={mapTheme === 'dark' ? darkMapStyle : []}
      onPress={handleMapPress}>
        {songs.map((song, index) => (
          <Marker key={`${song.lat}-${song.lon}-${index}`} coordinate={{ latitude: parseFloat(song.lat), longitude: parseFloat(song.lon) }} onPress={() => handleMarkerPress(parseFloat(song.lat), parseFloat(song.lon))} />
        ))}
      </MapView>
      {searchResults && (
        <Modal visible={true} animationType="slide" transparent={false}>
          <View style={styles.searchResultsContainer}>
            <Text style={styles.popupTitle}>{searchResults.name}</Text>
            <ScrollView>
              {searchResults.songs.length > 0 ? (
                searchResults.songs.map((song) => (
                  <View key={song.id} style={styles.songItem}>
                    <Text style={styles.songTitle}>{song.song_name} - {song.artist}</Text>
                    <Text>?? {song.creator_username}</Text>
                    <Text 
                         style={{ color: "green", textDecorationLine: "underline", marginTop: 5 }} 
                        onPress={() => Linking.openURL(song.spotify_url)}
                    >
                      ?? Ascolta su Spotify
                    </Text>
                    <Text>? {song.total_votes} voti</Text>
                    <Button title="Vota" onPress={() => handleVote(song.id, 1)} />
                    <Button title="Non mi piace" onPress={() => handleVote(song.id, -1)} />
                    {song.user_vote !== 0 && <Button title="Rimuovi Voto" onPress={() => handleVote(song.id, 0)} />}
                    {user?.username === song.creator_username && <Button title="Rimuovi Canzone" color="red" onPress={() => handleDeleteSong(song.id)} />}
                  </View>
                ))
              ) : (
                <Text>Nessuna canzone trovata per questo luogo.</Text>
              )}
            </ScrollView>
            <Button title="Chiudi" onPress={() => setSearchResults(null)} />
          </View>
        </Modal>
      )}
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
          <Button title="Chiudi" onPress={() => { 
          setShowAddSongModal(false); 
          setNewLocation(null); 
        }} />

        </View>
        )}
    </View>
  );
};

export default MapScreen;
