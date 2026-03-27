const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const ProjectService = require('./services/projectService');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');
db.pragma('foreign_keys = ON');

// Create tables (projects first — todos has FK dependency)
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT    NOT NULL,
    colour    TEXT    NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS todos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT    NOT NULL,
    dueDate   TEXT,
    completed BOOLEAN DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    projectId INTEGER REFERENCES projects(id) ON DELETE SET NULL
  )
`);

// Insert some initial data
const initialTodos = [
  { title: 'Learn React', dueDate: '2025-12-15', completed: 0 },
  { title: 'Build TODO app', dueDate: '2025-12-31', completed: 0 },
  { title: 'Master Copilot', dueDate: null, completed: 1 }
];

const insertStmt = db.prepare('INSERT INTO todos (title, dueDate, completed) VALUES (?, ?, ?)');

initialTodos.forEach(todo => {
  insertStmt.run(todo.title, todo.dueDate, todo.completed);
});

console.log('In-memory database initialized with sample todos');

const projectService = new ProjectService(db);

// API Routes

// --- Projects ---

app.get('/api/projects', (req, res) => {
  try {
    const projects = projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { title, colour } = req.body;
    const project = projectService.createProject(title, colour);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('required') ||
        error.message.includes('exceed') ||
        error.message.includes('valid colour')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid project ID is required' });
    }
    const { title, colour } = req.body;
    const project = projectService.updateProject(parseInt(id), { title, colour });
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('required') ||
        error.message.includes('exceed') ||
        error.message.includes('valid colour') ||
        error.message.includes('at least one')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid project ID is required' });
    }
    projectService.deleteProject(parseInt(id));
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- Todos ---
app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos ORDER BY createdAt DESC').all();
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.get('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { title, dueDate, projectId } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Todo title is required' });
    }

    if (title.length > 255) {
      return res.status(400).json({ error: 'Todo title must not exceed 255 characters' });
    }

    if (projectId !== undefined && projectId !== null) {
      const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
      if (!project) {
        return res.status(400).json({ error: 'Referenced project does not exist' });
      }
    }

    const stmt = db.prepare(
      'INSERT INTO todos (title, dueDate, completed, projectId) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(
      title.trim(),
      dueDate || null,
      0,
      projectId !== undefined ? (projectId || null) : null
    );
    const id = result.lastInsertRowid;

    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, dueDate, projectId } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Todo title must be a non-empty string' });
    }

    if (title !== undefined && title.length > 255) {
      return res.status(400).json({ error: 'Todo title must not exceed 255 characters' });
    }

    if (projectId !== undefined && projectId !== null) {
      const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
      if (!project) {
        return res.status(400).json({ error: 'Referenced project does not exist' });
      }
    }

    const newTitle = title !== undefined ? title.trim() : existingTodo.title;
    const newDueDate = dueDate !== undefined ? dueDate : existingTodo.dueDate;
    const newProjectId = projectId !== undefined ? (projectId || null) : existingTodo.projectId;

    const stmt = db.prepare(
      'UPDATE todos SET title = ?, dueDate = ?, projectId = ? WHERE id = ?'
    );
    stmt.run(newTitle, newDueDate || null, newProjectId, id);

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.patch('/api/todos/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const newCompleted = existingTodo.completed ? 0 : 1;
    const stmt = db.prepare('UPDATE todos SET completed = ? WHERE id = ?');
    stmt.run(newCompleted, id);

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error toggling todo status:', error);
    res.status(500).json({ error: 'Failed to toggle todo status' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Todo deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Backward compatibility: support old items endpoints
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT id, title as name, createdAt as created_at FROM todos ORDER BY createdAt DESC').all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const stmt = db.prepare('INSERT INTO todos (title, dueDate, completed) VALUES (?, ?, ?)');
    const result = stmt.run(name, null, 0);
    const id = result.lastInsertRowid;

    const newItem = db.prepare('SELECT id, title as name, createdAt as created_at FROM todos WHERE id = ?').get(id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db };