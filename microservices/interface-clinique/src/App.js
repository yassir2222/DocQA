import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Patients from "./pages/Patients";
import QAInterface from "./pages/QAInterface";
import Synthesis from "./pages/Synthesis";
import Analytics from "./pages/Analytics";
import AuditPage from "./pages/AuditPage";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/documents" element={<Layout><Documents /></Layout>} />
            <Route path="/patients" element={<Layout><Patients /></Layout>} />
            <Route path="/qa" element={<Layout><QAInterface /></Layout>} />
            <Route path="/synthesis" element={<Layout><Synthesis /></Layout>} />
            <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
            <Route path="/audit" element={<Layout><AuditPage /></Layout>} />
            <Route path="/help" element={<Layout><Help /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="/error" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
