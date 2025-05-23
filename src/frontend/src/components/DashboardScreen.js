import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { motion } from "framer-motion";
import { Package, Clock, Brain } from "lucide-react";
import UpperBar from "./UpperBar";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UsageCard from "./UsageCard";
import RecentActivityTable from "./RecentActivityTable";
const data = [
  { name: "Amazon", devices: 10 },
  { name: "Samsung", devices: 8 },
  { name: "Cisco", devices: 5 },
];

const functionBreakdown = [
  { name: "Sensor", count: 12 },
  { name: "Lock", count: 6 },
  { name: "Bulb", count: 3 },
  { name: "Camera", count: 4}
];

const monthlyDeviceData = [
  { month: "Jan", devices: 3 },
  { month: "Feb", devices: 5 },
  { month: "Mar", devices: 8 },
  { month: "Apr", devices: 6 },
  { month: "May", devices: 10 },
  { month: "Jun", devices: 12 },
  { month: "Jul", devices: 5}
];

const recentIdentifications = [
  { time: "2 minutes ago", vendor: "Samsung", function: "Sensor" },
  { time: "1 hour ago", vendor: "Google", function: "Camera" },
  { time: "Yesterday", vendor: "Philips", function: "Lighting" },
];

// Fake API usage data
const apiUsed = 45;
const apiLimit = 100;

const DashboardScreen = () => {
  const username = "Tal";

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
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
        }}
      />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#343C42", color: "white", overflowY: "auto" }}>
        <UpperBar username={username} />
        <Title />

        {/* Dashboard Content */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* Summary Cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-between" }}>
            <SummaryCard icon={<Package size={32} />} title="Devices Identified" value="24" />
            <SummaryCard icon={<Brain size={32} />} title="Avg Confidence" value="91%" />
            <UsageCard used={apiUsed} limit={apiLimit} />
          </div>

          <RecentActivityTable data={recentIdentifications} />


          {/* Charts Section */}
          <div style={{ display: "flex", flexDirection: "row", gap: "24px", justifyContent: "center" }}>
            <div style={{ width: 350, height: 300 }}>
              <ChartCard title="Top Vendors">
                <BarChart width={300} height={300} data={data} margin={{ top: 20, right: 0, bottom: 0, left: -30 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="devices" fill="#3b82f6" />
                </BarChart>
                </ChartCard>
            </div>

            <div style={{ width: 350, height: 300 }}>
                <ChartCard title="Function Categories">
                    <BarChart width={300} height={300} data={functionBreakdown} margin={{ top: 20, right: 0, bottom: 0, left: -30 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                </ChartCard>
            </div>

            <div style={{ width: 720, height: 300, marginTop: 40 }}>
            <ChartCard title="Devices Identified Over Time">
                <LineChart width={700} height={250} data={monthlyDeviceData} margin={{ top: 20, right: 30, bottom: 0, left: -30 }}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="devices" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
            </ChartCard>
            </div>
          </div>

          {/* Call-To-Action Buttons */}
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "20px" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "12px 24px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Re-Identify Devices
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              style={{
                backgroundColor: "#374151",
                color: "white",
                padding: "12px 24px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Export Report
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, title, value }) => (
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
      alignItems: "center",
      gap: "16px",
      color: "black",
      minWidth: "200px",
    }}
  >
    <div style={{ color: "#2563eb" }}>{icon}</div>
    <div>
      <div style={{ fontSize: "14px", color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</div>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
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
    }}
  >
    <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>{title}</h2>
    {children}
  </motion.div>
);

export default DashboardScreen;
