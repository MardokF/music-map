import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

// Sostituisci con il tuo IP locale (Metodo 1 che ti ho spiegato prima)
const BACKEND_URL = "http://192.168.1.53:5000"; 

const App = () => {
  const [songs, setSongs] = useState([]);
  
  // ? Recupera le canzoni dal backend
  const fetchSongs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/songs`);
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error("Errore nel recupero delle canzoni:", error);
    }
  };

  // ?? Esegue `fetchSongs()` quando l'app si avvia
  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#121212" }}>
      <Text style={{ color: "white", fontSize: 24, marginBottom: 10 }}>?? Canzoni sulla Mappa</Text>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 15, backgroundColor: "#1f1f1f", marginBottom: 10, borderRadius: 10 }}>
            <Text style={{ color: "white", fontSize: 18 }}>{item.song_name}</Text>
            <Text style={{ color: "#bbbbbb" }}>?? {item.artist}</Text>
            <TouchableOpacity onPress={() => console.log("Votato:", item.id)}>
              <Text style={{ color: "#00ff88", marginTop: 5 }}>?? Vota</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default App;
