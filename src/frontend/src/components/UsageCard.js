import React from "react";
import { motion } from "framer-motion";

const UsageCard = ({ used, limit, total }) => {
  const percentage = Math.min((used / limit) * 100, 100).toFixed(0);

  const divider = (
    <div
      style={{
        height: "1px",
        backgroundColor: "#e5e7eb",
        margin: "8px 0",
      }}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        color: "black",
        minWidth: "240px",
        flex: 1,
      }}
    >
      <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>
        Search Activity Summary
      </h2>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
        <span>🔄Searches this month</span>
        <span>{used}</span>
      </div>

      {divider}

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
        <span>📅Monthly search limit</span>
        <span>{limit}</span>
      </div>

      {divider}

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "16px" }}>
        <span>🌐Total searches</span>
        <span>{total}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: "8px", backgroundColor: "#e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: percentage > 85 ? "#f97316" : "#2563eb",
            transition: "width 0.5s ease-in-out",
          }}
        />
      </div>
      <div style={{ textAlign: "right", fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
        {percentage}% of limit used
      </div>
    </motion.div>
  );
};

export default UsageCard;
