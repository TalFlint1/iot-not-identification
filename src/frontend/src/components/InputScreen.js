import { useState, useRef } from "react";
import Title from "./Title";
import sidebarImage from "../Icons/sidebar.png";
import './InputScreen.css'; // Make sure the path is correct
import attachmentIcon from "../Icons/attachment.png"; // Adjust path if needed
import UpperBar from "./UpperBar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const InputScreen = () => {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("json"); // Default to JSON file
  const [selectedFile, setSelectedFile] = useState(null);
  const [focusedInput, setFocusedInput] = useState(""); // State to manage which input box is clicked
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  // For Manual Entry
  const [macAddress, setMacAddress] = useState("");
  const [dhcpHostname, setDhcpHostname] = useState("");
  const [httpUserAgent, setHttpUserAgent] = useState("");
  const [certificateDnsNames, setCertificateDnsNames] = useState("");
  const [domains, setDomains] = useState("");
  const [dnsPtr, setDnsPtr] = useState("");
  const [tlsServerName, setTlsServerName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const exampleJson = `{
    "device_sample.csv": {
      "dns.ptr.domain_name": [],
      "dhcp.option.hostname": [],
      "x509ce.dNSName": ["example.domain.com"],
      "http.user_agent": [],
      "tls.handshake.extensions_server_name": [],
      "mac_address": "00:11:22:33:44:55",
      "dns.qry.name": ["example.com", "pool.ntp.org"]
    }
  }`;

  // const handleRealAnalyze = async () => {
  //   if (!selectedFile) {
  //     alert("Please select a CSV file before identifying.");
  //     return;
  //   }
  
  //   const formData = new FormData();
  //   formData.append("file", selectedFile);

  //   const token = localStorage.getItem("access_token");
  //   if (!token) {
  //     alert("Authorization token is missing.");
  //     return;
  //   }
  
  //   try {
  //     const response = await fetch("http://localhost:5000/analyze_enriched_csv/", {
  //       method: "POST",
  //       headers: {
  //         'Authorization': `Bearer ${token}`,  // Adding Authorization header
  //       },
  //       body: formData,
  //     });
  
  //     if (!response.ok) {
  //       throw new Error("Failed to analyze device");
  //     }
  
  //     const data = await response.json();
  //     console.log("Response data:", data);
  //     // Navigate to result with the first device (assuming only one row for now)
  //     navigate("/result", { state: { resultData: data } });
  //   } catch (error) {
  //     console.error("Error during analysis:", error);
  //     alert("Something went wrong while identifying the device.");
  //   }
  // };

  const validateJsonFile = async (file) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const topKeys = Object.keys(json);
      if (topKeys.length !== 1) return false;

      const content = json[topKeys[0]];
      if (typeof content !== 'object' || content === null) return false;

      const fieldsToCheck = [
        "dns.ptr.domain_name",
        "dhcp.option.hostname",
        "x509ce.dNSName",
        "http.user_agent",
        "tls.handshake.extensions_server_name",
        "dns.qry.name"
      ];

      const hasAtLeastOne = fieldsToCheck.some(
        key => Array.isArray(content[key]) && content[key].length > 0
      );

      return hasAtLeastOne;
    } catch (e) {
      return false;
    }
  };

  const handleRealAnalyze = async () => {
    if (!selectedFile) {
      alert("Please select a JSON file before identifying.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".json")) {
      alert("Please select a valid JSON file (.json).");
      return;
    }

    const isValid = await validateJsonFile(selectedFile);
    if (!isValid) {
      alert("The uploaded JSON file is not properly formatted or missing required fields.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Authorization token is missing.");
      return;
    }
    
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:5000/analyze_device/", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,  // Adding Authorization header
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to analyze device");
      }
  
      const data = await response.json();
      console.log("Response data:", data);

      // Save result to localStorage
      localStorage.setItem("lastResult", JSON.stringify(data));

      // Navigate to result with the first device (assuming only one row for now)
      navigate("/result", { state: { resultData: data } });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error during analysis:", error);
      alert("Something went wrong while identifying the device.");
    }
  };

  const handleManualAnalyze = async () => {
    const manualData = {
      "dns.ptr.domain_name": dnsPtr ? dnsPtr.split(",").map(name => name.trim()) : [],
      "dhcp.option.hostname": dhcpHostname ? dhcpHostname.split(",").map(name => name.trim()) : [],
      "x509ce.dNSName": certificateDnsNames ? certificateDnsNames.split(",").map(name => name.trim()) : [],
      "http.user_agent": httpUserAgent ? httpUserAgent.split(",").map(agent => agent.trim()) : [],
      "tls.handshake.extensions_server_name": tlsServerName ? tlsServerName.split(",").map(name => name.trim()) : [],
      "mac_address": macAddress,
      "origin_dataset": "manual",
      "dns.qry.name": domains ? domains.split(",").map(domain => domain.trim()) : [],
    };     
  
    const allFieldsEmpty =
      !dnsPtr.trim() &&
      !dhcpHostname.trim() &&
      !certificateDnsNames.trim() &&
      !httpUserAgent.trim() &&
      !tlsServerName.trim() &&
      !macAddress.trim() &&
      !domains.trim();

    if (allFieldsEmpty) {
      alert("Please enter at least one field before identifying.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Authorization token is missing.");
      return;
    }

    setLoading(true);
  
    try {
      // 1. Create a Blob with the JSON string
      const fileJson = {
        "manual_input_1.csv": manualData,
      };

      const jsonBlob = new Blob([JSON.stringify(fileJson, null, 2)], {
        type: "application/json",
      });
  
      // 2. Prepare FormData
      const formData = new FormData();
      formData.append("file", jsonBlob, "manual_input.json");
  
      // 3. Send request to /analyze_device/
      const response = await fetch("http://localhost:5000/analyze_device/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to analyze device");
      }
  
      const data = await response.json();
      console.log("Response data:", data);

      // Save result to localStorage
      localStorage.setItem("lastResult", JSON.stringify(data));
      
      navigate("/result", { state: { resultData: data } });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error during manual analysis:", error);
      alert("Something went wrong while identifying the device.");
    }
  };

  const buttonStyle = {
    width: "200px", height: "40px", borderRadius: "5px", border: "1px solid #000000", fontSize: "18px",
  };

  const handleFocus = (placeholder) => {
    setFocusedInput(placeholder); // When an input box is clicked, it disappears
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#343C42", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          backgroundImage: `url(${sidebarImage})`, backgroundColor: "#343C42", backgroundSize: "contain", backgroundPosition: "left",
          backgroundRepeat: "no-repeat", height: "100%", width: "14%", margin: 0, padding: 0,
        }}
      ></div>

       {/* Upper Bar */}
      <UpperBar username="Tal" />
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Title />
        <div className="flex flex-col items-center text-white p-6">
        <p
            style={{
                fontSize: "20px", margin: "10px 0", textAlign: "left", color: "white", marginLeft: "300px",
            }}
        >
            Find out easily what devices are on your network
        </p>

          {/* New "Choose input option:" text */}
          <p
            style={{
                fontSize: "22px", margin: "10px 0", textAlign: "left", color: "white", marginLeft: "300px",
                textDecoration: "underline", marginTop: "40px", marginBottom: "20px"
            }}
        >
            Choose input option:
        </p>
          
          {/* Input Selection */}
          <div className="mb-4 flex gap-4" style={{ marginLeft: "300px" }}>
            <label className="flex items-center gap-2 cursor-pointer" style={{ marginRight: "50px" }}>
              <input 
                type="radio" 
                name="inputType" 
                value="manual" 
                checked={inputType === "manual"} 
                onChange={() => setInputType("manual")} 
                className="custom-radio"
              />
              <span style={{ marginLeft: "10px", color: "white", fontSize: "20px", marginBottom: "20px" }}>Manual Data Entry</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="inputType" 
                value="json" 
                checked={inputType === "json"} 
                onChange={() => setInputType("json")} 
                className="custom-radio"
              />
              <span style={{ marginLeft: "10px", color: "white", fontSize: "20px", marginBottom: "20px" }}>JSON File</span>
            </label>
          </div>
          
          {/* Input Box */}
          <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-gray-800 p-6 shadow-lg"
            style={{
                marginTop: "20px", marginLeft: "300px", backgroundColor: "#EDEDED", borderRadius: "10px", height: "300px",
                width: inputType === "json" ? "750px" : "1050px", maxWidth: "1200px", border: "1px solid #000000", display: "flex",
            }}
            >
            {inputType === "json" ? (
                <div className="flex flex-col items-center gap-4" style={{ height: "100%", justifyContent: "center" }}>
                <p className="italic" style={{ marginTop: "20px", marginLeft: "30px", marginBottom: "1px", paddingTop: "20px", fontSize: "18px" }}>
                  Select a JSON file from your computer and start the analysis
                </p>
                
                {/* Label for file upload */}
                <label
                  htmlFor="file-upload"
                  className="border border-dashed border-gray-500 p-4 w-full text-center cursor-pointer relative"
                  style={{
                    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                    height: "150px", width: "300px", color: "#333", position: "relative", borderRadius: "8px",
                  }}
                >
                  {/* Small gray box inside the input box */}
                  <input
  type="file"
  accept=".json"
  onChange={(e) => setSelectedFile(e.target.files[0])}
  ref={fileInputRef}
  style={{ display: "none" }}
/>

                  <div
  onClick={() => fileInputRef.current?.click()}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      setSelectedFile(file); // or however you're handling file selection
    }
  }}
  style={{
    backgroundColor: "#D9D9D9",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "left",
    fontSize: "16px",
    color: "#333",
    width: "200px",
    border: "2px dashed #4C484E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginLeft: "-40px",
    marginTop: "-40px",
    cursor: "pointer"
  }}
>
  <img src={attachmentIcon} alt="Attachment Icon" style={{ width: "25px", height: "25px" }} />
  Choose file or drag it here
</div>

                  
              
                  {/* Show file name directly under the gray box */}
                  {selectedFile && (
                    <p style={{ position: "absolute", bottom: "10px", fontSize: "16px", textAlign: "left", 
                      marginLeft: "40px", // smaller margin
                      marginBottom: "20px",
                      width: "calc(100% - 5px)", // make sure it takes the width inside margins
                      overflow: "hidden", // optional: hide overflow
                      textOverflow: "ellipsis", // optional: "..." if too long
                      whiteSpace: "nowrap" }}>
                      Selected file: {selectedFile.name}
                    </p>
                  )}
              
                  <input
                    id="file-upload"
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  />
                </label>
                {/* Show loader spinner if loading */}
                {loading && (
                  <div
                    className="loader"
                    style={{
                      position: "absolute", // Position it over the same container
                      top: "50%", // Vertically centered
                      left: "50%", // Adjusted to move it a bit right of the box (smaller offset)
                      transform: "translate(-50%, -50%)", // Adjust the positioning to center vertically
                    }}
                  ></div>
                )}
              
                {/* Buttons */}
                <div className="flex gap-4 mt-8" style={{ marginLeft: "30px",  }}>
                  <button onClick={handleRealAnalyze} style={{ ...buttonStyle, backgroundColor: "#68CABE", color: "white", marginLeft: "0px" }}>
                    IDENTIFY
                  </button>
                  <>
                    <div className="flex items-center space-x-2" style={{ marginTop: "10px" }}>
                      <label htmlFor="jsonUpload" className="font-semibold">Example JSON Format</label>
                      <button
                        aria-label="Show example JSON format"
                        onClick={() => setShowModal(true)}
                        style={{
                          marginLeft: "10px",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontSize: "1rem",
                          color: "#2563eb"
                        }}
                        onMouseOver={(e) => (e.target.style.color = "#1e40af")}
                        onMouseOut={(e) => (e.target.style.color = "#2563eb")}
                      >
                        ℹ️
                      </button>
                    </div>

                    {showModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
    onClick={() => setShowModal(false)}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <pre
        style={{
          backgroundColor: "#f3f3f3",
          padding: "15px",
          borderRadius: "5px",
          fontSize: "14px",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {exampleJson}
      </pre>
      <button
        onClick={() => setShowModal(false)}
        style={{
          marginTop: "15px",
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
      >
        Close
      </button>
    </div>
  </div>
)}

                  </>
                </div>
              </div>
              
            ) : (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <div className="input-grid">
                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={{ marginTop: "10px", fontStyle: "italic", color: "#666", marginBottom: "-10px" }}>
                    Use commas to separate multiple entries in a single field (e.g. www.google.com, pool.ntp.org)
                  </p>
                </div>

                {/* First row */}
                <div className="input-box">
                  <h3>MAC Address</h3>
                  <input className="input-box input" placeholder="Example: 00-B0-D0-63-C2-26" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} />
                </div>
                <div className="input-box">
                  <h3>DHCP Hostname</h3>
                  <input className="input-box input" placeholder="Example: host1" value={dhcpHostname} onChange={(e) => setDhcpHostname(e.target.value)} />
                </div>
                <div className="input-box">
                  <h3>HTTP User Agent</h3>
                  <input className="input-box input" placeholder="Example: Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0)"
                  value={httpUserAgent} onChange={(e) => setHttpUserAgent(e.target.value)} />
                </div>
                <div className="input-box">
                  <h3>Certificate DNS Names</h3>
                  <input className="input-box input" placeholder="Example: *.tplinkcloud.com, *.tplinkra.com" 
                  value={certificateDnsNames} onChange={(e) => setCertificateDnsNames(e.target.value)} />
                </div>

                {/* Second row */}
                <div className="input-box">
                  <h3>Domains</h3>
                  <input className="input-box input" placeholder="Example: example.com" value={domains} onChange={(e) => setDomains(e.target.value)} />
                </div>
                <div className="input-box">
                  <h3>DNS PTR</h3>
                  <input className="input-box input" placeholder="Example: mailserver.example.org" value={dnsPtr} onChange={(e) => setDnsPtr(e.target.value)} />
                </div>
                <div className="input-box">
                  <h3>TLS Server Name</h3>
                  <input className="input-box input" placeholder="Example: use1-api.tplinkra.com" value={tlsServerName} onChange={(e) => setTlsServerName(e.target.value)} />
                </div>
                <div className="input-box">
                <button
                  style={{ ...buttonStyle, backgroundColor: "#68CABE", color: "white", marginTop: "40px" }}
                  onClick={handleManualAnalyze}
                >
                  IDENTIFY
                </button>
                {/* <button onClick={downloadManualJson}>
                  Download Manual JSON
                </button> */}
                </div>
              </div>
              {/* Loader - OVERLAY the entire input-grid */}
              {loading && (
                <div
                  className="loader"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              )}
            </div>
            )}
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InputScreen;
