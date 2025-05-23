import React from "react";
import { motion } from "framer-motion";
import { Package, Clock, Brain } from "lucide-react";
//... (rest of your imports)

const getColor = (percentage) => {
  if (percentage >= 80) return "#03C04A"; // Green
  if (percentage >= 50) return "#FFA500"; // Orange
  return "#FF0000"; // Red
};

const CircularConfidenceCard = ({ confidencePercentage }) => {
  const ringColor = getColor(confidencePercentage);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (confidencePercentage / 100) * circumference;

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "black",
        minWidth: "200px",
      }}
    >
      <div style={{ color: "#2563eb", marginBottom: "8px" }}>
        <Brain size={32} />
      </div>
      <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "12px" }}>Avg Confidence</p>
      <div style={{ position: "relative", width: "120px", height: "120px" }}>
        <svg width="130" height="130" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e0e0e0"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={ringColor}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="57"
            textAnchor="middle"
            fontSize="20"
            fill="black"
            fontWeight="bold"
          >
            {confidencePercentage}%
          </text>
        </svg>
      </div>
    </motion.div>
  );
};

export default CircularConfidenceCard;