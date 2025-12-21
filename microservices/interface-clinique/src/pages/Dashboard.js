import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { ActivityChart, TypesChart } from "../components/Charts";

// Premium Icons with gradients
const Icons = {
  document: (
    <svg
      className="w-6 h-6"
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
  check: (
    <svg
      className="w-6 h-6"
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
  chat: (
    <svg
      className="w-6 h-6"
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
  bolt: (
    <svg
      className="w-6 h-6"
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
  upload: (
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  question: (
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
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  clipboard: (
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
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  ),
  audit: (
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
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  ),
  arrowUp: (
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
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
  ),
  arrowRight: (
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
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  ),
  sparkles: (
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
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
};

// Slider Widget Component avec auto-scroll
const SliderWidget = ({ isDark }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slides = [
    { id: 'activity', title: 'Activité (7 derniers jours)', type: 'chart-activity' },
    { id: 'types', title: 'Répartition des opérations', type: 'chart-types' },
    { id: 'actions', title: 'Actions rapides', type: 'quick-actions' },
  ];

  // Auto-scroll toutes les 5 secondes
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header avec indicateurs */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
          {slides[currentSlide].title}
        </h2>
        <div className="flex items-center gap-2">
          {/* Indicateurs de slide */}
          <div className="flex gap-1.5">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? 'bg-indigo-600 w-6' 
                    : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'
                }`}
                aria-label={slide.title}
              />
            ))}
          </div>
          {/* Boutons de navigation */}
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu du slider */}
      <div className="p-6 min-h-[350px] flex items-center justify-center">
        {slides[currentSlide].type === 'chart-activity' && (
          <div className="w-full animate-fade-in">
            <ActivityChart isDark={isDark} />
          </div>
        )}
        {slides[currentSlide].type === 'chart-types' && (
          <div className="w-full animate-fade-in">
            <TypesChart isDark={isDark} />
          </div>
        )}
        {slides[currentSlide].type === 'quick-actions' && (
          <div className="w-full grid grid-cols-2 gap-4 animate-fade-in">
            <Link to="/documents" className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                {Icons.upload}
              </div>
              <span className="relative mt-4 text-sm font-bold text-slate-800 dark:text-white">Uploader</span>
              <span className="relative text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">Nouveau document</span>
            </Link>
            <Link to="/qa" className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                {Icons.question}
              </div>
              <span className="relative mt-4 text-sm font-bold text-slate-800 dark:text-white">Question</span>
              <span className="relative text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">Poser une question</span>
            </Link>
            <Link to="/synthesis" className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                {Icons.clipboard}
              </div>
              <span className="relative mt-4 text-sm font-bold text-slate-800 dark:text-white">Synthèse</span>
              <span className="relative text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">Générer un résumé</span>
            </Link>
            <Link to="/audit" className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200">
                {Icons.audit}
              </div>
              <span className="relative mt-4 text-sm font-bold text-slate-800 dark:text-white">Audit</span>
              <span className="relative text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">Voir les logs</span>
            </Link>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div className="h-1 bg-slate-100 dark:bg-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ 
            width: isPaused ? `${((currentSlide + 1) / slides.length) * 100}%` : '0%',
            animation: isPaused ? 'none' : 'progress 5s linear infinite'
          }}
        />
      </div>
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

SliderWidget.propTypes = {
  isDark: PropTypes.bool,
};

SliderWidget.defaultProps = {
  isDark: false,
};
export default function Dashboard() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    processedDocuments: 0,
    totalQueries: 0,
    avgResponseTime: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    totalDocuments: 0,
    processedDocuments: 0,
    totalQueries: 0,
    avgResponseTime: 0,
  });
  const animationRan = useRef(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (animationRan.current || stats.totalDocuments === 0) return;
    animationRan.current = true;

    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    const targetStats = { ...stats };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        totalDocuments: Math.round(targetStats.totalDocuments * easeOut),
        processedDocuments: Math.round(
          targetStats.processedDocuments * easeOut
        ),
        totalQueries: Math.round(targetStats.totalQueries * easeOut),
        avgResponseTime: parseFloat(
          (targetStats.avgResponseTime * easeOut).toFixed(1)
        ),
      });

      if (step >= steps) clearInterval(timer);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [stats]);

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, auditLogs] = await Promise.all([
        api.getDashboardStats(),
        api.getAuditLogs({ limit: 5 }),
      ]);

      setStats({
        totalDocuments: dashboardStats.documents?.total || 0,
        processedDocuments: dashboardStats.documents?.processed || 0,
        totalQueries: dashboardStats.questions?.total || 0,
        avgResponseTime: 1.2,
      });

      const logsData =
        auditLogs.content ||
        auditLogs.logs ||
        (Array.isArray(auditLogs) ? auditLogs : []);

      if (Array.isArray(logsData)) {
        const activity = logsData.map((log) => {
          // Générer un titre descriptif selon le type d'action
          const getActivityTitle = (action, details) => {
            switch (action) {
              case "QUERY":
                // Extraire la question des détails si disponible
                if (details && details.length > 0) {
                  const question = details.length > 50 ? details.substring(0, 50) + "..." : details;
                  return `Question: "${question}"`;
                }
                return "Question posée à l'assistant IA";
              case "GENERATE_SYNTHESIS":
                return "Synthèse de documents générée";
              case "UPLOAD":
                return "Nouveau document uploadé";
              case "DOCUMENT_VIEW":
                return "Consultation d'un document";
              case "DOCUMENT_DELETE":
                return "Document supprimé";
              default:
                return details || "Activité système";
            }
          };

          return {
            id: log.id,
            type:
              log.action === "UPLOAD"
                ? "upload"
                : log.action === "QUERY"
                ? "query"
                : log.action === "GENERATE_SYNTHESIS"
                ? "synthesis"
                : "document",
            message: getActivityTitle(log.action, log.details),
            time: (() => {
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
              return dateObj.toLocaleTimeString();
            })(),
            status: "success",
          };
        });
        setRecentActivity(activity);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, gradient, trend, delay = 0 }) => (
    <div
      className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-600 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      {/* Decorative circle */}
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">{title}</p>
          <p className="text-4xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                {Icons.arrowUp}
              </div>
              <span className="text-sm font-semibold">{trend}%</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">ce mois</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity, index }) => {
    const getIcon = (type) => {
      switch (type) {
        case "upload":
          return Icons.upload;
        case "query":
          return Icons.question;
        case "synthesis":
          return Icons.clipboard;
        default:
          return Icons.document;
      }
    };

    const getGradient = (type) => {
      switch (type) {
        case "upload":
          return "from-indigo-500 to-purple-600";
        case "query":
          return "from-cyan-500 to-blue-600";
        case "synthesis":
          return "from-emerald-500 to-teal-600";
        default:
          return "from-slate-500 to-slate-600";
      }
    };

    return (
      <div
        className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-all duration-200 group cursor-pointer"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div
          className={`p-2.5 rounded-xl bg-gradient-to-br ${getGradient(
            activity.type
          )} text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200`}
        >
          {getIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">
            {activity.message}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{activity.time}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500">
          {Icons.arrowRight}
        </div>
      </div>
    );
  };

  const QuickAction = ({ href, icon, title, description, gradient }) => (
    <Link
      to={href}
      className="group relative flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-600 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
      <div
        className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-200`}
      >
        {icon}
      </div>
      <span className="relative mt-4 text-sm font-bold text-slate-800 dark:text-white group-hover:text-slate-900 dark:text-white">
        {title}
      </span>
      <span className="relative text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 text-center">
        {description}
      </span>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-800 rounded-full" />
          <div className="w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent absolute inset-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
              Tableau de bord
            </h1>
            <span className="px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 rounded-full">
              Live
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Vue d'ensemble de votre activité médicale
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/documents"
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            {Icons.upload}
            <span>Uploader</span>
          </Link>
          <Link
            to="/qa"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            {Icons.sparkles}
            <span>Assistant IA</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Documents totaux"
          value={animatedStats.totalDocuments}
          icon={Icons.document}
          gradient="from-indigo-500 to-purple-600"
          trend="12"
          delay={0}
        />
        <StatCard
          title="Documents traités"
          value={animatedStats.processedDocuments}
          icon={Icons.check}
          gradient="from-emerald-500 to-teal-600"
          trend="8"
          delay={100}
        />
        <StatCard
          title="Questions traitées"
          value={animatedStats.totalQueries}
          icon={Icons.chat}
          gradient="from-cyan-500 to-blue-600"
          trend="23"
          delay={200}
        />
        <StatCard
          title="Temps réponse moyen"
          value={`${animatedStats.avgResponseTime}s`}
          icon={Icons.bolt}
          gradient="from-amber-500 to-orange-600"
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Activité récente
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Dernières actions sur le système
              </p>
            </div>
            <Link
              to="/audit"
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors group"
            >
              Voir tout
              <span className="group-hover:translate-x-0.5 transition-transform">
                {Icons.arrowRight}
              </span>
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700 overflow-y-auto flex-1">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
            {recentActivity.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                  {Icons.document}
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  Aucune activité récente
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Commencez par uploader un document
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Auto Slider */}
        <div className="relative">
          <SliderWidget isDark={isDark} />
        </div>
      </div>
    </div>
  );
}

