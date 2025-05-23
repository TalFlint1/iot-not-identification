import React from "react";

const RecentActivityTable = ({ data }) => {
  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: "14px",
  };

  const thStyle = {
    borderBottom: "2px solid #ccc",
    textAlign: "left",
    padding: "8px",
    backgroundColor: "#f9f9f9",
    color: "#000",
  };

  const tdStyle = {
    borderBottom: "1px solid #ddd",
    padding: "8px",
    color: "#000",
  };

  const containerStyle = {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    padding: "16px",
    maxWidth: "400px",
    marginBottom: "24px",
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "12px",
    color: "#000",
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>🔎 Recent Identifications</div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Vendor</th>
            <th style={thStyle}>Function</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={tdStyle}>{item.time}</td>
              <td style={tdStyle}>{item.vendor}</td>
              <td style={tdStyle}>{item.function}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivityTable;
