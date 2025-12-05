import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { jsPDF } from "jspdf";
import api from "../services/api";

const Icons = {
  upload: (
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
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
  filter: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
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
        strokeWidth={1.5}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
  cloud: (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
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
  clock: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  grid: (
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
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  list: (
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
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  ),
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dragActive, setDragActive] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerContent, setViewerContent] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await api.getDocuments();
      const docs = response.documents || [];
      const formattedDocs = docs.map((doc) => ({
        id: doc.id,
        name: doc.filename,
        type: doc.content_type || "application/pdf",
        size: formatSize(doc.size || 0),
        date: new Date(doc.upload_date).toLocaleDateString(),
        status: doc.processed ? "processed" : "processing",
        patient: doc.patient_id || "Inconnu",
        patientId: doc.patient_id,
      }));
      setDocuments(formattedDocs);
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement documents:", error);
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (file) => {
    if (!patientName.trim()) {
      alert("Veuillez entrer le nom du patient avant d'uploader");
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", "compte-rendu");
      formData.append("patient_id", patientName.trim());

      await api.uploadDocument(formData);
      setUploadProgress(100);
      await loadDocuments();
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type.includes(filterType);
    return matchesSearch && matchesType;
  });

  // Fonction pour visualiser un document
  const handleView = async (doc) => {
    setViewerDoc(doc);
    setViewerOpen(true);
    setViewerLoading(true);
    setViewerContent("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/documents/${doc.id}/content`
      );
      if (!response.ok) throw new Error("Erreur récupération contenu");
      const data = await response.json();
      setViewerContent(data.content || "Contenu non disponible");
    } catch (error) {
      console.error("Erreur récupération contenu:", error);
      setViewerContent("Erreur lors du chargement du contenu du document.");
    } finally {
      setViewerLoading(false);
    }
  };

  // Fermer le viewer
  const closeViewer = () => {
    setViewerOpen(false);
    setViewerDoc(null);
    setViewerLoading(false);
    setViewerContent("");
  };

  // Fonction pour télécharger un document en PDF
  const handleDownload = async (doc) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/documents/${doc.id}/content`
      );
      if (!response.ok) throw new Error("Erreur téléchargement");
      const data = await response.json();
      const content = data.content || "";

      // Créer un PDF avec le contenu
      const pdf = new jsPDF();

      // Configuration
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // En-tête du document
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("DocQA Medical Suite - Document Extrait", margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(8);
      pdf.text(
        `Généré le: ${new Date().toLocaleString("fr-FR")}`,
        margin,
        yPosition
      );
      yPosition += 15;

      // Titre du document
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont(undefined, "bold");
      pdf.text(doc.name, margin, yPosition);
      yPosition += 8;

      // Informations patient
      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Patient: ${doc.patient || "Non spécifié"} | Date: ${
          doc.date || "Non spécifiée"
        }`,
        margin,
        yPosition
      );
      yPosition += 15;

      // Ligne de séparation
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Contenu du document
      pdf.setFontSize(11);
      pdf.setTextColor(50, 50, 50);
      pdf.setFont(undefined, "normal");

      // Diviser le contenu en lignes
      const lines = pdf.splitTextToSize(content, maxWidth);

      for (let i = 0; i < lines.length; i++) {
        if (yPosition > pageHeight - margin - 10) {
          pdf.addPage();
          yPosition = margin;

          // En-tête sur les nouvelles pages
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text(
            `${doc.name} - Page ${pdf.getNumberOfPages()}`,
            margin,
            yPosition
          );
          yPosition += 15;
          pdf.setFontSize(11);
          pdf.setTextColor(50, 50, 50);
        }
        pdf.text(lines[i], margin, yPosition);
        yPosition += 6;
      }

      // Pied de page sur la dernière page
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Document généré par DocQA Medical Suite`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Télécharger le PDF
      const filename = doc.name.replace(/\.[^/.]+$/, "") + "_extrait.pdf";
      pdf.save(filename);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      alert("Erreur lors du téléchargement du document");
    }
  };

  // Fonction pour supprimer un document
  const handleDelete = async (doc) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${doc.name}" ?`)) {
      return;
    }
    try {
      await api.deleteDocument(doc.id);
      await loadDocuments();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression du document");
    }
  };

  const getFileExtension = (type) => {
    if (type.includes("pdf")) return "PDF";
    if (type.includes("image")) return "IMG";
    if (type.includes("word")) return "DOC";
    return "FILE";
  };

  const getFileColor = (type) => {
    if (type.includes("pdf")) return "from-red-500 to-rose-600";
    if (type.includes("image")) return "from-emerald-500 to-teal-600";
    if (type.includes("word")) return "from-blue-500 to-indigo-600";
    return "from-slate-500 to-slate-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
          <div className="w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent absolute inset-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-display text-slate-900">
              Documents
            </h1>
            <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full">
              {documents.length} fichiers
            </span>
          </div>
          <p className="text-slate-500">
            Gérez vos documents médicaux en toute sécurité
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          {Icons.upload}
          <span>Uploader un document</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
        />
      </div>

      {/* Patient Name Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            {Icons.user}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Patient associé
            </label>
            <input
              type="text"
              placeholder="Entrez le nom du patient (ex: Jean Dupont)"
              className="block w-full lg:w-1/2 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Ce nom sera associé aux documents uploadés
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`relative rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
          dragActive
            ? "bg-indigo-50 border-2 border-indigo-500"
            : "bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center gap-4">
          <div
            className={`p-5 rounded-2xl transition-all duration-300 ${
              dragActive
                ? "bg-indigo-100 text-indigo-600 scale-110"
                : uploading
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-400 shadow-lg"
            }`}
          >
            {uploading ? (
              <div className="w-12 h-12 relative">
                <svg className="w-12 h-12 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            ) : (
              Icons.cloud
            )}
          </div>

          <div>
            <p className="text-xl font-bold text-slate-900 mb-1">
              {uploading
                ? `Upload en cours... ${uploadProgress}%`
                : dragActive
                ? "Déposez votre fichier"
                : "Glissez-déposez vos fichiers"}
            </p>
            <p className="text-sm text-slate-500">
              {uploading ? "Veuillez patienter" : "ou cliquez pour parcourir"}
            </p>
          </div>

          {uploading && (
            <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div className="flex items-center gap-3 mt-2">
            {["PDF", "DOCX", "JPG", "PNG"].map((format) => (
              <span
                key={format}
                className="px-3 py-1 text-xs font-medium text-slate-600 bg-white rounded-lg shadow-sm"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              {Icons.search}
            </div>
            <input
              type="text"
              placeholder="Rechercher un document..."
              className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-3">
            <select
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="pdf">PDF uniquement</option>
              <option value="image">Images</option>
              <option value="word">Documents Word</option>
            </select>

            {/* View Toggle */}
            <div className="hidden lg:flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {Icons.list}
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {Icons.grid}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc, index) => (
            <div
              key={doc.id}
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`px-3 py-1.5 text-xs font-bold text-white rounded-lg bg-gradient-to-r ${getFileColor(
                    doc.type
                  )}`}
                >
                  {getFileExtension(doc.type)}
                </div>
                <span
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                    doc.status === "processed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {doc.status === "processed" ? Icons.check : Icons.clock}
                  {doc.status === "processed" ? "Traité" : "En cours"}
                </span>
              </div>

              <h3 className="font-semibold text-slate-900 truncate mb-2 group-hover:text-indigo-600 transition-colors">
                {doc.name}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {doc.patient.charAt(0)}
                </div>
                <span className="text-sm text-slate-600 truncate">
                  {doc.patient}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{doc.date}</span>
                <span>{doc.size}</span>
              </div>

              {/* Actions on hover */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(doc);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  title="Visualiser"
                >
                  {Icons.eye}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(doc);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                  title="Télécharger"
                >
                  {Icons.download}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Supprimer"
                >
                  {Icons.trash}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 transition-colors group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br ${getFileColor(
                            doc.type
                          )} flex items-center justify-center text-white font-bold text-xs shadow-lg`}
                        >
                          {getFileExtension(doc.type)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {doc.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {doc.type.split("/")[1]?.toUpperCase() || "FILE"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
                          {doc.patient.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {doc.patient}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{doc.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                          doc.status === "processed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {doc.status === "processed" ? Icons.check : Icons.clock}
                        {doc.status === "processed" ? "Traité" : "En cours"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(doc)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Visualiser"
                        >
                          {Icons.eye}
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Télécharger"
                        >
                          {Icons.download}
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Supprimer"
                        >
                          {Icons.trash}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                {Icons.document}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Aucun document trouvé
              </h3>
              <p className="text-slate-500 mb-6">
                Essayez de modifier vos filtres ou uploadez un nouveau document.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all"
              >
                {Icons.upload}
                <span>Uploader maintenant</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats Footer */}
      {filteredDocuments.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-500 px-2">
          <span>
            Affichage de{" "}
            <span className="font-semibold text-slate-700">
              {filteredDocuments.length}
            </span>{" "}
            document{filteredDocuments.length > 1 ? "s" : ""}
          </span>
          <span>
            {documents.filter((d) => d.status === "processed").length} traités
            sur {documents.length}
          </span>
        </div>
      )}

      {/* Document Viewer Modal - Using Portal to render outside Layout */}
      {viewerOpen &&
        viewerDoc &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeViewer()}
          >
            <div
              className="relative w-full max-w-5xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white shrink-0">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getFileColor(
                      viewerDoc.type
                    )} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                  >
                    {getFileExtension(viewerDoc.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {viewerDoc.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Patient: {viewerDoc.patient} • {viewerDoc.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(viewerDoc)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    {Icons.download}
                    <span className="hidden sm:inline">Télécharger</span>
                  </button>
                  <button
                    onClick={closeViewer}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 relative bg-slate-50 overflow-auto min-h-0">
                {viewerLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
                        <div className="w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent absolute inset-0" />
                      </div>
                      <p className="text-sm text-slate-500">
                        Chargement du document...
                      </p>
                    </div>
                  </div>
                )}

                {!viewerLoading && (
                  <div className="h-full overflow-auto p-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                      {/* Document Header */}
                      <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100">
                        <div
                          className={`h-14 w-14 rounded-xl bg-gradient-to-br ${getFileColor(
                            viewerDoc.type
                          )} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                        >
                          {getFileExtension(viewerDoc.type)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {viewerDoc.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Patient: {viewerDoc.patient} • {viewerDoc.date}
                          </p>
                        </div>
                      </div>

                      {/* Document Text Content */}
                      <div className="prose prose-slate max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-slate-700 text-sm leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100">
                          {viewerContent}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
