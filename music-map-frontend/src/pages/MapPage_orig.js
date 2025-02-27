import React, { useEffect, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import AuthContext from '../context/AuthContext';
import { getSongs, addSong, voteSong, deleteSong } from '../api/songs';

const MapPage = () => {
  const [songs, setSongs] = useState([]);
  const [newLocation, setNewLocation] = useState(null);     // Coordinate dove aggiungere la canzone
  const [songDetails, setSongDetails] = useState({          // Dettagli della canzone in creazione
    song_name: '',
    artist: '',
    spotify_url: ''
  });
  const [searchQuery, setSearchQuery] = useState('');       // Testo nella barra di ricerca
  const [searchResults, setSearchResults] = useState(null); // Popup fullscreen con le canzoni trovate
  const [searchCoords, setSearchCoords] = useState(null);   // Coordinate del luogo cercato

  const { user } = useContext(AuthContext);

  // ?? Carica le canzoni al montaggio del componente
  useEffect(() => {
    fetchAllSongs();
  }, []);

  // ? Recupera tutte le canzoni dal backend
  const fetchAllSongs = async () => {
    try {
      const data = await getSongs();
      setSongs(data);
    } catch (error) {
      console.error('Errore nel recupero delle canzoni:', error);
    }
  };

  // ? Gestore dei click sulla mappa per aggiungere canzoni
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setNewLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
      },
    });
    return null;
  };

  // ? Aggiunta di una canzone (cliccando sulla mappa o dal luogo cercato)
  const handleAddSong = async (e) => {
    e.preventDefault();
    try {
      if (!newLocation) {
        alert("Seleziona un punto sulla mappa o scegli un luogo di ricerca.");
        return;
      }
      const lat = parseFloat(newLocation.lat.toFixed(6));
      const lon = parseFloat(newLocation.lon.toFixed(6));

      // Dati per il backend
      const newSong = {
        user_id: user?.id,
        song_name: songDetails.song_name,
        artist: songDetails.artist,
        lat,
        lon,
        spotify_url: songDetails.spotify_url,
      };

      await addSong(newSong);
      // Resetta il form
      setSongDetails({ song_name: '', artist: '', spotify_url: '' });
      setNewLocation(null);
      // Se stavi aggiungendo dal risultato di ricerca, chiudi le coordinate
      if (searchCoords) {
        setSearchCoords(null);
      }
      fetchAllSongs();
    } catch (error) {
      alert(error.response?.data?.error || 'Errore durante l\'aggiunta della canzone');
    }
  };

  // ? Votare o rimuovere il voto
  const handleVote = async (song_id, vote) => {
    try {
      // Cerca la canzone per capire se l'utente ha già votato
      const existingSong = songs.find(s => s.id === song_id);
      const existingVote = existingSong?.user_vote || 0;

      // Se l'utente riclicca lo stesso voto, lo rimuoviamo (set a 0)
      const newVote = (existingVote === vote) ? 0 : vote;

      const voteData = {
        user_id: user?.id,
        song_id,
        vote: newVote,
      };

      await voteSong(voteData);
      fetchAllSongs();
    } catch (error) {
      console.error('Errore durante la votazione:', error);
    }
  };

  // ? Rimuovere una canzone
  const handleDeleteSong = async (song_id) => {
    try {
      await deleteSong(song_id, user?.id);
      fetchAllSongs();
    } catch (error) {
      alert('Non hai i permessi per rimuovere questa canzone');
    }
  };

  // ? Raggruppa le canzoni per coordinate
  const groupSongsByLocation = () => {
    const grouped = {};
    songs.forEach((song) => {
      const key = `${song.lat},${song.lon}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(song);
    });
    return grouped;
  };

  const groupedSongs = groupSongsByLocation();

  // ? Ricerca di un luogo via Nominatim
  const handleSearch = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];

        // Trova le canzoni vicine a lat/lon (entro ~110m)
        const locationSongs = songs.filter(
          (song) => Math.abs(song.lat - lat) < 0.001 && Math.abs(song.lon - lon) < 0.001
        );

        setSearchResults({
          name: display_name,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          songs: locationSongs,
        });

        // Salva coordinate per eventuale aggiunta canzone
        setSearchCoords({ lat, lon });
      } else {
        alert('Nessun risultato trovato.');
      }
    } catch (error) {
      console.error('Errore durante la ricerca:', error);
    }
  };

  // ? Quando l'utente clicca su “Aggiungi canzone nel luogo cercato”
  const handleAddFromSearch = () => {
    if (!searchCoords) {
      alert('Nessun luogo selezionato.');
      return;
    }
    setNewLocation({
      lat: parseFloat(searchCoords.lat),
      lon: parseFloat(searchCoords.lon),
    });
  };

  return (
    <div className="h-screen relative">
      {/* ?? Barra di ricerca sopra la mappa */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex">
        <input
          type="text"
          placeholder="Cerca un luogo (es: Colosseo)"
          className="p-2 border rounded-lg w-72"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button className="ml-2 p-2 bg-blue-500 text-white rounded" onClick={handleSearch}>
          Cerca
        </button>
      </div>

      {/* ??? Mappa */}
      <MapContainer center={[45.4642, 9.1900]} zoom={13} className="h-full z-0">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />

        {/* ?? Mostra i Marker delle canzoni raggruppate */}
        {Object.keys(groupedSongs).map((coord) => {
          const [lat, lon] = coord.split(',').map(Number);
          const songsAtLocation = groupedSongs[coord];

          return (
            <Marker key={coord} position={[lat, lon]}>
              <Popup>
                <h3 className="font-bold">Canzoni qui:</h3>
                {songsAtLocation.map((song) => (
                  <div key={song.id} className="border-b pb-2 mb-2">
                    <strong>{song.song_name}</strong> by {song.artist} <br />
                    ?? Aggiunto da: {song.creator_username} <br />
                    ?? <a href={song.spotify_url} target="_blank" rel="noreferrer">Ascolta su Spotify</a> <br />
                    Voti: {song.total_votes}

                    <div className="flex mt-2">
                      <button
                        onClick={() => handleVote(song.id, 1)}
                        className={`px-2 py-1 rounded m-1 ${song.user_vote === 1 ? 'bg-green-600' : 'bg-green-500'} text-white`}
                      >
                        ??
                      </button>
                      <button
                        onClick={() => handleVote(song.id, -1)}
                        className={`px-2 py-1 rounded m-1 ${song.user_vote === -1 ? 'bg-red-600' : 'bg-red-500'} text-white`}
                      >
                        ??
                      </button>
                      {song.user_vote !== 0 && (
                        <button
                          onClick={() => handleVote(song.id, 0)}
                          className="bg-gray-500 text-white px-2 py-1 rounded m-1"
                        >
                          ? Rimuovi Voto
                        </button>
                      )}
                      {user?.username === song.creator_username && (
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          className="bg-red-700 text-white px-2 py-1 rounded ml-2"
                        >
                          ??? Rimuovi
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </Popup>
            </Marker>
          );
        })}

        {/* ? Aggiungi canzone cliccando sulla mappa */}
        {newLocation && (
          <Marker position={[newLocation.lat, newLocation.lon]}>
            <Popup>
              <h4 className="font-bold">Aggiungi la tua canzone qui:</h4>
              <form onSubmit={handleAddSong}>
                <input
                  type="text"
                  placeholder="Nome Canzone"
                  value={songDetails.song_name}
                  onChange={(e) => setSongDetails({ ...songDetails, song_name: e.target.value })}
                  className="w-full p-1 mb-2 border"
                  required
                />
                <input
                  type="text"
                  placeholder="Artista"
                  value={songDetails.artist}
                  onChange={(e) => setSongDetails({ ...songDetails, artist: e.target.value })}
                  className="w-full p-1 mb-2 border"
                  required
                />
                <input
                  type="text"
                  placeholder="Spotify URL"
                  value={songDetails.spotify_url}
                  onChange={(e) => setSongDetails({ ...songDetails, spotify_url: e.target.value })}
                  className="w-full p-1 mb-2 border"
                  required
                />
                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
                  Aggiungi
                </button>
              </form>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ? Popup Fullscreen con i risultati della ricerca */}
      {searchResults && (
        <div className="fixed inset-0 bg-black bg-opacity-80 text-white p-6 z-50 overflow-auto">
          <button
            className="absolute top-4 right-4 text-3xl"
            onClick={() => {
              setSearchResults(null);
              setSearchCoords(null);
            }}
          >
            ?
          </button>

          <h2 className="text-2xl font-bold mb-4">{searchResults.name}</h2>

          {/* ?? Canzoni associate al luogo */}
          {searchResults.songs.length > 0 ? (
            searchResults.songs.map((song) => (
              <div key={song.id} className="border-b border-gray-600 pb-4 mb-4">
                <strong>{song.song_name}</strong> by {song.artist} <br />
                ?? Aggiunto da: {song.creator_username} <br />
                ?? <a href={song.spotify_url} target="_blank" rel="noreferrer">Spotify</a> <br />
                Voti: {song.total_votes}

                <div className="flex mt-2">
                      <button
                        onClick={() => handleVote(song.id, 1)}
                        className={`px-2 py-1 rounded m-1 ${song.user_vote === 1 ? 'bg-green-600' : 'bg-green-500'} text-white`}
                      >
                        ??
                      </button>
                      <button
                        onClick={() => handleVote(song.id, -1)}
                        className={`px-2 py-1 rounded m-1 ${song.user_vote === -1 ? 'bg-red-600' : 'bg-red-500'} text-white`}
                      >
                        ??
                      </button>
                      {song.user_vote !== 0 && (
                        <button
                          onClick={() => handleVote(song.id, 0)}
                          className="bg-gray-500 text-white px-2 py-1 rounded m-1"
                        >
                          ? Rimuovi Voto
                        </button>
                      )}
                      {user?.username === song.creator_username && (
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          className="bg-red-700 text-white px-2 py-1 rounded ml-2"
                        >
                          ??? Rimuovi
                        </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>Nessuna canzone in questo luogo.</p>
          )}

          {/* ? Aggiungi canzone nel luogo cercato */}
          <div className="mt-4 p-4 border-t border-gray-600">
            <h3 className="text-xl font-bold mb-2">Aggiungi Canzone a {searchResults.name}</h3>
            <button
              onClick={handleAddFromSearch}
              className="bg-blue-700 text-white px-4 py-2 rounded"
            >
              Imposta Coordinate
            </button>
            {/* Una volta impostate le coordinate, appare il Marker e avvii la form in mappa */}
            <p className="text-sm mt-1">Poi compila il form nel marker sulla mappa.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
