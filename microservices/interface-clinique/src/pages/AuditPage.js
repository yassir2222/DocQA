import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import api from "../services/api";

const Icons = {
  download: (
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),
  search: (
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
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  filter: (
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
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  ),
  refresh: (
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
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  clipboard: (
    <svg
      className="w-10 h-10"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  ),
  user: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  document: (
    <svg
      className="w-4 h-4"
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
  clock: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  chevronLeft: (
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
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
  chevronRight: (
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
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  shield: (
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
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  activity: (
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
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  users: (
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
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
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
  calendar: (
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
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  eye: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  close: (
    <svg
      className="w-6 h-6"
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
};

const actionLabels = {
  DOCUMENT_UPLOAD: "Upload Document",
  DOCUMENT_VIEW: "Consultation",
  DOCUMENT_DELETE: "Suppression",
  QA_QUERY: "Question IA",
  SYNTHESIS_GENERATE: "Synthèse",
  USER_LOGIN: "Connexion",
  USER_LOGOUT: "Déconnexion",
  DEID_PROCESS: "Anonymisation",
};

const actionColors = {
  DOCUMENT_UPLOAD: "bg-emerald-100 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
  DOCUMENT_VIEW: "bg-blue-100 text-blue-700 border-blue-200",
  DOCUMENT_DELETE: "bg-red-100 text-red-700 border-red-200",
  QA_QUERY: "bg-indigo-100 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700",
  SYNTHESIS_GENERATE: "bg-amber-100 text-amber-700 border-amber-200",
  USER_LOGIN: "bg-cyan-100 text-cyan-700 border-cyan-200",
  USER_LOGOUT: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700",
  DEID_PROCESS: "bg-pink-100 text-pink-700 border-pink-200",
};

const actionIcons = {
  DOCUMENT_UPLOAD: "↑",
  DOCUMENT_VIEW: "👁",
  DOCUMENT_DELETE: "🗑",
  QA_QUERY: "💬",
  SYNTHESIS_GENERATE: "✨",
  USER_LOGIN: "→",
  USER_LOGOUT: "←",
  DEID_PROCESS: "🔒",
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const logsPerPage = 15;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await api.getAuditLogs();
      if (response.content && Array.isArray(response.content)) {
        setLogs(response.content);
      } else if (response.success && Array.isArray(response.logs)) {
        setLogs(response.logs);
      } else if (Array.isArray(response)) {
        setLogs(response);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Erreur chargement logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const userName = log.userId || log.user || "";
    const details = log.details || "";

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterAction || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const handleExport = () => {
    const csvContent = [
      ["Date", "Action", "Utilisateur", "Détails"].join(","),
      ...filteredLogs.map((log) =>
        [
          new Date(log.timestamp).toLocaleString("fr-FR"),
          actionLabels[log.action] || log.action,
          log.userId || log.user,
          `"${log.details}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Total Opérations",
      value: logs.length,
      icon: Icons.activity,
      gradient: "from-indigo-500 to-purple-600",
      bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30",
    },
    {
      label: "Aujourd'hui",
      value: logs.filter(
        (l) =>
          new Date(l.timestamp).toDateString() === new Date().toDateString()
      ).length,
      icon: Icons.calendar,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30",
    },
    {
      label: "Utilisateurs",
      value: [...new Set(logs.map((l) => l.userId || l.user))].length,
      icon: Icons.users,
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30",
    },
    {
      label: "Questions IA",
      value: logs.filter((l) => l.action === "QA_QUERY").length,
      icon: Icons.chat,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
              Journal d'Audit
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center gap-1">
              {Icons.shield}
              Sécurisé
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Traçabilité et conformité des opérations médicales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500 transition-all shadow-sm"
          >
            {Icons.refresh}
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-semibold shadow-lg shadow-slate-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {Icons.download}
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-5 border border-white/50 hover:shadow-lg transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {stat.label}
                </p>
                <p
                  className={`text-3xl font-bold mt-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                >
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {Icons.search}
            </span>
            <input
              type="text"
              placeholder="Rechercher par utilisateur ou détails..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 dark:bg-slate-900 text-sm transition-all"
            />
          </div>
          <div className="relative min-w-[220px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {Icons.filter}
            </span>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-8 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium text-sm cursor-pointer transition-all"
            >
              <option value="">Toutes les actions</option>
              {Object.entries(actionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {actionIcons[key]} {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-indigo-100 dark:border-indigo-800 rounded-full" />
              <div className="w-14 h-14 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent absolute inset-0" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-4">
              Chargement des logs...
            </p>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-300">
              {Icons.clipboard}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Aucun log trouvé
              </h3>
              <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
                Modifiez vos filtres ou attendez de nouvelles activités
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 dark:from-slate-800 dark:to-slate-700 dark:to-slate-700">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Date/Heure
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {paginatedLogs.map((log, idx) => (
                  <tr
                    key={log.id || idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 dark:text-slate-500">{Icons.clock}</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {(() => {
                            const dateVal = log.timestamp || log.createdAt;
                            const dateObj = Array.isArray(dateVal)
                              ? new Date(
                                  dateVal[0],
                                  dateVal[1] - 1,
                                  dateVal[2],
                                  dateVal[3],
                                  dateVal[4],
                                  dateVal[5]
                                )
                              : new Date(dateVal);
                            return dateObj.toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          })()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          actionColors[log.action] ||
                          "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span>{actionIcons[log.action] || "•"}</span>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                          {(log.userId || log.user || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {log.userId || log.user || "Inconnu"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 max-w-xs">
                        <span className="text-slate-400 dark:text-slate-500">{Icons.document}</span>
                        <span className="truncate" title={log.details}>
                          {log.details || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow"
                      >
                        {Icons.eye}
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-800 dark:text-white">
                {(currentPage - 1) * logsPerPage + 1}
              </span>
              {" - "}
              <span className="font-semibold text-slate-800 dark:text-white">
                {Math.min(currentPage * logsPerPage, filteredLogs.length)}
              </span>
              {" sur "}
              <span className="font-semibold text-slate-800 dark:text-white">
                {filteredLogs.length}
              </span>
              {" entrées"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:bg-slate-800 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white dark:bg-slate-800 shadow-sm"
              >
                {Icons.chevronLeft}
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                        : "border border-slate-200 dark:border-slate-700 hover:bg-white dark:bg-slate-800 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:bg-slate-800 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white dark:bg-slate-800 shadow-sm"
              >
                {Icons.chevronRight}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {selectedLog &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            onClick={() => setSelectedLog(null)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    {actionIcons[selectedLog.action] || "📋"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Détails de l'opération
                    </h3>
                    <p className="text-sm text-white/80">
                      {actionLabels[selectedLog.action] || selectedLog.action}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  {Icons.close}
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                {/* Info générales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1">
                      Date & Heure
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      {(() => {
                        const dateVal =
                          selectedLog.timestamp || selectedLog.createdAt;
                        const dateObj = Array.isArray(dateVal)
                          ? new Date(
                              dateVal[0],
                              dateVal[1] - 1,
                              dateVal[2],
                              dateVal[3],
                              dateVal[4],
                              dateVal[5]
                            )
                          : new Date(dateVal);
                        return dateObj.toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });
                      })()}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1">
                      Utilisateur
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {(selectedLog.userId || selectedLog.user || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">
                        {selectedLog.userId || selectedLog.user || "Inconnu"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Type d'action */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-2">
                    Type d'Action
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${
                      actionColors[selectedLog.action] ||
                      "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className="text-lg">
                      {actionIcons[selectedLog.action] || "•"}
                    </span>
                    {actionLabels[selectedLog.action] || selectedLog.action}
                  </span>
                </div>

                {/* Détails / Contenu */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-800">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide block mb-2 font-semibold">
                    {selectedLog.action === "SYNTHESIS_GENERATE"
                      ? "📊 Synthèse Générée"
                      : selectedLog.action === "QA_QUERY"
                      ? "💬 Question / Réponse"
                      : selectedLog.action === "DOCUMENT_VIEW" ||
                        selectedLog.action === "DOCUMENT_UPLOAD"
                      ? "📄 Document"
                      : "📝 Détails"}
                  </span>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800 shadow-inner">
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {selectedLog.details ||
                        selectedLog.content ||
                        "Aucun détail disponible"}
                    </p>
                  </div>
                </div>

                {/* Métadonnées supplémentaires si disponibles */}
                {(selectedLog.documentId ||
                  selectedLog.patientId ||
                  selectedLog.synthesisId) && (
                  <div className="grid grid-cols-3 gap-3">
                    {selectedLog.documentId && (
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-center">
                        <span className="text-xs text-emerald-600 block">
                          ID Document
                        </span>
                        <span className="text-sm font-mono font-bold text-emerald-800">
                          {selectedLog.documentId}
                        </span>
                      </div>
                    )}
                    {selectedLog.patientId && (
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 text-center">
                        <span className="text-xs text-blue-600 block">
                          ID Patient
                        </span>
                        <span className="text-sm font-mono font-bold text-blue-800">
                          {selectedLog.patientId}
                        </span>
                      </div>
                    )}
                    {selectedLog.synthesisId && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-100 text-center">
                        <span className="text-xs text-amber-600 block">
                          ID Synthèse
                        </span>
                        <span className="text-sm font-mono font-bold text-amber-800">
                          {selectedLog.synthesisId}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
