import React, { useState } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";  // Assuming this is your title component
import UpperBar from "./UpperBar";  // Assuming this is your upper bar component
import googleIcon from "../Icons/google.png";  // Assuming this is your Google icon

const LoginScreen = () => {
  const username = "Guest";  // You can set this dynamically based on login

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
          height: "100%",
          width: "14%",
          margin: 0,
          padding: 0,
        }}
      />
      <UpperBar username={username} />
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
          >
            Sign In
          </button>

           {/* Forgot Password and Create Account Links */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <a
                href="#"
                style={{
                fontSize: "14px",
                color: "#68CABE",
                display: "block", // Make the links appear vertically
                marginBottom: "10px", // Space between the links
                marginTop: "20px"
                }}
            >
                Forgot your password?
            </a>
            <a
                href="#"
                style={{
                fontSize: "14px",
                color: "#68CABE",
                display: "block", // Make the links appear vertically
                }}
            >
                Create Account
            </a>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
