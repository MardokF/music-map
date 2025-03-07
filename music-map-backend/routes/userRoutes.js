const express = require('express');
const bcrypt = require('bcryptjs');
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
    // ✅ Recupera l'utente dal database
    const result = await pool.query('SELECT id, username, email, password FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Email o password errati' });
    }

    // ✅ Confronta la password usando bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Email o password errati' });
    }

    // ✅ Genera il token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ 
  token, 
  user: { id: user.id, username: user.username, email: user.email } 
});
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ error: 'Errore del server' });
  }
});

module.exports = router;
 
