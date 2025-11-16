const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all tasks
router.get('/', async (req, res) => {
  try {
    // Get sorting parameters from query
    const sortBy = req.query.sort || 'priority_position';
    const order = req.query.order || 'desc';
    
    let orderClause = '';
    switch (sortBy) {
      case 'priority':
        // Custom priority order: urgent > high > normal > low
        orderClause = `ORDER BY 
          CASE priority 
            WHEN 'urgent' THEN 4 
            WHEN 'high' THEN 3 
            WHEN 'normal' THEN 2 
            WHEN 'low' THEN 1 
          END ${order.toUpperCase()}, 
          position ASC, 
          created_at DESC`;
        break;
      case 'created_at':
        orderClause = `ORDER BY created_at ${order.toUpperCase()}`;
        break;
      case 'updated_at':
        orderClause = `ORDER BY updated_at ${order.toUpperCase()}`;
        break;
      case 'title':
        orderClause = `ORDER BY title ${order.toUpperCase()}`;
        break;
      default: // priority_position
        orderClause = `ORDER BY 
          is_urgent DESC,
          CASE priority 
            WHEN 'urgent' THEN 4 
            WHEN 'high' THEN 3 
            WHEN 'normal' THEN 2 
            WHEN 'low' THEN 1 
          END DESC, 
          position ASC, 
          created_at DESC`;
    }
    
    const result = await db.execute(`SELECT * FROM tasks ${orderClause}`);
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
    const { title, description, status = 'pending', priority = 'normal', is_urgent = false } = req.body;
    
    console.log('Received body:', req.body);
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Clean and escape the values for SQL safety
    const cleanTitle = String(title).trim().replace(/'/g, "''");
    const cleanDescription = description ? String(description).trim().replace(/'/g, "''") : null;
    const cleanStatus = (status || 'pending').replace(/'/g, "''");
    const cleanPriority = (priority || 'normal').replace(/'/g, "''");
    const urgentFlag = is_urgent ? 1 : 0;
    
    // Calculate position - urgent tasks go to top, others go to end
    let position = 0;
    if (urgentFlag || priority === 'urgent') {
      // Get the highest position for urgent/high priority tasks
      const maxPosResult = await db.execute(`
        SELECT COALESCE(MIN(position), 0) - 100 as new_position 
        FROM tasks 
        WHERE is_urgent = 1 OR priority IN ('urgent', 'high')
      `);
      position = maxPosResult.rows[0]?.new_position || 0;
    } else {
      // Get next position for normal tasks
      const maxPosResult = await db.execute('SELECT COALESCE(MAX(position), 0) + 100 as new_position FROM tasks');
      position = maxPosResult.rows[0]?.new_position || 100;
    }
    
    console.log('Clean values:', { cleanTitle, cleanDescription, cleanStatus, cleanPriority, urgentFlag, position });
    
    // Use direct SQL as a workaround for parameter binding issue
    const insertSQL = cleanDescription 
      ? `INSERT INTO tasks (title, description, status, priority, position, is_urgent) VALUES ('${cleanTitle}', '${cleanDescription}', '${cleanStatus}', '${cleanPriority}', ${position}, ${urgentFlag})`
      : `INSERT INTO tasks (title, description, status, priority, position, is_urgent) VALUES ('${cleanTitle}', NULL, '${cleanStatus}', '${cleanPriority}', ${position}, ${urgentFlag})`;
    
    console.log('Executing SQL:', insertSQL);
    
    const insertResult = await db.execute(insertSQL);
    console.log('Insert result:', insertResult);
    
    // Get the inserted task
    const selectResult = await db.execute(
      `SELECT * FROM tasks WHERE id = ${insertResult.lastInsertRowid}`
    );
    
    console.log('Select result:', selectResult);
    
    res.status(201).json(selectResult.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task: ' + error.message });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    
    const cleanId = parseInt(id);
    
    console.log('Updating task:', cleanId, 'with fields:', updateFields);
    
    // First, get the current task data
    const currentResult = await db.execute(`SELECT * FROM tasks WHERE id = ${cleanId}`);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const currentTask = currentResult.rows[0];
    
    // Merge current data with updates, only updating provided fields
    const updatedTask = {
      title: updateFields.title !== undefined ? String(updateFields.title).trim() : currentTask.title,
      description: updateFields.description !== undefined ? 
        (updateFields.description ? String(updateFields.description).trim() : null) : 
        currentTask.description,
      status: updateFields.status !== undefined ? String(updateFields.status) : currentTask.status,
      priority: updateFields.priority !== undefined ? String(updateFields.priority) : currentTask.priority,
      is_urgent: updateFields.is_urgent !== undefined ? (updateFields.is_urgent ? 1 : 0) : currentTask.is_urgent,
      position: currentTask.position
    };
    
    // Handle position changes for priority/urgent updates
    if (updateFields.priority !== undefined || updateFields.is_urgent !== undefined) {
      const newIsUrgent = updatedTask.is_urgent || updatedTask.priority === 'urgent';
      const oldIsUrgent = currentTask.is_urgent || currentTask.priority === 'urgent';
      
      if (newIsUrgent && !oldIsUrgent) {
        // Moving to urgent - get top position
        const maxPosResult = await db.execute(`
          SELECT COALESCE(MIN(position), 0) - 100 as new_position 
          FROM tasks 
          WHERE id != ${cleanId} AND (is_urgent = 1 OR priority IN ('urgent', 'high'))
        `);
        updatedTask.position = maxPosResult.rows[0]?.new_position || 0;
      } else if (!newIsUrgent && oldIsUrgent) {
        // Moving from urgent - get bottom position
        const maxPosResult = await db.execute(`
          SELECT COALESCE(MAX(position), 0) + 100 as new_position 
          FROM tasks 
          WHERE id != ${cleanId}
        `);
        updatedTask.position = maxPosResult.rows[0]?.new_position || 100;
      }
    }
    
    // Update is_urgent flag based on priority
    if (updatedTask.priority === 'urgent') {
      updatedTask.is_urgent = 1;
    }
    
    // Escape values for SQL safety
    const cleanTitle = String(updatedTask.title).replace(/'/g, "''");
    const cleanDescription = updatedTask.description ? String(updatedTask.description).replace(/'/g, "''") : null;
    const cleanStatus = String(updatedTask.status).replace(/'/g, "''");
    const cleanPriority = String(updatedTask.priority).replace(/'/g, "''");
    
    console.log('Final values to update:', { cleanTitle, cleanDescription, cleanStatus, cleanPriority, is_urgent: updatedTask.is_urgent, position: updatedTask.position });
    
    // Update the task using direct SQL
    const updateSQL = cleanDescription
      ? `UPDATE tasks SET title = '${cleanTitle}', description = '${cleanDescription}', status = '${cleanStatus}', priority = '${cleanPriority}', is_urgent = ${updatedTask.is_urgent}, position = ${updatedTask.position}, updated_at = CURRENT_TIMESTAMP WHERE id = ${cleanId}`
      : `UPDATE tasks SET title = '${cleanTitle}', description = NULL, status = '${cleanStatus}', priority = '${cleanPriority}', is_urgent = ${updatedTask.is_urgent}, position = ${updatedTask.position}, updated_at = CURRENT_TIMESTAMP WHERE id = ${cleanId}`;
    
    await db.execute(updateSQL);
    
    // Get the updated task
    const result = await db.execute(`SELECT * FROM tasks WHERE id = ${cleanId}`);
    
    console.log('Updated task result:', result.rows[0]);
    
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
    const cleanId = parseInt(id);
    
    // Check if task exists
    const existsResult = await db.execute(`SELECT id FROM tasks WHERE id = ${cleanId}`);
    
    if (existsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Delete the task
    await db.execute(`DELETE FROM tasks WHERE id = ${cleanId}`);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// POST toggle urgent status
router.post('/:id/toggle-urgent', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = parseInt(id);
    
    // Get current task
    const currentResult = await db.execute(`SELECT * FROM tasks WHERE id = ${cleanId}`);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const currentTask = currentResult.rows[0];
    const newUrgentStatus = !currentTask.is_urgent;
    
    // Calculate new position
    let newPosition = currentTask.position;
    if (newUrgentStatus) {
      // Moving to urgent - get top position
      const maxPosResult = await db.execute(`
        SELECT COALESCE(MIN(position), 0) - 100 as new_position 
        FROM tasks 
        WHERE id != ${cleanId} AND (is_urgent = 1 OR priority IN ('urgent', 'high'))
      `);
      newPosition = maxPosResult.rows[0]?.new_position || 0;
    } else {
      // Moving from urgent - get bottom position  
      const maxPosResult = await db.execute(`
        SELECT COALESCE(MAX(position), 0) + 100 as new_position 
        FROM tasks 
        WHERE id != ${cleanId}
      `);
      newPosition = maxPosResult.rows[0]?.new_position || 100;
    }
    
    // Update task
    await db.execute(`
      UPDATE tasks 
      SET is_urgent = ${newUrgentStatus ? 1 : 0}, 
          position = ${newPosition},
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${cleanId}
    `);
    
    // Get updated task
    const result = await db.execute(`SELECT * FROM tasks WHERE id = ${cleanId}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling urgent status:', error);
    res.status(500).json({ error: 'Failed to toggle urgent status' });
  }
});

// POST move task up in priority
router.post('/:id/move-up', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = parseInt(id);
    
    // Get current task
    const currentResult = await db.execute(`SELECT * FROM tasks WHERE id = ${cleanId}`);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const currentTask = currentResult.rows[0];
    
    // Find task immediately above this one
    const aboveResult = await db.execute(`
      SELECT * FROM tasks 
      WHERE position < ${currentTask.position}
      ORDER BY position DESC 
      LIMIT 1
    `);
    
    if (aboveResult.rows.length > 0) {
      const aboveTask = aboveResult.rows[0];
      
      // Swap positions
      await db.execute(`UPDATE tasks SET position = ${aboveTask.position} WHERE id = ${cleanId}`);
      await db.execute(`UPDATE tasks SET position = ${currentTask.position} WHERE id = ${aboveTask.id}`);
    }
    
    // Get updated task
    const result = await db.execute(`SELECT * FROM tasks WHERE id = ${cleanId}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error moving task up:', error);
    res.status(500).json({ error: 'Failed to move task up' });
  }
});

// POST move task down in priority  
router.post('/:id/move-down', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = parseInt(id);
    
    // Get current task
    const currentResult = await db.execute(`SELECT * FROM tasks WHERE id = ${cleanId}`);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const currentTask = currentResult.rows[0];
    
    // Find task immediately below this one
    const belowResult = await db.execute(`
      SELECT * FROM tasks 
      WHERE position > ${currentTask.position}
      ORDER BY position ASC 
      LIMIT 1
    `);
    
    if (belowResult.rows.length > 0) {
      const belowTask = belowResult.rows[0];
      
      // Swap positions
      await db.execute(`UPDATE tasks SET position = ${belowTask.position} WHERE id = ${cleanId}`);
      await db.execute(`UPDATE tasks SET position = ${currentTask.position} WHERE id = ${belowTask.id}`);
    }
    
    // Get updated task
    const result = await db.execute(`SELECT * FROM tasks WHERE id = ${cleanId}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error moving task down:', error);
    res.status(500).json({ error: 'Failed to move task down' });
  }
});

module.exports = router;