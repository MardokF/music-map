require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const songRoutes = require('./routes/songRoutes');

const { router: spotifyRoutes } = require('./routes/spotifyRoutes');

const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
app.use(cors());
app.use(express.json());

// Usiamo le API separate
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/spotify', spotifyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Configurazione API di Spotify
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Genera un token di accesso
async function getSpotifyAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
    console.log("?? Token Spotify ottenuto!");
  } catch (error) {
    console.error("Errore nel recupero del token di Spotify:", error.message);
  }
}

//const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("? Connesso a PostgreSQL!"))
  .catch(err => console.error("? Errore di connessione al database:", err));

module.exports = pool;

// Ottenere il token all'avvio del server
getSpotifyAccessToken();
