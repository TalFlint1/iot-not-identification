import React from "react";
import SettingsScreen from "./components/SettingsScreen";
import InputScreen from "./components/InputScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import ResultScreen from "./components/ResultScreen";
import HistoryScreen from "./components/HistoryScreen";
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
