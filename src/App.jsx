import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Toolbar from './components/Toolbar';
import Home from './components/Home';
import Favorites from './components/Favorites';
import About from './components/About';
import Profile from './components/Profile';
import MyProperties from './components/MyProperties';
import Requests from './components/Requests';
import Dashboard from './components/DashboardComplete';
import PropertyDetails from './components/PropertyDetails';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            {user && <Toolbar />}
            <div className="content-area">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-properties" element={<MyProperties />} />
                    <Route path="/requests" element={<ProtectedRoute requiredRole="superadmin"><Requests /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute requiredRole="superadmin"><Dashboard /></ProtectedRoute>} />
                    <Route path="/property-details" element={<PropertyDetails />} />
                </Routes>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
