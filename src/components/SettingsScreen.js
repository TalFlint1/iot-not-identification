import React, { useState } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UpperBar from "./UpperBar";

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = useState("General Settings");
  const [expandedTab, setExpandedTab] = useState(null); // For collapsible tabs
  const username = "Tal";

  const menuItems = [
    {
      title: "General Settings",
      children: ["User Preferences", "Account Management"],
    },
    { title: "Advanced Settings" },
    { title: "Data Management" },
    { title: "Help & Support" },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const toggleExpand = (tab) => {
    setExpandedTab(expandedTab === tab ? null : tab);
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

        {/* Unified Box for Menu and Content */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            marginTop: "20px",
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
                    item.children ? toggleExpand(item.title) : handleTabClick(item.title);
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
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;