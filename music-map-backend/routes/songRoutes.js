const express = require('express');
const pool = require('../db');
const { getSpotifyTrackDetails } = require('./spotifyRoutes'); // Import della funzione
const router = express.Router();

// Aggiungere una canzone alla mappa
router.post('/add-song', async (req, res) => {
  const { user_id, song_name, artist, lat, lon, spotify_url } = req.body;

  try {
    // ? Verifica se l'utente ha già aggiunto una canzone in queste coordinate
    const existingSong = await pool.query(
      'SELECT * FROM songs WHERE user_id = $1 AND lat = $2 AND lon = $3',
      [user_id, lat, lon]
    );

    if (existingSong.rows.length > 0) {
      return res.status(400).json({ error: 'Hai già aggiunto una canzone in questa posizione' });
    }

    // ? Inserisci la nuova canzone
    const result = await pool.query(
      `INSERT INTO songs (user_id, song_name, artist, lat, lon, spotify_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, song_name, artist, lat, lon, spotify_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nell\'aggiunta della canzone:', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/vote', async (req, res) => {
  const { user_id, song_id, vote } = req.body;

  try {
    // ? Se voto è 0, rimuovi il voto
    if (vote === 0) {
      await pool.query('DELETE FROM votes WHERE user_id = $1 AND song_id = $2', [user_id, song_id]);
      return res.json({ message: 'Voto rimosso' });
    }

    // ? Altrimenti, aggiorna o aggiungi il voto
    const result = await pool.query(
      `INSERT INTO votes (user_id, song_id, vote)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, song_id)
       DO UPDATE SET vote = EXCLUDED.vote`,
      [user_id, song_id, vote]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Errore nella gestione del voto:', error);
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
      SELECT s.*, u.username AS creator_username, COALESCE(SUM(v.vote), 0) AS total_votes
      FROM songs s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN votes v ON s.id = v.song_id
      GROUP BY s.id, u.username
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

// ? Rimuovi canzone (solo se l'utente è il creatore)
router.delete('/delete-song/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body; // Passiamo l'ID dell'utente per il controllo

  try {
    // Verifica se l'utente è il creatore della canzone
    const song = await pool.query('SELECT user_id FROM songs WHERE id = $1', [id]);
    if (song.rows.length === 0) {
      return res.status(404).json({ error: 'Canzone non trovata' });
    }

    if (song.rows[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Non hai i permessi per eliminare questa canzone' });
    }

    // Elimina la canzone
    await pool.query('DELETE FROM songs WHERE id = $1', [id]);
    res.json({ message: 'Canzone rimossa con successo' });
  } catch (error) {
    console.error('Errore nella rimozione della canzone:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
 
