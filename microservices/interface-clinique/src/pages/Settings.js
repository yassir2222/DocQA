import React, { useState, useEffect } from "react";
import api, { getGatewayUrl } from "../services/api";

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
        strokeWidth={2}
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
        strokeWidth={2}
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
        strokeWidth={2}
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
        strokeWidth={2}
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
        strokeWidth={2}
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
        strokeWidth={2}
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
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
};

const statusColors = {
  healthy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  degraded: "bg-amber-100 text-amber-700 border-amber-200",
  error: "bg-red-100 text-red-700 border-red-200",
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

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = async () => {
    const serviceList = [
      { name: "Doc Ingestor", url: "http://localhost:8001", port: 8001 },
      { name: "DeID Service", url: "http://localhost:8002", port: 8002 },
      { name: "Indexeur Semantique", url: "http://localhost:8003", port: 8003 },
      { name: "LLM QA Module", url: "http://localhost:8004", port: 8004 },
      { name: "Synthese Service", url: "http://localhost:8005", port: 8005 },
      { name: "Audit Logger", url: "http://localhost:8006", port: 8006 },
    ];

    const results = await Promise.all(
      serviceList.map(async (service) => {
        try {
          const response = await fetch(`${service.url}/health`, {
            method: "GET",
            mode: "cors",
          });
          return { ...service, status: response.ok ? "healthy" : "degraded" };
        } catch {
          return { ...service, status: "error" };
        }
      })
    );
    setServices(results);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveSettings(settings);
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

  const SettingSection = ({ icon, title, description, children }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  );

  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-cyan-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
            Parametres
          </h1>
          <p className="text-slate-500 mt-1">
            Configuration du systeme et des services
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/25 hover:shadow-xl hover:-translate-y-0.5"
          } disabled:opacity-50`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            Icons.check
          ) : (
            Icons.save
          )}
          {saved ? "Sauvegarde!" : "Enregistrer"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <SettingSection
          icon={Icons.globe}
          title="Parametres Generaux"
          description="Langue et preferences d'affichage"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Langue
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleChange(null, "language", e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="fr">Francais</option>
                <option value="en">English</option>
                <option value="ar">Arabe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Theme
              </label>
              <div className="flex gap-3">
                {["light", "dark", "auto"].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleChange(null, "theme", theme)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                      settings.theme === theme
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {theme === "light"
                      ? "Clair"
                      : theme === "dark"
                      ? "Sombre"
                      : "Auto"}
                  </button>
                ))}
              </div>
            </div>
            <ToggleSwitch
              checked={settings.autoSave}
              onChange={(val) => handleChange(null, "autoSave", val)}
              label="Sauvegarde automatique"
            />
          </div>
        </SettingSection>

        {/* Services Status */}
        <SettingSection
          icon={Icons.link}
          title="Etat des Services"
          description="Connectivite des microservices"
        >
          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              services.map((service, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        service.status === "healthy"
                          ? "bg-emerald-500"
                          : service.status === "degraded"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      } ${service.status === "healthy" ? "animate-pulse" : ""}`}
                    />
                    <div>
                      <span className="font-medium text-slate-700">
                        {service.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        :{service.port}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                      statusColors[service.status]
                    }`}
                  >
                    {service.status === "healthy"
                      ? "En ligne"
                      : service.status === "degraded"
                      ? "Degrade"
                      : "Hors ligne"}
                  </span>
                </div>
              ))
            )}
            <button
              onClick={checkServices}
              className="w-full py-3 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Actualiser les statuts
            </button>
          </div>
        </SettingSection>

        {/* LLM Settings */}
        <SettingSection
          icon={Icons.cpu}
          title="Configuration LLM"
          description="Parametres du modele d'IA"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Modele
              </label>
              <select
                value={settings.llm.model}
                onChange={(e) => handleChange("llm", "model", e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
                <option value="mistral">Mistral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Temperature: {settings.llm.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.llm.temperature}
                onChange={(e) =>
                  handleChange("llm", "temperature", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Precis</span>
                <span>Creatif</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tokens Max: {settings.llm.maxTokens}
              </label>
              <input
                type="range"
                min="500"
                max="4000"
                step="100"
                value={settings.llm.maxTokens}
                onChange={(e) =>
                  handleChange("llm", "maxTokens", parseInt(e.target.value))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection
          icon={Icons.bell}
          title="Notifications"
          description="Preferences de notification"
        >
          <div className="space-y-4">
            <ToggleSwitch
              checked={settings.notifications.email}
              onChange={(val) => handleChange("notifications", "email", val)}
              label="Notifications par email"
            />
            <ToggleSwitch
              checked={settings.notifications.push}
              onChange={(val) => handleChange("notifications", "push", val)}
              label="Notifications push"
            />
            <ToggleSwitch
              checked={settings.notifications.desktop}
              onChange={(val) => handleChange("notifications", "desktop", val)}
              label="Notifications bureau"
            />
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection
          icon={Icons.shield}
          title="Securite"
          description="Parametres de securite du compte"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expiration session (minutes)
              </label>
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
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <ToggleSwitch
              checked={settings.security.twoFactor}
              onChange={(val) => handleChange("security", "twoFactor", val)}
              label="Authentification a deux facteurs"
            />
          </div>
        </SettingSection>

        {/* About */}
        <SettingSection
          icon={Icons.info}
          title="A Propos"
          description="Informations sur le systeme"
        >
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Version</span>
              <span className="text-sm font-medium text-slate-700">1.0.0</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Build</span>
              <span className="text-sm font-medium text-slate-700">
                2024.01.15
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Environnement</span>
              <span className="text-sm font-medium text-slate-700">
                Developpement
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-slate-500">Licence</span>
              <span className="text-sm font-medium text-slate-700">
                Proprietary
              </span>
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}
