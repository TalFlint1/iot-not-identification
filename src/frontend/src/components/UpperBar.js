import React from "react";
import { useNavigate } from "react-router-dom"; 
import settingsIcon from "../Icons/settings.png"; // Replace with your settings icon path
import historyIcon from "../Icons/history.png"; // Replace with your history icon path
import logoutIcon from "../Icons/logout.png"; // Replace with your logout icon path
import homepageIcon from "../Icons/homepage.png";
import { getAuth, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import dashboardIcon from "../Icons/dashboard.png";

const UpperBar = ({ username }) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/identify");
  };

  const handleHistoryClick = () => {
    navigate("/history");
  };

  const handleSettingsClick = () => {
    navigate("/settings"); // Navigate to the settings page
  };

  const handleDashboardClick = () => {
  navigate("/dashboard");
  };

  const handleLogoutClick = () => {
    // Remove the tokens from localStorage to log the user out
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Navigate to the login page
    navigate("/login");
  };
  
  return (
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            position: "fixed",
            top: "2px",
            left: "320px",
            width: "20%",
            zIndex: "1000",
        }}
    >
      {/* Rectangle box with rounded corners */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "5px 15px",
          width: "320px",
          height: "45px",
          gap: "17px",
          border: "1px solid gray"
        }}
      >
        {/* Settings Icon */}
        <button onClick={handleSettingsClick} style={iconButtonStyle}>
          <img src={settingsIcon} alt="Settings" style={iconStyle} />
        </button>

        {/* Home Icon */}
        <button onClick={handleHomeClick} style={iconButtonStyle}>
          <img src={homepageIcon} alt="Home" style={iconStyle} />
        </button>          

        {/* History Icon (with fake click) */}
        <button onClick={handleHistoryClick} style={iconButtonStyle}>
          <img src={historyIcon} alt="History" style={iconStyle} />
        </button>

        {/* Dashboard Icon */}
        <button onClick={handleDashboardClick} style={iconButtonStyle}>
          <img src={dashboardIcon} alt="Dashboard" style={iconStyle} />
        </button>

        {/* Logout Icon */}
        <button onClick={handleLogoutClick} style={iconButtonStyle}>
          <img src={logoutIcon} alt="Logout" style={iconStyle} />
        </button>
      </div>
    </div>
  );
};

const iconButtonStyle = {
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "10px",
  marginLeft: "1px",
  marginRight: "-3px"
};

const iconStyle = {
  width: "28px", // Adjust size as needed
  height: "28px", // Adjust size as needed
};

export default UpperBar;
