import React from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UpperBar from "./UpperBar";

const ResultScreen = () => {
  const username = "Tal"; // Username can be dynamic or static

  const deviceResult = "Verkada Security Camera";
  const confidencePercentage = 82; // Example confidence percentage
  const justificationText = "Verkada cameras can automatically sync their local storage to the cloud";

  // Circle filling style
  const circleStyle = {
    background: `conic-gradient(#68CABE ${confidencePercentage * 3.6}deg, #e0e0e0 0deg)`,
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
  };

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
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42" }}>
        <Title />
        
        {/* Results Mini Title */}
        <h2 style={{ color: "white", fontSize: "24px", fontWeight: "bold", textTransform: "uppercase" }}>
          RESULTS
        </h2>

        {/* Mini Titles (Device, Confidence, Justification) */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <h3 style={{ color: "white" }}>Device</h3>
          <h3 style={{ color: "white" }}>Confidence</h3>
          <h3 style={{ color: "white" }}>Justification</h3>
        </div>

        {/* Result Content */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          {/* Device */}
          <div style={{ textAlign: "center", width: "30%" }}>
            <div
              style={{
                backgroundColor: "#68CABE",
                borderRadius: "50%",
                width: "120px",
                height: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontWeight: "bold" }}>{deviceResult}</span>
            </div>
          </div>

          {/* Confidence */}
          <div style={{ textAlign: "center", width: "30%" }}>
            <div style={circleStyle}>
              {confidencePercentage}%
            </div>
          </div>

          {/* Justification */}
          <div style={{ width: "30%" }}>
            <div
              style={{
                backgroundColor: "#E0E0E0",
                padding: "20px",
                borderRadius: "10px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "black",
              }}
            >
              <p>{justificationText}</p>
            </div>
          </div>
        </div>

        {/* Analyze Another Device */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <h3 style={{ color: "white" }}>Analyze Another Device</h3>
          <button
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
            Identify
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
