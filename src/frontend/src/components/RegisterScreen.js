import React, { useState } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import googleIcon from "../Icons/google.png";
import { useNavigate } from 'react-router-dom';
import { handleGoogleSignIn } from "../utils/googleAuthUtils";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate("/login");  // Navigate to the login page when clicked
  };

  const handleRegister = async () => {
    if (!password || !confirmPassword) {
      setMessage("Password and Confirm Password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    const requestBody = { username, password, email };
    console.log("Request body being sent:", JSON.stringify(requestBody));

    try {
      const response = await fetch("http://localhost:5000/user/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.status === "error") {
        setMessage(data.message || "Registration failed");
        return;
      }
      
      if (response.ok) {
        setMessage("Registration successful!");
      
        // Delay the login + navigation by 2 seconds
        setTimeout(async () => {
          const loginResponse = await fetch("http://localhost:5000/user/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
      
          const loginData = await loginResponse.json();
      
          if (loginResponse.ok) {
            localStorage.setItem("access_token", loginData.access_token);
            localStorage.setItem("refresh_token", loginData.refresh_token);
            navigate("/identify");
          } else {
            setMessage(loginData.message || "Login after registration failed");
          }
        }, 2000); // 2000ms = 2 seconds
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
          backgroundImage: `url(${sidebarImage})`, backgroundColor: "#343C42", backgroundSize: "contain", backgroundPosition: "left",
          backgroundRepeat: "no-repeat", height: "100%", width: "14%", margin: 0, padding: 0,
        }}
      />
      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42" }}>
        <Title />

        {/* Register Form */}
        <div
          style={{
            display: "flex", flexDirection: "column", backgroundColor: "#EDEDED", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            padding: "30px", width: "100%", maxWidth: "400px", margin: "0 auto", marginTop: "40px",
          }}
        >
          <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>
            Create Account
          </h2>

          {/* Google Login Button */}
          <button
            onClick={() => handleGoogleSignIn(navigate, setMessage)}
            style={{
              display: "flex", alignItems: "center", padding: "12px", backgroundColor: "#fff", color: "black", border: "none",
              borderRadius: "5px", fontSize: "16px", marginBottom: "15px", cursor: "pointer", marginTop: "20px", border: "1px solid #ccc"
            }}
          >
            <img
              src={googleIcon}
              alt="Google"
              style={{ width: "25px", marginRight: "10px" }}
            />
            Continue with Google account
          </button>

          {/* Email Field */}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />

          {/* Register Button */}
          <button onClick={handleRegister} style={buttonStyle}>Register</button>
          {message && <p style={{ textAlign: "center", color: "red" }}>{message}</p>}
          {/* Already have an account */}
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button
              onClick={handleSignInClick}
              style={{ fontSize: "14px", color: "#68CABE", background: "none", border: "none", cursor: "pointer" }}
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "12px",
  marginBottom: "15px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#68CABE",
  color: "white",
  borderRadius: "5px",
  fontSize: "16px",
  cursor: "pointer",
  border: "1px solid #4B5A66",
};

export default RegisterScreen;
