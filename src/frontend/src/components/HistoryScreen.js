import React, { useState, useEffect } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UpperBar from "./UpperBar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import voice from "../Icons/voice-assistant.png";
import tv from "../Icons/smart-tv.png";
import robot from "../Icons/robot-vacuum.png";
import hub from "../Icons/hub.png";
import bulb from "../Icons/smart-light.png";
import plug from "../Icons/smart-plug.png";
import watch from "../Icons/smartwatch.png";
import sensor from "../Icons/sensor.png";
import camera from "../Icons/security_camera.png";
import phone from "../Icons/mobile_phone.png";
import laptop from "../Icons/laptop.png";
import tablet from "../Icons/tablet.png"
import smoke_detector from "../Icons/smoke-detector.png"
import './HistoryScreen.css';

const HistoryScreen = () => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState("all"); // Filtering by confidence level
  const [showUnsuccessful, setShowUnsuccessful] = useState(false); // Toggle for unsuccessful identifications
  const [showReidentifyModal, setShowReidentifyModal] = useState(false);
  const [itemToReidentify, setItemToReidentify] = useState(null);
  const [exportMode, setExportMode] = useState(false);  // If user clicked "Export"
  const [selectedExports, setSelectedExports] = useState([]);  // Which items are checked
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [reidentifyLoading, setReidentifyLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Cheap Version of Re Identify
  // const handleReidentify = async () => {
  //   if (!itemToReidentify || !itemToReidentify.input_s3_path) {
  //     alert("Missing original input file information.");
  //     return;
  //   }
  
  //   const token = localStorage.getItem("access_token");
  //   if (!token) {
  //     alert("Authorization token is missing.");
  //     return;
  //   }
  
  //   setShowReidentifyModal(false); // Close the modal
  //   setReidentifyLoading(true);
  
  //   try {
  //     const response = await fetch("http://localhost:5000/cheap_reidentify/", {
  //       method: "POST",
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         input_s3_path: itemToReidentify.input_s3_path,
  //       }),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error("Failed to re-identify device");
  //     }
  
  //     const data = await response.json();
  //     console.log("Re-identify response:", data);
  
  //     // Navigate to result screen with the new data
  //     navigate("/result", { state: { resultData: data } });
  //   } catch (error) {
  //     console.error("Error during re-identification:", error);
  //     alert("Something went wrong while re-identifying the device.");
  //   } finally {
  //   setReidentifyLoading(false);
  // }
  // };

  const handleReidentify = async () => {
    if (!itemToReidentify || !itemToReidentify.raw_input_s3_path) {
      alert("Missing original raw input file path.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Authorization token is missing.");
      return;
    }

    setShowReidentifyModal(false);
    setReidentifyLoading(true);

    try {
      const response = await fetch("http://localhost:5000/reidentify/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          raw_input_s3_path: itemToReidentify.raw_input_s3_path,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to re-identify device");
      }

      const data = await response.json();
      console.log("Re-identify response:", data);
      navigate("/result", { state: { resultData: data } });
    } catch (error) {
      console.error("Error during re-identification:", error);
      alert("Something went wrong while re-identifying the device.");
    } finally {
      setReidentifyLoading(false);
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
    setExportMode(false);
    setSelectedExports([]);
  };
    

  // Filter data based on selection
  const filteredData = historyData.filter((item) => {
    if (showUnsuccessful) return item.confidence < 50;
    if (filter === "high") return item.confidence >= 80;
    if (filter === "medium") return item.confidence >= 50 && item.confidence < 80;
    if (filter === "low") return item.confidence > 0 && item.confidence < 50;
    return true; // "all" filter
  });

  const handleDelete = async (item) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Authorization token is missing.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/delete-identification/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ input_s3_path: item.input_s3_path }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // Remove the deleted item from the historyData state
      setHistoryData((prevData) =>
        prevData.filter((entry) => entry.input_s3_path !== item.input_s3_path)
      );

      console.log("Item deleted successfully.");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Something went wrong while deleting the item.");
    }
  };

  const sortedData = React.useMemo(() => {
  return [...filteredData].sort((a, b) => new Date(b.date) - new Date(a.date));
}, [filteredData]);
const getFunctionFromLabel = (deviceLabel) => {
  const [vendor, ...funcWords] = deviceLabel.split(" ");
  return funcWords.join(" ").toLowerCase(); // everything after first word
};

const getIconForFunction = (func) => {
  const iconMap = {
    "camera": camera,
    "smartphone": phone,
    "laptop": laptop,
    "tablet": tablet,
    "ipad": tablet,
    "security camera": camera,
    "smart camera": camera,
    "smart speaker": voice,
    "sensor": sensor,
    "smart sensor": sensor,
    "motion sensor": sensor,
    "air quality sensor": sensor,
    "smoke alarm": smoke_detector,
    "environmental sensor": sensor,
    "door Sensor": sensor,
    "smartwatch": watch,
    "plug": plug,
    "smart plug": plug,
    "smart bulb": bulb,
    "bulb": bulb,
    "hub": hub,
    "smart home hub": hub,
    "vacuum cleaner": robot,
    "robot vacuum" : robot,
    "smart tv": tv,
    "voice assistant": voice
  };

  const match = Object.keys(iconMap).find(key => func.includes(key));
    return match ? iconMap[match] : null; // fallback icon
  };

  const finalFilteredData = React.useMemo(() => {
    return sortedData.filter(item =>
      item.device.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedData, searchTerm]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{ backgroundImage: `url(${sidebarImage})`, backgroundColor: "#343C42", backgroundSize: "contain", 
        backgroundPosition: "left", backgroundRepeat: "no-repeat", height: "100vh", width: "14%", position: "sticky",top: 0 }}
      />
      <UpperBar/>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42", textAlign: "center" }}>
        <Title />
        <p style={{ color: "white", fontSize: "36px", textTransform: "uppercase", fontStyle: "italic" }}>HISTORY</p>
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px',
            marginBottom: '10px',
            marginTop: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '30%'
          }}
        />

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
                setSelectedExports([]);
              }
              setExportMode(!exportMode);
            }}
            className={`export-btnn ${exportMode ? "active" : "default"}`}
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
          {finalFilteredData.map((item, index) => (
            <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => {
                if (!exportMode) {  // Only expand if export mode is off
                  setSelectedItem(selectedItem?.id === item.id ? null : item);
                }
              }}
              style={{ backgroundColor: "#fff", color: "black", padding: "15px", borderRadius: "10px", cursor: "pointer",
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getIconForFunction(getFunctionFromLabel(item.device)) && (
                  <img
                    src={getIconForFunction(getFunctionFromLabel(item.device))}
                    alt="Function Icon"
                    style={{ width: '24px', height: '24px' }}
                  />
                )}
                <span>
                  {item.device.charAt(0).toUpperCase() + item.device.slice(1)} ({item.confidence}%) - {item.date}
                </span>
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
                  <p><strong>Confidence:</strong> {item.confidence}%</p>
                  <p><strong>Date:</strong> {item.date}</p>
                  <p><strong>Justification:</strong> {item.justification}</p>

                    {/* Buttons for Re-identify and Export */}
                    <div style={{ marginTop: "20px" }}>
                    <button
                      onClick={() => {
                        setItemToReidentify(item); 
                        setShowReidentifyModal(true);
                      }}
                      className="btnn reidentify-btn"
                    >
                      <RotateCcw size={14} style={{ marginRight: "8px", position: "relative", top: "2px" }} />
                      Re-Identify
                    </button>

                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setShowDeleteModal(true);
                      }}
                      className="btnn delete-account-btnn"
                    >
                      <span >Delete</span>
                    </button>
                    </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {showDeleteModal && (
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          textAlign: "center",
          width: "400px",
        }}>
          <p style={{ fontSize: "18px", marginBottom: "20px" }}>
            Are you sure you want to delete this history entry?
          </p>
          <button
            onClick={() => {
              handleDelete(itemToDelete);
              setShowDeleteModal(false);
              setItemToDelete(null);
            }}
            style={{
              backgroundColor: "#e55353",
              color: "white",
              border: "none",
              padding: "10px 20px",
              margin: "10px",
              cursor: "pointer",
              fontSize: "16px",
              borderRadius: "5px",
            }}
          >
            Yes, Delete
          </button>
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setItemToDelete(null);
            }}
            style={{
              backgroundColor: "#ccc",
              color: "black",
              border: "none",
              padding: "10px 20px",
              margin: "10px",
              cursor: "pointer",
              fontSize: "16px",
              borderRadius: "5px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )}

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
            style={{ backgroundColor: "#2CA6A4", color: "white", border: "none", padding: "10px 20px", margin: "10px", cursor: "pointer",
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
    {reidentifyLoading && (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000
  }}>
    <div className="loader" />
  </div>
)}
    </div>
  );
};

export default HistoryScreen;