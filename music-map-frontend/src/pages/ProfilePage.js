import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { getSongsByUser } from '../api/songs';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [userSongs, setUserSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ? Recupera le canzoni aggiunte dall'utente
  useEffect(() => {
    const fetchUserSongs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        console.log(`?? Caricamento canzoni per l'utente: ${user.id}`); // Debug
        const data = await getSongsByUser(user.id);
        console.log("? Canzoni trovate:", data); // Debug
        setUserSongs(data);
      } catch (err) {
        console.error("? Errore nel recupero delle canzoni dell'utente:", err);
        setError("Errore nel recupero delle canzoni.");
      }
      setLoading(false);
    };

    fetchUserSongs();
  }, [user]);

  // ? Se il profilo sta ancora caricando
  if (loading) return <p className="text-center mt-10">? Caricamento in corso...</p>;

  // ? Se l'utente non ha canzoni aggiunte
  if (!loading && userSongs.length === 0)
    return <p className="text-center mt-10">?? Non hai ancora aggiunto nessuna canzone.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-4">?? Profilo di {user?.username}</h1>

      {/* ? Lista delle canzoni aggiunte */}
      <div className="space-y-4">
        {userSongs.map((song) => {
          const lat = Number(song.lat);
          const lon = Number(song.lon);

          return (
            <div key={song.id} className="p-4 border rounded-lg shadow-md bg-gray-100">
              <p className="text-lg font-semibold">{song.song_name} - {song.artist}</p>
              <p className="text-sm">?? Posizione: {isNaN(lat) ? "N/D" : lat.toFixed(6)}, {isNaN(lon) ? "N/D" : lon.toFixed(6)}</p>
              <p className="text-sm">?? Voti: {song.total_votes}</p>
              <a href={song.spotify_url} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                ?? Ascolta su Spotify
              </a>
            </div>
          );
        })}
      </div>

      {/* ? Messaggio di errore */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default ProfilePage;
