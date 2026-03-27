import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoForm from '../TodoForm';

describe('TodoForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form inputs and button', () => {
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();
    expect(screen.getByLabelText('Due date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Todo/ })).toBeInTheDocument();
  });

  it('should display character count', () => {
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    expect(screen.getByText('0/255')).toBeInTheDocument();
  });

  it('should update character count as user types', () => {
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: 'Test' } });
    
    expect(screen.getByText('4/255')).toBeInTheDocument();
  });

  it('should show error when title is empty on submit', () => {
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const button = screen.getByRole('button', { name: /Add Todo/ });
    fireEvent.click(button);
    
    expect(screen.getByText('Todo title cannot be empty')).toBeInTheDocument();
  });

  it('should show error when title exceeds 255 characters', () => {
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    const longTitle = 'a'.repeat(256);
    fireEvent.change(input, { target: { value: longTitle } });
    
    const button = screen.getByRole('button', { name: /Add Todo/ });
    fireEvent.click(button);
    
    expect(screen.getByText('Todo title cannot exceed 255 characters')).toBeInTheDocument();
  });

  it('should call onSubmit with title when form is submitted', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: 'New Todo' } });
    
    const button = screen.getByRole('button', { name: /Add Todo/ });
    
    await waitFor(() => {
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('New Todo', null, null);
    });
  });

  it('should call onSubmit with title and due date', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const titleInput = screen.getByPlaceholderText('Add a new todo...');
    const dueDateInput = screen.getByLabelText('Due date');
    
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });
    fireEvent.change(dueDateInput, { target: { value: '2025-12-25' } });
    
    const button = screen.getByRole('button', { name: /Add Todo/ });
    
    await waitFor(() => {
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('New Todo', '2025-12-25', null);
    });
  });

  it('should clear inputs after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const titleInput = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });
    
    const button = screen.getByRole('button', { name: /Add Todo/ });
    
    await waitFor(() => {
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByText('0/255')).toBeInTheDocument();
      expect(titleInput).toHaveValue('');
    });
  });

  it('should disable inputs when loading', () => {
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const titleInput = screen.getByPlaceholderText('Add a new todo...');
    const dueDateInput = screen.getByLabelText('Due date');
    const button = screen.getByRole('button', { name: /Adding/ });
    
    expect(titleInput).toBeDisabled();
    expect(dueDateInput).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should trim whitespace from title', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: '  Test Todo  ' } });
    
    const button = screen.getByRole('button', { name: /Add Todo/ });
    
    await waitFor(() => {
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test Todo', null, null);
    });
  });

  it('should clear error when user starts typing', () => {
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const button = screen.getByRole('button', { name: /Add Todo/ });
    fireEvent.click(button);
    
    expect(screen.getByText('Todo title cannot be empty')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: 'Test' } });
    
    expect(screen.queryByText('Todo title cannot be empty')).not.toBeInTheDocument();
  });
});

describe('TodoForm - Project Selector', () => {
  const mockOnSubmit = jest.fn();
  const mockProjects = [
    { id: 1, title: 'Work', colour: 'blue' },
    { id: 2, title: 'Personal', colour: 'green' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render project selector when no projects are provided', () => {
    render(<TodoForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.queryByRole('combobox', { name: /project/i })).not.toBeInTheDocument();
  });

  it('should render project selector when projects are provided', () => {
    render(
      <TodoForm onSubmit={mockOnSubmit} isLoading={false} projects={mockProjects} />
    );
    expect(screen.getByRole('combobox', { name: /project/i })).toBeInTheDocument();
  });

  it('should render "No project" option and all project options', () => {
    render(
      <TodoForm onSubmit={mockOnSubmit} isLoading={false} projects={mockProjects} />
    );
    expect(screen.getByRole('option', { name: 'No project' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Personal' })).toBeInTheDocument();
  });

  it('should use defaultProjectId as initial selection', () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        projects={mockProjects}
        defaultProjectId={1}
      />
    );
    expect(screen.getByRole('combobox', { name: /project/i })).toHaveValue('1');
  });

  it('should call onSubmit with selected projectId', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(
      <TodoForm onSubmit={mockOnSubmit} isLoading={false} projects={mockProjects} />
    );

    fireEvent.change(screen.getByPlaceholderText('Add a new todo...'), {
      target: { value: 'Work Todo' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: /project/i }), {
      target: { value: '1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add Todo/ }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Work Todo', null, 1);
    });
  });

  it('should call onSubmit with null when "No project" is selected', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(
      <TodoForm onSubmit={mockOnSubmit} isLoading={false} projects={mockProjects} />
    );

    fireEvent.change(screen.getByPlaceholderText('Add a new todo...'), {
      target: { value: 'Unassigned Todo' },
    });
    // default is no project (empty value)
    fireEvent.click(screen.getByRole('button', { name: /Add Todo/ }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Unassigned Todo', null, null);
    });
  });
});
