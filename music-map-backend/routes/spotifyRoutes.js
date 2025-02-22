const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const router = express.Router();

// Configura Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Ottiene il token di accesso
async function getSpotifyAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
    console.log("Token Spotify ottenuto!");
  } catch (error) {
    console.error("Errore nel recupero del token di Spotify:", error.message);
  }
}


// Recupera i dettagli della canzone da Spotify
async function getSpotifyTrackDetails(spotify_url) {
  try {
    await getSpotifyAccessToken();
    const trackId = spotify_url.split('/track/')[1].split('?')[0]; // Estrae l'ID della traccia
    const data = await spotifyApi.getTrack(trackId);

    return {
      name: data.body.name,
      artist: data.body.artists.map(artist => artist.name).join(', '),
      album: data.body.album.name,
      cover: data.body.album.images[0]?.url,
      preview_url: data.body.preview_url,
      spotify_url: data.body.external_urls.spotify,
    };
  } catch (error) {
    console.error(`Errore nel recupero dei dettagli Spotify per la traccia ${spotify_url}:`, error.message);
    return null;
  }
}


// API: Cerca una canzone su Spotify
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Devi fornire un parametro di ricerca' });
  }

  try {
    const data = await spotifyApi.searchTracks(query);
    const songs = data.body.tracks.items.map(track => ({
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      spotify_url: track.external_urls.spotify,
      preview_url: track.preview_url,
      cover: track.album.images[0]?.url
    }));

    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ?? Esportiamo sia il router che la funzione
module.exports = {
  router,
  getSpotifyTrackDetails
};

