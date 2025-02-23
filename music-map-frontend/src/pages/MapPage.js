import React, { useEffect, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { getSongs, addSong, voteSong, deleteSong } from '../api/songs';
import AuthContext from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

const MapPage = () => {
  const [songs, setSongs] = useState([]);
  const [newLocation, setNewLocation] = useState(null);
  const [songDetails, setSongDetails] = useState({ song_name: '', artist: '', spotify_url: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const data = await getSongs();
      setSongs(data);
    } catch (error) {
      console.error('Errore nel recupero delle canzoni:', error);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setNewLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
      },
    });
    return null;
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    try {
      if (!newLocation) {
        alert("Seleziona un punto sulla mappa o usa il pulsante 'Aggiungi Canzone'.");
        return;
      }

      const songData = {
        user_id: user?.id,
        song_name: songDetails.song_name,
        artist: songDetails.artist,
        lat: parseFloat(newLocation.lat.toFixed(6)),
        lon: parseFloat(newLocation.lon.toFixed(6)),
        spotify_url: songDetails.spotify_url,
      };

      await addSong(songData);
      setNewLocation(null);
      setSongDetails({ song_name: '', artist: '', spotify_url: '' });
      fetchSongs();
    } catch (error) {
      alert(error.response?.data?.error || 'Errore nell\'aggiunta della canzone');
    }
  };

  const handleVote = async (song_id, vote) => {
    try {
      const existingVote = songs.find(s => s.id === song_id)?.user_vote || 0;
      const newVote = existingVote === vote ? 0 : vote;

      const voteData = {
        user_id: user?.id,
        song_id,
        vote: newVote,
      };

      await voteSong(voteData);
      fetchSongs();
    } catch (error) {
      console.error('Errore durante la votazione:', error);
    }
  };

  const handleDeleteSong = async (song_id) => {
    try {
      await deleteSong(song_id, user?.id);
      fetchSongs();
    } catch (error) {
      alert('Non hai i permessi per eliminare questa canzone');
    }
  };

  const groupSongsByLocation = () => {
    const grouped = {};
    songs.forEach(song => {
      const key = `${song.lat},${song.lon}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(song);
    });
    return grouped;
  };

  const groupedSongs = groupSongsByLocation();

  return (
    <div className="h-screen">
      <MapContainer center={[45.4642, 9.1900]} zoom={13} className="h-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />

        {/* ?? Mostra i Marker raggruppati per coordinate */}
        {Object.keys(groupedSongs).map((coord) => {
          const [lat, lon] = coord.split(',').map(Number);
          const songsAtLocation = groupedSongs[coord];
          const userHasSongHere = songsAtLocation.some(song => song.user_id === user?.id);

          return (
            <Marker key={coord} position={[lat, lon]}>
              <Popup>
                <h3 className="font-bold">?? Canzoni in questa posizione:</h3>
                {songsAtLocation.map((song) => (
                  <div key={song.id} className="mb-2 border-b pb-2">
                    <strong>{song.song_name}</strong> by {song.artist} <br />
                    ?? Aggiunto da: <strong>{song.creator_username}</strong><br />
                    ?? <a href={song.spotify_url} target="_blank" rel="noreferrer">Ascolta su Spotify</a><br />
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

                {/* ? Pulsante per aggiungere una canzone */}
                {!userHasSongHere && (
                  <button
                    onClick={() => setNewLocation({ lat, lon })}
                    className="bg-blue-500 text-white px-3 py-1 rounded mt-3"
                  >
                    ? Aggiungi Canzone Qui
                  </button>
                )}

                {/* ? Mostra il form se si vuole aggiungere una canzone */}
                {newLocation && newLocation.lat === lat && newLocation.lon === lon && (
                  <form onSubmit={handleAddSong} className="mt-4">
                    <h4 className="font-bold">? Inserisci la tua canzone:</h4>
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
                    <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded">
                      Aggiungi ??
                    </button>
                  </form>
                )}
              </Popup>
            </Marker>
          );
        })}

        {/* ? Aggiungi una nuova canzone cliccando sulla mappa */}
        {newLocation && (
          <Marker position={[newLocation.lat, newLocation.lon]}>
            <Popup>
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
                  Aggiungi ??
                </button>
              </form>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapPage;
