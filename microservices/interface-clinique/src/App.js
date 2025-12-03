import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/qa" element={<QAInterface />} />
          <Route path="/synthesis" element={<Synthesis />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
