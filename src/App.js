import React from "react";
import SettingsScreen from "./frontend/components/SettingsScreen";
import InputScreen from "./frontend/components/InputScreen";
import LoginScreen from "./frontend/components/LoginScreen";
import RegisterScreen from "./frontend/components/RegisterScreen";
import ResultScreen from "./frontend/components/ResultScreen";
import HistoryScreen from "./frontend/components/HistoryScreen";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InputScreen />} /> {/* Default Screen */}
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
