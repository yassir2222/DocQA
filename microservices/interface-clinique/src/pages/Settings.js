import React, { useState, useEffect } from "react";
import api from "../services/api";

const Icons = {
  globe: (
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
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  ),
  link: (
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
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  ),
  cpu: (
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
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
      />
    </svg>
  ),
  bell: (
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
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
  info: (
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
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  check: (
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
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  save: (
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
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  ),
  shield: (
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
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
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
  sun: (
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
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  moon: (
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
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
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
  cog: (
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
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
};

const statusColors = {
  healthy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  degraded: "bg-amber-100 text-amber-700 border-amber-200",
  error: "bg-red-100 text-red-700 border-red-200",
};

const themeIcons = {
  light: Icons.sun,
  dark: Icons.moon,
  auto: Icons.sparkles,
};

export default function Settings() {
  const [settings, setSettings] = useState({
    language: "fr",
    theme: "light",
    autoSave: true,
    notifications: {
      email: true,
      push: false,
      desktop: true,
    },
    llm: {
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
    },
    security: {
      sessionTimeout: 30,
      twoFactor: false,
    },
  });
  const [services, setServices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = async () => {
    try {
      const response = await api.getServicesHealth();
      if (Array.isArray(response)) {
        setServices(
          response.map((s) => ({
            name: s.name,
            url: s.url,
            port: new URL(s.url).port,
            status: s.status,
          }))
        );
      }
    } catch (error) {
      console.error("Erreur vérification services:", error);
      setServices([]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, key, value) => {
    if (section) {
      setSettings((prev) => ({
        ...prev,
        [section]: { ...prev[section], [key]: value },
      }));
    } else {
      setSettings((prev) => ({ ...prev, [key]: value }));
    }
  };

  const SettingSection = ({ icon, title, description, gradient, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className={`p-5 border-b border-slate-100 flex items-center gap-4 bg-gradient-to-r ${
          gradient || "from-slate-50 to-white"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
            gradient || "from-indigo-500 to-purple-600"
          } flex items-center justify-center text-white shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-2 group">
      <div>
        <span className="text-sm font-semibold text-slate-700 block">
          {label}
        </span>
        {description && (
          <span className="text-xs text-slate-400">{description}</span>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${
          checked
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
            : "bg-slate-200 hover:bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
            checked ? "left-8" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  const tabs = [
    { id: "general", label: "Général", icon: Icons.globe },
    { id: "notifications", label: "Notifications", icon: Icons.bell },
    { id: "security", label: "Sécurité", icon: Icons.shield },
    { id: "about", label: "À propos", icon: Icons.info },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-display text-slate-900">
              Paramètres
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full flex items-center gap-1">
              {Icons.cog}
              Configuration
            </span>
          </div>
          <p className="text-slate-500">
            Personnalisez votre expérience et gérez les services
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all hover:-translate-y-0.5 ${
            saved
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:shadow-xl"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            Icons.check
          ) : (
            Icons.save
          )}
          {saved ? "Sauvegardé !" : "Enregistrer"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="lg:col-span-2">
            <SettingSection
              icon={Icons.globe}
              title="Langue & Région"
              description="Préférences linguistiques"
              gradient="from-indigo-500 to-purple-600"
            >
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Langue de l'interface
                  </label>
                  <div className="flex justify-center">
                    <div className="p-6 rounded-xl border-2 border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-500/10 text-center min-w-[150px]">
                      <span className="text-4xl block mb-2">🇫🇷</span>
                      <span className="text-lg font-semibold">Français</span>
                      <span className="block text-xs text-indigo-500 mt-1">
                        Langue par défaut
                      </span>
                    </div>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.autoSave}
                  onChange={(val) => handleChange(null, "autoSave", val)}
                  label="Sauvegarde automatique"
                  description="Enregistrer les modifications automatiquement"
                />
              </div>
            </SettingSection>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="lg:col-span-2">
            <SettingSection
              icon={Icons.bell}
              title="Préférences de Notification"
              description="Gérez comment vous recevez les alertes"
              gradient="from-amber-500 to-orange-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                      📧
                    </div>
                    <span className="font-bold text-slate-800">Email</span>
                  </div>
                  <ToggleSwitch
                    checked={settings.notifications.email}
                    onChange={(val) =>
                      handleChange("notifications", "email", val)
                    }
                    label="Activer"
                    description="Alertes par email"
                  />
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                      📱
                    </div>
                    <span className="font-bold text-slate-800">Push</span>
                  </div>
                  <ToggleSwitch
                    checked={settings.notifications.push}
                    onChange={(val) =>
                      handleChange("notifications", "push", val)
                    }
                    label="Activer"
                    description="Notifications push"
                  />
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                      🖥️
                    </div>
                    <span className="font-bold text-slate-800">Bureau</span>
                  </div>
                  <ToggleSwitch
                    checked={settings.notifications.desktop}
                    onChange={(val) =>
                      handleChange("notifications", "desktop", val)
                    }
                    label="Activer"
                    description="Alertes bureau"
                  />
                </div>
              </div>
            </SettingSection>
          </div>
        )}
        {/* Security */}
        {activeTab === "security" && (
          <div className="lg:col-span-2">
            <SettingSection
              icon={Icons.shield}
              title="Sécurité du Compte"
              description="Protection et authentification"
              gradient="from-emerald-500 to-teal-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    ⏱️ Expiration de session
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        handleChange(
                          "security",
                          "sessionTimeout",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1 px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white font-bold text-slate-700 text-center text-lg"
                    />
                    <span className="text-sm text-slate-500 font-medium">
                      minutes
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Délai d'inactivité avant déconnexion automatique
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="font-bold text-slate-800 block">
                        🔐 Double authentification
                      </span>
                      <span className="text-xs text-slate-500">
                        Sécurité renforcée avec 2FA
                      </span>
                    </div>
                    {settings.security.twoFactor && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        Activé
                      </span>
                    )}
                  </div>
                  <ToggleSwitch
                    checked={settings.security.twoFactor}
                    onChange={(val) =>
                      handleChange("security", "twoFactor", val)
                    }
                    label="Activer 2FA"
                    description="Code de vérification supplémentaire"
                  />
                </div>
              </div>
            </SettingSection>
          </div>
        )}
        {/* About */}
        {activeTab === "about" && (
          <div className="lg:col-span-2">
            <SettingSection
              icon={Icons.info}
              title="À Propos de DocQA"
              description="Votre assistant médical intelligent"
              gradient="from-slate-600 to-slate-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description principale */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    🏥 DocQA Medical System
                  </h3>
                  <p className="text-sm opacity-90 mb-4 leading-relaxed">
                    DocQA est une plateforme médicale intelligente conçue pour
                    simplifier la gestion documentaire et améliorer la prise de
                    décision clinique grâce à l'intelligence artificielle.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        ✓
                      </span>
                      <span>
                        Solution sécurisée et conforme aux normes médicales
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        ✓
                      </span>
                      <span>Traitement intelligent des documents médicaux</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        ✓
                      </span>
                      <span>
                        Assistance IA pour les professionnels de santé
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fonctionnalités */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Fonctionnalités Principales
                  </h4>
                  {[
                    {
                      label: "Gestion Documentaire",
                      desc: "Upload, stockage et organisation des documents médicaux",
                      icon: "📄",
                    },
                    {
                      label: "Questions & Réponses IA",
                      desc: "Posez des questions sur vos documents et obtenez des réponses précises",
                      icon: "💬",
                    },
                    {
                      label: "Synthèse Comparative",
                      desc: "Comparez et analysez plusieurs documents automatiquement",
                      icon: "📊",
                    },
                    {
                      label: "Anonymisation",
                      desc: "Protection des données sensibles des patients",
                      icon: "🔒",
                    },
                    {
                      label: "Journal d'Audit",
                      desc: "Traçabilité complète de toutes les opérations",
                      icon: "📋",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <span className="text-sm font-semibold text-slate-800 block">
                          {item.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version info */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">
                      📦 Version 1.0.0
                    </span>
                    <span className="text-sm text-slate-500">
                      © 2024 DocQA Medical System - Tous droits réservés
                    </span>
                  </div>
                </div>
              </div>
            </SettingSection>
          </div>
        )}
      </div>
    </div>
  );
}
