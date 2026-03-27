import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectsPanel from '../ProjectsPanel';
import ProjectService from '../../services/projectService';

jest.mock('../../services/projectService');

describe('ProjectsPanel Component', () => {
  const mockProjects = [
    { id: 1, title: 'Work', colour: 'blue', createdAt: '2025-01-01' },
    { id: 2, title: 'Personal', colour: 'green', createdAt: '2025-01-02' },
  ];

  const mockOnProjectsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render empty state when no projects', () => {
    render(<ProjectsPanel projects={[]} onProjectsChange={mockOnProjectsChange} />);
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });

  it('should render project list when projects exist', () => {
    render(<ProjectsPanel projects={mockProjects} onProjectsChange={mockOnProjectsChange} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('should show create form when "+ New Project" button is clicked', () => {
    render(<ProjectsPanel projects={[]} onProjectsChange={mockOnProjectsChange} />);
    fireEvent.click(screen.getByText('+ New Project'));
    expect(screen.getByPlaceholderText('Project title')).toBeInTheDocument();
  });

  it('should show error when submitting create form with empty title', async () => {
    render(<ProjectsPanel projects={[]} onProjectsChange={mockOnProjectsChange} />);
    fireEvent.click(screen.getByText('+ New Project'));
    fireEvent.submit(screen.getByPlaceholderText('Project title').closest('form'));
    expect(screen.getByText('Project title cannot be empty')).toBeInTheDocument();
  });

  it('should call ProjectService.createProject and onProjectsChange on valid submit', async () => {
    ProjectService.createProject.mockResolvedValueOnce({ id: 3, title: 'Test', colour: 'blue' });

    render(<ProjectsPanel projects={[]} onProjectsChange={mockOnProjectsChange} />);
    fireEvent.click(screen.getByText('+ New Project'));

    fireEvent.change(screen.getByPlaceholderText('Project title'), {
      target: { value: 'Test Project' },
    });
    fireEvent.submit(screen.getByPlaceholderText('Project title').closest('form'));

    await waitFor(() => {
      expect(ProjectService.createProject).toHaveBeenCalledWith('Test Project', 'blue');
      expect(mockOnProjectsChange).toHaveBeenCalled();
    });
  });

  it('should show edit form when Edit button is clicked', () => {
    render(<ProjectsPanel projects={mockProjects} onProjectsChange={mockOnProjectsChange} />);
    fireEvent.click(screen.getByLabelText('Edit Work'));
    expect(screen.getByLabelText('Edit project title')).toBeInTheDocument();
  });

  it('should call ProjectService.updateProject and onProjectsChange on edit save', async () => {
    ProjectService.updateProject.mockResolvedValueOnce({ id: 1, title: 'Work Updated', colour: 'blue' });

    render(<ProjectsPanel projects={mockProjects} onProjectsChange={mockOnProjectsChange} />);
    fireEvent.click(screen.getByLabelText('Edit Work'));

    const editInput = screen.getByLabelText('Edit project title');
    fireEvent.change(editInput, { target: { value: 'Work Updated' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(ProjectService.updateProject).toHaveBeenCalledWith(1, {
        title: 'Work Updated',
        colour: 'blue',
      });
      expect(mockOnProjectsChange).toHaveBeenCalled();
    });
  });

  it('should cancel edit form when Cancel is clicked', () => {
    render(<ProjectsPanel projects={mockProjects} onProjectsChange={mockOnProjectsChange} />);
    fireEvent.click(screen.getByLabelText('Edit Work'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByLabelText('Edit project title')).not.toBeInTheDocument();
  });

  it('should show ConfirmDialog when Delete button is clicked', () => {
    render(<ProjectsPanel projects={mockProjects} onProjectsChange={mockOnProjectsChange} />);
    fireEvent.click(screen.getByLabelText('Delete Work'));
    expect(screen.getByText('Delete Project?')).toBeInTheDocument();
    expect(
      screen.getByText(/Deleting this project will remove it from all associated todos/)
    ).toBeInTheDocument();
  });

  it('should call ProjectService.deleteProject and onProjectsChange on confirm delete', async () => {
    ProjectService.deleteProject.mockResolvedValueOnce({ message: 'Deleted' });

    render(<ProjectsPanel projects={mockProjects} onProjectsChange={mockOnProjectsChange} />);
    fireEvent.click(screen.getByLabelText('Delete Work'));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(ProjectService.deleteProject).toHaveBeenCalledWith(1);
      expect(mockOnProjectsChange).toHaveBeenCalled();
    });
  });

  it('should dismiss ConfirmDialog when cancel is clicked during delete', () => {
    render(<ProjectsPanel projects={mockProjects} onProjectsChange={mockOnProjectsChange} />);
    fireEvent.click(screen.getByLabelText('Delete Work'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Delete Project?')).not.toBeInTheDocument();
  });
});
