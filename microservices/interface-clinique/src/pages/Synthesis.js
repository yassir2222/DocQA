import React, { useState, useEffect } from "react";
import api from "../services/api";

const Icons = {
  compare: (
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
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
  x: (
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
        d="M6 18L18 6M6 6l12 12"
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
  user: (
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  folder: (
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
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
  sparkles: (
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
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
  chart: (
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
        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
      />
    </svg>
  ),
  chevronDown: (
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
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  chevronRight: (
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
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  lightbulb: (
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
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
};

export default function Synthesis() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [synthesis, setSynthesis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPatients, setExpandedPatients] = useState({});

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await api.getDocuments();
      const docs = Array.isArray(response.documents) ? response.documents : [];
      setDocuments(docs.filter((doc) => doc.processed === true));
    } catch (error) {
      console.error("Erreur chargement documents:", error);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const documentsByPatient = documents.reduce((acc, doc) => {
    const patientId = doc.patient_id || "Non assigné";
    if (!acc[patientId]) {
      acc[patientId] = [];
    }
    acc[patientId].push(doc);
    return acc;
  }, {});

  const patients = Object.keys(documentsByPatient);

  useEffect(() => {
    const initial = {};
    patients.forEach((p) => {
      initial[p] = true;
    });
    setExpandedPatients(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents.length]);

  const togglePatient = (patientId) => {
    setExpandedPatients((prev) => ({
      ...prev,
      [patientId]: !prev[patientId],
    }));
  };

  const toggleDocument = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllFromPatient = (patientId) => {
    const patientDocs = documentsByPatient[patientId].map((d) => d.id);
    const allSelected = patientDocs.every((id) => selectedDocs.includes(id));

    if (allSelected) {
      setSelectedDocs((prev) => prev.filter((id) => !patientDocs.includes(id)));
    } else {
      setSelectedDocs((prev) => [...new Set([...prev, ...patientDocs])]);
    }
  };

  const getSelectedPatients = () => {
    const patientSet = new Set();
    selectedDocs.forEach((docId) => {
      const doc = documents.find((d) => d.id === docId);
      if (doc) {
        patientSet.add(doc.patient_id || "Non assigné");
      }
    });
    return Array.from(patientSet);
  };

  const handleGenerateSynthesis = async () => {
    if (selectedDocs.length < 1) {
      alert("Veuillez sélectionner au moins 1 document pour la synthèse.");
      return;
    }

    setLoading(true);
    setSynthesis(null);

    try {
      const selectedPatients = getSelectedPatients();
      console.log("🚀 Generating synthesis for docs:", selectedDocs);
      const response = await api.generateSynthesis(selectedDocs, {
        comparisonMode:
          selectedPatients.length > 1 ? "cross-patient" : "single-patient",
        patients: selectedPatients,
      });
      console.log("✅ Got synthesis response:", response);
      console.log("📊 Has summary?", !!response?.summary);
      console.log("📊 Has keyPoints?", !!response?.keyPoints);
      setSynthesis(response);
    } catch (error) {
      console.error("❌ Erreur génération synthèse:", error);
      alert("Erreur lors de la génération de la synthèse. Veuillez réessayer.");
      setSynthesis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!synthesis) return;

    const content = `# Synthèse Comparative\n\nGénéré le: ${new Date().toLocaleDateString(
      "fr-FR"
    )}\nDocuments analysés: ${selectedDocs.length}\n\n## Résumé\n${
      synthesis.summary || ""
    }\n\n## Points Clés\n${(synthesis.keyPoints || [])
      .map((p) => `- ${p}`)
      .join("\n")}`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "synthese-comparative.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true;
    const patientMatch = patient
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const docsMatch = documentsByPatient[patient].some((doc) =>
      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return patientMatch || docsMatch;
  });

  const selectedPatients = getSelectedPatients();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-display text-slate-900">
              Synthèse
            </h1>
            {selectedPatients.length > 1 && (
              <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                Multi-patients
              </span>
            )}
          </div>
          <p className="text-slate-500">
            Comparez et analysez les documents médicaux
          </p>
        </div>
        <button
          onClick={handleGenerateSynthesis}
          disabled={selectedDocs.length < 1 || loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:translate-y-0"
        >
          {Icons.sparkles}
          <span>Générer la synthèse</span>
          {selectedDocs.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">
              {selectedDocs.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents par Patient */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[650px]">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                {Icons.folder}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Documents par Patient
                </h2>
                <p className="text-sm text-slate-500">
                  {documents.length} documents disponibles
                </p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder="Rechercher un patient ou document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingDocs ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-100 rounded-full" />
                  <div className="w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent absolute inset-0" />
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  Chargement des documents...
                </p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                  {Icons.user}
                </div>
                <h3 className="font-semibold text-slate-700">Aucun résultat</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Modifiez votre recherche
                </p>
              </div>
            ) : (
              filteredPatients.map((patientId) => {
                const patientDocs = documentsByPatient[patientId];
                const isExpanded = expandedPatients[patientId];
                const allSelected = patientDocs.every((d) =>
                  selectedDocs.includes(d.id)
                );
                const someSelected = patientDocs.some((d) =>
                  selectedDocs.includes(d.id)
                );

                return (
                  <div
                    key={patientId}
                    className={`rounded-xl overflow-hidden border transition-all duration-200 ${
                      someSelected
                        ? "border-indigo-200 shadow-md"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Patient Header */}
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                        someSelected
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50"
                          : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 flex-1"
                        onClick={() => togglePatient(patientId)}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow transition-all ${
                            someSelected
                              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                              : "bg-white text-slate-500 border border-slate-200"
                          }`}
                        >
                          {Icons.user}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {patientId}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {patientDocs.length} document
                            {patientDocs.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <span
                          className={`ml-2 transition-transform ${
                            isExpanded ? "rotate-0" : "-rotate-90"
                          }`}
                        >
                          {Icons.chevronDown}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllFromPatient(patientId);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          allSelected
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {allSelected ? "✓ Sélectionné" : "Tout sélectionner"}
                      </button>
                    </div>

                    {/* Documents List */}
                    {isExpanded && (
                      <div className="p-3 space-y-2 bg-white">
                        {patientDocs.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => toggleDocument(doc.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                              selectedDocs.includes(doc.id)
                                ? "border-indigo-400 bg-indigo-50 shadow-sm"
                                : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                  selectedDocs.includes(doc.id)
                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {selectedDocs.includes(doc.id)
                                  ? Icons.check
                                  : Icons.document}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`font-medium truncate text-sm transition-colors ${
                                    selectedDocs.includes(doc.id)
                                      ? "text-indigo-900"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {doc.filename}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {new Date(doc.created_at).toLocaleDateString(
                                    "fr-FR"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  {selectedDocs.length} sélectionné
                  {selectedDocs.length > 1 ? "s" : ""}
                </span>
                {selectedPatients.length > 0 && (
                  <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full">
                    {selectedPatients.length} patient
                    {selectedPatients.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {selectedDocs.length > 0 && (
                <button
                  onClick={() => setSelectedDocs([])}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium hover:underline"
                >
                  {Icons.x}
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Synthesis Result */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[650px]">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                {Icons.clipboard}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Résultat</h2>
                <p className="text-sm text-slate-500">
                  Synthèse générée par IA
                </p>
              </div>
            </div>
            {synthesis && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors text-sm font-medium shadow-sm"
              >
                {Icons.download}
                <span>Exporter</span>
              </button>
            )}
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-100 rounded-full" />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    {Icons.sparkles}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    Génération en cours...
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Analyse de {selectedDocs.length} document
                    {selectedDocs.length > 1 ? "s" : ""}
                    {selectedPatients.length > 1 &&
                      ` pour ${selectedPatients.length} patients`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            ) : synthesis ? (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-lg text-sm font-semibold">
                      {synthesis.type || "Synthèse IA"}
                    </span>
                    <span className="text-sm text-slate-500">
                      {new Date(
                        synthesis.generatedAt || Date.now()
                      ).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs flex items-center justify-center font-bold shadow">
                      1
                    </span>
                    Résumé
                  </h3>
                  <div className="pl-9">
                    <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {synthesis.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Points */}
                {synthesis.keyPoints && synthesis.keyPoints.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs flex items-center justify-center font-bold shadow">
                        2
                      </span>
                      Points Clés
                    </h3>
                    <div className="pl-9">
                      <ul className="space-y-3">
                        {synthesis.keyPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm"
                          >
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {Icons.lightbulb}
                            </span>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Processing info */}
                {synthesis.processingTimeMs && (
                  <div className="text-xs text-slate-400 pt-4 border-t border-slate-100 text-center">
                    ✨ Généré en {synthesis.processingTimeMs}ms
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300">
                  {Icons.chart}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    Aucune synthèse
                  </h3>
                  <p className="text-slate-500 max-w-xs">
                    Sélectionnez des documents à gauche puis cliquez sur
                    "Générer la synthèse"
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-full">
                  {Icons.lightbulb}
                  <span>Vous pouvez comparer plusieurs patients</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
