import React, { useState, useEffect } from "react";
import api from "../services/api";

const Icons = {
  download: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  filter: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  clipboard: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  document: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

const actionLabels = {
  DOCUMENT_UPLOAD: "Upload Document",
  DOCUMENT_VIEW: "Consultation Document",
  DOCUMENT_DELETE: "Suppression Document",
  QA_QUERY: "Question/Réponse",
  SYNTHESIS_GENERATE: "Génération Synthèse",
  USER_LOGIN: "Connexion",
  USER_LOGOUT: "Déconnexion",
  DEID_PROCESS: "Anonymisation",
};

const actionColors = {
  DOCUMENT_UPLOAD: "bg-emerald-100 text-emerald-700 border-emerald-200",
  DOCUMENT_VIEW: "bg-blue-100 text-blue-700 border-blue-200",
  DOCUMENT_DELETE: "bg-red-100 text-red-700 border-red-200",
  QA_QUERY: "bg-brand-100 text-brand-700 border-brand-200",
  SYNTHESIS_GENERATE: "bg-amber-100 text-amber-700 border-amber-200",
  USER_LOGIN: "bg-cyan-100 text-cyan-700 border-cyan-200",
  USER_LOGOUT: "bg-slate-100 text-slate-700 border-slate-200",
  DEID_PROCESS: "bg-pink-100 text-pink-700 border-pink-200",
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await api.getAuditLogs();
      if (response.success && Array.isArray(response.logs)) {
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
    const matchesSearch =
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
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
      ["Date", "Action", "Utilisateur", "Détails", "IP"].join(","),
      ...filteredLogs.map((log) =>
        [
          new Date(log.timestamp).toLocaleString("fr-FR"),
          actionLabels[log.action] || log.action,
          log.user,
          `"${log.details}"`,
          log.ip,
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Journal d'Audit</h1>
          <p className="text-slate-500 mt-1">Traçabilité et conformité des opérations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            {Icons.refresh}
            Actualiser
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium shadow-lg shadow-slate-500/20 hover:bg-slate-900 transition-all"
          >
            {Icons.download}
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Opérations",
            value: logs.length,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Aujourd'hui",
            value: logs.filter(
              (l) =>
                new Date(l.timestamp).toDateString() ===
                new Date().toDateString()
            ).length,
            color: "from-emerald-500 to-teal-500",
          },
          {
            label: "Utilisateurs Actifs",
            value: [...new Set(logs.map((l) => l.user))].length,
            color: "from-brand-500 to-accent-500",
          },
          {
            label: "Questions Q/R",
            value: logs.filter((l) => l.action === "QA_QUERY").length,
            color: "from-amber-500 to-orange-500",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p
              className={`text-3xl font-bold mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
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
              className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-slate-50"
            />
          </div>
          <div className="relative min-w-[200px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {Icons.filter}
            </span>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none bg-slate-50 text-slate-700 font-medium"
            >
              <option value="">Toutes les actions</option>
              {Object.entries(actionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
              {Icons.clipboard}
            </div>
            <p className="text-slate-500 font-medium">Aucun log trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date/Heure
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((log, idx) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        {Icons.clock}
                        {new Date(log.timestamp).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                          actionColors[log.action] ||
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          {Icons.user}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {log.user}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 max-w-xs truncate" title={log.details}>
                        {Icons.document}
                        {log.details}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {log.ip}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-600">
              Affichage {(currentPage - 1) * logsPerPage + 1} -{" "}
              {Math.min(currentPage * logsPerPage, filteredLogs.length)} sur{" "}
              {filteredLogs.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
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
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-brand-600 text-white shadow-sm"
                        : "border border-slate-200 hover:bg-white bg-white text-slate-600"
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
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                {Icons.chevronRight}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
