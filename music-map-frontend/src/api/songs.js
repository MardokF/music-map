import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const getSongs = async () => {
  try {
    const res = await axios.get(`${API_URL}/songs`);
    return res.data;
  } catch (error) {
    console.error('Errore nel recupero delle canzoni:', error);
    throw error;
  }
};

export const addSong = async (songData) => {
  try {
    const res = await axios.post(`${API_URL}/songs/add-song`, songData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (error) {
    console.error('Errore nell\'aggiunta della canzone:', error);
    throw error;
  }
};

export const voteSong = async (voteData) => {
  try {
    const res = await axios.post(`${API_URL}/songs/vote`, voteData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (error) {
    console.error('Errore nella richiesta di voto:', error);
    throw error;
  }
};

export const deleteSong = async (song_id, user_id) => {
  try {
    const res = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/songs/delete-song/${song_id}`, {
      data: { user_id }, // ? Passiamo l'ID dell'utente
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (error) {
    console.error('Errore nella rimozione della canzone:', error);
    throw error;
  }
};



