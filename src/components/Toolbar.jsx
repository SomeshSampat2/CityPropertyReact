import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser, checkUserRole } from '../services/authService';

const Toolbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, userData } = useAuth();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (user) {
            checkUserRole(user.uid).then(role => {
                setUserRole(role);
            }).catch(error => {
                console.error('Error fetching user role:', error);
                setUserRole('user'); // Default role
            });
        } else {
            setUserRole(null);
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOutUser();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Custom active state calculation to avoid Bootstrap conflicts
    const isActive = (path) => {
        return location.pathname === path ? 'toolbar-active' : '';
    };

    // Memoize role checks to prevent recalculation on every render
    const shouldShowRequests = useMemo(() => {
        return userRole && ['admin', 'superadmin'].includes(userRole);
    }, [userRole]);

    const shouldShowDashboard = useMemo(() => {
        return userRole && ['admin', 'superadmin'].includes(userRole);
    }, [userRole]);

    if (!user) {
        return null; // Don't show toolbar if user is not authenticated
    }

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
                <Link className="navbar-brand text-primary fw-bold" to="/home">
                    CityProperty
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/home')}`} to="/home">
                                <i className="fas fa-home me-1"></i>Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/favorites')}`} to="/favorites">
                                <i className="fas fa-heart me-1"></i>Favorites
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/about')}`} to="/about">
                                <i className="fas fa-info-circle me-1"></i>About
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/profile')}`} to="/profile">
                                <i className="fas fa-user me-1"></i>Profile
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/my-properties')}`} to="/my-properties">
                                <i className="fas fa-building me-1"></i>My Properties
                            </Link>
                        </li>
                        {shouldShowRequests && (
                            <li className="nav-item" id="requests-nav-item">
                                <Link className={`nav-link ${isActive('/requests')}`} to="/requests">
                                    <i className="fas fa-user-cog me-1"></i>Requests
                                </Link>
                            </li>
                        )}
                        {shouldShowDashboard && (
                            <li className="nav-item" id="dashboard-nav-item">
                                <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                                    <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                                </Link>
                            </li>
                        )}
                        <li className="nav-item">
                            <button
                                id="logout-btn"
                                className="btn btn-danger"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Toolbar;
