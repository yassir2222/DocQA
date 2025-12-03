import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Icon components
const Icons = {
  document: (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  check: (
    <svg
      className="w-8 h-8"
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
  chat: (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  bolt: (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  upload: (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  question: (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  clipboard: (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  ),
  audit: (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
};

export default function Dashboard() {
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Animated counter effect
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        totalDocuments: Math.round(stats.totalDocuments * easeOut),
        processedDocuments: Math.round(stats.processedDocuments * easeOut),
        totalQueries: Math.round(stats.totalQueries * easeOut),
        avgResponseTime: parseFloat(
          (stats.avgResponseTime * easeOut).toFixed(1)
        ),
      });

      if (step >= steps) clearInterval(timer);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [stats]);

  const loadDashboardData = async () => {
    try {
      // Simulated data - will connect to real API
      setTimeout(() => {
        setStats({
          totalDocuments: 156,
          processedDocuments: 142,
          totalQueries: 1247,
          avgResponseTime: 1.2,
        });

        setRecentActivity([
          {
            id: 1,
            type: "upload",
            message: "Compte-rendu consultation uploade",
            time: "Il y a 5 min",
            status: "success",
          },
          {
            id: 2,
            type: "query",
            message: "Question sur traitement patient P001",
            time: "Il y a 15 min",
            status: "success",
          },
          {
            id: 3,
            type: "synthesis",
            message: "Synthese generee pour dossier 2024-123",
            time: "Il y a 1h",
            status: "success",
          },
          {
            id: 4,
            type: "upload",
            message: "Resultats laboratoire uploades",
            time: "Il y a 2h",
            status: "success",
          },
          {
            id: 5,
            type: "query",
            message: "Recherche antecedents patient P002",
            time: "Il y a 3h",
            status: "success",
          },
        ]);

        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 overflow-hidden border border-slate-100 hover:-translate-y-1`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      {/* Content */}
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
              {Icons.arrowUp}
              <span>{trend}% ce mois</span>
            </div>
          )}
        </div>
        <div
          className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
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

    const getColor = (type) => {
      switch (type) {
        case "upload":
          return "from-blue-500 to-cyan-500";
        case "query":
          return "from-purple-500 to-indigo-500";
        case "synthesis":
          return "from-emerald-500 to-teal-500";
        default:
          return "from-slate-500 to-slate-600";
      }
    };

    return (
      <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
        <div
          className={`p-2 rounded-xl bg-gradient-to-br ${getColor(
            activity.type
          )} text-white shadow-md group-hover:scale-110 transition-transform`}
        >
          <div className="w-5 h-5">{getIcon(activity.type)}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {activity.message}
          </p>
          <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    );
  };

  const QuickAction = ({ href, icon, title, description, color }) => (
    <Link
      to={href}
      className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden hover:-translate-y-1"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      />
      <div
        className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <span className="text-sm font-semibold text-slate-800">{title}</span>
      <span className="text-xs text-slate-500 mt-1 text-center">
        {description}
      </span>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-200 rounded-full animate-spin border-t-cyan-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-slate-500 mt-1">
            Vue d'ensemble de votre activite medicale
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Systeme operationnel
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Documents totaux"
          value={animatedStats.totalDocuments}
          icon={Icons.document}
          color="from-blue-500 to-cyan-500"
          trend="12"
        />
        <StatCard
          title="Documents traites"
          value={animatedStats.processedDocuments}
          icon={Icons.check}
          color="from-emerald-500 to-teal-500"
          trend="8"
        />
        <StatCard
          title="Questions traitees"
          value={animatedStats.totalQueries}
          icon={Icons.chat}
          color="from-purple-500 to-indigo-500"
          trend="23"
        />
        <StatCard
          title="Temps reponse moyen"
          value={`${animatedStats.avgResponseTime}s`}
          icon={Icons.bolt}
          color="from-amber-500 to-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Activite recente
              </h2>
              <p className="text-sm text-slate-500">
                Dernieres actions sur le systeme
              </p>
            </div>
            <Link
              to="/audit"
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Actions rapides
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction
                href="/documents"
                icon={Icons.upload}
                title="Uploader"
                description="Nouveau document"
                color="from-blue-500 to-cyan-500"
              />
              <QuickAction
                href="/qa"
                icon={Icons.chat}
                title="Question"
                description="Poser une question"
                color="from-purple-500 to-indigo-500"
              />
              <QuickAction
                href="/synthesis"
                icon={Icons.clipboard}
                title="Synthese"
                description="Generer un resume"
                color="from-emerald-500 to-teal-500"
              />
              <QuickAction
                href="/audit"
                icon={Icons.audit}
                title="Audit"
                description="Voir les logs"
                color="from-amber-500 to-orange-500"
              />
            </div>
          </div>

          {/* System Health */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-semibold mb-4">Sante du systeme</h3>
            <div className="space-y-3">
              {[
                { name: "CPU", value: 23 },
                { name: "Memoire", value: 45 },
                { name: "Stockage", value: 67 },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
