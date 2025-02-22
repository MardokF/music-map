const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db'); // Importiamo la connessione al DB
const jwt = require('jsonwebtoken');

const router = express.Router();

// Registrazione utente con password criptata
router.post('/register', async (req, res) => {
  console.log("Dati ricevuti:", req.body); // 🔍 Debug

  const { username, email, password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "La password è obbligatoria" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Login utente
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Controlla se l'utente esiste nel database
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Confronta la password (assumendo che sia hashata con bcrypt)
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // 🔹 GENERAZIONE DEL TOKEN JWT
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,  // Assicurati di averlo definito nel file .env
      { expiresIn: '24h' }
    );

    res.json({ token, user: user.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
 
