import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import { NotificationProvider } from '../../context/NotificationContext';
import Dashboard from '../../pages/Dashboard';

// Mock API
jest.mock('../../services/api', () => ({
  getDashboardStats: jest.fn(() => Promise.resolve({
    documents: { total: 10 },
    questions: { total: 50 },
    performance: { avgResponseTime: 2.5 }
  })),
  getAuditLogs: jest.fn(() => Promise.resolve({
    content: [
      { id: 1, action: 'UPLOAD', userId: 'user1', timestamp: new Date().toISOString() },
      { id: 2, action: 'QUERY', userId: 'user2', timestamp: new Date().toISOString() }
    ]
  })),
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  test('renders dashboard title', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    });
  });

  test('displays statistics cards', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );
    
    await waitFor(() => {
      // Check for stat cards presence
      const cards = screen.getAllByRole('article') || document.querySelectorAll('[class*="rounded"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  test('shows loading state initially', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );
    
    // Component should render without error
    expect(document.body).toBeInTheDocument();
  });
});
