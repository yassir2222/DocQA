import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";

const Icons = {
  send: (
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
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  ),
  document: (
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  bot: (
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
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  user: (
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
};

export default function QAInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content:
        "Bonjour, je suis votre assistant medical. Posez-moi des questions sur les dossiers patients et je vous repondrai en me basant sur les documents disponibles.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [patients] = useState([
    { id: "P001", name: "Patient Anonyme 001" },
    { id: "P002", name: "Patient Anonyme 002" },
    { id: "P003", name: "Patient Anonyme 003" },
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

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
      const response = await api.askQuestion(input, selectedPatient);

      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content:
          response.answer ||
          "Je n'ai pas pu trouver de reponse a votre question dans les documents disponibles.",
        sources: response.sources || [],
        confidence: response.confidence || 0,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erreur QA:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: "Une erreur est survenue. Veuillez reessayer.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const suggestedQuestions = [
    "Quels sont les derniers resultats d'analyse?",
    "Quel est le traitement actuel du patient?",
    "Y a-t-il des allergies connues?",
    "Quel est l'historique des consultations?",
  ];

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === "user";
    const isError = message.type === "error";

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
        <div
          className={`flex gap-3 max-w-3xl ${isUser ? "flex-row-reverse" : ""}`}
        >
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              isUser
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                : isError
                ? "bg-gradient-to-br from-red-500 to-rose-600 text-white"
                : "bg-gradient-to-br from-slate-700 to-slate-800 text-white"
            }`}
          >
            {isUser ? Icons.user : Icons.bot}
          </div>

          {/* Message content */}
          <div
            className={`rounded-2xl p-4 shadow-lg ${
              isUser
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                : isError
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-white border border-slate-200"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Sources:
                </p>
                <ul className="space-y-1">
                  {message.sources.map((source, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2"
                    >
                      {Icons.document}
                      <span>
                        {source.document} - Page {source.page}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confidence */}
            {message.confidence > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-slate-500">Confiance:</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-[100px]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      message.confidence > 0.7
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : message.confidence > 0.4
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                    }`}
                    style={{ width: `${message.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {Math.round(message.confidence * 100)}%
                </span>
              </div>
            )}

            {/* Timestamp */}
            <p
              className={`text-xs mt-3 ${
                isUser ? "text-cyan-100" : "text-slate-400"
              }`}
            >
              {message.timestamp.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white shadow-lg">
          {Icons.bot}
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
            Questions / Reponses
          </h1>
          <p className="text-slate-500 mt-1">
            Interrogez vos documents medicaux avec l'IA
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-600 font-medium">Patient:</label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white shadow-sm"
          >
            <option value="">Tous les patients</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && !loading && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
              {Icons.sparkles}
              <span className="font-medium">Questions suggerees:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all hover:-translate-y-0.5 shadow-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-100 bg-white"
        >
          <div className="flex gap-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={loading}
              className="flex-1 px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 text-slate-800 placeholder-slate-400 shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                Icons.send
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
