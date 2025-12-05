import React, { useState, useEffect } from "react";
import api from "../services/api";

const Icons = {
  compare: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  download: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  chart: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

  // Grouper les documents par patient
  const documentsByPatient = documents.reduce((acc, doc) => {
    const patientId = doc.patient_id || "Non assigné";
    if (!acc[patientId]) {
      acc[patientId] = [];
    }
    acc[patientId].push(doc);
    return acc;
  }, {});

  const patients = Object.keys(documentsByPatient);

  // Initialiser les patients comme développés
  useEffect(() => {
    const initial = {};
    patients.forEach(p => { initial[p] = true; });
    setExpandedPatients(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents.length]);

  const togglePatient = (patientId) => {
    setExpandedPatients(prev => ({
      ...prev,
      [patientId]: !prev[patientId]
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
    const patientDocs = documentsByPatient[patientId].map(d => d.id);
    const allSelected = patientDocs.every(id => selectedDocs.includes(id));
    
    if (allSelected) {
      setSelectedDocs(prev => prev.filter(id => !patientDocs.includes(id)));
    } else {
      setSelectedDocs(prev => [...new Set([...prev, ...patientDocs])]);
    }
  };

  // Obtenir les patients des documents sélectionnés
  const getSelectedPatients = () => {
    const patientSet = new Set();
    selectedDocs.forEach(docId => {
      const doc = documents.find(d => d.id === docId);
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
      const response = await api.generateSynthesis(selectedDocs, {
        comparisonMode: selectedPatients.length > 1 ? "cross-patient" : "single-patient",
        patients: selectedPatients
      });
      setSynthesis(response);
    } catch (error) {
      console.error("Erreur génération synthèse:", error);
      alert("Erreur lors de la génération de la synthèse. Veuillez réessayer.");
      setSynthesis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!synthesis) return;

    const content = `# Synthèse Comparative\n\nGénéré le: ${new Date().toLocaleDateString("fr-FR")}\nDocuments analysés: ${selectedDocs.length}\n\n## Résumé\n${synthesis.summary || ""}\n\n## Points Clés\n${(synthesis.keyPoints || []).map(p => `- ${p}`).join("\n")}`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "synthese-comparative.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;
    const patientMatch = patient.toLowerCase().includes(searchTerm.toLowerCase());
    const docsMatch = documentsByPatient[patient].some(doc => 
      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return patientMatch || docsMatch;
  });

  const selectedPatients = getSelectedPatients();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Synthèse Comparative</h1>
          <p className="text-slate-500 mt-1">Comparez et analysez les documents par patient</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedPatients.length > 1 && (
            <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
              Comparaison inter-patients
            </span>
          )}
          <button
            onClick={handleGenerateSynthesis}
            disabled={selectedDocs.length < 1 || loading}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Icons.compare}
            Générer la synthèse ({selectedDocs.length} docs)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents par Patient */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Documents par Patient</h2>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder="Rechercher un patient ou document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-slate-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingDocs ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Aucun patient ou document trouvé
              </div>
            ) : (
              filteredPatients.map((patientId) => {
                const patientDocs = documentsByPatient[patientId];
                const isExpanded = expandedPatients[patientId];
                const allSelected = patientDocs.every(d => selectedDocs.includes(d.id));
                const someSelected = patientDocs.some(d => selectedDocs.includes(d.id));
                
                return (
                  <div key={patientId} className="border border-slate-200 rounded-xl overflow-hidden">
                    {/* Patient Header */}
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        someSelected ? "bg-brand-50" : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div 
                        className="flex items-center gap-3 flex-1"
                        onClick={() => togglePatient(patientId)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          someSelected ? "bg-brand-600 text-white" : "bg-white text-slate-500 border border-slate-200"
                        }`}>
                          {Icons.user}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{patientId}</h3>
                          <p className="text-sm text-slate-500">{patientDocs.length} document(s)</p>
                        </div>
                        <span className="ml-2 text-slate-400">
                          {isExpanded ? Icons.chevronDown : Icons.chevronRight}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); selectAllFromPatient(patientId); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          allSelected 
                            ? "bg-brand-600 text-white" 
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-brand-50"
                        }`}
                      >
                        {allSelected ? "Désélectionner" : "Tout sélectionner"}
                      </button>
                    </div>
                    
                    {/* Documents List */}
                    {isExpanded && (
                      <div className="p-3 pt-0 space-y-2">
                        {patientDocs.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => toggleDocument(doc.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedDocs.includes(doc.id)
                                ? "border-brand-500 bg-brand-50"
                                : "border-slate-100 hover:border-brand-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  selectedDocs.includes(doc.id)
                                    ? "bg-brand-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {selectedDocs.includes(doc.id) ? Icons.check : Icons.document}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium truncate text-sm ${
                                  selectedDocs.includes(doc.id) ? "text-brand-900" : "text-slate-700"
                                }`}>
                                  {doc.filename}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {new Date(doc.created_at).toLocaleDateString("fr-FR")}
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

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-slate-600 font-medium">
                  {selectedDocs.length} document(s) sélectionné(s)
                </span>
                {selectedPatients.length > 0 && (
                  <span className="text-sm text-slate-500 ml-2">
                    ({selectedPatients.length} patient{selectedPatients.length > 1 ? "s" : ""})
                  </span>
                )}
              </div>
              {selectedDocs.length > 0 && (
                <button
                  onClick={() => setSelectedDocs([])}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
                >
                  {Icons.x}
                  Tout désélectionner
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Synthesis Result */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-slate-800">Résultat de la Synthèse</h2>
            {synthesis && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-brand-700 bg-brand-50 border border-brand-100 rounded-xl hover:bg-brand-100 transition-colors text-sm font-medium"
              >
                {Icons.download}
                Exporter
              </button>
            )}
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-brand-100 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-slate-900 font-medium">Génération de la synthèse en cours...</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Analyse de {selectedDocs.length} document(s) pour {selectedPatients.length} patient(s)
                  </p>
                </div>
              </div>
            ) : synthesis ? (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-lg text-sm font-medium">
                      {synthesis.type || "Synthèse"}
                    </span>
                    <span className="text-sm text-slate-500">
                      {new Date(synthesis.generatedAt || Date.now()).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">1</span>
                    Résumé
                  </h3>
                  <div className="pl-8">
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                      {synthesis.summary}
                    </p>
                  </div>
                </div>

                {/* Key Points */}
                {synthesis.keyPoints && synthesis.keyPoints.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">2</span>
                      Points Clés
                    </h3>
                    <div className="pl-8">
                      <ul className="space-y-2">
                        {synthesis.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Processing info */}
                {synthesis.processingTimeMs && (
                  <div className="text-xs text-slate-400 pt-4 border-t border-slate-100">
                    Généré en {synthesis.processingTimeMs}ms
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                  {Icons.chart}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Aucune synthèse générée</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Sélectionnez des documents d'un ou plusieurs patients
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Vous pouvez comparer les documents d'un même patient ou entre différents patients
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
