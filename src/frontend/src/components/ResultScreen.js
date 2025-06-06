import React from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UpperBar from "./UpperBar";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./ResultScreen.css";

const ResultScreen = () => {
  const username = "Tal";
  const navigate = useNavigate();
  const location = useLocation();
  let resultData = null;

  // Prefer navigation state first
  if (location.state && location.state.resultData) {
    resultData = location.state.resultData;
    localStorage.setItem("lastResult", JSON.stringify(resultData));  // Also update the saved result
  } else {
    const saved = localStorage.getItem("lastResult");
    if (saved) {
      resultData = JSON.parse(saved);
    }
  }

  const deviceResult = resultData?.device
  ?.split(" ")
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ") || "Unknown Device";
  const confidencePercentage = resultData ? Math.round(resultData.confidence) : 0;
  const justificationText = resultData?.justification || "No justification available.";

  // Determine color based on confidence percentage
  const getColor = (percentage) => {
    if (percentage >= 80) return "#17B95B"; // Green
    if (percentage >= 50) return "#FFA500"; // Orange
    return "#FF0000"; // Red
  };

  const handleAnalyzeAnother = () => {
    navigate("/identify");
  };

  const ringColor = getColor(confidencePercentage);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          backgroundImage: `url(${sidebarImage})`,
          backgroundColor: "#343C42",
          backgroundSize: "contain",
          backgroundPosition: "left",
          backgroundRepeat: "no-repeat",
          height: "100%",
          width: "14%",
          margin: 0,
          padding: 0,
        }}
      />
      <UpperBar username={username} />
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42", textAlign: "center", }}>
        <Title />
        
        <p style={{ color: "white", fontSize: "36px", textTransform: "uppercase", fontStyle: "italic", marginBottom: "40px", marginRight: "60px" }}>
          RESULTS</p>
        
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "50px", marginTop: "20px" }}>
          {/* Device */}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "white", fontSize: "20px", marginBottom: "10px", fontSize: "28px", marginRight: "50px" }}>Device</p>
            <div
              style={{
                backgroundColor: "#6A8EDD",
                borderRadius: "50%",
                width: "200px",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "-80px",
                marginRight: "50px"
              }}
            >
              <span style={{ color: "white", fontSize: "28px", textAlign: "center", fontStyle: "italic"}}>{deviceResult}</span>
            </div>
          </div>
          
          {/* Confidence - Circular Progress */}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "white", fontSize: "20px", marginBottom: "10px", fontSize: "28px", marginLeft: "80px" }}>Confidence</p>
            <div style={{ position: "relative", width: "120px", height: "120px", marginLeft: "50px" }}>
              <svg width="200" height="200" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#e0e0e0" strokeWidth="10" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={ringColor}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (confidencePercentage / 100) * 251.2}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text x="52" y="57" textAnchor="middle" fontSize="20" fill="white">
                  {confidencePercentage}%
                </text>
              </svg>
            </div>
          </div>
          {/* Justification */}
          <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "20px", marginBottom: "10px", fontSize: "28px", marginLeft: "100px" }}>Justification</p>
          <div
            className="justification-box"
            style={{
              backgroundColor: "#E0E0E0",
              padding: "20px",
              borderRadius: "30px",
              height: "200px",
              width: "400px",
              textAlign: "center",
              marginLeft: "120px",
              marginBottom: "-80px",
              overflowY: "auto",
              overflowX: "hidden",
              // display: "flex",
              // alignItems: "flex-start",
              // justifyContent: "flex-start",
            }}
          >
            <p style={{ color: "black", fontSize: "18px", fontStyle: "italic" }}>{justificationText}</p>
          </div>
          </div>
        </div>
        
        {/* Analyze Another Device */}
        <div style={{ textAlign: "center", marginTop: "130px" }}>
          <p style={{ color: "white", fontSize: "24px" }}>Analyze Another Device</p>
          <button
            onClick={handleAnalyzeAnother}
            style={{
              width: "200px",
              height: "40px",
              borderRadius: "5px",
              border: "1px solid #000000",
              fontSize: "18px",
              backgroundColor: "#68CABE",
              color: "white",
              marginTop: "20px",
            }}
          >
            New Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
