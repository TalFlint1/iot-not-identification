import React from "react";
import { motion } from "framer-motion";

const UsageCard = ({ used, limit }) => {
  const percentage = Math.min((used / limit) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: 250,
        backgroundColor: "white",
        borderRadius: 24,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>
        API Calls Used
      </div>
      <div style={{ fontWeight: "bold", fontSize: 24, marginBottom: 12, color: "#000000" }}>
        {used} / {limit}
      </div>
      <div
        style={{
          backgroundColor: "#eee",
          borderRadius: 8,
          height: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: "#3b82f6",
            height: "100%",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </motion.div>
  );
};

export default UsageCard;
