import React from "react";
import SettingsScreen from "./components/SettingsScreen";
import InputScreen from "./components/InputScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import ResultScreen from "./components/ResultScreen";
import HistoryScreen from "./components/HistoryScreen";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardScreen from "./components/DashboardScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterScreen  />} /> {/* Default Screen */}
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/identify" element={<InputScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
