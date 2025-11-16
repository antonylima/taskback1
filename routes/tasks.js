const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET task by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status = 'pending' } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await db.execute(
      'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?) RETURNING *',
      [title, description, status]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    const result = await db.execute(
      'UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      [title, description, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute('DELETE FROM tasks WHERE id = ? RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;