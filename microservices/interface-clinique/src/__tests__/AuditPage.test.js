import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';
import AuditPage from '../pages/AuditPage';

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  </BrowserRouter>
);

// Mock de l'API
jest.mock('../services/api', () => ({
  getAuditLogs: jest.fn(() => Promise.resolve({
    content: [
      { 
        id: 1, 
        action: 'QUERY', 
        details: 'Question test', 
        timestamp: [2024, 12, 19, 10, 30, 0],
        userId: 'Dr. Martin'
      },
      { 
        id: 2, 
        action: 'GENERATE_SYNTHESIS', 
        details: '', 
        timestamp: [2024, 12, 19, 11, 0, 0],
        userId: 'SYSTEM'
      },
      { 
        id: 3, 
        action: 'UPLOAD', 
        details: 'document.pdf', 
        timestamp: [2024, 12, 18, 14, 0, 0],
        userId: 'Dr. Martin'
      },
    ],
  })),
}));

describe('AuditPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('affiche le titre du journal d\'audit', async () => {
    render(<AuditPage />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Journal d\'Audit')).toBeInTheDocument();
    });
  });

  test('affiche les statistiques', async () => {
    render(<AuditPage />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Total Opérations')).toBeInTheDocument();
      expect(screen.getByText('Aujourd\'hui')).toBeInTheDocument();
      expect(screen.getByText('Questions IA')).toBeInTheDocument();
    });
  });

  test('affiche les logs après chargement', async () => {
    render(<AuditPage />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      // Vérifier que les types d'action sont affichés
      expect(screen.getByText('Question')).toBeInTheDocument();
      expect(screen.getByText('Synthèse')).toBeInTheDocument();
    });
  });

  test('affiche le bouton d\'export CSV', async () => {
    render(<AuditPage />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Exporter CSV')).toBeInTheDocument();
    });
  });

  test('affiche le bouton Actualiser', async () => {
    render(<AuditPage />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Actualiser')).toBeInTheDocument();
    });
  });
});

describe('AuditPage - Filtrage', () => {
  test('affiche le champ de recherche', async () => {
    render(<AuditPage />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
    });
  });

  test('affiche le filtre par action', async () => {
    render(<AuditPage />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Toutes les actions')).toBeInTheDocument();
    });
  });
});

describe('AuditPage - Affichage des descriptions contextuelles', () => {
  test('affiche une description pour QUERY', async () => {
    render(<AuditPage />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      // Le QUERY avec details "Question test" devrait afficher ce texte
      expect(screen.getByText(/Question test/)).toBeInTheDocument();
    });
  });

  test('affiche une description pour GENERATE_SYNTHESIS', async () => {
    render(<AuditPage />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/synthèse de documents/i)).toBeInTheDocument();
    });
  });
});
