import React from "react";
import ReactDOM from "react-dom";
import { useNotifications } from "../context/NotificationContext";

// Icônes
const Icons = {
  close: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  check: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  checkAll: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  trash: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  document: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  chat: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  synthesis: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  success: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  bell: (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
};

// Configuration des types de notifications
const notificationConfig = {
  document: {
    icon: Icons.document,
    bgColor: "bg-blue-50",
    iconBg: "bg-blue-500",
    borderColor: "border-blue-200",
  },
  qa: {
    icon: Icons.chat,
    bgColor: "bg-indigo-50",
    iconBg: "bg-indigo-500",
    borderColor: "border-indigo-200",
  },
  synthesis: {
    icon: Icons.synthesis,
    bgColor: "bg-purple-50",
    iconBg: "bg-purple-500",
    borderColor: "border-purple-200",
  },
  success: {
    icon: Icons.success,
    bgColor: "bg-emerald-50",
    iconBg: "bg-emerald-500",
    borderColor: "border-emerald-200",
  },
  error: {
    icon: Icons.error,
    bgColor: "bg-red-50",
    iconBg: "bg-red-500",
    borderColor: "border-red-200",
  },
  warning: {
    icon: Icons.warning,
    bgColor: "bg-amber-50",
    iconBg: "bg-amber-500",
    borderColor: "border-amber-200",
  },
  info: {
    icon: Icons.info,
    bgColor: "bg-slate-50",
    iconBg: "bg-slate-500",
    borderColor: "border-slate-200",
  },
};

// Formater le temps relatif
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

// Composant d'une notification
const NotificationItem = ({ notification, onRead, onDelete }) => {
  const config =
    notificationConfig[notification.type] || notificationConfig.info;

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-200 ${
        notification.read
          ? "bg-white border-slate-100 opacity-70"
          : `${config.bgColor} ${config.borderColor}`
      } hover:shadow-md group`}
    >
      <div className="flex gap-3">
        {/* Icône */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center text-white shadow-lg`}
        >
          {config.icon}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-sm font-semibold ${
                notification.read ? "text-slate-600" : "text-slate-800"
              }`}
            >
              {notification.title}
            </h4>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p
            className={`text-sm mt-1 ${
              notification.read ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {notification.message}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={() => onRead(notification.id)}
            className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-500 hover:text-emerald-600 shadow-sm transition-all"
            title="Marquer comme lu"
          >
            {Icons.check}
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-500 hover:text-red-600 shadow-sm transition-all"
          title="Supprimer"
        >
          {Icons.trash}
        </button>
      </div>

      {/* Indicateur non lu */}
      {!notification.read && (
        <div className="absolute top-4 left-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
      )}
    </div>
  );
};

// Panneau de notifications principal
const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    loading,
    isOpen,
    closePanel,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999]" onClick={closePanel}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Panel */}
      <div
        className="absolute top-20 right-4 lg:right-8 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-white/20 text-white rounded-full">
                  {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={closePanel}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Actions rapides */}
          {notifications.length > 0 && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                {Icons.checkAll}
                Tout marquer lu
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                {Icons.trash}
                Tout effacer
              </button>
            </div>
          )}
        </div>

        {/* Liste des notifications */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500 mt-3">Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
              {Icons.bell}
              <p className="text-sm text-slate-500 mt-3">Aucune notification</p>
              <p className="text-xs text-slate-400">Vous êtes à jour !</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onDelete={removeNotification}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              {notifications.length} notification
              {notifications.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default NotificationPanel;
