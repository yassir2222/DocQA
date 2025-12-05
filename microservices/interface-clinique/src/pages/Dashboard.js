import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

// Icon components
const Icons = {
  document: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  check: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  bolt: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  question: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  audit: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  arrowUp: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
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
  const animationRan = useRef(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Only run animation once when stats are loaded (not zero) and animation hasn't run yet
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
        processedDocuments: Math.round(targetStats.processedDocuments * easeOut),
        totalQueries: Math.round(targetStats.totalQueries * easeOut),
        avgResponseTime: parseFloat((targetStats.avgResponseTime * easeOut).toFixed(1)),
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

      const logsData = auditLogs.content || auditLogs.logs || (Array.isArray(auditLogs) ? auditLogs : []);
      
      if (Array.isArray(logsData)) {
        const activity = logsData.map((log) => ({
          id: log.id,
          type:
            log.action === "UPLOAD"
              ? "upload"
              : log.action === "QUERY"
              ? "query"
              : log.action === "GENERATE_SYNTHESIS"
              ? "synthesis"
              : "document",
          message: log.details || log.action,
          time: (() => {
            const dateVal = log.timestamp || log.createdAt;
            const dateObj = Array.isArray(dateVal) 
              ? new Date(dateVal[0], dateVal[1]-1, dateVal[2], dateVal[3], dateVal[4], dateVal[5])
              : new Date(dateVal);
            return dateObj.toLocaleTimeString();
          })(),
          status: "success",
        }));
        setRecentActivity(activity);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 overflow-hidden border border-slate-100">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold font-display text-slate-800">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm font-medium">
              {Icons.arrowUp}
              <span>{trend}% ce mois</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg shadow-brand-500/20`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = (type) => {
      switch (type) {
        case "upload": return Icons.upload;
        case "query": return Icons.question;
        case "synthesis": return Icons.clipboard;
        default: return Icons.document;
      }
    };

    const getColor = (type) => {
      switch (type) {
        case "upload": return "from-brand-500 to-brand-600";
        case "query": return "from-accent-500 to-accent-600";
        case "synthesis": return "from-emerald-500 to-emerald-600";
        default: return "from-slate-500 to-slate-600";
      }
    };

    return (
      <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${getColor(activity.type)} text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
          {getIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{activity.message}</p>
          <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
        </div>
      </div>
    );
  };

  const QuickAction = ({ href, icon, title, description, color }) => (
    <Link to={href} className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg mb-3 group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-800">{title}</span>
      <span className="text-xs text-slate-500 mt-1 text-center">{description}</span>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-brand-100 rounded-full animate-spin border-t-brand-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Vue d'ensemble de votre activité médicale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Documents totaux"
          value={animatedStats.totalDocuments}
          icon={Icons.document}
          color="from-brand-500 to-brand-600"
          trend="12"
        />
        <StatCard
          title="Documents traités"
          value={animatedStats.processedDocuments}
          icon={Icons.check}
          color="from-emerald-500 to-emerald-600"
          trend="8"
        />
        <StatCard
          title="Questions traitées"
          value={animatedStats.totalQueries}
          icon={Icons.chat}
          color="from-accent-500 to-accent-600"
          trend="23"
        />
        <StatCard
          title="Temps réponse moyen"
          value={`${animatedStats.avgResponseTime}s`}
          icon={Icons.bolt}
          color="from-amber-500 to-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">Activité récente</h2>
              <p className="text-sm text-slate-500">Dernières actions sur le système</p>
            </div>
            <Link to="/audit" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
            {recentActivity.length === 0 && (
              <div className="p-8 text-center text-slate-500">Aucune activité récente</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold font-display text-slate-900 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction
                href="/documents"
                icon={Icons.upload}
                title="Uploader"
                description="Nouveau document"
                color="from-brand-500 to-brand-600"
              />
              <QuickAction
                href="/qa"
                icon={Icons.question}
                title="Question"
                description="Poser une question"
                color="from-accent-500 to-accent-600"
              />
              <QuickAction
                href="/synthesis"
                icon={Icons.clipboard}
                title="Synthèse"
                description="Générer un résumé"
                color="from-emerald-500 to-emerald-600"
              />
              <QuickAction
                href="/audit"
                icon={Icons.audit}
                title="Audit"
                description="Voir les logs"
                color="from-amber-500 to-amber-600"
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/10 rounded-full blur-3xl" />
            <h3 className="font-bold font-display mb-4 relative z-10">Santé du système</h3>
            <div className="space-y-4 relative z-10">
              {[
                { name: "CPU", value: 23 },
                { name: "Mémoire", value: 45 },
                { name: "Stockage", value: 67 },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-400">{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-1000"
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
