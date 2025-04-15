import { useState } from "react";
import Title from "./Title";
import sidebarImage from "../Icons/sidebar.png";
import './InputScreen.css'; // Make sure the path is correct
import attachmentIcon from "../Icons/attachment.png"; // Adjust path if needed
import UpperBar from "./UpperBar";
import { useNavigate } from "react-router-dom";

const InputScreen = () => {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("json"); // Default to JSON file
  const [selectedFile, setSelectedFile] = useState(null);
  const [focusedInput, setFocusedInput] = useState(""); // State to manage which input box is clicked

  const handleRealAnalyze = async () => {
    if (!selectedFile) {
      alert("Please select a CSV file before identifying.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const response = await fetch("http://localhost:5000/analyze_device/", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to analyze device");
      }
  
      const data = await response.json();
      console.log("Response data:", data);
      // Navigate to result with the first device (assuming only one row for now)
      navigate("/result", { state: { resultData: data } });
    } catch (error) {
      console.error("Error during analysis:", error);
      alert("Something went wrong while identifying the device.");
    }
  };
  

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name); // Update state with file name
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
          <div
            className="bg-gray-800 p-6 shadow-lg"
            style={{
                marginTop: "20px", marginLeft: "300px", backgroundColor: "#EDEDED", borderRadius: "10px", height: "300px",
                width: inputType === "json" ? "750px" : "800px", maxWidth: "1200px", border: "1px solid #000000", display: "flex",
            }}
            >
            {inputType === "json" ? (
                <div className="flex flex-col items-center gap-4" style={{ height: "100%", justifyContent: "center" }}>
                <p className="italic" style={{ marginTop: "20px", marginLeft: "30px", marginBottom: "1px", paddingTop: "20px", fontSize: "18px" }}>
                  Select your JSON file from your computer or drag and drop it into the box below
                </p>
                
                {/* Label for file upload */}
                <label
                  htmlFor="file-upload"
                  className="border border-dashed border-gray-500 p-4 w-full text-center cursor-pointer relative"
                  style={{
                    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                    height: "150px", width: "200px", color: "#333", position: "relative", borderRadius: "8px",
                  }}
                >
                  {/* Small gray box inside the input box */}
                  <div
                    style={{
                      backgroundColor: "#D9D9D9", padding: "10px", borderRadius: "8px", textAlign: "left", fontSize: "16px", color: "#333",
                      width: "200px", border: "2px dashed #4C484E", display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "8px", marginLeft: "60px", marginTop: "-40px", cursor: "pointer"
                    }}
                  >
                    <img src={attachmentIcon} alt="Attachment Icon" style={{ width: "25px", height: "25px" }} />
                    Choose file or drag it here
                  </div>
              
                  {/* Show file name directly under the gray box */}
                  {selectedFile && (
                    <p style={{ position: "absolute", bottom: "10px", fontSize: "16px", textAlign: "center", 
                    marginLeft: "20px", marginBottom: "20px" }}>
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
              
                {/* Buttons */}
                <div className="flex gap-4 mt-8" style={{ marginLeft: "30px",  }}>
                  <button onClick={handleRealAnalyze} style={{ ...buttonStyle, backgroundColor: "#68CABE", color: "white", marginLeft: "0px" }}>
                    IDENTIFY
                  </button>
                </div>
              </div>
              
            ) : (
              <div className="input-grid">
                {/* First row */}
                <div className="input-box">
                  <h3>MAC Address</h3>
                  <input className="input-box input" placeholder="Example: 00-B0-D0-63-C2-26" />
                </div>
                <div className="input-box">
                  <h3>DHCP Hostname</h3>
                  <input className="input-box input" placeholder="Example: host1" />
                </div>
                <div className="input-box">
                  <h3>HTTP User Agent</h3>
                  <input className="input-box input" placeholder="Example: Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0)" />
                </div>

                {/* Second row */}
                <div className="input-box">
                  <h3>Domains</h3>
                  <input className="input-box input" placeholder="Example: example.com" />
                </div>
                <div className="input-box">
                  <h3>DNS PTR</h3>
                  <input className="input-box input" placeholder="Example: mailserver.example.org" />
                </div>
                <div className="input-box">
                  <button style={{ ...buttonStyle, backgroundColor: "#68CABE", color: "white", marginTop: "40px" }}>IDENTIFY</button>
                </div>
              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default InputScreen;
