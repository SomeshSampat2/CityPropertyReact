import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const About = () => {
    const navigate = useNavigate();
    const { isAuthenticated, hasCompleteProfile } = useAuth();

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Redirect to profile if profile is incomplete
    React.useEffect(() => {
        if (isAuthenticated && !hasCompleteProfile) {
            navigate('/profile');
        }
    }, [isAuthenticated, hasCompleteProfile, navigate]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="text-center mb-5">
                        <h1 className="display-6 fw-bold text-dark mb-4">About CityProperty</h1>
                        <p className="lead text-muted">Your trusted partner in real estate excellence</p>
                    </div>

                    <div className="card shadow-custom">
                        <div className="card-body p-5">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-gradient rounded-circle p-3 me-3">
                                            <i className="fas fa-home text-white"></i>
                                        </div>
                                        <h4 className="mb-0">Premium Properties</h4>
                                    </div>
                                    <p className="text-muted">We curate the finest selection of properties to match your dreams and lifestyle.</p>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-gradient rounded-circle p-3 me-3">
                                            <i className="fas fa-users text-white"></i>
                                        </div>
                                        <h4 className="mb-0">Expert Service</h4>
                                    </div>
                                    <p className="text-muted">Our experienced team provides personalized guidance throughout your property journey.</p>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-gradient rounded-circle p-3 me-3">
                                            <i className="fas fa-shield-alt text-white"></i>
                                        </div>
                                        <h4 className="mb-0">Trusted Platform</h4>
                                    </div>
                                    <p className="text-muted">Secure transactions and verified listings ensure peace of mind for all our clients.</p>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-gradient rounded-circle p-3 me-3">
                                            <i className="fas fa-chart-line text-white"></i>
                                        </div>
                                        <h4 className="mb-0">Market Insights</h4>
                                    </div>
                                    <p className="text-muted">Stay informed with the latest market trends and property valuations.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
