// Load environment variables first
require('dotenv').config();

const express = require('express');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tasks', tasksRouter);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});