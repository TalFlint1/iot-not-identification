import React, { useState } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";  // Assuming this is your title component
import UpperBar from "./UpperBar";  // Assuming this is your upper bar component
import googleIcon from "../Icons/google.png";  // Assuming this is your Google icon

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
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
      if (response.ok) {
        setMessage("Registration successful!");
      } else {
        setMessage(data.message || "Registration failed");
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
      <UpperBar username={username} />
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
            <a href="/login" style={{ fontSize: "14px", color: "#68CABE" }}>Already have an account? Sign In</a>
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
