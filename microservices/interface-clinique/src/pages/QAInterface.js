import React, { useState, useEffect, useRef } from "react";
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
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
  paperclip: (
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
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>
  ),
  microphone: (
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
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  ),
  microphoneOff: (
    <svg
      className="w-5 h-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
      <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  speaker: (
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
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  ),
  speakerOff: (
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
        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zm12-3l4-4m0 4l-4-4"
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
  plus: (
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
        d="M12 4v16m8-8H4"
      />
    </svg>
  ),
  history: (
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  chat: (
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
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  trash: (
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  chevronLeft: (
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
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
  menu: (
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
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
};

// Composant Dropdown personnalisé
const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  iconBgColor,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div className={`p-1.5 rounded-lg ${iconBgColor}`}>{icon}</div>
        <span className="text-sm font-semibold text-slate-800 dark:text-white max-w-[150px] truncate">
          {displayText}
        </span>
        <div
          className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          {Icons.chevronDown}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-slide-up">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center gap-2 ${
                value === option.value
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900"
              }`}
            >
              {value === option.value && (
                <span className="text-indigo-600 dark:text-indigo-400">{Icons.check}</span>
              )}
              <span className={value === option.value ? "" : "ml-6"}>
                {option.label}
              </span>
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">
              Aucune option
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function QAInterface() {
  // États conversation
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // États chat
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // États documents/patients
  const [documents, setDocuments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [patientDocuments, setPatientDocuments] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // États pour la reconnaissance et synthèse vocale
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Fonction pour démarrer/arrêter l'écoute
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Fonction pour lire le texte à voix haute
  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    // Arrêter toute synthèse en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Essayer de trouver une voix française
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Fonction pour arrêter la synthèse vocale
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadDocuments();
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      const docs = documents.filter((d) => d.patient_id === selectedPatient);
      setPatientDocuments(docs);
      if (docs.length > 0) {
        setSelectedDocument(docs[0].id);
      } else {
        setSelectedDocument("");
      }
      loadConversations();
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

      const uniquePatients = [...new Set(docs.map((d) => d.patient_id))].filter(
        Boolean
      );
      setPatients(uniquePatients);

      if (uniquePatients.length > 0) {
        setSelectedPatient(uniquePatients[0]);
      }
    } catch (error) {
      console.error("Erreur chargement documents:", error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await api.getConversations(selectedPatient || null);
      setConversations(response.conversations || []);
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
    }
  };

  const startNewConversation = async () => {
    try {
      const title = `Conversation - ${new Date().toLocaleDateString(
        "fr-FR"
      )} ${new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      const conversation = await api.createConversation(
        title,
        selectedPatient || null
      );
      setCurrentConversation(conversation);
      setMessages([
        {
          id: "welcome",
          type: "bot",
          content:
            "Bonjour ! Je suis votre assistant IA médical. Posez-moi vos questions sur les dossiers médicaux du patient.",
          timestamp: new Date(),
        },
      ]);
      setShowHistory(false);
      loadConversations();
    } catch (error) {
      console.error("Erreur création conversation:", error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const conversation = await api.getConversation(conversationId);
      setCurrentConversation(conversation);

      // Convertir les messages
      const loadedMessages = conversation.messages.map((msg) => ({
        id: msg.id,
        type: msg.role === "user" ? "user" : "bot",
        content: msg.content,
        sources: msg.sources,
        timestamp: new Date(msg.timestamp),
      }));

      // Ajouter message de bienvenue si vide
      if (loadedMessages.length === 0) {
        loadedMessages.push({
          id: "welcome",
          type: "bot",
          content:
            "Bonjour ! Je suis votre assistant IA médical. Posez-moi vos questions sur les dossiers médicaux du patient.",
          timestamp: new Date(),
        });
      }

      setMessages(loadedMessages);
      setShowHistory(false);

      // Mettre à jour le patient sélectionné si la conversation en a un
      if (
        conversation.patientId &&
        conversation.patientId !== selectedPatient
      ) {
        setSelectedPatient(conversation.patientId);
      }
    } catch (error) {
      console.error("Erreur chargement conversation:", error);
    }
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (window.confirm("Supprimer cette conversation ?")) {
      try {
        await api.deleteConversation(conversationId);
        loadConversations();
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
      } catch (error) {
        console.error("Erreur suppression:", error);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedPatient) return;

    // Créer une nouvelle conversation si nécessaire
    let convId = currentConversation?.id;
    if (!convId) {
      const title = input.length > 50 ? input.substring(0, 50) + "..." : input;
      const newConv = await api.createConversation(title, selectedPatient);
      setCurrentConversation(newConv);
      convId = newConv.id;
      loadConversations();
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const questionText = input;
    setInput("");
    setLoading(true);

    // Sauvegarder le message utilisateur
    await api.addMessageToConversation(convId, "user", questionText);

    try {
      const response = await api.askQuestion(
        questionText,
        selectedPatient,
        selectedDocument || null
      );

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Lire la réponse à voix haute si la voix est activée
      if (voiceEnabled && response.answer) {
        speakText(response.answer);
      }

      // Sauvegarder la réponse
      await api.addMessageToConversation(
        convId,
        "assistant",
        response.answer,
        response.sources
      );

      // Mettre à jour le titre si c'est le premier message
      if (currentConversation?.messages?.length === 0 || !currentConversation) {
        const newTitle =
          questionText.length > 40
            ? questionText.substring(0, 40) + "..."
            : questionText;
        await api.updateConversation(convId, newTitle);
        loadConversations();
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          error.message ||
          "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickQuestions = [
    "Quel est le diagnostic principal ?",
    "Quels médicaments sont prescrits ?",
    "Y a-t-il des allergies connues ?",
    "Quel est l'historique médical ?",
  ];

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return new Date(date).toLocaleDateString("fr-FR");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex animate-fade-in">
      {/* Sidebar Historique - Mobile Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="lg:hidden fixed bottom-24 left-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
      >
        {Icons.history}
      </button>

      {/* Sidebar Historique */}
      <div
        className={`
        ${showHistory ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        fixed lg:relative inset-y-0 left-0 z-40 lg:z-0
        w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col
        transition-transform duration-300 lg:transition-none
        shadow-xl lg:shadow-none rounded-r-2xl lg:rounded-none
      `}
      >
        {/* Header Historique */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {Icons.history}
              Historique
            </h2>
            <button
              onClick={() => setShowHistory(false)}
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200"
            >
              {Icons.chevronLeft}
            </button>
          </div>

          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold"
          >
            {Icons.plus}
            Nouvelle conversation
          </button>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {Icons.chat}
              </div>
              <p className="text-sm">Aucune conversation</p>
              <p className="text-xs mt-1">Commencez une nouvelle discussion</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`
                  group p-3 rounded-xl cursor-pointer transition-all
                  ${
                    currentConversation?.id === conv.id
                      ? "bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-700"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 border-2 border-transparent"
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                      {conv.title}
                    </h3>
                    {conv.lastMessage && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(conv.updatedAt)}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 rounded-full">
                        {conv.messageCount} msg
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:bg-red-900/30 rounded-lg transition-all"
                  >
                    {Icons.trash}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Overlay mobile */}
      {showHistory && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 lg:p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 rounded-xl"
            >
              {Icons.menu}
            </button>
            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                Assistant IA
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
                {currentConversation
                  ? currentConversation.title
                  : "Nouvelle conversation"}
              </p>
            </div>
          </div>

          {/* Patient & Document Selectors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Patient Selector */}
            <CustomDropdown
              value={selectedPatient}
              onChange={(val) => setSelectedPatient(val)}
              options={patients.map((p) => ({ value: p, label: p }))}
              placeholder="Sélectionner un patient"
              icon={Icons.user}
              iconBgColor="bg-indigo-100 text-indigo-600 dark:text-indigo-400"
              disabled={patients.length === 0}
            />

            {/* Document Selector */}
            <CustomDropdown
              value={selectedDocument}
              onChange={(val) => setSelectedDocument(val)}
              options={[
                { value: "", label: "Tous les documents" },
                ...patientDocuments.map((doc) => ({
                  value: doc.id,
                  label:
                    doc.filename.length > 25
                      ? doc.filename.substring(0, 25) + "..."
                      : doc.filename,
                })),
              ]}
              placeholder="Sélectionner un document"
              icon={Icons.document}
              iconBgColor="bg-emerald-100 text-emerald-600"
              disabled={patientDocuments.length === 0}
            />
          </div>
        </div>

        {/* Documents chips */}
        {selectedPatient && patientDocuments.length > 0 && (
          <div className="mx-4 lg:mx-6 mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 mb-3">
              {Icons.folder}
              <span className="text-sm font-semibold">
                {patientDocuments.length} document
                {patientDocuments.length > 1 ? "s" : ""} disponible
                {patientDocuments.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {patientDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc.id)}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-all duration-200 ${
                    selectedDocument === doc.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md"
                  }`}
                >
                  {selectedDocument === doc.id && Icons.check}
                  {doc.filename.length > 25
                    ? doc.filename.substring(0, 25) + "..."
                    : doc.filename}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${
                  msg.type === "user" ? "flex-row-reverse" : ""
                } animate-slide-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                    msg.type === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                      : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {msg.type === "user" ? Icons.user : Icons.sparkles}
                </div>

                {/* Message Content */}
                <div
                  className={`flex flex-col max-w-[75%] ${
                    msg.type === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-5 py-4 rounded-2xl shadow-sm ${
                      msg.type === "user"
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-md"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-md"
                    } ${
                      msg.isError
                        ? "!bg-red-50 dark:bg-red-900/30 !text-red-600 !border-red-200"
                        : ""
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap text-[15px]">
                      {msg.content}
                    </p>
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium self-center mr-1">
                        Sources:
                      </span>
                      {msg.sources.map((source, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {Icons.document}
                          {typeof source === "string"
                            ? source
                            : source.filename ||
                              source.document_id ||
                              "Document"}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 px-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg">
                  {Icons.sparkles}
                </div>
                <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl rounded-tl-md border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && !loading && (
            <div className="px-4 lg:px-6 pb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-3">
                Questions suggérées :
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-indigo-100 hover:text-indigo-700 dark:text-indigo-300 transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 dark:border-indigo-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <form
              onSubmit={handleSend}
              className="flex gap-3 max-w-4xl mx-auto"
            >
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedPatient
                      ? "Posez votre question..."
                      : "Sélectionnez d'abord un patient"
                  }
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white dark:bg-slate-800 transition-all placeholder-slate-400 dark:placeholder-slate-500 pr-12"
                  disabled={loading || !selectedPatient}
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={loading || !selectedPatient}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                    isListening 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  } ${loading || !selectedPatient ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={isListening ? "Arrêter l'écoute" : "Parler"}
                >
                  {isListening ? Icons.microphoneOff : Icons.microphone}
                </button>
              </div>

              {/* Toggle Voice Response */}
              <button
                type="button"
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (isSpeaking) stopSpeaking();
                }}
                className={`p-4 rounded-2xl border transition-all ${
                  voiceEnabled
                    ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500"
                }`}
                title={voiceEnabled ? "Désactiver la réponse vocale" : "Activer la réponse vocale"}
              >
                {voiceEnabled ? Icons.speaker : Icons.speakerOff}
              </button>

              <button
                type="submit"
                disabled={loading || !input.trim() || !selectedPatient}
                className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">Envoyer</span>
                    {Icons.send}
                  </>
                )}
              </button>
            </form>

            {/* Voice Status Indicator */}
            {(isListening || isSpeaking) && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Écoute en cours...
                  </div>
                )}
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Lecture vocale - Cliquer pour arrêter
                  </button>
                )}
              </div>
            )}

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
              L'IA peut faire des erreurs. Vérifiez les informations
              importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
