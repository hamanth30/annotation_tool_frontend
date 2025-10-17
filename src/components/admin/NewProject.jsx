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

const NewProject = () => {
  const [projectName, setProjectName] = useState("");
  const [boxType, setBoxType] = useState("2D");
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [selectedAnnotators, setSelectedAnnotators] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [annotators, setAnnotators] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Backend API configuration
  const API_BASE_URL = "http://localhost:8000"; // Update this with your backend URL

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/get_all_user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const users = await response.json();
      console.log("Fetched users:", users);
      
      // Transform users to match the expected format
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }));
      
      setAnnotators(formattedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(`Failed to load users: ${err.message}`);
      // Fallback to empty array
      setAnnotators([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // API Functions
  const createProject = async (projectData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/create_project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_name: projectData.name,
        description: `Project for ${projectData.boxType} annotation`,
        classes: projectData.labels,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create project");
    }

    return await response.json();
  };

  const addProjectMembers = async (projectName, members) => {
    const requestData = {
      project_name: projectName,
      members: members.map(member => ({
        user_id: member.id.toString(), // Ensure it's a string
        project_role: "annotator"
      })),
    };
    
    console.log("Sending add project members request:", requestData);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/add_project_members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Add project members error:", errorData);
      throw new Error(errorData.detail || `Failed to add project members: ${response.status}`);
    }

    return await response.json();
  };

  const uploadFilesToS3 = async (projectName, files) => {
    const formData = new FormData();
    formData.append("id", Date.now().toString()); // Generate unique ID
    formData.append("project_name", projectName);
    
    files.forEach(file => {
      formData.append("proofImages", file.file);
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/upload-to-s3`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to upload files");
    }

    return await response.json();
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
    // Clear previous messages
    setError("");
    setSuccess("");

    // Validation
    if (!projectName.trim()) {
      setError("Please enter a project name!");
      return;
    }

    if (labels.length === 0) {
      setError("Please add at least one label!");
      return;
    }

    if (selectedAnnotators.length === 0) {
      setError("Please select at least one team member!");
      return;
    }

    if (uploadedImages.length === 0) {
      setError("Please upload at least one image!");
      return;
    }

    setIsLoading(true);

    try {
      const projectData = {
        name: projectName.trim(),
        boxType,
        labels,
        annotators: annotators.filter((a) =>
          selectedAnnotators.includes(a.id)
        ),
        images: uploadedImages.map((i) => i.name),
      };

      console.log("Creating project:", projectData);

      // Step 1: Create project
      console.log("the project data is ", projectData); 
      const projectResult = await createProject(projectData);
      console.log("Project created:", projectResult);

      // Step 2: Add project members
      if (projectData.annotators.length > 0) {
        console.log("Adding project members:", projectData.annotators);
        await addProjectMembers(projectData.name, projectData.annotators);
        console.log("Project members added successfully");
      }

      // Step 3: Upload files to S3
      if (uploadedImages.length > 0) {
        const uploadResult = await uploadFilesToS3(projectData.name, uploadedImages);
        console.log("Files uploaded:", uploadResult);
      }

      setSuccess("Project created successfully! All data has been saved to the database.");
      
      // Reset form
      setProjectName("");
      setLabels([]);
      setSelectedAnnotators([]);
      setUploadedImages([]);
      setNewLabel("");

    } catch (err) {
      console.error("Error creating project:", err);
      // Handle different types of errors
      let errorMessage = "Failed to create project. Please try again.";
      
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.toString && err.toString() !== '[object Object]') {
        errorMessage = err.toString();
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 mb-12">
      <h2 className="text-3xl font-semibold text-indigo-600 mb-6 text-center">
        Create New Project
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <X className="mr-2" size={20} />
            {error}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <div className="flex items-center">
            <Check className="mr-2" size={20} />
            {success}
          </div>
        </div>
      )}

      {/* Project Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
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
          >
            <option value="2D">2D</option>
            <option value="3D">3D</option>
          </select>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Add Team Members
        </h3>
        {loadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin mr-2" size={20} />
            <span>Loading users...</span>
          </div>
        ) : annotators.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No users found. Please add users first.</p>
            <button 
              onClick={fetchUsers}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry Loading Users
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {annotators.map((user) => (
            <div
              key={user.id}
              onClick={() => toggleAnnotator(user.id)}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                selectedAnnotators.includes(user.id)
                  ? "bg-indigo-100 border-indigo-500"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAnnotators.includes(user.id)}
                onChange={() => toggleAnnotator(user.id)}
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
        )}
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
          />
          <button
            onClick={addLabel}
            className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
            title="Add Label"
          >
            <Check size={20} />
          </button>
          <button
            onClick={clearLabelInput}
            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
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
          className="flex flex-col items-center justify-center w-full border-2 border-dashed border-indigo-400 rounded-xl py-10 cursor-pointer hover:bg-indigo-50 transition"
        >
          <UploadCloud className="text-indigo-500 mb-3" size={40} />
          <span className="text-indigo-600 font-medium">
            Click or drag to upload images
          </span>
          <input
            id="fileUpload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
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
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={isLoading}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <Loader2 className="animate-spin" size={16} />}
          {isLoading ? "Creating..." : "Create Tasks"}
        </button>
      </div>
    </div>
  );
};

export default NewProject;
