import React, { useState } from "react";

const Icons = {
  help: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  book: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  synthesis: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  rocket: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  folder: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  cpu: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  chartBar: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

// FAQ Data
const faqData = [
  {
    category: "Général",
    questions: [
      {
        q: "Qu'est-ce que DocQA Medical Suite ?",
        a: "DocQA Medical Suite est une plateforme intelligente d'analyse de documents médicaux. Elle utilise l'intelligence artificielle pour permettre aux professionnels de santé d'interroger leurs documents cliniques, de générer des synthèses comparatives et de gérer efficacement les dossiers patients."
      },
      {
        q: "Quels types de documents puis-je uploader ?",
        a: "Vous pouvez uploader des documents aux formats PDF, DOC, DOCX, et TXT. Les documents sont automatiquement traités, anonymisés si nécessaire, et indexés pour permettre une recherche intelligente."
      },
      {
        q: "Les données sont-elles sécurisées ?",
        a: "Oui, toutes les données sont traitées localement sur vos serveurs. L'anonymisation automatique (dé-identification) supprime les informations personnelles sensibles des documents. Un journal d'audit complet trace toutes les opérations."
      }
    ]
  },
  {
    category: "Documents",
    questions: [
      {
        q: "Comment uploader un document ?",
        a: "Rendez-vous dans la section 'Documents', puis glissez-déposez vos fichiers dans la zone prévue ou cliquez pour sélectionner des fichiers. Vous pouvez associer chaque document à un patient via son identifiant."
      },
      {
        q: "Combien de temps prend le traitement d'un document ?",
        a: "Le traitement dépend de la taille du document. En général, un document de quelques pages est traité en moins d'une minute. L'indicateur de progression vous informe de l'état du traitement."
      },
      {
        q: "Puis-je supprimer un document ?",
        a: "Oui, vous pouvez supprimer un document depuis la liste des documents. Cette action est irréversible et sera enregistrée dans le journal d'audit."
      }
    ]
  },
  {
    category: "Assistant IA",
    questions: [
      {
        q: "Comment poser une question à l'Assistant IA ?",
        a: "Accédez à la section 'Assistant IA', sélectionnez optionnellement un patient pour cibler les documents, puis tapez votre question dans le champ de saisie. L'IA analysera les documents pertinents et vous fournira une réponse."
      },
      {
        q: "Quelles questions puis-je poser ?",
        a: "Vous pouvez poser des questions sur le contenu des documents : résultats d'analyses, historique médical, traitements, diagnostics, etc. L'IA recherche dans les documents indexés pour trouver les informations pertinentes."
      },
      {
        q: "L'IA peut-elle se tromper ?",
        a: "L'IA fournit des réponses basées sur les documents disponibles. Elle indique les sources de ses réponses pour que vous puissiez vérifier. Il est recommandé de toujours valider les informations critiques."
      }
    ]
  },
  {
    category: "Synthèse",
    questions: [
      {
        q: "Comment générer une synthèse ?",
        a: "Dans la section 'Synthèse', sélectionnez les documents que vous souhaitez comparer (minimum 1 document), puis cliquez sur 'Générer la synthèse'. L'IA analysera les documents et produira un résumé avec les points clés."
      },
      {
        q: "Puis-je comparer des documents de plusieurs patients ?",
        a: "Oui, vous pouvez sélectionner des documents de différents patients pour une analyse comparative. La synthèse indiquera clairement les informations par patient."
      },
      {
        q: "Comment exporter une synthèse ?",
        a: "Une fois la synthèse générée, cliquez sur le bouton 'Exporter' pour télécharger un PDF professionnel contenant le résumé et les points clés."
      }
    ]
  }
];

// Guide sections
const guideData = [
  {
    title: "Démarrage rapide",
    icon: "rocket",
    content: [
      { step: 1, title: "Uploader des documents", desc: "Commencez par uploader vos documents médicaux dans la section Documents. Associez-les à un identifiant patient pour une meilleure organisation." },
      { step: 2, title: "Attendre le traitement", desc: "Le système traite automatiquement vos documents : extraction du texte, anonymisation et indexation. Un indicateur vous montre la progression." },
      { step: 3, title: "Poser des questions", desc: "Une fois les documents traités, utilisez l'Assistant IA pour poser des questions sur leur contenu." },
      { step: 4, title: "Générer des synthèses", desc: "Sélectionnez plusieurs documents pour générer des synthèses comparatives automatiques." }
    ]
  },
  {
    title: "Gestion des documents",
    icon: "folder",
    content: [
      { step: 1, title: "Upload multiple", desc: "Vous pouvez uploader plusieurs documents simultanément en les glissant-déposant dans la zone d'upload." },
      { step: 2, title: "Filtrage", desc: "Utilisez la barre de recherche pour filtrer les documents par nom, patient ou date." },
      { step: 3, title: "Statut de traitement", desc: "L'indicateur de statut montre si le document est en attente, en cours de traitement, ou prêt." },
      { step: 4, title: "Suppression", desc: "Cliquez sur l'icône de suppression pour retirer un document. Cette action est tracée dans l'audit." }
    ]
  },
  {
    title: "Utilisation de l'IA",
    icon: "cpu",
    content: [
      { step: 1, title: "Questions précises", desc: "Posez des questions spécifiques pour obtenir des réponses plus pertinentes. Ex: 'Quelle est la glycémie du patient ?' plutôt que 'Parlez-moi du patient'." },
      { step: 2, title: "Filtrage par patient", desc: "Sélectionnez un patient pour limiter la recherche à ses documents uniquement." },
      { step: 3, title: "Sources citées", desc: "L'IA cite les documents sources. Cliquez dessus pour consulter le document original." },
      { step: 4, title: "Reformulation", desc: "Si la réponse n'est pas satisfaisante, reformulez votre question différemment." }
    ]
  },
  {
    title: "Audit et traçabilité",
    icon: "chartBar",
    content: [
      { step: 1, title: "Journal complet", desc: "Toutes les actions sont enregistrées : uploads, consultations, questions, synthèses, suppressions." },
      { step: 2, title: "Filtrage", desc: "Filtrez les logs par type d'action ou par date pour retrouver une opération spécifique." },
      { step: 3, title: "Export", desc: "Exportez le journal d'audit en CSV pour archivage ou analyse externe." },
      { step: 4, title: "Détails", desc: "Cliquez sur une opération pour voir ses détails complets." }
    ]
  }
];

export default function Help() {
  const [activeTab, setActiveTab] = useState("faq");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Général");

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredFaq = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
          Centre d'aide
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          FAQ et guide utilisateur pour DocQA Medical Suite
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700 w-fit">
        <button
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "faq"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          {Icons.help}
          <span>FAQ</span>
        </button>
        <button
          onClick={() => setActiveTab("guide")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "guide"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          {Icons.book}
          <span>Guide utilisateur</span>
        </button>
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder="Rechercher dans la FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {faqData.map((category) => (
              <button
                key={category.category}
                onClick={() => setActiveCategory(category.category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === category.category
                    ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {(searchTerm ? filteredFaq : faqData.filter(c => c.category === activeCategory)).map((category, catIdx) => (
              <div key={category.category}>
                {searchTerm && (
                  <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">{category.category}</h3>
                  </div>
                )}
                {category.questions.map((item, idx) => {
                  const globalIdx = `${catIdx}-${idx}`;
                  return (
                    <div key={idx} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <button
                        onClick={() => toggleFaq(globalIdx)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span className="font-medium text-slate-900 dark:text-white pr-4">
                          {item.q}
                        </span>
                        <span className={`flex-shrink-0 text-slate-400 transition-transform ${expandedFaq === globalIdx ? "rotate-180" : ""}`}>
                          {Icons.chevronDown}
                        </span>
                      </button>
                      {expandedFaq === globalIdx && (
                        <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide Tab */}
      {activeTab === "guide" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {guideData.map((section, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">{Icons[section.icon]}</span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {section.content.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Accès rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <a href="/documents" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            {Icons.upload}
            <span className="text-sm font-medium">Uploader</span>
          </a>
          <a href="/qa" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            {Icons.chat}
            <span className="text-sm font-medium">Assistant IA</span>
          </a>
          <a href="/synthesis" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            {Icons.synthesis}
            <span className="text-sm font-medium">Synthèse</span>
          </a>
          <a href="/audit" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            {Icons.document}
            <span className="text-sm font-medium">Audit</span>
          </a>
        </div>
      </div>
    </div>
  );
}
