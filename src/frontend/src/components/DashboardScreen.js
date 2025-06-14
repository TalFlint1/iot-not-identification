import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { motion } from "framer-motion";
import { Package, Star } from "lucide-react";
import UpperBar from "./UpperBar";
import sidebarImage from "../Icons/sidebar.png";
import Title from "./Title";
import UsageCard from "./UsageCard";
import RecentActivityTable from "./RecentActivityTable";
import ConfidenceAlertsTable from "./ConfidenceAlerts";
import CircularConfidenceCard from "./CircularConfidenceCard";
import { useState, useEffect } from "react";
import RawJsonModal from "./RawJsonModal";

const getVendorLogoURL = (vendorName) => 
  `https://logo.clearbit.com/${vendorName.toLowerCase()}.com`;


const DashboardScreen = () => {
  const username = "Tal";

  const [devicesIdentified, setDevicesIdentified] = useState(null);
  const [error, setError] = useState(null);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [recentIdentifications, setRecentIdentifications] = useState([]);
  const [confidenceAlerts, setConfidenceAlerts] = useState([]);
  const [monthlyDeviceData, setMonthlyDeviceData] = useState([]);
  const [topVendor, setTopVendor] = useState("");
  const [topVendors, setTopVendors] = useState([]);
  const [topFunctions, setTopFunctions] = useState([]);
  const [apiUsed, setApiUsed] = useState(0);
  const apiLimit = 200;
  const [totalUsed, setTotalUsed] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (item) => {
    setSelectedRow(item);
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch('http://localhost:5000/dashboard-summary/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDevicesIdentified(data.devices_identified);
        setAverageConfidence(data.average_confidence);
      } catch (err) {
        console.error('Failed to fetch dashboard summary:', err);
        setError('Failed to load data');
      }
    };

    fetchDashboardSummary();
  }, []);

  useEffect(() => {
    const fetchRecentIdentifications = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch('http://localhost:5000/recent-identifications/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRecentIdentifications(data.recent_identifications);
      } catch (err) {
        console.error('Failed to fetch recent identifications:', err);
        setError('Failed to load recent identifications');
      }
    };

    fetchRecentIdentifications();
  }, []);

  useEffect(() => {
    const fetchConfidenceAlerts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch('http://localhost:5000/confidence-alerts/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setConfidenceAlerts(data.confidence_alerts);
      } catch (err) {
        console.error('Failed to fetch confidence alerts:', err);
      }
    };

    fetchConfidenceAlerts();
  }, []);

  useEffect(() => {
    const fetchDevicesOverTime = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://localhost:5000/monthly-devices/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const transformed = result.data.map(entry => ({
          month: entry.month,
          devices: entry.devices
        }));
        setMonthlyDeviceData(transformed);
      } catch (err) {
        console.error("Failed to fetch devices over time:", err);
      }
    };

    fetchDevicesOverTime();
  }, []);

  useEffect(() => {
    const fetchTopVendor = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://localhost:5000/top-vendor/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTopVendor(data.vendor || "N/A");
      } catch (error) {
        console.error("Failed to fetch top vendor:", error);
      }
    };

    fetchTopVendor();
  }, []);

  useEffect(() => {
    const fetchTopVendors = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://localhost:5000/top-vendors-chart/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        const rawData = data.vendor || [];

        // Transform for chart compatibility
        const formattedData = rawData.map(item => ({
          name: item.vendor,
          devices: item.count,
        }));

        setTopVendors(formattedData);
      } catch (error) {
        console.error("Failed to fetch top vendor:", error);
      }
    };

    fetchTopVendors();
  }, []);

  useEffect(() => {
    const fetchTopFunctions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://localhost:5000/top-functions/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        const rawData = data.function || [];

        // Transform for chart compatibility
        const formattedData = rawData.map(item => ({
          name: item["function"],
          devices: item.count,
        }));

        setTopFunctions(formattedData);
      } catch (error) {
        console.error("Failed to fetch top functions:", error);
      }
    };

    fetchTopFunctions();
  }, []);

  useEffect(() => {
    const fetchSerpApiUsage = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://localhost:5000/serpapi-usage/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setApiUsed(data.serpapi_queries_this_month);
          setTotalUsed(data.serpapi_queries);
        } else {
          console.error("Failed to fetch SerpAPI usage:", data.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching SerpAPI usage:", error);
      }
    };

    fetchSerpApiUsage();
  }, []);


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
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#343C42",
          color: "white",
          overflowY: "auto",
        }}
      >
        <UpperBar username={username} />
        <Title />

        {/* Dashboard Content */}
        <div
        style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
        }}
        >

        {/* ROW 1: Summary Cards */}
        <div
            style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            }}
        >
            <SummaryCard
              icon={<Package size={64} />}
              title="Devices Identified"
              value={devicesIdentified !== null ? devicesIdentified : 'Loading...'}
            />
            <CircularConfidenceCard confidencePercentage={averageConfidence} />
            <UsageCard used={apiUsed} limit={apiLimit} total={totalUsed} />
            <SummaryCard
                title="Top Vendor"
                value={topVendor}
                    icon={
                    <img
                    src={getVendorLogoURL(topVendor)}
                    alt={`${topVendor} logo`}
                    style={{ width: 64, height: 64, objectFit: "contain" }}
                    />
                }
            />
        </div>

        {/* ROW 2: Tables */}
        <div
            style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            }}
        >
            <motion.div
            style={{ width: "100%" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            >
            <RecentActivityTable data={recentIdentifications} />
            </motion.div>

            <motion.div
            style={{ width: "100%" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            >
            <ConfidenceAlertsTable data={confidenceAlerts} onRowClick={handleRowClick}/>
            {modalOpen && (
              <RawJsonModal
                item={selectedRow}
                onClose={() => setModalOpen(false)}
              />
            )}
            </motion.div>
        </div>

        {/* ROW 3: Charts */}
        <div
            style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 2fr",
            gap: "24px",
            alignItems: "start",
            }}
        >
            <ChartCard title="Top Vendors">
            <BarChart
                width={300}
                height={300}
                data={topVendors}
                margin={{ top: 20, right: 0, bottom: 0, left: -30 }}
            >
                <XAxis dataKey="name" angle={0} textAnchor="end" interval={0} style={{ fontSize: '12px' }} dx={25} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="devices" fill="#60A5FA" />
            </BarChart>
            </ChartCard>

            <ChartCard title="Top Functions">
              <BarChart
                width={300}
                height={300}
                data={topFunctions}
                margin={{ top: 20, right: 0, bottom: 10, left: -30 }}
              >
                <XAxis
                  dataKey="name"
                  angle={-10}
                  textAnchor="end"
                  interval={0}
                  style={{ fontSize: '12px' }}
                  dx={15}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="devices" fill="#9F7AEA" />
              </BarChart>
            </ChartCard>

            <ChartCard title="Devices Identified Over Time">
            <LineChart
                width={700}
                height={300}
                data={monthlyDeviceData}
                margin={{ top: 20, right: 30, bottom: 0, left: -30 }}
            >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                type="monotone"
                dataKey="devices"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 4 }}
                />
            </LineChart>
            </ChartCard>
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
      <div style={{ fontSize: "28px", color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: "42px", fontWeight: "bold" }}>{value}</div>
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
