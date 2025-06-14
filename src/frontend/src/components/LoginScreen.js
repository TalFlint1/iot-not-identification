import React, { useState, useEffect } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import googleIcon from "../Icons/google.png";
import { useNavigate } from "react-router-dom";
import { handleGoogleSignIn } from "../utils/googleAuthUtils";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    setMessage("");
  }, [username, password]);
  

  const handleCreateAccountClick = () => {
    navigate("/register");  // Navigate to the register screen
  };

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        setMessage("Incorrect username or password.");
        return;
      }
      const response = await fetch("http://localhost:5000/user/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        setMessage("Login successful!");
        
        // Navigate to InputScreen
        navigate("/identify");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Error connecting to server");
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
      />
      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42" }}>
        <Title />

        {/* Login Form */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#EDEDED",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            padding: "30px",
            width: "100%",
            maxWidth: "400px",
            margin: "0 auto",
            marginTop: "40px",
          }}
        >
          <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>
            Welcome to IDENT
          </h2>

          {/* Google Login Button */}
          <button
          onClick={() => handleGoogleSignIn(navigate, setMessage)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              backgroundColor: "#fff",
              color: "black",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              marginBottom: "15px",
              cursor: "pointer",
              marginTop: "20px",
              border: "1px solid #ccc"
            }}
          >
            <img
              src={googleIcon}
              alt="Google"
              style={{ width: "25px", marginRight: "10px" }}
            />
            Continue with Google account
          </button>

          {/* Username Field */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "12px",
              marginBottom: "15px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          {/* Password Field */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px",
              marginBottom: "15px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          {/* Sign In Button */}
          <button
            style={{
              padding: "12px",
              backgroundColor: "#68CABE",
              color: "white",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              border: "1px solid #4B5A66"
            }}
            onClick={handleLogin}
          >
            Sign In
          </button>
          {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}

           {/* Forgot Password and Create Account Links */}
           <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button
              onClick={handleCreateAccountClick}
              style={{
                background: "none",
                border: "none",
                color: "#68CABE",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
