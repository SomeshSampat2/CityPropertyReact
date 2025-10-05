import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const BlockedUserOverlay = ({ onLogout }) => {
    const handleContactSupport = () => {
        window.open('mailto:support@cityproperty.com?subject=Account Blocked - Request for Assistance', '_blank');
    };

    return (
        <div
            id="blocked-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backdropFilter: 'blur(10px)'
            }}
        >
            <div
                className="blocked-message"
                style={{
                    background: 'white',
                    padding: '3rem',
                    borderRadius: '15px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    maxWidth: '500px',
                    margin: '2rem'
                }}
            >
                <div className="mb-4">
                    <i className="fas fa-ban fa-4x text-danger mb-3"></i>
                    <h2 className="text-danger">Account Blocked</h2>
                </div>
                <p className="lead text-muted mb-4">
                    Your account has been temporarily blocked by the administrator.
                    Please contact support for assistance.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                    <button
                        id="contact-support-btn"
                        className="btn btn-primary"
                        onClick={handleContactSupport}
                    >
                        <i className="fas fa-envelope me-2"></i>Contact Support
                    </button>
                    <button
                        id="logout-blocked-btn"
                        className="btn btn-outline-secondary"
                        onClick={onLogout}
                    >
                        <i className="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlockedUserOverlay;
