-- Add priority and position columns to tasks table
ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE tasks ADD COLUMN position INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN is_urgent BOOLEAN DEFAULT 0;

-- Create index for better performance on ordering
CREATE INDEX IF NOT EXISTS idx_tasks_priority_position ON tasks(priority, position);
CREATE INDEX IF NOT EXISTS idx_tasks_urgent ON tasks(is_urgent);

-- Update existing tasks to have default priority
UPDATE tasks SET priority = 'normal', position = id * 100 WHERE priority IS NULL;