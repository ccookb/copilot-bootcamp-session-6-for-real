import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: '2025-12-25',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render todo title and due date', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
  });

  it('should render unchecked checkbox when todo is incomplete', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when todo is complete', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show edit button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should apply completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByTestId('todo-card')).toHaveClass('completed');
  });

  it('should not render due date when dueDate is null', () => {
    const todoNoDate = { ...mockTodo, dueDate: null };
    render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });
});

describe('TodoCard - Overdue Indicator', () => {
  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-25T10:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // T002: overdue incomplete todo has .todo-card--overdue class
  it('should have .todo-card--overdue class when incomplete and dueDate is before today', () => {
    const overdueTodo = {
      id: 2,
      title: 'Overdue Todo',
      dueDate: '2026-03-24',
      completed: 0,
      createdAt: '2026-01-01T00:00:00Z'
    };
    render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByTestId('todo-card')).toHaveClass('todo-card--overdue');
  });

  // T003: overdue incomplete todo renders "Overdue" badge text
  it('should render "Overdue" badge when incomplete and dueDate is before today', () => {
    const overdueTodo = {
      id: 2,
      title: 'Overdue Todo',
      dueDate: '2026-03-24',
      completed: 0,
      createdAt: '2026-01-01T00:00:00Z'
    };
    render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  // T004: completed todo with past due date does NOT have .todo-card--overdue class
  it('should NOT have .todo-card--overdue class when completed even if dueDate is before today', () => {
    const completedOverdueTodo = {
      id: 3,
      title: 'Completed Overdue Todo',
      dueDate: '2026-03-24',
      completed: 1,
      createdAt: '2026-01-01T00:00:00Z'
    };
    render(<TodoCard todo={completedOverdueTodo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByTestId('todo-card')).not.toHaveClass('todo-card--overdue');
  });

  // T005: todo with dueDate equal to today does NOT have .todo-card--overdue class
  it('should NOT have .todo-card--overdue class when dueDate is today', () => {
    const dueTodayTodo = {
      id: 4,
      title: 'Due Today',
      dueDate: '2026-03-25',
      completed: 0,
      createdAt: '2026-01-01T00:00:00Z'
    };
    render(<TodoCard todo={dueTodayTodo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByTestId('todo-card')).not.toHaveClass('todo-card--overdue');
  });

  // T006: todo with no due date does NOT have .todo-card--overdue class
  it('should NOT have .todo-card--overdue class when dueDate is null', () => {
    const noDateTodo = {
      id: 5,
      title: 'No Date Todo',
      dueDate: null,
      completed: 0,
      createdAt: '2026-01-01T00:00:00Z'
    };
    render(<TodoCard todo={noDateTodo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByTestId('todo-card')).not.toHaveClass('todo-card--overdue');
  });

  // T007: overdue indicator disappears when todo is toggled to complete
  it('should remove .todo-card--overdue class when todo is toggled to complete', () => {
    const overdueTodo = {
      id: 6,
      title: 'Overdue Todo Toggle',
      dueDate: '2026-03-24',
      completed: 0,
      createdAt: '2026-01-01T00:00:00Z'
    };
    const { rerender } = render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByTestId('todo-card')).toHaveClass('todo-card--overdue');

    const completedTodo = { ...overdueTodo, completed: 1 };
    rerender(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByTestId('todo-card')).not.toHaveClass('todo-card--overdue');
  });

  // T011: overdue incomplete todo's due date element has .todo-due-date--overdue class
  it('should have .todo-due-date--overdue class on due date when incomplete and overdue', () => {
    const overdueTodo = {
      id: 7,
      title: 'Overdue Due Date Style',
      dueDate: '2026-03-24',
      completed: 0,
      createdAt: '2026-01-01T00:00:00Z'
    };
    render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByTestId('todo-due-date')).toHaveClass('todo-due-date--overdue');
  });

  // T012: completed todo with past due date does NOT have .todo-due-date--overdue class
  it('should NOT have .todo-due-date--overdue class on due date when completed', () => {
    const completedOverdueTodo = {
      id: 8,
      title: 'Completed Overdue Date Style',
      dueDate: '2026-03-24',
      completed: 1,
      createdAt: '2026-01-01T00:00:00Z'
    };
    render(<TodoCard todo={completedOverdueTodo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByTestId('todo-due-date')).not.toHaveClass('todo-due-date--overdue');
  });

  // T015: timer auto-refresh test
  it('should update overdue status after 60 seconds when time advances past midnight', () => {
    // Start at 2026-03-25 23:59:00 — "today" is 2026-03-25, so 2026-03-25 is NOT overdue yet
    jest.setSystemTime(new Date('2026-03-25T23:59:00'));
    const todoNotYetOverdue = {
      id: 9,
      title: 'Becomes Overdue At Midnight',
      dueDate: '2026-03-25',
      completed: 0,
      createdAt: '2026-01-01T00:00:00Z'
    };
    render(<TodoCard todo={todoNotYetOverdue} {...mockHandlers} isLoading={false} />);

    expect(screen.getByTestId('todo-card')).not.toHaveClass('todo-card--overdue');

    // Advance time to 2026-03-26 00:01:00 — now 2026-03-25 IS overdue
    act(() => {
      jest.setSystemTime(new Date('2026-03-26T00:01:00'));
      jest.advanceTimersByTime(60_000);
    });

    expect(screen.getByTestId('todo-card')).toHaveClass('todo-card--overdue');
  });
});

describe('TodoCard - Project Pill', () => {
  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: null,
    completed: 0,
    createdAt: '2025-01-01T00:00:00Z',
    projectId: 1
  };

  const mockProject = { id: 1, title: 'Work', colour: 'blue' };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render project pill when project prop is provided', () => {
    render(
      <TodoCard
        todo={mockTodo}
        {...mockHandlers}
        isLoading={false}
        project={mockProject}
        projects={[mockProject]}
      />
    );
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Work')).toHaveClass('project-pill');
  });

  it('should not render project pill when project prop is null', () => {
    render(
      <TodoCard
        todo={mockTodo}
        {...mockHandlers}
        isLoading={false}
        project={null}
        projects={[mockProject]}
      />
    );
    expect(screen.queryByClass && screen.queryByRole('generic', { name: /Work/ })).toBeFalsy();
    // pill element should not be present
    const card = screen.getByTestId('todo-card');
    expect(card.querySelector('.project-pill')).toBeNull();
  });

  it('should show project select in edit mode when projects are provided', () => {
    render(
      <TodoCard
        todo={mockTodo}
        {...mockHandlers}
        isLoading={false}
        project={mockProject}
        projects={[mockProject]}
      />
    );
    fireEvent.click(screen.getByLabelText(/Edit/));
    expect(screen.getByRole('combobox', { name: /Edit project/i })).toBeInTheDocument();
  });

  it('should pass projectId to onEdit when edit is submitted', async () => {
    mockHandlers.onEdit.mockResolvedValueOnce({});
    render(
      <TodoCard
        todo={mockTodo}
        {...mockHandlers}
        isLoading={false}
        project={mockProject}
        projects={[mockProject]}
      />
    );
    fireEvent.click(screen.getByLabelText(/Edit/));
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockHandlers.onEdit).toHaveBeenCalledWith(
        mockTodo.id,
        mockTodo.title,
        null,
        1
      );
    });
  });
});
