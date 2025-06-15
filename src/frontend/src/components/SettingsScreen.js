import React, { useState, useEffect } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UpperBar from "./UpperBar";
import './SettingsScreen.css';
import { motion } from "framer-motion";

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = useState("Account Management");
  const [expandedTab, setExpandedTab] = useState(null); // For collapsible tabs
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [syncStatus, setSyncStatus] = useState(false);
  const [dataIntegrityCheckEnabled, setDataIntegrityCheckEnabled] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });

  const username = "Tal";

  const menuItems = [
    { title: "Account Management" },
    { title: "Data Management" },
    { title: "FAQ" },
    { title: "Contact Support" },
  ];

  const faqData = [
    {
      question: "How does device identification work?",
      answer:
        "Our system analyzes network traffic to determine the vendor and function of IoT devices using AI-based techniques.",
    },
    {
      question: "What file formats are supported for uploading device data?",
      answer: (
        <>
          Currently, we support JSON files. Ensure your file follows the correct format before uploading.
          <br />
          Additionally, you can manually input data through the system if you prefer.
        </>
      ),
    },
    {
      question: "How accurate is the identification process?",
      answer: "The system provides a confidence level with each result. Higher confidence means a more certain match.",
    },
    {
      question: "What should I do if my device is not identified?",
      answer:
        "Try uploading different network data samples. If issues persist, contact support.",
    },
  ];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const toggleExpand = (tab) => {
    setExpandedTab(expandedTab === tab ? null : tab);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch('http://localhost:5000/user-info/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };

    fetchUserInfo();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "Account Management":
        return (
          <div>
            <p style={{ marginTop: "20px", marginLeft: "240px", fontSize: "36px" }}>Account Management</p>
            <div className="account-info" style={{ marginLeft: "100px", marginTop: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <p style={{ width: "200px" }}>Username:</p>
                <span>{userInfo.username}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <p style={{ width: "200px" }}>Email:</p>
                <span>{userInfo.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <p style={{ width: "200px" }}>Export history data to CSV:</p>
                <button className="btn export-btn">Export</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <p style={{ width: "200px" }}>Clear my history:</p>
                <button className="btn clear-history-btn">Clear</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <p style={{ width: "200px" }}>Delete my account:</p>
                <button className="btn delete-account-btn">Delete</button>
              </div>
            </div>
          </div>
        );
      case "General Settings":
        return <div><h3>General Settings</h3><p>Update your general preferences here.</p></div>;
      case "User Preferences":
        return (
          <div>
            <h3 style={{ marginTop: "20px" }}>User Preferences</h3>
            <div className="preferences">
              <div>
                <h3 style={{ marginTop: "20px" }}>Two-Factor Authentication</h3>
                
                {/* Displaying the status of 2FA */}
                <p style={{ marginTop: "20px" }}> Your account is protected with 2FA to enhance security.</p>
                <p style={{ marginTop: "20px" }}>Choose your preferred method of authentication:</p>
                
                <div>
                  <p style={{ marginTop: "20px", marginBottom: "10px" }}>Select Authentication Method:</p>
                  <select>
                    <option value="authenticator">Authenticator App (Recommended)</option>
                    <option value="sms">SMS (Text Message)</option>
                    <option value="email">Email Verification</option>
                  </select>
                </div>

                <div>
                  <p style={{ marginTop: "20px" }}>Current 2FA Method:</p>
                  <p style={{ marginTop: "10px", fontSize: "14px", marginBottom: "10px" }}>Google Authenticator</p> {/* This would be dynamic based on current method */}
                </div>

                <div>
                  <button className="btn reg-button-btn">Change 2FA Method</button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case "Data Management":
        return (
          <div>
            <h3 style={{ marginTop: "20px" }}>Data Management</h3>
            <p style={{ marginTop: "20px" }}>Manage your data settings.</p>
  
            {/* Sync Status */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ marginTop: "30px", marginBottom: "10px" }}>Sync Status</h4>
              <p>
                {syncStatus ? "Your data is currently synchronized." : "Your data is not synchronized."}
              </p>
              <div
                style={{
                  marginTop: "20px",
                  position: "relative",
                  width: "80px",
                  height: "40px",
                  borderRadius: "20px",
                  background: syncStatus ? "#4CAF50" : "#D9D9D9",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onClick={() => setSyncStatus(!syncStatus)}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: syncStatus ? "40px" : "2px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    transition: "left 0.3s",
                  }}
                ></div>
              </div>
            </div>
  
            {/* Data Integrity Check */}
              <div>
              <h4 style={{ marginTop: "30px", marginBottom: "10px" }}>Data Integrity Check</h4>
              <p>
                {dataIntegrityCheckEnabled
                  ? "Data integrity check is enabled."
                  : "Data integrity check is disabled."}
              </p>
              <div
                style={{
                  marginTop: "20px",
                  position: "relative",
                  width: "80px",
                  height: "40px",
                  borderRadius: "20px",
                  background: dataIntegrityCheckEnabled ? "#4CAF50" : "#D9D9D9",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onClick={() => setDataIntegrityCheckEnabled(!dataIntegrityCheckEnabled)}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: dataIntegrityCheckEnabled ? "40px" : "2px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    transition: "left 0.3s",  // This is the key part for the sliding effect
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      case "FAQ":
        return (
          <div>
            <h3 style={{ marginBottom: "20px", marginTop: "20px" }}>Frequently Asked Questions</h3>
            {faqData.map((item, index) => (
              <div key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                <button
                  onClick={() => toggleFAQ(index)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    fontSize: "16px",
                    display: "block",
                    padding: "10px 0",
                    marginBottom: "10px",
                  }}
                >
                  {item.question} {expandedFAQ === index ? "▲" : "▼"}
                </button>
                {expandedFAQ === index && <p style={{ paddingLeft: "10px" }}>{item.answer}</p>}
              </div>
            ))}
          </div>
        );
      case "Contact Support":
        return (
          <div>
            <h3 style={{ marginBottom: "20px", marginTop: "20px" }}>Contact Support</h3>
            <p style={{ marginBottom: "20px", marginTop: "20px" }}>If you need help, feel free to reach out to our support team!</p>
            
            <form style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
              <label htmlFor="name">Full Name:</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              />
      
              <label htmlFor="email">Email Address:</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              />
      
              <label htmlFor="message">Your Message:</label>
              <textarea
                id="message"
                placeholder="Write your message here"
                rows="4"
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              />
      
              <button
                type="submit"
                style={{
                  padding: "10px 15px",
                  borderRadius: "5px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
              >
                Submit
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
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
      >
      </div>
      <UpperBar username={username} /> 
      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42" }}>
        <Title />

        {/* Unified Box for Menu and Content */}
        <motion.div
        initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            display: "flex",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            width: "75%",
            height: "55vh",
            marginTop: "20px",
            marginLeft: "10%",
          }}
        >
          {/* Menu */}
          <div
            style={{
              width: "20%",
              padding: "10px",
              backgroundColor: "#EDEDED",
              borderRight: "1px solid #ccc",
            }}
          >
            {/* Settings Header */}
            <h3
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                margin: "10px 0 20px",
                textAlign: "left",
                color: "#333",
                marginBottom: "30px",
                marginTop: "30px",
                paddingLeft: "40px",
              }}
            >
              Settings
            </h3>
            {menuItems.map((item) => (
              <div key={item.title}>
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleExpand(item.title); // Toggle for sections with children
                    } else {
                      handleTabClick(item.title); // Regular click for non-collapsible tabs
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    paddingLeft: "40px",
                    marginBottom: "10px",
                    border: "none",
                    backgroundColor: activeTab === item.title ? "#D9D9D9" : "#EDEDED",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "16px",
                    borderRadius: "10px",
                    transition: "0.3s",
                    fontWeight: activeTab === item.title ? "bold" : "normal",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#DDDDDD")}
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor =
                      activeTab === item.title ? "#D9D9D9" : "#EDEDED")
                  }
                >
                  {item.title}
                </button>
                {item.children && expandedTab === item.title && (
                  <div style={{ paddingLeft: "60px" }}>
                    {item.children.map((child) => (
                      <button
                        key={child}
                        onClick={() => handleTabClick(child)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          marginBottom: "10px",
                          border: "none",
                          backgroundColor: activeTab === child ? "#D9D9D9" : "#EDEDED",
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: "16px",
                          borderRadius: "10px",
                          transition: "0.3s",
                          fontWeight: activeTab === child ? "bold" : "normal",
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#DDDDDD")}
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor =
                            activeTab === child ? "#D9D9D9" : "#EDEDED")
                        }
                      >
                        {child}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, padding: "20px" }}>{renderContent()}</div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsScreen;