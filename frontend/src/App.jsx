import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Landing & Auth Pages
import LandingPage from './landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OtpVerifyPage from './pages/auth/OtpVerifyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportIssue from './pages/citizen/ReportIssue';
import CitizenIssueDetail from './pages/citizen/IssueDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import IssueManagement from './pages/admin/IssueManagement';
import AdminIssueDetail from './pages/admin/IssueDetail';
import WorkerManagement from './pages/admin/WorkerManagement';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerIssueDetail from './pages/worker/WorkerIssueDetail';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Citizen Protected Routes */}
          <Route 
            path="/citizen/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/report-issue" 
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <ReportIssue />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/issue/:id" 
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenIssueDetail />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/issues" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <IssueManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/issue/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminIssueDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/workers" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <WorkerManagement />
              </ProtectedRoute>
            } 
          />

          {/* Worker Protected Routes */}
          <Route 
            path="/worker/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['worker']}>
                <WorkerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worker/issue/:id" 
            element={
              <ProtectedRoute allowedRoles={['worker']}>
                <WorkerIssueDetail />
              </ProtectedRoute>
            } 
          />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
