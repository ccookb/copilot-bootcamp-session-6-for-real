import ProjectService from '../projectService';

describe('ProjectService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should fetch all projects', async () => {
      const mockProjects = [
        { id: 1, title: 'Project A', colour: 'blue', createdAt: '2025-01-01' },
        { id: 2, title: 'Project B', colour: 'green', createdAt: '2025-01-02' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      });

      const result = await ProjectService.getAllProjects();

      expect(global.fetch).toHaveBeenCalledWith('/api/projects');
      expect(result).toEqual(mockProjects);
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(ProjectService.getAllProjects()).rejects.toThrow();
    });
  });

  describe('createProject', () => {
    it('should create a project with title and colour', async () => {
      const mockProject = { id: 1, title: 'New Project', colour: 'blue', createdAt: '2025-01-01' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      });

      const result = await ProjectService.createProject('New Project', 'blue');

      expect(global.fetch).toHaveBeenCalledWith('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Project', colour: 'blue' }),
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw error with server message on failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Project title is required' }),
      });

      await expect(ProjectService.createProject('', 'blue')).rejects.toThrow(
        'Project title is required'
      );
    });
  });

  describe('updateProject', () => {
    it('should update a project title and colour', async () => {
      const mockProject = { id: 1, title: 'Updated Project', colour: 'green', createdAt: '2025-01-01' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      });

      const result = await ProjectService.updateProject(1, { title: 'Updated Project', colour: 'green' });

      expect(global.fetch).toHaveBeenCalledWith('/api/projects/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Project', colour: 'green' }),
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw error with server message on failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Project not found' }),
      });

      await expect(ProjectService.updateProject(999, { title: 'x', colour: 'blue' })).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete a project by id', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Project deleted successfully' }),
      });

      const result = await ProjectService.deleteProject(1);

      expect(global.fetch).toHaveBeenCalledWith('/api/projects/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual({ message: 'Project deleted successfully' });
    });

    it('should throw error with server message on failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Project not found' }),
      });

      await expect(ProjectService.deleteProject(999)).rejects.toThrow('Project not found');
    });
  });
});
