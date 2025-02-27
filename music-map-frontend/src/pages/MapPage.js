import React, { useEffect, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import AuthContext from '../context/AuthContext';
import { getSongs, addSong, voteSong, deleteSong } from '../api/songs';

const MapPage = () => {
  const [songs, setSongs] = useState([]);

  // Coordinate dove aggiungere la canzone (clic su mappa o cercate)
  const [newLocation, setNewLocation] = useState(null);
  // Dettagli della canzone in creazione da mappa o search
  const [songDetails, setSongDetails] = useState({
    song_name: '',
    artist: '',
    spotify_url: ''
  });

  // Per la funzionalità di aggiunta inline (nel popup di voto)
  const [popupSongName, setPopupSongName] = useState('');
  const [popupSongArtist, setPopupSongArtist] = useState('');
  const [popupSongUrl, setPopupSongUrl] = useState('');

  // Testo nella barra di ricerca
  const [searchQuery, setSearchQuery] = useState('');
  // Popup fullscreen con le canzoni trovate
  const [searchResults, setSearchResults] = useState(null);
  // Coordinate del luogo cercato
  const [searchCoords, setSearchCoords] = useState(null);

  // Per aggiungere direttamente dal popup di ricerca
  const [searchSongName, setSearchSongName] = useState('');
  const [searchSongArtist, setSearchSongArtist] = useState('');
  const [searchSongUrl, setSearchSongUrl] = useState('');

  const { user } = useContext(AuthContext);

    // ?? Stato per il tema della mappa (giorno/notte)
  const [mapTheme, setMapTheme] = useState("light");

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
      alert(error.response?.data?.error || "Errore durante l'aggiunta della canzone");
    }
  };

  // ? Aggiunta inline (dal popup di una canzone esistente)
  const handleAddSongInline = async (e, lat, lon) => {
    e.preventDefault();

    try {
      if (!popupSongName || !popupSongArtist || !popupSongUrl) {
        alert('Compila tutti i campi!');
        return;
      }

      const newSong = {
        user_id: user?.id,
        song_name: popupSongName,
        artist: popupSongArtist,
        lat: parseFloat(lat.toFixed(6)),
        lon: parseFloat(lon.toFixed(6)),
        spotify_url: popupSongUrl,
      };

      await addSong(newSong);
      // Pulisci i campi inline
      setPopupSongName('');
      setPopupSongArtist('');
      setPopupSongUrl('');

      fetchAllSongs();
    } catch (error) {
      console.error("Errore durante l'aggiunta in popup:", error);
      alert(error.response?.data?.error || "Errore durante l'aggiunta della canzone");
    }
  };

  // ? Votare o rimuovere il voto
const handleVote = async (song_id, vote) => {
  try {
    console.log(`??? Tentativo di voto: song_id=${song_id}, voto=${vote}`); // ?? Debug

    // Trova la canzone per capire se l'utente ha già votato
    const existingSong = songs.find(s => s.id === song_id);
    const existingVote = existingSong?.user_vote || 0;

    // Se l'utente clicca di nuovo sullo stesso voto, lo rimuoviamo (set a 0)
    const newVote = (existingVote === vote) ? 0 : vote;

    const voteData = {
      user_id: user?.id,
      song_id,
      vote: newVote,
    };

    console.log("?? Invio dati voto:", voteData); // ?? Debug

    await voteSong(voteData);

    // Dopo aver inviato il voto al backend, ricarichiamo i dati reali
    const updatedSongs = await getSongs(); // ? Otteniamo i dati aggiornati dal backend
    setSongs(updatedSongs); // ? Aggiorniamo la lista delle canzoni

    // ?? Se il popup di ricerca è aperto, aggiorniamo lo stato con i dati reali
    if (searchResults) {
      setSearchResults(prev => ({
        ...prev,
        songs: updatedSongs.filter(song =>
          Math.abs(song.lat - prev.lat) < 0.001 && Math.abs(song.lon - prev.lon) < 0.001
        )
      }));
    }

  } catch (error) {
    console.error("? Errore durante la votazione:", error.response?.data || error.message);
  }
};




  // ? Rimuovere una canzone
  const handleDeleteSong = async (song_id) => {
    try {
      await deleteSong(song_id, user?.id);
      fetchAllSongs();
    } catch (error) {
      alert('Non hai i permessi per eliminare questa canzone');
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


  const handleAddSongFromSearch = async (e) => {
    e.preventDefault();
    try {
      if (!searchResults) {
        alert("Nessun risultato di ricerca per aggiungere la canzone.");
        return;
      }

      if (!searchSongName || !searchSongArtist || !searchSongUrl) {
        alert("Compila tutti i campi!");
        return;
      }

      const lat = parseFloat(searchResults.lat.toFixed(6));
      const lon = parseFloat(searchResults.lon.toFixed(6));

      const newSong = {
        user_id: user?.id,
        song_name: searchSongName,
        artist: searchSongArtist,
        lat,
        lon,
        spotify_url: searchSongUrl,
      };

      await addSong(newSong);

      setSearchSongName('');
      setSearchSongArtist('');
      setSearchSongUrl('');
      setSearchResults(null);
      setSearchCoords(null);

      fetchAllSongs();
    } catch (error) {
      console.error("Errore durante l'aggiunta dal popup di ricerca:", error);
      alert(error.response?.data?.error || "Errore durante l'aggiunta della canzone");
    }
  };
  // ?? URL dei tile di OpenStreetMap per i temi chiaro e scuro
  const mapTileUrl = mapTheme === "light"
    ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  // ?? Mappa chiara
    : "https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png";  // ?? Mappa scura (Black & White OSM)


  return (
    <div className="h-screen relative">
     {/* ?? Pulsanti per cambiare tema della mappa */}
      <div className="absolute top-4 right-4 z-50 flex space-x-2">
        <button
          onClick={() => setMapTheme("light")}
          className={`px-4 py-2 rounded ${mapTheme === "light" ? "bg-blue-700 text-white" : "bg-gray-200 text-black"} transition`}
        >
          ?? Giorno
        </button>
        <button
          onClick={() => setMapTheme("dark")}
          className={`px-4 py-2 rounded ${mapTheme === "dark" ? "bg-gray-900 text-white" : "bg-gray-200 text-black"} transition`}
        >
          ?? Notte
        </button>
      </div>
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
      <MapContainer center={[45.4642, 9.1900]} zoom={13} className="h-full z-0" key={mapTheme}>
        <TileLayer
          attribution='© OpenStreetMap contributors'
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

                {/* ?? Form inline per aggiungere una canzone in questa coordinata */}
                <hr className="my-2" />
                <h4 className="font-bold mb-2">Aggiungi una nuova canzone qui</h4>
                <form onSubmit={(e) => handleAddSongInline(e, lat, lon)}>
                  <input
                    type="text"
                    placeholder="Nome Canzone"
                    value={popupSongName}
                    onChange={(e) => setPopupSongName(e.target.value)}
                    className="w-full p-1 mb-2 border"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Artista"
                    value={popupSongArtist}
                    onChange={(e) => setPopupSongArtist(e.target.value)}
                    className="w-full p-1 mb-2 border"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Spotify URL"
                    value={popupSongUrl}
                    onChange={(e) => setPopupSongUrl(e.target.value)}
                    className="w-full p-1 mb-2 border"
                    required
                  />
                  <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
                    Aggiungi
                  </button>
                </form>
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

          {searchResults.songs.length > 0 ? (
            searchResults.songs.map((song) => (
              <div key={song.id} className="border-b border-gray-600 pb-4 mb-4">
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
            ))
          ) : (
            <p>Nessuna canzone trovata per questo luogo.</p>
          )}

          {/* ? Aggiunta diretta nel popup di ricerca */}
          <div className="mt-4 p-4 border-t border-gray-600">
            <h3 className="text-xl font-bold mb-2">Aggiungi Canzone a {searchResults.name}</h3>
            <form onSubmit={handleAddSongFromSearch}>
              <input
                type="text"
                placeholder="Nome Canzone"
                value={searchSongName}
                onChange={(e) => setSearchSongName(e.target.value)}
                className="w-full p-2 mb-2 text-black"
                required
              />
              <input
                type="text"
                placeholder="Artista"
                value={searchSongArtist}
                onChange={(e) => setSearchSongArtist(e.target.value)}
                className="w-full p-2 mb-2 text-black"
                required
              />
              <input
                type="text"
                placeholder="Spotify URL"
                value={searchSongUrl}
                onChange={(e) => setSearchSongUrl(e.target.value)}
                className="w-full p-2 mb-2 text-black"
                required
              />
              <button type="submit" className="bg-green-500 px-4 py-2 rounded">
                Aggiungi ??
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
