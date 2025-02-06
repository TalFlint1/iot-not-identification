import React, { useState } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UpperBar from "./UpperBar";

const HistoryScreen = () => {
  const username = "Tal";

  // Mock history data
  const historyData = [
    { id: 1, device: "Verkada Security Camera", confidence: 82, date: "2025-02-05" },
    { id: 2, device: "Ring Doorbell", confidence: 75, date: "2025-02-03" },
    { id: 3, device: "Amazon Echo", confidence: 90, date: "2025-02-01" },
  ];

  const [selectedItem, setSelectedItem] = useState(null);

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
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42", textAlign: "center" }}>
        <Title />

        <p style={{ color: "white", fontSize: "36px", textTransform: "uppercase", fontStyle: "italic" }}>HISTORY</p>

        {/* History List */}
        <div style={{ marginTop: "20px" }}>
          {historyData.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
              style={{
                backgroundColor: "#6A8EDD",
                borderRadius: "10px",
                padding: "15px",
                margin: "10px auto",
                width: "50%",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              {item.device} - {item.date}
            </div>
          ))}
        </div>

        {/* Selected History Details */}
        {selectedItem && (
          <div
            style={{
              backgroundColor: "#E0E0E0",
              padding: "20px",
              borderRadius: "10px",
              width: "50%",
              margin: "20px auto",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{selectedItem.device}</p>
            <p style={{ fontSize: "20px" }}>Confidence: {selectedItem.confidence}%</p>
            <p style={{ fontSize: "18px" }}>Date: {selectedItem.date}</p>

            {/* Buttons for Re-identify and Export */}
            <div style={{ marginTop: "20px" }}>
              <button
                style={{
                  backgroundColor: "#68CABE",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  margin: "5px",
                  cursor: "pointer",
                  fontSize: "18px",
                  borderRadius: "5px",
                }}
              >
                Re-Identify
              </button>
              <button
                style={{
                  backgroundColor: "#FFA500",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  margin: "5px",
                  cursor: "pointer",
                  fontSize: "18px",
                  borderRadius: "5px",
                }}
              >
                Export Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
