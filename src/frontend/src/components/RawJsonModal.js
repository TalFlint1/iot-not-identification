import React, { useEffect, useState } from "react";

const RawJsonModal = ({ item, onClose }) => {
  const [rawJson, setRawJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const primaryColor = "#3B82F6";
  const primaryHover = "#2563EB";
  const [copyHovered, setCopyHovered] = useState(false);
  const [downloadHovered, setDownloadHovered] = useState(false);


  const getButtonStyle = (isHovered) => ({
    backgroundColor: isHovered ? primaryHover : primaryColor,
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  });


  useEffect(() => {
    const fetchRawJson = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://localhost:5000/raw-json/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ s3_key: item.raw_input_s3_path }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch raw JSON");
        }

        const data = await response.json();
        setRawJson(data.raw_json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (item?.raw_input_s3_path) {
      fetchRawJson();
    }
  }, [item]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(rawJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // hide after 2s
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(rawJson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "raw_input.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "90%",
          maxWidth: "800px",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "transparent",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
          }}
          title="Close"
        >
          ❌
        </button>

        <h2 style={{ marginBottom: 16, color: "#000" }}>📄 Raw JSON Input</h2>

        {loading ? (
          <p style={{ color: "#000" }}>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>Error: {error}</p>
        ) : (
          <>
            <pre
              style={{
                backgroundColor: "#f9f9f9",
                color: "#000",
                padding: "16px",
                borderRadius: "8px",
                maxHeight: "400px",
                overflowY: "auto",
                fontSize: "14px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                border: "1px solid #ddd",
              }}
            >
              {JSON.stringify(rawJson, null, 2)}
            </pre>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: "10px", }}>
              <button
                onClick={handleDownload}
                onMouseEnter={() => setDownloadHovered(true)}
                onMouseLeave={() => setDownloadHovered(false)}
                style={getButtonStyle(downloadHovered)}
              >
                ⬇️ Download JSON
              </button>

              <button
                onClick={handleCopy}
                onMouseEnter={() => setCopyHovered(true)}
                onMouseLeave={() => setCopyHovered(false)}
                style={getButtonStyle(copyHovered)}
              >
                📋 {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RawJsonModal;