import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  Eye,
  Trash2,
  User,
  PlusCircle,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { adminAPI } from "../../services/api";

const NewProject = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [boxType, setBoxType] = useState("2D");
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [selectedAnnotators, setSelectedAnnotators] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [annotators, setAnnotators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch users from backend on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await adminAPI.getAllUsers();
      setAnnotators(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Fallback to hardcoded users if API fails
      setAnnotators([
        { id: 1, name: "Hemanth", email: "hemanth@vista.com" },
        { id: 2, name: "Mahaashri", email: "mahaashri@vista.com" },
        { id: 3, name: "Saravanan", email: "saravanan@vista.com" },
        { id: 4, name: "Dharshini", email: "dharshini@vista.com" },
      ]);
    }
  };

  // Handle selecting annotators
  const toggleAnnotator = (id) => {
    setSelectedAnnotators((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Handle adding labels
  const addLabel = () => {
    if (newLabel.trim() !== "") {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel("");
    }
  };

  // Remove individual label
  const removeLabel = (label) => {
    setLabels((prev) => prev.filter((l) => l !== label));
  };

  // Handle clear text box
  const clearLabelInput = () => {
    setNewLabel("");
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newUploads = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setUploadedImages((prev) => [...prev, ...newUploads]);
  };

  // Remove image
  const removeImage = (name) => {
    setUploadedImages((prev) => prev.filter((img) => img.name !== name));
  };

  // Form submit
  const handleCreate = async () => {
    if (!projectName) {
      setError("Please enter a project name!");
      return;
    }

    if (uploadedImages.length === 0) {
      setError("Please upload at least one image!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Create the project
      console.log("Creating project...");
      const projectData = {
        name: projectName,
        description: description,
        labels: labels,
      };

      const projectResponse = await adminAPI.createProject(projectData);
      console.log("Project created:", projectResponse);

      // Step 2: Add project members (if any selected)
      if (selectedAnnotators.length > 0) {
        console.log("Adding project members...");
        const selectedUsers = annotators.filter((a) =>
          selectedAnnotators.includes(a.id)
        );
        
        await adminAPI.addProjectMembers(projectName, selectedUsers);
        console.log("Project members added successfully");
      }

      // Step 3: Upload files to S3
      console.log("Uploading files to S3...");
      const files = uploadedImages.map((img) => img.file);
      const uploadResponse = await adminAPI.uploadFilesToS3(
        projectName,
        files,
        projectResponse.project.id
      );
      console.log("Files uploaded:", uploadResponse);

      setSuccess(
        `Project "${projectName}" created successfully! ${uploadResponse.files_uploaded} files uploaded.`
      );

      // Reset form
      setProjectName("");
      setDescription("");
      setLabels([]);
      setSelectedAnnotators([]);
      setUploadedImages([]);

    } catch (error) {
      console.error("Error creating project:", error);
      setError(error.message || "Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 mb-12">
      <h2 className="text-3xl font-semibold text-indigo-600 mb-6 text-center">
        Create New Project
      </h2>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Project Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Bounding Box Type
          </label>
          <select
            value={boxType}
            onChange={(e) => setBoxType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
            disabled={loading}
          >
            <option value="2D">2D</option>
            <option value="3D">3D</option>
          </select>
        </div>
      </div>

      {/* Project Description */}
      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">
          Project Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description (optional)"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
          disabled={loading}
        />
      </div>

      {/* Team Members */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Add Team Members
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {annotators.map((user) => (
            <div
              key={user.id}
              onClick={() => !loading && toggleAnnotator(user.id)}
              className={`flex items-center p-4 border rounded-lg transition ${
                loading 
                  ? "cursor-not-allowed opacity-50" 
                  : "cursor-pointer"
              } ${
                selectedAnnotators.includes(user.id)
                  ? "bg-indigo-100 border-indigo-500"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAnnotators.includes(user.id)}
                onChange={() => !loading && toggleAnnotator(user.id)}
                disabled={loading}
                className="mr-3 h-5 w-5 accent-indigo-600 cursor-pointer"
              />
              <User className="text-indigo-600 mr-3" />
              <div>
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Labels Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Labels
        </h3>

        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Enter label name"
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-indigo-400 outline-none"
            disabled={loading}
          />
          <button
            onClick={addLabel}
            disabled={loading}
            className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add Label"
          >
            <Check size={20} />
          </button>
          <button
            onClick={clearLabelInput}
            disabled={loading}
            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear"
          >
            <X size={20} />
          </button>
        </div>

        {labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {labels.map((label, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-sm"
              >
                <span>{label}</span>
                <X
                  size={16}
                  className="cursor-pointer text-red-500 hover:text-red-700"
                  onClick={() => removeLabel(label)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Images */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Upload Images
        </h3>

        <label
          htmlFor="fileUpload"
          className={`flex flex-col items-center justify-center w-full border-2 border-dashed border-indigo-400 rounded-xl py-10 transition ${
            loading 
              ? "cursor-not-allowed opacity-50" 
              : "cursor-pointer hover:bg-indigo-50"
          }`}
        >
          <UploadCloud className="text-indigo-500 mb-3" size={40} />
          <span className="text-indigo-600 font-medium">
            {loading ? "Uploading..." : "Click or drag to upload images"}
          </span>
          <input
            id="fileUpload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
            className="hidden"
          />
        </label>

        {uploadedImages.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploadedImages.map((img) => (
              <div
                key={img.name}
                className="flex justify-between items-center border rounded-lg px-4 py-2 bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Eye
                    className="text-indigo-500 cursor-pointer"
                    size={18}
                    onClick={() => window.open(img.url, "_blank")}
                  />
                  <p className="text-gray-800">{img.name}</p>
                </div>
                <Trash2
                  className="text-red-500 cursor-pointer"
                  size={18}
                  onClick={() => removeImage(img.name)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <button 
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          {loading ? "Creating..." : "Create Tasks"}
        </button>
      </div>
    </div>
  );
};

export default NewProject;
