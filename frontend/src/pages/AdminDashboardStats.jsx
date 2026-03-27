import { useEffect, useState } from "react";
import API from "../api/axios";

const AdminDashboardStats = () => {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await API.get("/tickets/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) return <p className="p-6">Loading stats...</p>;

  return (
    <div className="px-4 py-0 text-gray-800">
      <h2 className="text-2xl font-bold mb-3 ">Dashboard</h2>

      {/* 🔥 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
        <Card title="Total Tickets" value={stats.total} />
        <Card title="Open Tickets" value={stats.status.open} />
        <Card title="Closed Tickets" value={stats.status.closed} />
      </div>

      {/* 🔥 Status Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow mb-4">
        <h3 className="font-semibold text-sm mb-4">Status Overview</h3>
        <div className="flex gap-6">
          <Badge label="Open" value={stats.status.open} color="blue" />
          <Badge label="In Progress" value={stats.status.in_progress} color="yellow" />
          <Badge label="Closed" value={stats.status.closed} color="green" />
        </div>
      </div>

      {/* 🔥 Priority */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold text-sm mb-4">Priority Distribution</h3>
        <div className="flex gap-6">
          <Badge label="High" value={stats.priority.High} color="red" />
          <Badge label="Medium" value={stats.priority.Medium} color="yellow" />
          <Badge label="Low" value={stats.priority.Low} color="green" />
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow text-center">
    <p className="text-gray-800 text-sm ">{title}</p>
    <h2 className="text-2xl text-gray-800 font-bold mt-2 ">{value}</h2>
  </div>
);

const Badge = ({ label, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className={`px-4 py-1 text-sm rounded ${colors[color]}`}>
      {label}: {value}
    </div>
  );
};

export default AdminDashboardStats;