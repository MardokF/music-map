const express = require('express');
const pool = require('../db');

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

  if (!user_id || !song_id || (vote !== 1 && vote !== -1)) {
    return res.status(400).json({ error: 'user_id, song_id e vote (1 o -1) sono obbligatori' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO votes (user_id, song_id, vote) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, song_id) 
       DO UPDATE SET vote = EXCLUDED.vote 
       RETURNING *;`,
      [user_id, song_id, vote]
    );

    res.json(result.rows[0]);
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

module.exports = router;
 
