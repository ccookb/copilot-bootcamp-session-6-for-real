import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectFilterBar from '../ProjectFilterBar';

describe('ProjectFilterBar Component', () => {
  const mockProjects = [
    { id: 1, title: 'Work', colour: 'blue' },
    { id: 2, title: 'Personal', colour: 'green' },
  ];

  const mockOnSelectProject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when no projects are provided', () => {
    const { container } = render(
      <ProjectFilterBar projects={[]} selectedProjectId={null} onSelectProject={mockOnSelectProject} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should return null when projects is undefined', () => {
    const { container } = render(
      <ProjectFilterBar selectedProjectId={null} onSelectProject={mockOnSelectProject} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render "All" chip and one chip per project', () => {
    render(
      <ProjectFilterBar
        projects={mockProjects}
        selectedProjectId={null}
        onSelectProject={mockOnSelectProject}
      />
    );
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('should mark "All" chip as active when selectedProjectId is null', () => {
    render(
      <ProjectFilterBar
        projects={mockProjects}
        selectedProjectId={null}
        onSelectProject={mockOnSelectProject}
      />
    );
    expect(screen.getByText('All')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should mark project chip as active when its id matches selectedProjectId', () => {
    render(
      <ProjectFilterBar
        projects={mockProjects}
        selectedProjectId={1}
        onSelectProject={mockOnSelectProject}
      />
    );
    expect(screen.getByText('All')).toHaveAttribute('aria-pressed', 'false');
    // The Work button text is inside a button that also contains the dot span
    const workButton = screen.getByText('Work').closest('button');
    expect(workButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onSelectProject(null) when "All" chip is clicked', () => {
    render(
      <ProjectFilterBar
        projects={mockProjects}
        selectedProjectId={1}
        onSelectProject={mockOnSelectProject}
      />
    );
    fireEvent.click(screen.getByText('All'));
    expect(mockOnSelectProject).toHaveBeenCalledWith(null);
  });

  it('should call onSelectProject with project id when project chip is clicked', () => {
    render(
      <ProjectFilterBar
        projects={mockProjects}
        selectedProjectId={null}
        onSelectProject={mockOnSelectProject}
      />
    );
    fireEvent.click(screen.getByText('Work').closest('button'));
    expect(mockOnSelectProject).toHaveBeenCalledWith(1);
  });
});
