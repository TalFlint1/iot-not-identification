import React, { useState } from "react";
import networkIcon from "../Icons/network_icon.png";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UpperBar from "./UpperBar";

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = useState("General Settings");
  const username = "Tal";

  const menuItems = [
    "General Settings",
    "User Preferences",
    "Account Management",
    "Advanced Settings",
    "Data Management",
    "Help & Support",
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Account Management":
        return (
          <div>
            <h3>Account Management</h3>
            <div className="account-info">
              <p><span>Name:</span> Tal</p>
              <p><span>Username:</span> tal123</p>
              <p><span>Connected Accounts:</span></p>
              <p>Platform: Google</p>
              <p>Status: <span style={{ color: "green" }}>Connected</span></p>
              <button className="disconnect">Disconnect</button>
            </div>

            <div className="account-buttons">
              <button>Change Password</button>
              <button>Delete Account</button>
            </div>
          </div>
        );
      case "General Settings":
        return <div><h3>General Settings</h3><p>Update your general preferences here.</p></div>;
      case "User Preferences":
        return <div><h3>User Preferences</h3><p>Set your preferences here.</p></div>;
      case "Advanced Settings":
        return <div><h3>Advanced Settings</h3><p>Configure advanced options.</p></div>;
      case "Data Management":
        return <div><h3>Data Management</h3><p>Manage your data settings.</p></div>;
      case "Help & Support":
        return <div><h3>Help & Support</h3><p>Get help or contact support.</p></div>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
       
      {/* Sidebar */}
      <div
        style={{
            backgroundImage: `url(${sidebarImage})`, // Use the imported image
            backgroundColor: "#343C42",
            backgroundSize: "contain",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
            height: "100%", // Full height of the viewport
            width: "14%", // Same width as before
            margin: 0, // Remove any default margin
            padding: 0, // Remove any default padding
          }}
      >
      </div>
      <UpperBar username={username} /> 
      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42" }}>
        <Title />

        <div style={{ display: "flex" }}>
          {/* Menu */}
          <div
            style={{
              width: "25%",
              padding: "10px",
              backgroundColor: "#f9f9f9",
              borderRight: "1px solid #ccc",
            }}
          >
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => handleTabClick(item)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  border: "none",
                  backgroundColor: activeTab === item ? "#d8f4f7" : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "16px",
                  borderRadius: "5px",
                  transition: "0.3s",
                  fontWeight: activeTab === item ? "bold" : "normal",
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, padding: "20px" }}>{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;