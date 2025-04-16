import React, { useState, useEffect } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UpperBar from "./UpperBar";

const HistoryScreen = () => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState("all"); // Filtering by confidence level
  const [showUnsuccessful, setShowUnsuccessful] = useState(false); // Toggle for unsuccessful identifications

  useEffect(() => {
    const fetchHistory = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token found.");
        return;
      }
      
      try {
        const response = await fetch("http://localhost:5000/history/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Fetched history data:", data);
        setHistoryData(data.history); // assuming you're using useState for historyData
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
  
    fetchHistory();
  }, []);
  

  // Filter data based on selection
  const filteredData = historyData.filter((item) => {
    if (showUnsuccessful) return item.confidence === 0;
    if (filter === "high") return item.confidence >= 80;
    if (filter === "medium") return item.confidence >= 50 && item.confidence < 80;
    if (filter === "low") return item.confidence > 0 && item.confidence < 50;
    return true; // "all" filter
  });

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
        }}
      />
      <UpperBar/>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42", textAlign: "center" }}>
        <Title />
        <p style={{ color: "white", fontSize: "36px", textTransform: "uppercase", fontStyle: "italic" }}>HISTORY</p>

        {/* Filters */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "white", marginRight: "10px" }}>Filter by confidence:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "5px", fontSize: "16px" }}>
            <option value="all">All</option>
            <option value="high">High Confidence (80%+)</option>
            <option value="medium">Medium Confidence (50-79%)</option>
            <option value="low">Low Confidence (1-49%)</option>
          </select>
          <br />
          <label style={{ color: "white", marginRight: "10px", }}>Show only unsuccessful identifications:</label>
          <input type="checkbox" checked={showUnsuccessful} onChange={() => setShowUnsuccessful(!showUnsuccessful)} />
        </div>

        {/* History List */}
        <div style={{ marginTop: "20px" }}>
          {filteredData.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
              style={{
                backgroundColor: "#EDEDED",
                color: "black",
                padding: "15px",
                borderRadius: "10px",
                cursor: "pointer",
                marginBottom: "10px",
                width: "50%",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {item.device} ({item.confidence}%) - {item.date}
              {selectedItem?.id === item.id && (
                <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "10px", marginTop: "10px", color: "black",border: "1px solid #D9D9D9", }}>
                  <p>Confidence: {item.confidence}%</p>
                  <p>Date: {item.date}</p>
                  <p>Justification: {item.justification}</p>

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
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;
