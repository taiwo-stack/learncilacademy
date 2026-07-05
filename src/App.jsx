import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SubjectsPage from './pages/SubjectsPage';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Whiteboard from './pages/Whiteboard';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';

function AppContent() {
  const [currentUser, setCurrentUser] = useState({ role: 'guest' });
  const location = useLocation();

  const isWhiteboard = location.pathname.startsWith('/whiteboard');
  
  // Hide the footer on dashboard and whiteboard pages for a cleaner web app dashboard workspace feel
  const isDashboardOrWhiteboard = ['/student', '/tutor', '/admin', '/whiteboard'].some(path => 
    location.pathname.startsWith(path)
  );

  const handleLogout = () => {
    setCurrentUser({ role: 'guest' });
  };

  return (
    <>
      {!isWhiteboard && <Header currentUser={currentUser} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/login" element={<Login onLoginSuccess={setCurrentUser} />} />
        <Route path="/whiteboard" element={<Whiteboard />} />
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['student']} user={currentUser}>
              <StudentDashboard user={currentUser} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tutor" 
          element={
            <ProtectedRoute allowedRoles={['tutor']} user={currentUser}>
              <TutorDashboard user={currentUser} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']} user={currentUser}>
              <AdminDashboard user={currentUser} />
            </ProtectedRoute>
          } 
        />
      </Routes>
      {!isDashboardOrWhiteboard && !location.pathname.startsWith('/login') && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
