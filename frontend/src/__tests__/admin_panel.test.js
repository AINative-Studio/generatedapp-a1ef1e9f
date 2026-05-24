import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from '../components/AdminPanel';

// Mock fetch globally
global.fetch = jest.fn();

describe('AdminPanel', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders admin panel container with correct testid', () => {
    render(<AdminPanel />);
    
    const container = screen.getByTestId('admin_panel-container');
    expect(container).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    render(<AdminPanel />);
    
    const loadingElement = screen.getByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('fetches and displays admin data successfully', async () => {
    const mockData = {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ],
      tasks: [
        { id: 1, title: 'Task 1', status: 'completed' },
        { id: 2, title: 'Task 2', status: 'pending' }
      ]
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('API Error'))
    });

    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading admin data/i)).toBeInTheDocument();
    });
  });

  test('handles user interaction for adding new user', async () => {
    const user = userEvent.setup();
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: mockUsers })
    });

    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Mock the POST request for adding a user
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 2,
        name: 'New User',
        email: 'newuser@example.com'
      })
    });

    const addUserButton = screen.getByRole('button', { name: /add user/i });
    await user.click(addUserButton);

    // Verify the new user is displayed
    expect(screen.getByText('New User')).toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    render(<AdminPanel />);
    
    const container = screen.getByTestId('admin_panel-container');
    expect(container).toHaveAttribute('role', 'main');
    expect(container).toHaveAttribute('aria-label', 'Admin Panel');
  });
});