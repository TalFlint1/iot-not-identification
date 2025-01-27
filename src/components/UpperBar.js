import React from "react";
//import { useHistory } from "react-router-dom"; // for routing to the history page
import settingsIcon from "../Icons/settings.png"; // Replace with your settings icon path
import historyIcon from "../Icons/history.png"; // Replace with your history icon path
import logoutIcon from "../Icons/logout.png"; // Replace with your logout icon path

const UpperBar = ({ username }) => {
  //const history = useHistory(); // For navigation

  // const handleHistoryClick = () => {
  //   history.push("/history"); // Change to the actual route for the history page
  // };

  const handleLogoutClick = () => {
    // Add logout functionality here (e.g., clearing tokens or redirecting)
    console.log("Logging out...");
  };

  return (
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#343C42",
            padding: "10px",
            position: "fixed", // Fix it at the top of the screen
            top: "10px", // Ensure it's at the top
            left: "320px", // Align it to the left side
            width: "100%", // Make it span the full width of the screen
            zIndex: "1000", // Ensure it stays on top of other content
        }}
    >
      {/* Rectangle box with rounded corners */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: "10px", // Rounded corners
          padding: "5px 15px",  // Padding inside the box
          width: "250px", // Adjust width as needed
          height: "45px",
          gap: "17px",
        }}
      >
        {/* Settings Icon */}
        <button style={iconButtonStyle}>
          <img src={settingsIcon} alt="Settings" style={iconStyle} />
        </button>

        {/* User Initials */}
        <button
            style={{
                ...iconButtonStyle,
                backgroundColor: "green",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                padding: "0px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "3px", // Slightly adjust left margin to balance the gap
                marginRight: "3px", // Slightly adjust right margin to balance the gap
            }}
        >
            <span
                style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "20px",
                    width: "35px", // Ensure it takes up the same space as the button
                    textAlign: "center", // Center the text horizontally
                }}
            >
                {username[0]}
            </span>
        </button>


        {/* History Icon (with fake click) */}
        <button onClick={() => {}} style={iconButtonStyle}>
          <img src={historyIcon} alt="History" style={iconStyle} />
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
