import React from "react";
import { useNavigate } from "react-router-dom"; 
import resultIcon from "../Icons/result.png";
import historyIcon from "../Icons/history.png";
import logoutIcon from "../Icons/logout.png";
import homepageIcon from "../Icons/homepage.png";
import settingsIcon from "../Icons/settings.png"
import { getAuth, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import dashboardIcon from "../Icons/dashboard.png";
import "./UpperBar.css";

const UpperBar = ({ username }) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleHomeClick = () => {
    navigate("/identify");
  };

  const handleHistoryClick = () => {
    navigate("/history");
  };

  const handleResultClick = () => {
    navigate("/result");
  };

  const handleDashboardClick = () => {
  navigate("/dashboard");
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("lastResult");
    // Remove the tokens from localStorage to log the user out
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Navigate to the login page
    navigate("/login");
  };
  
  return (
    <div className="upperbar-container">
      <div className="upperbar-inner">
        <button onClick={handleSettingsClick} className="upperbar-btn">
          <img src={settingsIcon} alt="Settings" className="upperbar-icon" />
        </button>

        <button onClick={handleResultClick} className="upperbar-btn">
          <img src={resultIcon} alt="Result" className="upperbar-icon" />
        </button>

        <button onClick={handleHomeClick} className="upperbar-btn">
          <img src={homepageIcon} alt="Home" className="upperbar-icon" />
        </button>          

        <button onClick={handleHistoryClick} className="upperbar-btn">
          <img src={historyIcon} alt="History" className="upperbar-icon" />
        </button>

        <button onClick={handleDashboardClick} className="upperbar-btn">
          <img src={dashboardIcon} alt="Dashboard" className="upperbar-icon" />
        </button>

        <button onClick={handleLogoutClick} className="upperbar-btn">
          <img src={logoutIcon} alt="Logout" className="upperbar-icon" />
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
  width: "28px",
  height: "28px",
};

export default UpperBar;
