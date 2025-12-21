import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import api from "../services/api";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Charger les notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications({ limit: 50 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger seulement le compteur
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Erreur compteur notifications:", error);
    }
  }, []);

  // Créer une notification locale (pour feedback immédiat)
  const addLocalNotification = useCallback((notification) => {
    const newNotif = {
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      type: notification.type || "info",
      title: notification.title || "Notification",
      message: notification.message || "",
      data: notification.data || {},
      priority: notification.priority || "normal",
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Marquer comme lue
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur marquage toutes notifications:", error);
    }
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback(
    async (notificationId) => {
      try {
        await api.deleteNotification(notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        // Mettre à jour le compteur si non lue
        const notif = notifications.find((n) => n.id === notificationId);
        if (notif && !notif.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Erreur suppression notification:", error);
      }
    },
    [notifications]
  );

  // Supprimer toutes les notifications
  const clearAll = useCallback(async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur suppression notifications:", error);
    }
  }, []);

  // Ouvrir/fermer le panneau
  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Polling pour les nouvelles notifications (toutes les 30 secondes)
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  // Rafraîchir les notifications quand on ouvre le panneau
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    isOpen,
    fetchNotifications,
    addLocalNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    togglePanel,
    closePanel,
  }), [notifications, unreadCount, loading, isOpen, fetchNotifications, addLocalNotification, markAsRead, markAllAsRead, removeNotification, clearAll, togglePanel, closePanel]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NotificationContext;
