import axios from 'axios';

// ?? MODIFICA QUESTO URL CON IL TUO IP LOCALE
const BACKEND_URL = "https://music-map.onrender.com"; 

// ? Recupera tutte le canzoni dalla mappa
export const getSongs = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/songs`);
    return response.data;
  } catch (error) {
    console.error("Errore nel recupero delle canzoni:", error);
    throw error;
  }
};

// ? Recupera le canzoni aggiunte da un utente
export const getUserSongs = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/songs/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Errore nel recupero delle canzoni dell’utente:", error);
    throw error;
  }
};

// ? Aggiungi una nuova canzone alla mappa
export const addSong = async (songData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/songs/add-song`, songData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Errore nell\'aggiunta della canzone:', error);
    throw error;
  }
};

// ? Vota una canzone
export const voteSong = async (voteData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/songs/vote`, voteData);
    return response.data;
  } catch (error) {
    console.error("Errore nella votazione della canzone:", error);
    throw error;
  }
};

// ? Elimina una canzone
export const deleteSong = async (song_id, user_id) => {
     try {
     console.log(`?? Chiamata API DELETE: ${BACKEND_URL}/songs/delete-song/${song_id}`);
    const res = await axios.delete(`${BACKEND_URL}/api/songs/delete-song/${song_id}`, {
      data: { user_id }, // ? Passiamo l'ID dell'utente
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (error) {
    console.error('Errore nella rimozione della canzone:', error);
    throw error;
  }
};
