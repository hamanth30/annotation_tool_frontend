import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  Eye,
  Trash2,
  User,
  Check,
  X,
  Loader2,
  PlusCircle,
} from "lucide-react";

const NewProject = () => {
  const [projectName, setProjectName] = useState("");
  const [boxType, setBoxType] = useState("2D");
  const [description, setDescription] = useState("");
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState("");

  const [selectedAnnotators, setSelectedAnnotators] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [annotators, setAnnotators] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE_URL = "http://localhost:8000";

  // --- Fetch Annotators ---
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/get_all_user`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const users = await res.json();
      setAnnotators(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      })));
    } catch (err) {
      console.error(err);
      setAnnotators([]);
      setError(`Error loading users: ${err.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };
  useEffect(() => { fetchUsers(); }, []);

  // --- Create Project ---
  const createProject = async (projectData) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/create_project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_name: projectData.name,
        description: `Project for ${projectData.boxType} annotation`,
        classes: projectData.classes,
      }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to create project");
    return await res.json();
  };

  const addProjectMembers = async (projectName, members) => {
    const data = {
      project_name: projectName,
      members: members.map(m => ({ user_id: m.id.toString(), project_role: "annotator" })),
    };
    const res = await fetch(`${API_BASE_URL}/api/admin/add_project_members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Failed to add members");
    return await res.json();
  };

  const uploadFilesToS3 = async (projectName, files) => {
    const formData = new FormData();
    formData.append("id", Date.now().toString());
    formData.append("project_name", projectName);
    files.forEach(f => formData.append("proofImages", f.file));
    const res = await fetch(`${API_BASE_URL}/api/admin/upload-to-s3`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Upload failed");
    return await res.json();
  };

  // --- UI Handlers ---
  const toggleAnnotator = (id) =>
    setSelectedAnnotators(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const uploads = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setUploadedImages(prev => [...prev, ...uploads]);
  };
  const removeImage = (name) =>
    setUploadedImages(prev => prev.filter(img => img.name !== name));

  // --- Class + Attribute logic ---
  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    setClasses([...classes, { name: newClassName.trim(), attributes: {} }]);
    setNewClassName("");
  };

  const handleRemoveClass = (index) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  const handleAddAttribute = (classIndex) => {
    const attrName = prompt("Enter attribute name (e.g., color):");
    if (!attrName) return;
    const attrType = prompt("Enter type (string/integer/boolean):", "string");
    let defaultValue = prompt("Enter default value:");
    let allowedValues = prompt("Enter allowed values (comma-separated, optional):");

    if (attrType === "integer") defaultValue = parseInt(defaultValue);
    if (attrType === "boolean") defaultValue = defaultValue === "true";

    const updated = [...classes];
    updated[classIndex].attributes[attrName] = {
      type: attrType,
      default: defaultValue || null,
      allowed_values: allowedValues
        ? allowedValues.split(",").map(v => v.trim())
        : undefined,
    };
    setClasses(updated);
  };

  const handleRemoveAttribute = (classIndex, attrKey) => {
    const updated = [...classes];
    delete updated[classIndex].attributes[attrKey];
    setClasses(updated);
  };

  // --- Submit ---
  const handleCreate = async () => {
    setError("");
    setSuccess("");

    if (!projectName.trim()) return setError("Please enter a project name!");
    if (classes.length === 0) return setError("Add at least one class!");
    if (selectedAnnotators.length === 0)
      return setError("Select at least one team member!");
    if (uploadedImages.length === 0)
      return setError("Upload at least one image!");

    setIsLoading(true);
    try {
      const projectData = {
        name: projectName.trim(),
        boxType,
        classes,
        annotators: annotators.filter(a => selectedAnnotators.includes(a.id)),
        images: uploadedImages.map(i => i.name),
      };
      const projectResult = await createProject(projectData);
      if (projectData.annotators.length)
        await addProjectMembers(projectData.name, projectData.annotators);
      if (uploadedImages.length)
        await uploadFilesToS3(projectData.name, uploadedImages);
      setSuccess("Project created successfully!");
      setProjectName("");
      setClasses([]);
      setSelectedAnnotators([]);
      setUploadedImages([]);
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 mb-12">
      <h2 className="text-3xl font-semibold text-indigo-600 mb-6 text-center">
        Create New Project
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <X className="mr-2" size={20} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <Check className="mr-2" size={20} /> {success}
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
            <p>No users found.</p>
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

      {/* Classes and Attributes */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Classes & Attributes
        </h3>

        {/* Add Class Input */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Enter class name"
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <button
            onClick={handleAddClass}
            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            + Add Class
          </button>
        </div>

        {/* Render Classes */}
        {classes.map((cls, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-indigo-700 text-lg">{cls.name}</h4>
              <button
                onClick={() => handleRemoveClass(index)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>

            {/* Attributes */}
            {Object.keys(cls.attributes).length > 0 ? (
              <div className="pl-4 mb-3">
                {Object.entries(cls.attributes).map(([key, attr]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center mb-2 bg-white p-2 rounded-md border"
                  >
                    <div>
                      <span className="font-medium text-gray-800">{key}</span>{" "}
                      <span className="text-gray-500 text-sm">({attr.type})</span>
                      <div className="text-xs text-gray-600">
                        Default:{" "}
                        <span className="font-mono text-gray-700">
                          {`${attr.default}`}
                        </span>
                      </div>
                      {attr.allowed_values && (
                        <div className="text-xs text-gray-600">
                          Allowed: {attr.allowed_values.join(", ")}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveAttribute(index, key)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 pl-4 mb-3">
                No attributes added yet.
              </p>
            )}

            <button
              onClick={() => handleAddAttribute(index)}
              className="ml-4 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm flex items-center gap-1"
            >
              <PlusCircle size={14} /> Add Attribute
            </button>
          </div>
        ))}
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

      {/* Footer */}
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
          {isLoading ? "Creating..." : "Create Project"}
        </button>
      </div>
    </div>
  );
};

export default NewProject;
