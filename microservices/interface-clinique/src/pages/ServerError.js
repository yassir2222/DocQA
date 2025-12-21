import React from "react";
import { Link } from "react-router-dom";

const Icons = {
  refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  warning: (
    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

export default function ServerError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        {/* Illustration 500 */}
        <div className="relative mb-8">
          <div className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 leading-none select-none">
            500
          </div>
          <div className="absolute inset-0 text-[180px] font-black text-red-500/10 blur-2xl leading-none">
            500
          </div>
        </div>

        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 text-red-500 dark:text-red-400">
            {Icons.warning}
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Erreur serveur
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Une erreur inattendue s'est produite sur nos serveurs.
          Notre équipe technique a été notifiée. Veuillez réessayer dans quelques instants.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {Icons.refresh}
            <span>Réessayer</span>
          </button>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all"
          >
            {Icons.home}
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        {/* Informations techniques */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <details className="text-left">
            <summary className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Informations techniques
            </summary>
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400">
              <p>Code: 500 Internal Server Error</p>
              <p>Timestamp: {new Date().toISOString()}</p>
              <p>URL: {window.location.href}</p>
            </div>
          </details>
        </div>

        {/* Support */}
        <div className="mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Si le problème persiste, contactez le support technique.
          </p>
        </div>
      </div>
    </div>
  );
}
