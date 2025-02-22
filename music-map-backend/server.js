require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const songRoutes = require('./routes/songRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Usiamo le API separate
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
