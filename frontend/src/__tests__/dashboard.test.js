import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../components/Dashboard';

// Mock fetch globally
global.fetch = jest.fn();

describe('Dashboard Component', () => {
  const mockTasks = [
    { id: 1, title: 'Task 1', description: 'Description 1', status: 'completed' },
    { id: 2, title: 'Task 2', description: 'Description 2', status: 'pending' },
  ];

  const mockAnalytics = {
    totalTasks: 10,
    completedTasks: 7,
    pendingTasks: 3,
    teamMembers: 5
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard container with correct testid', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [], analytics: {} })
    });

    render(<Dashboard />);

    expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
  });

  test('displays loading state while fetching data', () => {
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ tasks: [], analytics: {} })
      }), 1000))
    );

    render(<Dashboard />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  test('renders tasks and analytics data correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: mockTasks, analytics: mockAnalytics })
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks: 10')).toBeInTheDocument();
      expect(screen.getByText('Completed: 7')).toBeInTheDocument();
      expect(screen.getByText('Pending: 3')).toBeInTheDocument();
      expect(screen.getByText('Team Members: 5')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' })
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error loading dashboard data')).toBeInTheDocument();
    });
  });

  test('handles empty tasks and analytics data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [], analytics: {} })
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No tasks available')).toBeInTheDocument();
      expect(screen.getByText('No analytics data available')).toBeInTheDocument();
    });
  });

  test('is accessible with proper ARIA labels', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: mockTasks, analytics: mockAnalytics })
    });

    render(<Dashboard />);

    await waitFor(() => {
      const dashboardContainer = screen.getByTestId('dashboard-container');
      expect(dashboardContainer).toHaveAttribute('role', 'main');
      expect(dashboardContainer).toHaveAttribute('aria-label', 'Dashboard');
    });
  });
});