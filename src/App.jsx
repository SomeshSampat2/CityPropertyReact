import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Toolbar from './components/Toolbar';
import Home from './components/Home';
import Auction from './components/Auction';
import AuctionDetails from './components/AuctionDetails';
import Favorites from './components/Favorites';
import About from './components/About';
import Profile from './components/Profile';
import MyProperties from './components/MyProperties';
import Requests from './components/Requests';
import Dashboard from './components/DashboardComplete';
import PropertyDetails from './components/PropertyDetails';
import BlockedUserOverlay from './components/BlockedUserOverlay';
import { auth } from './config/firebase';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Component to protect routes that require complete profiles
const ProfileRequiredRoute = ({ children }) => {
    const { hasCompleteProfile } = useAuth();

    if (!hasCompleteProfile) {
        return <Navigate to="/profile" replace />;
    }

    return children;
};

const AppContent = () => {
    const { user, loading, isBlocked, isAuthenticated, hasCompleteProfile } = useAuth();
    const location = useLocation();

    // Handle logout for blocked users
    const handleLogout = async () => {
        try {
            await auth.signOut();
            // The AuthContext will handle the state changes
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Show blocked overlay if user is blocked and not on dashboard
    // Dashboard is excluded because admins need to access it to unblock users
    if (isAuthenticated && isBlocked && !location.pathname.endsWith('/dashboard')) {
        return (
            <div className="app-container">
                <BlockedUserOverlay onLogout={handleLogout} />
            </div>
        );
    }

    return (
        <div className="app-container">
            {user && <Toolbar />}
            <div className="content-area">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<ProfileRequiredRoute><Home /></ProfileRequiredRoute>} />
                    <Route path="/auctions" element={<ProfileRequiredRoute><Auction /></ProfileRequiredRoute>} />
                    <Route path="/auction-details" element={<ProfileRequiredRoute><AuctionDetails /></ProfileRequiredRoute>} />
                    <Route path="/favorites" element={<ProfileRequiredRoute><Favorites /></ProfileRequiredRoute>} />
                    <Route path="/about" element={<About />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-properties" element={<ProfileRequiredRoute><MyProperties /></ProfileRequiredRoute>} />
                    <Route path="/requests" element={<ProtectedRoute requiredRole="superadmin"><Requests /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute requiredRole="superadmin"><Dashboard /></ProtectedRoute>} />
                    <Route path="/property-details" element={<ProfileRequiredRoute><PropertyDetails /></ProfileRequiredRoute>} />
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
