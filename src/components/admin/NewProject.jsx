import React, { useState } from "react";
import {
  UploadCloud,
  Eye,
  Trash2,
  User,
  PlusCircle,
  Check,
  X,
} from "lucide-react";

const NewProject = () => {
  const [projectName, setProjectName] = useState("");
  const [boxType, setBoxType] = useState("2D");
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [selectedAnnotators, setSelectedAnnotators] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Sample annotators JSON (hardcoded)
  const annotators = [
    { id: 1, name: "Hemanth", email: "hemanth@vista.com" },
    { id: 2, name: "Mahaashri", email: "mahaashri@vista.com" },
    { id: 3, name: "Saravanan", email: "saravanan@vista.com" },
    { id: 4, name: "Dharshini", email: "dharshini@vista.com" },
  ];

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
  const handleCreate = () => {
    if (!projectName) {
      alert("Please enter a project name!");
      return;
    }

    const newProject = {
      name: projectName,
      boxType,
      labels,
      annotators: annotators.filter((a) =>
        selectedAnnotators.includes(a.id)
      ),
      images: uploadedImages.map((i) => i.name),
    };

    console.log("New Project Data:", newProject);
    alert("Project created successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto p-8 mb-12">
      <h2 className="text-3xl font-semibold text-indigo-600 mb-6 text-center">
        Create New Project
      </h2>

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
        <button className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition">
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Create Tasks
        </button>
      </div>
    </div>
  );
};

export default NewProject;
