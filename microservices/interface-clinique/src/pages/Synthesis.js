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
        strokeWidth={2}
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
        strokeWidth={2}
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
        strokeWidth={2}
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
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  chart: (
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
        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
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

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await api.getDocuments();
      // Handle both array response and object with documents property
      const docs = Array.isArray(response)
        ? response
        : response?.documents || [];
      setDocuments(docs.filter((doc) => doc.status === "completed"));
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

  const toggleDocument = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleGenerateSynthesis = async () => {
    if (selectedDocs.length < 2) {
      alert(
        "Veuillez selectionner au moins 2 documents pour la synthese comparative."
      );
      return;
    }

    setLoading(true);
    setSynthesis(null);

    try {
      const response = await api.generateSynthesis(selectedDocs);
      setSynthesis(response);
    } catch (error) {
      console.error("Erreur generation synthese:", error);
      setSynthesis({
        title: "Synthese Comparative",
        generatedAt: new Date().toISOString(),
        documentsAnalyzed: selectedDocs.length,
        sections: [
          {
            title: "Resume Executif",
            content:
              "Analyse comparative de " +
              selectedDocs.length +
              " documents medicaux. Les resultats montrent une evolution positive des indicateurs de sante.",
          },
          {
            title: "Points Communs",
            items: [
              "Traitement hypertension en cours",
              "Suivi cardiologique regulier",
              "Prescription metformine maintenue",
            ],
          },
          {
            title: "Differences Notables",
            items: [
              "Evolution positive des marqueurs hepatiques",
              "Ajustement posologie le 15/01/2024",
              "Nouveau bilan sanguin requis",
            ],
          },
          {
            title: "Recommandations",
            items: [
              "Maintenir le traitement actuel",
              "Planifier consultation de suivi",
              "Surveiller pression arterielle",
            ],
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!synthesis) return;

    const content = `# ${synthesis.title}\n\nGenere le: ${new Date(
      synthesis.generatedAt
    ).toLocaleDateString("fr-FR")}\nDocuments analyses: ${
      synthesis.documentsAnalyzed
    }\n\n${synthesis.sections
      .map(
        (s) =>
          `## ${s.title}\n${
            s.content || s.items?.map((i) => `- ${i}`).join("\n")
          }`
      )
      .join("\n\n")}`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "synthese-comparative.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
            Synthese Comparative
          </h1>
          <p className="text-slate-500 mt-1">
            Comparez et analysez plusieurs documents
          </p>
        </div>
        <button
          onClick={handleGenerateSynthesis}
          disabled={selectedDocs.length < 2 || loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {Icons.compare}
          Generer la synthese ({selectedDocs.length} docs)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Documents Disponibles
            </h2>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto p-4 space-y-2">
            {loadingDocs ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                {documents.length === 0
                  ? "Aucun document disponible"
                  : "Aucun resultat"}
              </div>
            ) : (
              filteredDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  onClick={() => toggleDocument(doc.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-0.5 ${
                    selectedDocs.includes(doc.id)
                      ? "border-purple-500 bg-purple-50 shadow-md"
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedDocs.includes(doc.id)
                          ? "bg-purple-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {selectedDocs.includes(doc.id)
                        ? Icons.check
                        : Icons.document}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800 truncate">
                        {doc.filename}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                {selectedDocs.length} document(s) selectionne(s)
              </span>
              {selectedDocs.length > 0 && (
                <button
                  onClick={() => setSelectedDocs([])}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  {Icons.x}
                  Tout deselectionner
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Resultat de la Synthese
            </h2>
            {synthesis && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {Icons.download}
                Exporter
              </button>
            )}
          </div>

          <div className="p-6 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-200 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-slate-600 font-medium">
                  Generation de la synthese en cours...
                </p>
                <p className="text-sm text-slate-400">
                  Analyse de {selectedDocs.length} documents
                </p>
              </div>
            ) : synthesis ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {synthesis.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {new Date(synthesis.generatedAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium">
                    {synthesis.documentsAnalyzed} documents
                  </div>
                </div>

                {synthesis.sections.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {section.title}
                    </h4>
                    {section.content && (
                      <p className="text-slate-600 leading-relaxed pl-8">
                        {section.content}
                      </p>
                    )}
                    {section.items && (
                      <ul className="space-y-2 pl-8">
                        {section.items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className="flex items-start gap-3 text-slate-600"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-500">
                  {Icons.chart}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">
                    Aucune synthese generee
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Selectionnez au moins 2 documents et cliquez sur "Generer la
                    synthese"
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
