import axios from 'axios';
import config from '../config/api.js';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const adminAPI = {
  // Create a new project
  createProject: async (projectData) => {
    try {
      const response = await api.post(config.ENDPOINTS.CREATE_PROJECT, {
        project_name: projectData.name,
        description: projectData.description || '',
        classes: projectData.labels || []
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create project');
    }
  },

  // Add project members
  addProjectMembers: async (projectName, members) => {
    try {
      const response = await api.post(config.ENDPOINTS.ADD_PROJECT_MEMBERS, {
        project_name: projectName,
        members: members.map(member => ({
          user_id: member.id,
          project_role: member.role || 'annotator' // Default role
        }))
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add project members');
    }
  },

  // Upload files to S3
  uploadFilesToS3: async (projectName, files, ticketId = null) => {
    try {
      const formData = new FormData();
      
      // Add form fields
      formData.append('id', ticketId || Date.now().toString());
      formData.append('project_name', projectName);
      
      // Add files
      files.forEach(file => {
        formData.append('proofImages', file);
      });

      const response = await api.post(config.ENDPOINTS.UPLOAD_FILES, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to upload files');
    }
  },

  // Get all projects
  getAllProjects: async () => {
    try {
      const response = await api.get(config.ENDPOINTS.GET_ALL_PROJECTS);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch projects');
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get(config.ENDPOINTS.GET_ALL_USERS);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch users');
    }
  },

  // Get project files
  getProjectFiles: async (projectId) => {
    try {
      const response = await api.get(`${config.ENDPOINTS.GET_PROJECT_FILES}/${projectId}/files`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch project files');
    }
  }
};

export default api;
