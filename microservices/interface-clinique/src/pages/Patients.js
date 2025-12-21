import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Icons = {
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  chart: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      // Récupérer les documents et extraire les patients uniques
      const response = await api.getDocuments();
      const docs = Array.isArray(response.documents) ? response.documents : [];
      
      // Grouper par patient_id
      const patientMap = {};
      docs.forEach((doc) => {
        const patientId = doc.patient_id || "Non assigné";
        if (!patientMap[patientId]) {
          patientMap[patientId] = {
            id: patientId,
            name: patientId,
            documents: [],
            lastActivity: null,
          };
        }
        patientMap[patientId].documents.push(doc);
        const docDate = new Date(doc.created_at);
        if (!patientMap[patientId].lastActivity || docDate > patientMap[patientId].lastActivity) {
          patientMap[patientId].lastActivity = docDate;
        }
      });

      const patientList = Object.values(patientMap).sort((a, b) => 
        (b.lastActivity || 0) - (a.lastActivity || 0)
      );
      setPatients(patientList);
    } catch (error) {
      console.error("Erreur chargement patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDocuments = patients.reduce((acc, p) => acc + p.documents.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
            Patients
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gérez les dossiers patients et leurs documents
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              {Icons.user}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{patients.length}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Patients</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              {Icons.document}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDocuments}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              {Icons.folder}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {patients.length > 0 ? Math.round(totalDocuments / patients.length) : 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Moy. docs/patient</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {Icons.search}
          </span>
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Liste des patients
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-800 rounded-full" />
                  <div className="w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent absolute inset-0" />
                </div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-300 mb-4">
                  {Icons.user}
                </div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Aucun patient</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Uploadez des documents pour créer des dossiers patients
                </p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700 ${
                    selectedPatient?.id === patient.id ? "bg-indigo-50 dark:bg-indigo-900/30" : ""
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                    selectedPatient?.id === patient.id 
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                      : "bg-gradient-to-br from-slate-400 to-slate-500"
                  }`}>
                    {patient.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {patient.documents.length} document{patient.documents.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      {patient.lastActivity?.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patient Details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Détails du patient
            </h2>
          </div>
          {selectedPatient ? (
            <div className="p-4 space-y-4">
              {/* Patient Info */}
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl mx-auto">
                  {selectedPatient.name.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                  {selectedPatient.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedPatient.documents.length} document{selectedPatient.documents.length > 1 ? "s" : ""}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/qa?patient=${selectedPatient.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  {Icons.chart}
                  <span>Poser une question</span>
                </Link>
              </div>

              {/* Documents List */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Documents récents
                </h4>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {selectedPatient.documents.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600"
                    >
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        {Icons.document}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                          {doc.filename}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Link
                        to="/documents"
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {Icons.eye}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-300 mb-4">
                {Icons.user}
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                Sélectionnez un patient
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Cliquez sur un patient pour voir ses détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
