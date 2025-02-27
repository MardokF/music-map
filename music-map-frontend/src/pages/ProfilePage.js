import React, { useEffect, useState, useContext } from 'react';
import { getSongsByUser } from '../api/songs';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [userSongs, setUserSongs] = useState([]);

  useEffect(() => {
    if (user) {
    console.log("User ID:", user?.id); // ?? Debug: Stampiamo l'ID dell'utentes
      fetchUserSongs();
    }
  }, [user]);

  const fetchUserSongs = async () => {
    try {
      const songs = await getSongsByUser(user.id);
      setUserSongs(songs);
    } catch (error) {
      console.error('Errore nel recupero delle canzoni dell’utente:', error);
    }
  };

  if (!user) {
    return <p className="text-center text-red-500">Devi essere loggato per vedere il tuo profilo.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">?? Profilo di {user.username}</h1>
      <h2 className="text-lg font-semibold mb-2">Le tue canzoni aggiunte:</h2>

      {userSongs.length > 0 ? (
        <ul className="space-y-4">
          {userSongs.map((song) => (
            <li key={song.id} className="border p-4 rounded-lg">
              <p><strong>{song.song_name}</strong> di {song.artist}</p>
              <p>?? Posizione: ({song.lat.toFixed(6)}, {song.lon.toFixed(6)})</p>
              <p>? Voti: {song.total_votes}</p>
              <a href={song.spotify_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                ?? Ascolta su Spotify
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Non hai ancora aggiunto nessuna canzone.</p>
      )}
    </div>
  );
};

export default ProfilePage;

