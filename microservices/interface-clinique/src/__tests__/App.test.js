import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import { NotificationProvider } from '../../context/NotificationContext';
import App from '../../App';

// Wrapper pour les tests avec tous les providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  </BrowserRouter>
);

const renderWithProviders = (component) => {
  return render(<TestWrapper>{component}</TestWrapper>);
};

describe('App Component', () => {
  test('renders without crashing', () => {
    renderWithProviders(<App />);
  });

  test('redirects to dashboard by default', async () => {
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});

describe('Navigation', () => {
  test('sidebar is visible', async () => {
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    });
  });

  test('all navigation links are present', async () => {
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Documents/i)).toBeInTheDocument();
      expect(screen.getByText(/Patients/i)).toBeInTheDocument();
      expect(screen.getByText(/Assistant IA/i)).toBeInTheDocument();
    });
  });
});
