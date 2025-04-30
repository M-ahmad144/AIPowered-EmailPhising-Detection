"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Trash,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";

import axios from "axios";

export default function AdminLogsDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  // Fetch all logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("api/admin/logs/all");
      // Handle the data structure where logs are in response.data.logs
      const logsData = response.data.logs || response.data;
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      showNotification(
        `Error fetching logs: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle log deletion
  const handleDeleteLog = async (logId) => {
    setLoading(true);
    try {
      await axios.delete(`api/admin/logs/${logId}`);

      // Remove the deleted log from the UI
      setLogs(logs.filter((log) => log._id !== logId));

      showNotification("Log deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting log:", error);
      showNotification(
        `Error deleting log: ${error.response?.data?.message || error.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Filter logs based on search term
  const filteredLogs = Array.isArray(logs)
    ? logs.filter(
        (log) =>
          log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      info: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <h1 className="font-bold text-gray-900 text-3xl">
            Admin Logs Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Notification */}
        {notification && (
          <div
            className={`mb-4 p-4 rounded-md ${
              notification.type === "error"
                ? "bg-red-50 text-red-800"
                : notification.type === "success"
                ? "bg-green-50 text-green-800"
                : notification.type === "warning"
                ? "bg-yellow-50 text-yellow-800"
                : "bg-blue-50 text-blue-800"
            } relative`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === "error" && (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                {notification.type === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {notification.type === "warning" && (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="top-4 right-4 absolute"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white shadow p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-gray-800 text-xl">System Logs</h2>
            <button
              onClick={fetchLogs}
              className="hover:bg-gray-100 p-2 rounded-full"
              title="Refresh logs"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              className="block bg-white py-2 pr-3 pl-10 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:text-sm leading-5 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Logs Table */}
          {loading ? (
            <div className="flex flex-col items-center py-8 text-gray-500 text-center">
              <Loader2 className="mb-2 w-8 h-8 text-blue-500 animate-spin" />
              <span>Loading logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-8 text-gray-500 text-center">
              {logs.length === 0
                ? "No logs found"
                : "No logs match your search"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="divide-y divide-gray-200 min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider"
                    >
                      User ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider"
                    >
                      Action
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider"
                    >
                      IP Address
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {log.userId || "Unknown"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 text-sm whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {formatDate(log.timestamp || log.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-medium text-sm text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteLog(log._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete log"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
