
import axios from 'axios';

// Configure your FastAPI backend URL here
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Update this to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const studentApi = {
  // Student Lookup
  getStudentResults: (indexNumber: string) => 
    api.get(`/students/${indexNumber}`),

  getStudentFullData: async (indexNumber: string) => {
    const [resultsRes, gpaRes] = await Promise.all([
      api.get(`/students/${indexNumber}`),
      api.get(`/summary/students/gpa-summary/${indexNumber}`),
    ]);
    return {
      results: resultsRes.data,
      gpaSummary: gpaRes.data
    };
  },
  
  downloadStudentExcel: (indexNumber: string) => 
    api.get(`/students/${indexNumber}/download`, { responseType: 'blob' }),

  
  getSubjectResult: (indexNumber: string, subjectCode: string) => 
    api.get(`/students/${indexNumber}/subject/${subjectCode}`),
  
  // GPA Summary
  getAllGPASummary: () => 
    api.get('/summary/students/gpa-summary'),
  
  getGPASummaryByIndex: (indexNumber: string) => 
    api.get(`/summary/students/gpa-summary/${indexNumber}`),
  
  // Medical Credits
  getAllMedicalCredits: (strategicOnly?: boolean) => 
    api.get('/summary/students/medical-credits', { 
      params: strategicOnly ? { strategic_only: true } : undefined 
    }),
  
  // Subjects
  getAllSubjects: () => 
    api.get('/subjects/'),
  
  getSubjectMetadata: (subjectCode: string) => 
    api.get(`/subjects/${subjectCode}`),
  
  downloadSubjectExcel: (subjectCode: string) => 
    api.get(`/subjects/${subjectCode}/download`, { responseType: 'blob' }),
  
  // Subject Difficulty
  getAllDifficultySummary: () => 
    api.get('/summary/subjects/difficulty-summary'),
  
  getDifficultySummaryBySubject: (subjectCode: string) => 
    api.get(`/subjects/difficulty-summary/${subjectCode}`),
};

export default api;
