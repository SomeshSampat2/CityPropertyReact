import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MyProperties = () => {
    const navigate = useNavigate();
    const { isAuthenticated, hasCompleteProfile } = useAuth();

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <React.Fragment>
            <div className="container mt-4">
                <h1 className="display-6 fw-bold text-primary mb-4">My Properties</h1>
                <p className="lead text-muted">Manage your property listings here.</p>
                {/* My Properties content will go here */}
            </div>
        </React.Fragment>
    );
};

export default MyProperties;
