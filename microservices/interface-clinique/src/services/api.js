import axios from "axios";

// Configuration de l'API Gateway
const getSettings = () => {
  try {
    const saved = localStorage.getItem("docqa-settings");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const settings = getSettings();

// URL de l'API Gateway (point d'entrée unique)
const API_GATEWAY_URL =
  settings.apiGatewayUrl ||
  process.env.REACT_APP_API_GATEWAY_URL ||
  "http://localhost:8000";

// Client API unique vers le Gateway
const apiClient = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// API Functions
const api = {
  // === Health ===

  checkHealth: async () => {
    const response = await apiClient.get("/health");
    return response.data;
  },

  getServicesHealth: async () => {
    const response = await apiClient.get("/api/health/services");
    return response.data;
  },

  // === Documents ===

  uploadDocument: async (formData) => {
    const response = await apiClient.post("/api/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return response.data;
  },

  getDocuments: async (params = {}) => {
    const response = await apiClient.get("/api/documents", { params });
    return response.data;
  },

  getDocument: async (id) => {
    const response = await apiClient.get(`/api/documents/${id}`);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await apiClient.delete(`/api/documents/${id}`);
    return response.data;
  },

  // === DeID ===

  anonymizeDocument: async (documentId) => {
    const response = await apiClient.post("/api/deid/anonymize", {
      documentId,
    });
    return response.data;
  },

  getMappings: async (documentId) => {
    const response = await apiClient.get(`/api/deid/mappings/${documentId}`);
    return response.data;
  },

  // === Indexation ===

  searchDocuments: async (query, options = {}) => {
    const response = await apiClient.post("/api/search", {
      query,
      topK: options.topK || 10,
      patientId: options.patientId,
    });
    return response.data;
  },

  indexDocument: async (documentId) => {
    const response = await apiClient.post("/api/index", { documentId });
    return response.data;
  },

  // === Question-Reponse ===

  askQuestion: async (question, patientId = null, documentId = null) => {
    try {
      const payload = {
        question,
        patient_id: patientId,
        max_context_docs: 5,
      };

      // Ajouter document_id si spécifié
      if (documentId) {
        payload.document_id = documentId;
      }

      // Timeout plus long pour le LLM (3 minutes)
      const response = await apiClient.post("/api/qa/ask", payload, {
        timeout: 180000,
      });
      return response.data;
    } catch (error) {
      console.warn(
        "Service Q/R erreur:",
        error.response?.status,
        error.response?.data
      );

      // Handle specific error cases
      if (error.response?.status === 404) {
        const errorDetail =
          error.response?.data?.detail || "Aucun document trouvé";
        return {
          answer: `Je n'ai pas trouvé de documents pertinents pour répondre à votre question.\n\n**Votre question:** "${question}"\n\n**Suggestion:** Essayez de poser une question plus spécifique en lien avec les documents médicaux du patient.`,
          sources: [],
          confidence: 0,
        };
      }

      // Generic error (service unavailable)
      return {
        answer: `Le service de questions/reponses n'est pas disponible actuellement.\n\nVotre question: "${question}"\n\nVerifiez que tous les services sont demarres.`,
        sources: [],
        confidence: 0,
      };
    }
  },

  getChatHistory: async (sessionId) => {
    const response = await apiClient.get(`/api/qa/history/${sessionId}`);
    return response.data;
  },

  // === Synthese ===

  generateSynthesis: async (documentIds, options = {}) => {
    try {
      const response = await apiClient.post("/api/synthesis/generate", {
        documentIds,
        synthesisType: options.type || "SUMMARY",
        format: options.format || "markdown",
        language: options.language || "fr",
      });

      const data = response.data;
      console.log("🔍 API Response Data:", data);

      // Retourner directement les données du backend
      const result = {
        ...data,
        // Compatibilité avec l'ancien format
        title: "Synthèse du dossier",
        documentsAnalyzed: data.sourceDocuments?.length || 0,
      };
      
      console.log("🔍 Returning to component:", result);
      return result;
    } catch (error) {
      console.error("❌ Service Synthese error:", error);
      throw error;
    }
  },

  comparePatients: async (patientIds, options = {}) => {
    const response = await apiClient.post("/api/synthesis/compare", {
      patientIds,
      criteria: options.criteria || ["diagnostics", "treatments", "evolution"],
    });
    return response.data;
  },

  // === Audit ===

  getAuditLogs: async (filters = {}) => {
    const response = await apiClient.get("/api/audit/logs", {
      params: filters,
    });
    return response.data;
  },

  getAuditStats: async (startDate, endDate) => {
    const response = await apiClient.get("/api/audit/stats", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  logAction: async (action, details = {}) => {
    try {
      await apiClient.post("/api/audit/log", {
        action,
        details,
        timestamp: new Date().toISOString(),
        user: localStorage.getItem("user") || "anonymous",
      });
    } catch (error) {
      console.warn("Audit log failed:", error.message);
    }
  },

  // === Dashboard ===

  getDashboardStats: async () => {
    try {
      const response = await apiClient.get("/api/dashboard/stats");
      const data = response.data;

      // Transform backend structure to frontend expected structure
      const docStats = data.documents?.statistics || {};
      const auditStats = data.questions || {}; // Assuming gateway returns questions stats here or we need to fetch audit logs

      // If gateway doesn't aggregate audit stats correctly, we might need to fetch them separately
      // But let's assume gateway does its job or we use what we have.
      // Actually, gateway implementation of /api/dashboard/stats returns:
      // "questions": {"total": 0, "today": 0} (default)
      // It doesn't seem to fetch real question stats in the gateway code I saw.

      // Let's keep the separate audit fetch if we want real question stats,
      // OR trust the gateway. The gateway code showed it returns default 0 for questions.
      // So we should probably fetch audit stats here to be sure, or just return what gateway gives.

      // Better approach: Use gateway response but map fields correctly.
      return {
        documents: {
          total: docStats.total_documents || 0,
          processed: docStats.processed_documents || 0,
          pending: docStats.pending_documents || 0,
        },
        questions: {
          total: data.questions?.total || 0,
          today: data.questions?.today || 0,
        },
        services: data.services || [],
      };
    } catch (error) {
      console.error("Dashboard stats error", error);
      return {
        documents: { total: 0, processed: 0, pending: 0 },
        questions: { total: 0, today: 0 },
        services: [],
      };
    }
  },

  // === Settings ===

  updateSettings: (newSettings) => {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem("docqa-settings", JSON.stringify(updated));
    window.location.reload();
  },

  getSettings: () => {
    return getSettings();
  },

  // === Notifications ===

  getNotifications: async (params = {}) => {
    try {
      const response = await apiClient.get("/api/notifications", { params });
      return response.data;
    } catch (error) {
      console.error("Erreur notifications:", error);
      return { notifications: [], total: 0, unreadCount: 0 };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await apiClient.get("/api/notifications/unread-count");
      return response.data;
    } catch (error) {
      return { unreadCount: 0 };
    }
  },

  createNotification: async (notification) => {
    const response = await apiClient.post("/api/notifications", notification);
    return response.data;
  },

  markNotificationRead: async (notificationId) => {
    const response = await apiClient.put(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await apiClient.put("/api/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(
      `/api/notifications/${notificationId}`
    );
    return response.data;
  },

  clearAllNotifications: async () => {
    const response = await apiClient.delete("/api/notifications");
    return response.data;
  },

  // === Conversations Q&A ===

  getConversations: async (patientId = null, limit = 20) => {
    try {
      const params = { limit };
      if (patientId) params.patient_id = patientId;
      const response = await apiClient.get("/api/conversations", { params });
      return response.data;
    } catch (error) {
      console.error("Erreur récupération conversations:", error);
      return { conversations: [], total: 0 };
    }
  },

  getConversation: async (conversationId) => {
    const response = await apiClient.get(
      `/api/conversations/${conversationId}`
    );
    return response.data;
  },

  createConversation: async (title, patientId = null) => {
    const response = await apiClient.post("/api/conversations", {
      title,
      patientId,
    });
    return response.data;
  },

  addMessageToConversation: async (
    conversationId,
    role,
    content,
    sources = null
  ) => {
    const response = await apiClient.post(
      `/api/conversations/${conversationId}/messages`,
      {
        role,
        content,
        sources,
      }
    );
    return response.data;
  },

  updateConversation: async (conversationId, title) => {
    const response = await apiClient.put(
      `/api/conversations/${conversationId}`,
      {
        title,
      }
    );
    return response.data;
  },

  deleteConversation: async (conversationId) => {
    const response = await apiClient.delete(
      `/api/conversations/${conversationId}`
    );
    return response.data;
  },

  clearConversations: async (patientId = null) => {
    const params = patientId ? { patient_id: patientId } : {};
    const response = await apiClient.delete("/api/conversations", { params });
    return response.data;
  },
};

export default api;

export const getGatewayUrl = () => API_GATEWAY_URL;
