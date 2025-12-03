import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const Icons = {
  upload: (
    <svg
      className="w-12 h-12"
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
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
  eye: (
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  trash: (
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  hospital: (
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
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  lab: (
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
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    </svg>
  ),
  image: (
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
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  pill: (
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
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setDocuments([
        {
          id: 1,
          name: "Compte-rendu_consultation_2024-01.pdf",
          type: "consultation",
          status: "processed",
          uploadDate: "2024-01-15",
          patientId: "P001",
          size: "2.4 MB",
        },
        {
          id: 2,
          name: "Resultats_laboratoire_2024-01.pdf",
          type: "laboratory",
          status: "processed",
          uploadDate: "2024-01-14",
          patientId: "P001",
          size: "1.8 MB",
        },
        {
          id: 3,
          name: "IRM_cerebrale_2024-01.pdf",
          type: "imaging",
          status: "processing",
          uploadDate: "2024-01-13",
          patientId: "P002",
          size: "15.2 MB",
        },
        {
          id: 4,
          name: "Ordonnance_2024-01.pdf",
          type: "prescription",
          status: "pending",
          uploadDate: "2024-01-12",
          patientId: "P003",
          size: "0.5 MB",
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement documents:", error);
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("document_type", "compte-rendu");

      await api.uploadDocument(formData);
      setUploadProgress(100);

      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        loadDocuments();
      }, 500);
    } catch (error) {
      console.error("Erreur upload:", error);
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      processed: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Traite",
      },
      processing: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "En cours",
      },
      pending: {
        bg: "bg-slate-100",
        text: "text-slate-700",
        label: "En attente",
      },
      error: { bg: "bg-red-100", text: "text-red-700", label: "Erreur" },
    };
    const { bg, text, label } = config[status] || config.pending;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === "processing" ? "animate-pulse" : ""
          } ${text.replace("text-", "bg-")}`}
        />
        {label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      consultation: Icons.hospital,
      laboratory: Icons.lab,
      imaging: Icons.image,
      prescription: Icons.pill,
    };
    return icons[type] || Icons.document;
  };

  const getTypeColor = (type) => {
    const colors = {
      consultation: "from-blue-500 to-cyan-500",
      laboratory: "from-purple-500 to-indigo-500",
      imaging: "from-amber-500 to-orange-500",
      prescription: "from-emerald-500 to-teal-500",
    };
    return colors[type] || "from-slate-500 to-slate-600";
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter = filter === "all" || doc.status === filter;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-200 rounded-full animate-spin border-t-cyan-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
          Gestion des Documents
        </h1>
        <p className="text-slate-500 mt-1">
          Uploadez et gerez vos documents medicaux
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? "border-cyan-500 bg-cyan-50 scale-[1.02]"
            : selectedFile
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-300 hover:border-slate-400 bg-white"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              {Icons.document}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {uploading && (
              <div className="w-full max-w-xs mx-auto">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {uploadProgress}% complete
                </p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Upload en cours..." : "Uploader le fichier"}
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
                className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
              {Icons.upload}
            </div>
            <p className="text-lg font-medium text-slate-700">
              Glissez-deposez un document ici
            </p>
            <p className="text-slate-500 my-2">ou</p>
            <label className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium cursor-pointer shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Selectionner un fichier
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
              />
            </label>
            <p className="mt-6 text-xs text-slate-400">
              Formats acceptes: PDF, DOC, DOCX, TXT (max 50 MB)
            </p>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "Tous" },
              { value: "processed", label: "Traites" },
              { value: "processing", label: "En cours" },
              { value: "pending", label: "En attente" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === value
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {Icons.search}
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full md:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="group bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`h-2 bg-gradient-to-r ${getTypeColor(doc.type)}`} />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(
                    doc.type
                  )} text-white shadow-lg`}
                >
                  {getTypeIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate group-hover:text-cyan-600 transition-colors">
                    {doc.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {doc.patientId} - {doc.size}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {getStatusBadge(doc.status)}
                  <p className="text-xs text-slate-400 mt-2">
                    {doc.uploadDate}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-cyan-100 hover:text-cyan-600 transition-colors">
                    {Icons.eye}
                  </button>
                  <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors">
                    {Icons.trash}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            {Icons.document}
          </div>
          <p className="text-slate-500">Aucun document trouve</p>
        </div>
      )}
    </div>
  );
}
