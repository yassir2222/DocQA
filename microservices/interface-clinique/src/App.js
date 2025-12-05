import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import QAInterface from "./pages/QAInterface";
import Synthesis from "./pages/Synthesis";
import AuditPage from "./pages/AuditPage";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <NotificationProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/qa" element={<QAInterface />} />
            <Route path="/synthesis" element={<Synthesis />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </NotificationProvider>
    </Router>
  );
}

export default App;
