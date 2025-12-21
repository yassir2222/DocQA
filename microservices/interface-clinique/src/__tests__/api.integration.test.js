/**
 * Tests d'intégration API
 * Ces tests vérifient la communication avec le backend
 */

// Configuration de l'URL de l'API Gateway
const API_BASE_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8000';

describe('API Integration Tests', () => {
  // Skip ces tests en CI si l'API n'est pas disponible
  const apiAvailable = process.env.RUN_API_TESTS === 'true';

  beforeAll(async () => {
    if (!apiAvailable) {
      console.log('⚠️ API tests skipped. Set RUN_API_TESTS=true to run them.');
    }
  });

  describe('Health Check', () => {
    test.skipIf(!apiAvailable)('API Gateway répond au health check', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('ok');
    });
  });

  describe('Documents API', () => {
    test.skipIf(!apiAvailable)('GET /api/documents retourne une liste', async () => {
      const response = await fetch(`${API_BASE_URL}/api/documents`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('documents');
      expect(Array.isArray(data.documents)).toBe(true);
    });

    test.skipIf(!apiAvailable)('POST /api/documents/upload accepte un fichier', async () => {
      const formData = new FormData();
      const testFile = new Blob(['Test content'], { type: 'text/plain' });
      formData.append('file', testFile, 'test.txt');
      formData.append('patient_id', 'TEST_PATIENT');

      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      // Soit succès, soit erreur de validation (pas erreur serveur)
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Audit API', () => {
    test.skipIf(!apiAvailable)('GET /api/audit/logs retourne les logs', async () => {
      const response = await fetch(`${API_BASE_URL}/api/audit/logs`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      // L'API retourne soit content, soit logs, soit un tableau directement
      const logs = data.content || data.logs || data;
      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('Q&A API', () => {
    test.skipIf(!apiAvailable)('POST /api/qa/ask répond à une question', async () => {
      const response = await fetch(`${API_BASE_URL}/api/qa/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Test question',
          patient_id: null,
          max_context_docs: 5,
        }),
      });

      // L'API peut retourner 200 ou 404 si pas de documents
      expect([200, 404]).toContain(response.status);
      
      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty('answer');
      }
    }, 30000); // Timeout plus long pour le LLM
  });

  describe('Synthesis API', () => {
    test.skipIf(!apiAvailable)('POST /api/synthesis/generate génère une synthèse', async () => {
      // D'abord, obtenir les IDs de documents existants
      const docsResponse = await fetch(`${API_BASE_URL}/api/documents`);
      const docsData = await docsResponse.json();
      const docs = docsData.documents || [];

      if (docs.length === 0) {
        console.log('⚠️ Pas de documents disponibles pour tester la synthèse');
        return;
      }

      const docIds = docs.slice(0, 2).map(d => d.id);

      const response = await fetch(`${API_BASE_URL}/api/synthesis/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: docIds,
          synthesisType: 'SUMMARY',
          format: 'markdown',
          language: 'fr',
        }),
      });

      expect(response.status).toBeLessThan(500);
      
      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty('summary');
      }
    }, 60000); // Timeout très long pour la génération LLM
  });

  describe('Dashboard Stats API', () => {
    test.skipIf(!apiAvailable)('GET /api/dashboard/stats retourne les statistiques', async () => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('documents');
    });
  });
});

// Helper pour skip conditionnel
if (!test.skipIf) {
  test.skipIf = (condition) => (condition ? test.skip : test);
}
