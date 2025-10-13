// Configuration file for API endpoints
export const config = {
  // Backend API base URL - Update this to match your backend server
  API_BASE_URL: 'http://localhost:8000', // Change this to your actual backend URL
  
  // API endpoints
  ENDPOINTS: {
    CREATE_PROJECT: '/api/admin/create_project',
    ADD_PROJECT_MEMBERS: '/api/admin/add_project_members',
    UPLOAD_FILES: '/api/admin/upload-to-s3',
    GET_ALL_PROJECTS: '/api/admin/get_all_projects',
    GET_ALL_USERS: '/api/admin/get_all_user',
    GET_PROJECT_FILES: '/api/admin/projects'
  }
};

export default config;

