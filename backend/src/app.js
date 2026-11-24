const express = require('express');
const authRoutes = require('./features/auth/auth.routes');

const app = express();

app.use('/api/auth', authRoutes);

module.exports = app;
