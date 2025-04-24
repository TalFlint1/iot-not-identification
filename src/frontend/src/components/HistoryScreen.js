import React, { useState, useEffect } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UpperBar from "./UpperBar";
import { useNavigate } from "react-router-dom";

const HistoryScreen = () => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState("all"); // Filtering by confidence level
  const [showUnsuccessful, setShowUnsuccessful] = useState(false); // Toggle for unsuccessful identifications
  const [showReidentifyModal, setShowReidentifyModal] = useState(false);
  const [itemToReidentify, setItemToReidentify] = useState(null);
  const [exportMode, setExportMode] = useState(false);  // If user clicked "Export"
  const [selectedExports, setSelectedExports] = useState([]);  // Which items are checked
  const navigate = useNavigate();

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

        const historyWithIds = data.history.map((item, index) => ({
          ...item,
          id: index,  // Add id based on index
        }));

        setHistoryData(historyWithIds);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
  
    fetchHistory();
  }, []);

  const handleReidentify = async () => {
    if (!itemToReidentify || !itemToReidentify.input_s3_path) {
      alert("Missing original input file information.");
      return;
    }
  
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Authorization token is missing.");
      return;
    }
  
    setShowReidentifyModal(false); // Close the modal
  
    try {
      const response = await fetch("http://localhost:5000/cheap_reidentify/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          input_s3_path: itemToReidentify.input_s3_path,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to re-identify device");
      }
  
      const data = await response.json();
      console.log("Re-identify response:", data);
  
      // Navigate to result screen with the new data
      navigate("/result", { state: { resultData: data } });
    } catch (error) {
      console.error("Error during re-identification:", error);
      alert("Something went wrong while re-identifying the device.");
    }
  };
  const handleExportCSV = () => {
    if (selectedExports.length === 0) return;
  
    const headers = ["Device", "Confidence", "Date", "Justification"];
    const rows = selectedExports.map(item => [
      item.device,
      item.confidence,
      item.date,
      item.justification,
    ]);
  
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.map(field => `"${field}"`).join(",")).join("\n");
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exported_history.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };
    

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
        style={{ backgroundImage: `url(${sidebarImage})`, backgroundColor: "#343C42", backgroundSize: "contain", 
        backgroundPosition: "left", backgroundRepeat: "no-repeat", height: "100%", width: "14%", }}
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
          <button
            onClick={() => {
              if (exportMode) {
                // If we are currently in export mode and clicking to cancel, reset the ticks
                setSelectedExports([]);
              }
              setExportMode(!exportMode); // Toggle the mode
            }}
            
            style={{
              backgroundColor: exportMode ? "#FFA500" : "#68CABE",  // Orange if active, green if not
              color: "white", border: "none", padding: "10px 20px", marginTop: "10px", cursor: "pointer",
              fontSize: "18px", borderRadius: "5px", marginLeft: "40px"
            }}
          >
            {exportMode ? "Cancel Export" : "Export"}
          </button>

          {exportMode && selectedExports.length > 0 && (
            <button
              onClick={handleExportCSV}
              style={{ backgroundColor: "#68CABE", color: "white", border: "none", padding: "10px 20px", marginTop: "10px",
                marginLeft: "20px", cursor: "pointer", fontSize: "18px", borderRadius: "5px", }}
            >
              Download Selected as CSV
            </button>
          )}
          <br />
          <label style={{ color: "white", marginRight: "10px", }}>Show only unsuccessful identifications:</label>
          <input type="checkbox" checked={showUnsuccessful} onChange={() => setShowUnsuccessful(!showUnsuccessful)} />
        </div>

        {/* History List */}
        <div style={{ marginTop: "20px" }}>
          {filteredData.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!exportMode) {  // Only expand if export mode is off
                  setSelectedItem(selectedItem?.id === item.id ? null : item);
                }
              }}
              style={{ backgroundColor: "#EDEDED", color: "black", padding: "15px", borderRadius: "10px", cursor: "pointer",
                marginBottom: "10px", width: "50%", marginLeft: "auto", marginRight: "auto", transition: "background-color 0.3s ease",
                ...(selectedItem?.id === item.id ? { backgroundColor: "#D9D9D9" } : {}), }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {exportMode && (
                  <input
                  type="checkbox"
                  checked={selectedExports.includes(item)}
                  onChange={(e) => {
                    e.stopPropagation();  // Prevent the item from expanding when checkbox is clicked
                    if (selectedExports.includes(item)) {
                      setSelectedExports(selectedExports.filter(i => i !== item));
                    } else {
                      setSelectedExports([...selectedExports, item]);
                    }
                  }}
                  style={{ marginRight: "10px" }}
                />
                )}
                <div>
                  {item.device} ({item.confidence}%) - {item.date}
                </div>
              </div>
              <div style={{
                transform: selectedItem?.id === item.id ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
                fontSize: "20px",
              }}>
                ▶
              </div>
            </div>
              {selectedItem?.id === item.id && (
                <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "10px", marginTop: "10px", color: "black",border: "1px solid #D9D9D9", }}>
                  <p>Confidence: {item.confidence}%</p>
                  <p>Date: {item.date}</p>
                  <p>Justification: {item.justification}</p>

                    {/* Buttons for Re-identify and Export */}
                    <div style={{ marginTop: "20px" }}>
                    <button
                      onClick={() => {
                        setItemToReidentify(item); 
                        setShowReidentifyModal(true);
                      }}
                      style={{
                      backgroundColor: "#68CABE", color: "white", border: "none", padding: "10px 20px", margin: "5px", cursor: "pointer",
                      fontSize: "18px", borderRadius: "5px", }}
                    >
                        Re-Identify
                    </button>
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showReidentifyModal && (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000
      }}>
        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "10px", textAlign: "center", width: "400px",}}>
          <p style={{ fontSize: "18px", marginBottom: "20px" }}>
            This will perform a new analysis based on the original input you provided.<br/>
            Are you sure you want to re-identify this device?
          </p>
          <button 
            onClick={handleReidentify}
            style={{ backgroundColor: "#68CABE", color: "white", border: "none", padding: "10px 20px", margin: "10px", cursor: "pointer",
              fontSize: "16px", borderRadius: "5px", }}
          >
            Yes, Re-Identify
          </button>
          <button 
            onClick={() => setShowReidentifyModal(false)}
            style={{ backgroundColor: "#ccc", color: "black", border: "none", padding: "10px 20px", margin: "10px", cursor: "pointer",
              fontSize: "16px", borderRadius: "5px", }}
          >
            Cancel
          </button>
        </div>
      </div>
    )}
    </div>
  );
};

export default HistoryScreen;