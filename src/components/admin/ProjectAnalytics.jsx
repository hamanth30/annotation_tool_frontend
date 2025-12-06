import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_BASE_URL = "http://localhost:8000";

const ProjectAnalytics = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [taskCounts, setTaskCounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("json"); // "json" or "xml"
  const [downloading, setDownloading] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  // Fetch all projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/get_all_projects`
        );
        setProjects(response.data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects");
      }
    };

    fetchProjects();
  }, []);

  // Fetch task counts when project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchTaskCounts(selectedProject);
    } else {
      setTaskCounts(null);
    }
  }, [selectedProject]);

  const fetchTaskCounts = async (projectName) => {
    setLoading(true);
    setError("");
    try {
      const url = `${API_BASE_URL}/api/admin/projects/${encodeURIComponent(projectName)}/task-counts`;
      console.log("Fetching task counts from:", url);
      const response = await axios.get(url);
      setTaskCounts(response.data);
    } catch (err) {
      console.error("Error fetching task counts:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to load task counts for this project";
      setError(errorMessage);
      setTaskCounts(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOutput = async () => {
  if (!selectedProject) {
    setError("Please select a project before downloading output.");
    return;
  }

  setError("");
  setDownloading(true);

  try {
    // Decide which endpoint to call
    const endpoint =
      downloadFormat === "json"
        ? `/api/admin/download-folder/${encodeURIComponent(selectedProject)}`
        : `/api/admin/download-xml/${encodeURIComponent(selectedProject)}`;

    const url = `${API_BASE_URL}${endpoint}`;
    console.log("Downloading from:", url);

    // Request zip file as blob
    const response = await axios.get(url, {
      responseType: "blob",
    });

    // Create a Blob and trigger browser download
    const blob = new Blob([response.data], { type: "application/zip" });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeProjectName = selectedProject.replace(/\s+/g, "_");

    // Filename based on your backend naming
    const fileName =
      downloadFormat === "json"
        ? `${safeProjectName}_labels.zip`
        : `${safeProjectName}_xml_files.zip`;

    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error("Error downloading output:", err);
    const msg =
      err.response?.data?.detail ||
      err.message ||
      "Failed to download output file";
    setError(msg);
  } finally {
    setDownloading(false);
  }
};

  const handleDownloadCsv = async () => {
  if (!selectedProjectObj) {
    setError("Please select a project before downloading CSV.");
    return;
  }

  setError("");
  setDownloadingCsv(true);

  try {
    const projectId = selectedProjectObj.id;

    // Adjust path prefix if needed (assuming router prefix is /api/admin)
    const url = `${API_BASE_URL}/api/admin/project/${encodeURIComponent(
      projectId
    )}/csv`;

    console.log("Downloading CSV from:", url);

    const response = await axios.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeProjectName = selectedProject.replace(/\s+/g, "_");
    const fileName = `project_${safeProjectName}.csv`;

    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error("Error downloading CSV:", err);
    const msg =
      err.response?.data?.detail ||
      err.message ||
      "Failed to download CSV file";
    setError(msg);
  } finally {
    setDownloadingCsv(false);
  }
};



  // Prepare data for charts
  const prepareChartData = () => {
    if (!taskCounts?.counts) return [];

    const { counts } = taskCounts;
    return [
      { name: "Raw (Pending)", value: counts.raw || 0, status: "raw" },
      { name: "Assigned", value: counts.assigned || 0, status: "assigned" },
      { name: "Review", value: counts.review || 0, status: "review" },
      { name: "Completed", value: counts.completed || 0, status: "completed" },
    ];
  };

  const selectedProjectObj = projects.find(
  (p) => p.name === selectedProject
    );

  const chartData = prepareChartData();
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

  return (
        <div className="space-y-6">
            {/* Project Selection Dropdown */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Left: Project selection */}
            <div className="w-full md:w-1/2">
              <label
                htmlFor="project-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Project
              </label>
              <select
                id="project-select"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Choose a project --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.name}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Middle: Productivity CSV download */}
            <div className="w-full md:w-52">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Productivity CSV
              </label>
              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={!selectedProjectObj || downloadingCsv}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition
                  ${
                    !selectedProjectObj || downloadingCsv
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
              >
                {downloadingCsv
                  ? "Downloading..."
                  : selectedProject
                  ? "Download CSV"
                  : "Select a project first"}
              </button>
            </div>

            {/* Right: Output download controls */}
            <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-end gap-3">
              <div className="w-full md:w-40">
                <label
                  htmlFor="output-format"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Output format
                </label>
                <select
                  id="output-format"
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="json">JSON (labels.zip)</option>
                  <option value="xml">XML (xml_files.zip)</option>
                </select>
              </div>

              <div className="w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadOutput}
                  disabled={!selectedProject || downloading}
                  className={`w-full md:w-auto px-4 py-2 rounded-lg text-sm font-medium text-white transition
                    ${
                      !selectedProject || downloading
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                >
                  {downloading
                    ? "Downloading..."
                    : selectedProject
                    ? `Download ${downloadFormat.toUpperCase()}`
                    : "Select a project first"}
                </button>
              </div>
            </div>
          </div>


      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading analytics...
        </div>
      )}

      {/* Charts */}
      {!loading && taskCounts && chartData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-400">
              <p className="text-sm text-gray-600">Raw (Pending)</p>
              <p className="text-2xl font-bold text-gray-800">
                {taskCounts.counts.raw || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-400">
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-blue-800">
                {taskCounts.counts.assigned || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-400">
              <p className="text-sm text-gray-600">Review</p>
              <p className="text-2xl font-bold text-yellow-800">
                {taskCounts.counts.review || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-800">
                {taskCounts.counts.completed || 0}
              </p>
            </div>
          </div>

          {/* Total Count Card */}
          <div className="bg-indigo-50 rounded-lg shadow-sm p-4 border border-indigo-200">
            <p className="text-sm text-indigo-600 font-medium">Total Tasks</p>
            <p className="text-3xl font-bold text-indigo-800">
              {taskCounts.total || 0}
            </p>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Task Status Distribution (Bar Chart)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Task Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Task Status Distribution (Pie Chart)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !taskCounts && !error && selectedProject && (
        <div className="text-center py-8 text-gray-500">
          No data available for this project.
        </div>
      )}

      {/* Initial State */}
      {!selectedProject && !loading && (
        <div className="text-center py-8 text-gray-500">
          Please select a project to view analytics.
        </div>
      )}
    </div>
  );
};

export default ProjectAnalytics;

