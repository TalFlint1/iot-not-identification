const ConfidenceAlertsTable = ({ data }) => {
  const lowConfidence = data.filter(item => item.confidence < 60);

  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: 14,
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

  return (
    <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", width: "100%", minWidth: "400px", }}>
      <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#000" }}>🛡️ Confidence Alerts</h2>
      {lowConfidence.length === 0 ? (
        <p style={{ color: "#555" }}>No low-confidence results recently. You're good to go ✅</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Vendor</th>
              <th style={thStyle}>Function</th>
              <th style={thStyle}>Conf.</th>
            </tr>
          </thead>
          <tbody>
            {lowConfidence.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.time}</td>
                <td style={tdStyle}>{item.vendor}</td>
                <td style={tdStyle}>{item.function}</td>
                <td style={{ ...tdStyle, color: "#dc2626", fontWeight: "bold" }}>{item.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {lowConfidence.length > 0 && (
        <p style={{ marginTop: 12, color: "#b91c1c", fontSize: 13 }}>
          Some results had low confidence. Consider verifying these manually.
        </p>
      )}
    </div>
  );
};


export default ConfidenceAlertsTable;
