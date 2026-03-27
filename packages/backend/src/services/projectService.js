const ALLOWED_COLOURS = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'teal', 'pink'];

class ProjectService {
  constructor(database) {
    this.db = database;
  }

  getAllProjects() {
    try {
      return this.db.prepare('SELECT * FROM projects ORDER BY createdAt ASC').all();
    } catch (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }

  getProjectById(id) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid project ID is required');
      }
      return this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    } catch (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }

  createProject(title, colour) {
    try {
      if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new Error('Project title is required');
      }
      if (title.trim().length > 100) {
        throw new Error('Project title must not exceed 100 characters');
      }
      if (!colour || !ALLOWED_COLOURS.includes(colour)) {
        throw new Error(`Project colour must be a valid colour: ${ALLOWED_COLOURS.join(', ')}`);
      }

      const existing = this.db
        .prepare('SELECT id FROM projects WHERE LOWER(title) = LOWER(?)')
        .get(title.trim());
      if (existing) {
        throw new Error('A project with this title already exists');
      }

      const stmt = this.db.prepare('INSERT INTO projects (title, colour) VALUES (?, ?)');
      const result = stmt.run(title.trim(), colour);
      return this.getProjectById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  updateProject(id, updates = {}) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid project ID is required');
      }

      const { title, colour } = updates;
      if (title === undefined && colour === undefined) {
        throw new Error('Must provide at least one of title or colour to update');
      }

      const existing = this.getProjectById(id);
      if (!existing) {
        throw new Error('Project not found');
      }

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
          throw new Error('Project title is required');
        }
        if (title.trim().length > 100) {
          throw new Error('Project title must not exceed 100 characters');
        }
        const conflict = this.db
          .prepare('SELECT id FROM projects WHERE LOWER(title) = LOWER(?) AND id != ?')
          .get(title.trim(), id);
        if (conflict) {
          throw new Error('A project with this title already exists');
        }
      }

      if (colour !== undefined && !ALLOWED_COLOURS.includes(colour)) {
        throw new Error(`Project colour must be a valid colour: ${ALLOWED_COLOURS.join(', ')}`);
      }

      const newTitle = title !== undefined ? title.trim() : existing.title;
      const newColour = colour !== undefined ? colour : existing.colour;

      this.db.prepare('UPDATE projects SET title = ?, colour = ? WHERE id = ?')
        .run(newTitle, newColour, id);

      return this.getProjectById(id);
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  deleteProject(id) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid project ID is required');
      }

      const existing = this.getProjectById(id);
      if (!existing) {
        throw new Error('Project not found');
      }

      // Explicitly nullify todos (belt-and-suspenders alongside ON DELETE SET NULL)
      this.db.prepare('UPDATE todos SET projectId = NULL WHERE projectId = ?').run(id);
      this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);

      return existing;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }
}

module.exports = ProjectService;
