const express = require('express');
const pool = require('../db');
const { getSpotifyTrackDetails } = require('./spotifyRoutes'); // Import della funzione
const router = express.Router();

// Aggiungere una canzone alla mappa
router.post('/add-song', async (req, res) => {
  const { user_id, song_name, artist, lat, lon, spotify_url } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO songs (user_id, song_name, artist, lat, lon, spotify_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, song_name, artist, lat, lon, spotify_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Votare una canzone
router.post('/vote', async (req, res) => {
    const { user_id, song_id, vote } = req.body;

    // Controlla che il voto sia +1 o -1
    if (![1, -1].includes(vote)) {
        return res.status(400).json({ error: 'Il voto deve essere +1 o -1' });
    }

    try {
        // Controlla se l'utente ha già votato
        const checkVote = await pool.query(
            'SELECT * FROM votes WHERE user_id = $1 AND song_id = $2',
            [user_id, song_id]
        );

        if (checkVote.rows.length > 0) {
            return res.status(400).json({ error: 'Hai già votato questa canzone' });
        }

        // Inserisce il voto
        const result = await pool.query(
            'INSERT INTO votes (user_id, song_id, vote) VALUES ($1, $2, $3) RETURNING *',
            [user_id, song_id, vote]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Recuperare le canzoni in base alla posizione
router.get('/songs-nearby', async (req, res) => {
  const { lat, lon, radius } = req.query;

  if (!lat || !lon || !radius) {
    return res.status(400).json({ error: 'lat, lon e radius sono obbligatori' });
  }

  try {
    const result = await pool.query(
      `SELECT songs.*, 
        ( 6371 * acos(
          cos(radians($1)) * cos(radians(lat)) * cos(radians(lon) - radians($2)) 
          + sin(radians($1)) * sin(radians(lat))
        ) ) AS calculated_distance
      FROM songs
      WHERE ( 6371 * acos(
          cos(radians($1)) * cos(radians(lat)) * cos(radians(lon) - radians($2)) 
          + sin(radians($1)) * sin(radians(lat))
        ) ) < $3
      ORDER BY calculated_distance ASC`,
      [lat, lon, radius]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ?? API: Ottieni canzoni con voti
router.get('/songs', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, COALESCE(SUM(v.vote), 0) AS total_votes
            FROM songs s
            LEFT JOIN votes v ON s.id = v.song_id
            GROUP BY s.id
            ORDER BY total_votes DESC;
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ?? API: Recupera le canzoni con i dettagli di Spotify e i voti
router.get('/', async (req, res) => {
  try {

    // Recupera tutte le canzoni con i voti
    const result = await pool.query(`
      SELECT s.*, 
             COALESCE(SUM(v.vote), 0) AS total_votes
      FROM songs s
      LEFT JOIN votes v ON s.id = v.song_id
      GROUP BY s.id
      ORDER BY total_votes DESC;
    `);

    // Recupera i dettagli da Spotify per ogni canzone
    const songsWithSpotifyDetails = await Promise.all(
      result.rows.map(async (song) => {
        const spotifyDetails = await getSpotifyTrackDetails(song.spotify_url);
        return {
          ...song,
          spotify_details: spotifyDetails,
        };
      })
    );

    res.json(songsWithSpotifyDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
 
