import React, { useState } from "react";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";  // Assuming this is your title component
import UpperBar from "./UpperBar";  // Assuming this is your upper bar component
import googleIcon from "../Icons/google.png";  // Assuming this is your Google icon

const RegisterScreen = () => {
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

        {/* Register Form */}
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
            Create Account
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

          {/* Email Field */}
          <input
            type="email"
            placeholder="Email"
            style={{
              padding: "12px",
              marginBottom: "15px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

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

          {/* Confirm Password Field */}
          <input
            type="password"
            placeholder="Confirm Password"
            style={{
              padding: "12px",
              marginBottom: "15px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />

          {/* Register Button */}
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
            Register
          </button>

          {/* Already have an account */}
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <a
              href="/login"
              style={{
                fontSize: "14px",
                color: "#68CABE",
              }}
            >
              Already have an account? Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
