# Frontend-Backend Integration Setup

This document explains how to connect your React frontend with the FastAPI backend for the annotation tool.

## Files Modified/Created

### 1. New Files Created:
- `src/services/api.js` - API service functions for backend communication
- `src/config/api.js` - Configuration file for API endpoints

### 2. Modified Files:
- `src/components/admin/NewProject.jsx` - Updated to integrate with backend APIs

## Setup Instructions

### 1. Backend Configuration
Update the backend URL in `src/config/api.js`:
```javascript
export const config = {
  API_BASE_URL: 'http://your-backend-url:8000', // Change this to your actual backend URL
  // ... rest of config
};
```

### 2. Backend Endpoints Required
Make sure your backend has these endpoints running:
- `POST /api/admin/create_project` - Creates a new project
- `POST /api/admin/add_project_members` - Adds members to a project
- `POST /api/admin/upload-to-s3` - Uploads files to S3
- `GET /api/admin/get_all_projects` - Gets all projects
- `GET /api/admin/get_all_user` - Gets all users
- `GET /api/admin/projects/{project_id}/files` - Gets project files

### 3. CORS Configuration
Make sure your FastAPI backend has CORS enabled for your frontend domain:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## How It Works

### Project Creation Flow:
1. **Create Project**: Calls `/api/admin/create_project` with project name, description, and labels
2. **Add Members**: Calls `/api/admin/add_project_members` with selected team members
3. **Upload Files**: Calls `/api/admin/upload-to-s3` with uploaded images

### Data Flow:
- **Project Data** → `projects` table
- **Member Data** → `project_members` table  
- **File Data** → `files` table + S3 storage

## Features Added:
- ✅ Real-time API integration
- ✅ Loading states during API calls
- ✅ Error handling with user-friendly messages
- ✅ Success notifications
- ✅ Form validation
- ✅ Disabled form elements during loading
- ✅ Dynamic user fetching from backend
- ✅ File upload with progress indication

## Testing:
1. Start your backend server
2. Update the API_BASE_URL in config
3. Run the frontend: `npm run dev`
4. Test the project creation flow

## Troubleshooting:
- Check browser console for API errors
- Verify backend server is running
- Ensure CORS is properly configured
- Check network tab for failed requests

