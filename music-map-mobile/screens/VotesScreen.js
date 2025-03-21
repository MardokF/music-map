import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking } from 'react-native';
import AuthContext from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import voteStyles from '../styles/MapStyles';

//const BACKEND_URL = "https://music-map.onrender.com"; 
const BACKEND_URL = "http://192.168.1.53:5000"; 

const VotesScreen = () => {
  const { user } = useContext(AuthContext);
  const [allVotes, setAllVotes] = useState([]);
  const [filter, setFilter] = useState(null);

  const fetchVotedSongs = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/songs/voted/${user.id}`);
      setAllVotes(res.data);
    } catch (err) {
      console.error('Errore nel recupero voti:', err);
    }
  };

  useEffect(() => {
    fetchVotedSongs();
  }, []);

  const filteredVotes = filter
    ? allVotes.filter(song => song.vote_state === filter)
    : allVotes;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Le tue canzoni votate</Text>

      {/* Filtro per tipo voto */}
      <View style={voteStyles.voteButtonContainer}>
        {['happy', 'sad', 'adrenalin', 'relaxed'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(filter === type ? null : type)}
            style={[
              voteStyles.voteButton,
              filter === type
                ? voteStyles[`${type}Active`]
                : voteStyles[type]
            ]}
          >
            <Ionicons
              name={
                type === 'happy' ? 'happy-outline' :
                type === 'sad' ? 'sad-outline' :
                type === 'adrenalin' ? 'flash-outline' :
                'leaf-outline'
              }
              size={20}
              color="white"
            />
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredVotes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.song_name} - {item.artist}</Text>
            <Text>Votato come: {item.vote_state}</Text>
            <Text>Aggiunto da: {item.creator_username}</Text>
            <Text
              style={{ color: 'green', textDecorationLine: 'underline' }}
              onPress={() => Linking.openURL(item.spotify_url)}
            >
              Ascolta su Spotify
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default VotesScreen;
