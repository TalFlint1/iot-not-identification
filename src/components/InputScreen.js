import { useState } from "react";
import Title from "./Title";
import sidebarImage from "../Icons/sidebar.png";
import './InputScreen.css'; // Make sure the path is correct

const InputScreen = () => {
  const [inputType, setInputType] = useState("json"); // Default to JSON file

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
                fontSize: "22px",  // Adjust the font size
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
                fontSize: "18px",  // Adjust the font size
                margin: "10px 0",  // Add some margin for spacing
                textAlign: "left",  // Center align the text
                color: "white",  // Set the text color to white
                marginLeft: "200px",
                textDecoration: "underline",
                marginTop: "40px"
            }}
        >
            Choose input option:
        </p>
          
          {/* Input Selection */}
          <div className="mb-4 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="inputType" 
                value="manual" 
                checked={inputType === "manual"} 
                onChange={() => setInputType("manual")} 
                className="custom-radio"
              />
              Manual Data Entry
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
              JSON File
            </label>
          </div>
          
          {/* Input Box */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-lg">
            {inputType === "json" ? (
              <div className="flex flex-col items-center gap-4">
                <p className="italic">Select your JSON file from your computer or drag and drop it into the box below</p>
                <input type="file" className="border border-dashed border-gray-500 p-4 w-full text-center" />
                <div className="flex gap-4">
                  <button className="bg-green-300 text-black px-4 py-2 rounded-lg">UPLOAD</button>
                  <button className="bg-teal-400 text-black px-4 py-2 rounded-lg">IDENTIFY</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <input className="p-2 bg-gray-700 rounded" placeholder="MAC Address" />
                <input className="p-2 bg-gray-700 rounded" placeholder="HTTP User Agent" />
                <input className="p-2 bg-gray-700 rounded" placeholder="DHCP Hostname" />
                <input className="p-2 bg-gray-700 rounded" placeholder="Domains" />
                <input className="p-2 bg-gray-700 rounded" placeholder="DNS PTR" />
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
