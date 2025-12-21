import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Icons = {
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  document: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  navigation: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  ),
  action: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  dashboard: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  chat: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  synthesis: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  analytics: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  audit: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  help: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  patients: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  upload: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
};

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [patients, setPatients] = useState([]);
  const inputRef = useRef(null);

  // Navigation items
  const navigationItems = [
    { type: "navigation", icon: Icons.dashboard, title: "Tableau de bord", path: "/dashboard", keywords: ["dashboard", "accueil", "home"] },
    { type: "navigation", icon: Icons.document, title: "Documents", path: "/documents", keywords: ["fichiers", "files", "upload"] },
    { type: "navigation", icon: Icons.patients, title: "Patients", path: "/patients", keywords: ["users", "dossiers"] },
    { type: "navigation", icon: Icons.chat, title: "Assistant IA", path: "/qa", keywords: ["chat", "question", "reponse", "ia", "ai"] },
    { type: "navigation", icon: Icons.synthesis, title: "Synthese", path: "/synthesis", keywords: ["resume", "comparaison"] },
    { type: "navigation", icon: Icons.analytics, title: "Analytics", path: "/analytics", keywords: ["stats", "metrics", "insights"] },
    { type: "navigation", icon: Icons.audit, title: "Journal d'audit", path: "/audit", keywords: ["logs", "historique", "trace"] },
    { type: "navigation", icon: Icons.help, title: "Aide", path: "/help", keywords: ["faq", "guide", "support"] },
    { type: "navigation", icon: Icons.settings, title: "Parametres", path: "/settings", keywords: ["config", "options", "preferences"] },
  ];

  // Quick actions
  const actionItems = [
    { type: "action", icon: Icons.plus, title: "Nouvelle conversation IA", action: () => navigate("/qa"), keywords: ["new", "chat", "question"] },
    { type: "action", icon: Icons.upload, title: "Uploader un document", action: () => navigate("/documents"), keywords: ["upload", "ajouter", "fichier"] },
    { type: "action", icon: Icons.synthesis, title: "Generer une synthese", action: () => navigate("/synthesis"), keywords: ["generate", "resume"] },
  ];

  // Load documents and patients
  useEffect(() => {
    if (isOpen) {
      loadData();
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const response = await api.getDocuments();
      const docs = response.documents || [];
      setDocuments(docs);
      
      const uniquePatients = [...new Set(docs.map((d) => d.patient_id))].filter(Boolean);
      setPatients(uniquePatients);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Filter results based on query
  const getFilteredResults = useCallback(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return [
        ...actionItems.slice(0, 3),
        ...navigationItems,
      ];
    }

    const results = [];

    // Filter navigation
    const filteredNav = navigationItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    );
    results.push(...filteredNav);

    // Filter actions
    const filteredActions = actionItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    );
    results.push(...filteredActions);

    // Filter documents
    const filteredDocs = documents
      .filter((doc) => doc.filename.toLowerCase().includes(q))
      .slice(0, 5)
      .map((doc) => ({
        type: "document",
        icon: Icons.document,
        title: doc.filename,
        subtitle: `Patient: ${doc.patient_id || "Non assigne"}`,
        action: () => navigate("/documents"),
      }));
    results.push(...filteredDocs);

    // Filter patients
    const filteredPatients = patients
      .filter((p) => p.toLowerCase().includes(q))
      .slice(0, 5)
      .map((patient) => ({
        type: "patient",
        icon: Icons.user,
        title: patient,
        subtitle: "Patient",
        action: () => navigate(`/patients`),
      }));
    results.push(...filteredPatients);

    return results;
  }, [query, documents, patients, navigate]);

  const filteredResults = getFilteredResults();

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          const selected = filteredResults[selectedIndex];
          if (selected) {
            handleSelect(selected);
          }
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults, onClose]);

  const handleSelect = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
    onClose();
    setQuery("");
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "navigation": return "Navigation";
      case "action": return "Action";
      case "document": return "Document";
      case "patient": return "Patient";
      default: return "";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "navigation": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400";
      case "action": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400";
      case "document": return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400";
      case "patient": return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 dark:text-slate-500">
              {Icons.search}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher pages, documents, patients..."
              className="flex-1 bg-transparent text-lg text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                {Icons.close}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {filteredResults.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <p>Aucun resultat pour "{query}"</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredResults.map((item, index) => (
                  <button
                    key={`${item.type}-${index}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      selectedIndex === index
                        ? "bg-indigo-50 dark:bg-indigo-900/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedIndex === index 
                        ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-400" 
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        selectedIndex === index 
                          ? "text-indigo-700 dark:text-indigo-300" 
                          : "text-slate-800 dark:text-white"
                      }`}>
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">Fleches</kbd>
                pour naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">Entree</kbd>
                pour selectionner
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {filteredResults.length} resultats
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

CommandPalette.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CommandPalette;
