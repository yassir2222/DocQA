import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";

const Icons = {
  send: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  bot: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  user: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  document: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  folder: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
};

export default function QAInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Bonjour ! Je suis votre assistant médical. Sélectionnez un patient et un document, puis posez-moi vos questions.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [patientDocuments, setPatientDocuments] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadDocuments();
  }, []);

  // Quand le patient change, filtrer ses documents
  useEffect(() => {
    if (selectedPatient) {
      const docs = documents.filter((d) => d.patient_id === selectedPatient);
      setPatientDocuments(docs);
      // Sélectionner le premier document par défaut
      if (docs.length > 0) {
        setSelectedDocument(docs[0].id);
      } else {
        setSelectedDocument("");
      }
    } else {
      setPatientDocuments([]);
      setSelectedDocument("");
    }
  }, [selectedPatient, documents]);

  const loadDocuments = async () => {
    try {
      const response = await api.getDocuments();
      const docs = response.documents || [];
      setDocuments(docs);
      
      // Extraire les patients uniques
      const uniquePatients = [...new Set(docs.map((d) => d.patient_id))].filter(Boolean);
      setPatients(uniquePatients);
      
      // Sélectionner le premier patient par défaut
      if (uniquePatients.length > 0) {
        setSelectedPatient(uniquePatients[0]);
      }
    } catch (error) {
      console.error("Erreur chargement documents:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedPatient) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Utiliser le document sélectionné s'il y en a un, sinon le patient
      const response = await api.askQuestion(input, selectedPatient, selectedDocument || null);
      
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: error.message || "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Assistant IA</h1>
          <p className="text-slate-500 mt-1">Posez des questions sur les dossiers médicaux</p>
        </div>
        
        {/* Sélection Patient et Document */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Sélection du patient */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <span className="text-sm font-medium text-slate-600 pl-2 flex items-center gap-1">
              {Icons.user}
              Patient :
            </span>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="form-select bg-slate-50 border-none rounded-lg text-sm font-medium text-brand-700 focus:ring-2 focus:ring-brand-500 py-1.5 pl-3 pr-8"
            >
              {patients.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
              {patients.length === 0 && <option value="">Aucun patient</option>}
            </select>
          </div>

          {/* Sélection du document */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <span className="text-sm font-medium text-slate-600 pl-2 flex items-center gap-1">
              {Icons.document}
              Document :
            </span>
            <select
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value)}
              className="form-select bg-slate-50 border-none rounded-lg text-sm font-medium text-brand-700 focus:ring-2 focus:ring-brand-500 py-1.5 pl-3 pr-8 max-w-[200px]"
              disabled={patientDocuments.length === 0}
            >
              <option value="">Tous les documents</option>
              {patientDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename.length > 25 ? doc.filename.substring(0, 25) + "..." : doc.filename}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info sur les documents du patient */}
      {selectedPatient && (
        <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-xl">
          <div className="flex items-center gap-2 text-brand-700">
            {Icons.folder}
            <span className="text-sm font-medium">
              {patientDocuments.length} document(s) pour {selectedPatient}
            </span>
          </div>
          {patientDocuments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {patientDocuments.map((doc) => (
                <span
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc.id)}
                  className={`text-xs px-2 py-1 rounded-lg cursor-pointer transition-all ${
                    selectedDocument === doc.id
                      ? "bg-brand-600 text-white"
                      : "bg-white text-brand-600 border border-brand-200 hover:bg-brand-100"
                  }`}
                >
                  {doc.filename}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                  msg.type === "user"
                    ? "bg-brand-600 text-white"
                    : "bg-white text-brand-600 border border-slate-100"
                }`}
              >
                {msg.type === "user" ? Icons.user : Icons.bot}
              </div>
              
              <div className={`flex flex-col max-w-[80%] ${msg.type === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-6 py-4 rounded-2xl shadow-sm ${
                    msg.type === "user"
                      ? "bg-brand-600 text-white rounded-tr-none"
                      : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  } ${msg.isError ? "bg-red-50 text-red-600 border-red-100" : ""}`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500 flex flex-col gap-1">
                    <span className="font-medium">Sources :</span>
                    {msg.sources.map((source, idx) => (
                      <span key={idx} className="bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                        {typeof source === 'string' ? source : source.filename || source.document_id || 'Document'}
                      </span>
                    ))}
                  </div>
                )}
                
                <span className="text-xs text-slate-400 mt-2 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white text-brand-600 border border-slate-100 flex items-center justify-center shadow-sm">
                {Icons.bot}
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex gap-4 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question ici..."
              className="flex-1 px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-slate-400"
              disabled={loading || !selectedPatient}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !selectedPatient}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 font-medium"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Envoyer</span>
                  {Icons.send}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
