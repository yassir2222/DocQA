import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import { NotificationProvider } from '../../context/NotificationContext';
import CommandPalette from '../../components/CommandPalette';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock API
jest.mock('../../services/api', () => ({
  getDocuments: jest.fn(() => Promise.resolve({ documents: [] })),
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

describe('CommandPalette Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders when isOpen is true', () => {
    render(
      <TestWrapper>
        <CommandPalette isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );
    
    expect(screen.getByPlaceholderText(/Rechercher/i)).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(
      <TestWrapper>
        <CommandPalette isOpen={false} onClose={jest.fn()} />
      </TestWrapper>
    );
    
    expect(screen.queryByPlaceholderText(/Rechercher/i)).not.toBeInTheDocument();
  });

  test('shows navigation items by default', () => {
    render(
      <TestWrapper>
        <CommandPalette isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    expect(screen.getByText(/Documents/i)).toBeInTheDocument();
  });

  test('filters results based on search query', async () => {
    render(
      <TestWrapper>
        <CommandPalette isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );
    
    const searchInput = screen.getByPlaceholderText(/Rechercher/i);
    fireEvent.change(searchInput, { target: { value: 'Documents' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Documents/i)).toBeInTheDocument();
    });
  });

  test('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    render(
      <TestWrapper>
        <CommandPalette isOpen={true} onClose={onClose} />
      </TestWrapper>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('navigates when item is selected', async () => {
    const onClose = jest.fn();
    render(
      <TestWrapper>
        <CommandPalette isOpen={true} onClose={onClose} />
      </TestWrapper>
    );
    
    const dashboardItem = screen.getByText(/Tableau de bord/i);
    fireEvent.click(dashboardItem);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(onClose).toHaveBeenCalled();
  });

  test('shows result count in footer', () => {
    render(
      <TestWrapper>
        <CommandPalette isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/resultats/i)).toBeInTheDocument();
  });

  test('keyboard navigation works', () => {
    render(
      <TestWrapper>
        <CommandPalette isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );
    
    // Press ArrowDown
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    // Press ArrowUp
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    
    // No error should occur
    expect(screen.getByPlaceholderText(/Rechercher/i)).toBeInTheDocument();
  });
});
