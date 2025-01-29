import { useState } from "react";
import Title from "./Title";
import sidebarImage from "../Icons/sidebar.png";
import './InputScreen.css'; // Make sure the path is correct
import attachmentIcon from "../Icons/attachment.png"; // Adjust path if needed


const InputScreen = () => {
  const [inputType, setInputType] = useState("json"); // Default to JSON file
  const [selectedFile, setSelectedFile] = useState(null); // State for file name

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name); // Update state with file name
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#343C42", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div
        style={{
          backgroundImage: `url(${sidebarImage})`,
          backgroundColor: "#343C42",
          backgroundSize: "contain",
          backgroundPosition: "left",
          backgroundRepeat: "no-repeat",
          height: "100%",
          width: "14%",
          margin: 0,
          padding: 0,
        }}
      ></div>
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Title />
        <div className="flex flex-col items-center text-white p-6">
        <p
            style={{
                fontSize: "20px",  // Adjust the font size
                margin: "10px 0",  // Add some margin for spacing
                textAlign: "left",  // Center align the text
                color: "white",  // Set the text color to white
                marginLeft: "200px",
            }}
        >
            Find out easily what devices are on your network
        </p>


          {/* New "Choose input option:" text */}
          <p
            style={{
                fontSize: "22px",  // Adjust the font size
                margin: "10px 0",  // Add some margin for spacing
                textAlign: "left",  // Center align the text
                color: "white",  // Set the text color to white
                marginLeft: "200px",
                textDecoration: "underline",
                marginTop: "40px",
                marginBottom: "20px"
            }}
        >
            Choose input option:
        </p>
          
          {/* Input Selection */}
          <div className="mb-4 flex gap-4" style={{ marginLeft: "200px" }}>
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
                marginTop: "20px",
                marginLeft: "200px",
                backgroundColor: "#EDEDED",
                borderRadius: "10px", // More rounded corners
                height: "300px", // Taller box
                width: "60%", // Thinner box
                maxWidth: "800px", // Limit the maximum width
                display: "flex",
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
                    display: "flex",
                    flexDirection: "column", // Arrange children vertically
                    justifyContent: "center",
                    alignItems: "center",
                    height: "150px",
                    width: "200px",
                    color: "#333",
                    position: "relative",
                    borderRadius: "8px",
                  }}
                >
                  {/* Small gray box inside the input box */}
                  <div
                    style={{
                      backgroundColor: "#D9D9D9",
                      padding: "10px",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "16px",
                      color: "#333",
                      width: "180px",
                      border: "2px dashed #4C484E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      marginLeft: "40px",
                      marginTop: "-40px"
                    }}
                  >
                    <img src={attachmentIcon} alt="Attachment Icon" style={{ width: "25px", height: "25px" }} />
                    Choose file or drag it here
                  </div>
              
                  {/* Show file name directly under the gray box */}
                  {selectedFile && (
                    <p style={{ position: "absolute", bottom: "10px", fontSize: "16px", textAlign: "center", 
                    marginLeft: "20px", marginBottom: "20px" }}>
                      Selected file: {selectedFile}
                    </p>
                  )}
              
                  <input
                    id="file-upload"
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => setSelectedFile(e.target.files[0]?.name || "")}
                  />
                </label>
              
                {/* Buttons */}
                <div className="flex gap-4 mt-8" style={{ width: "200px", marginLeft: "30px" }}>
                  <button className="bg-green-300 text-black px-4 py-2 rounded-lg">CONFIRM UPLOAD</button>
                  <button className="bg-teal-400 text-black px-4 py-2 rounded-lg">IDENTIFY</button>
                </div>
              </div>
              
            ) : (
                <div className="grid grid-cols-2 gap-4" style={{ height: "100%", justifyContent: "center", paddingTop: "20px" }}>
                <input
                    className="p-2 bg-gray-700 rounded"
                    placeholder="MAC Address"
                    style={{ backgroundColor: "#FFF" }}
                />
                <input
                    className="p-2 bg-gray-700 rounded"
                    placeholder="HTTP User Agent"
                    style={{ backgroundColor: "#FFF" }}
                />
                <input
                    className="p-2 bg-gray-700 rounded"
                    placeholder="DHCP Hostname"
                    style={{ backgroundColor: "#FFF" }}
                />
                <input
                    className="p-2 bg-gray-700 rounded"
                    placeholder="Domains"
                    style={{ backgroundColor: "#FFF" }}
                />
                <input
                    className="p-2 bg-gray-700 rounded"
                    placeholder="DNS PTR"
                    style={{ backgroundColor: "#FFF" }}
                />
                <button className="bg-teal-400 text-black px-4 py-2 rounded-lg col-span-2">IDENTIFY</button>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default InputScreen;
