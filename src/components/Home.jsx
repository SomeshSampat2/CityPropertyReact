import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/styles.css';

const Home = () => {
    const navigate = useNavigate();
    const { user, userData, isAuthenticated, hasCompleteProfile } = useAuth();

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <React.Fragment>
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="display-6 fw-bold text-primary mb-2">Premium Properties</h1>
                        <p className="lead text-muted">Discover your dream property with our exclusive collection</p>
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn btn-primary btn-lg shadow-custom animate-float" data-bs-toggle="modal" data-bs-target="#propertyTypeModal">
                            <i className="fas fa-plus me-2"></i>Add Property
                        </button>
                        <button className="btn btn-success btn-lg shadow-custom animate-float" id="need-property-btn">
                            <i className="fas fa-search me-2"></i>I Need Property
                        </button>
                    </div>
                </div>

                {/* Property grid will go here */}
                <div className="row g-2" id="properties-list">
                    {/* Properties will be loaded here */}
                </div>

                {/* Property Type Modal */}
                <div className="modal fade" id="propertyTypeModal" tabIndex="-1" aria-labelledby="propertyTypeModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="propertyTypeModalLabel">Choose Property Type</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3" id="property-type-buttons">
                                    {/* Property type buttons will be loaded here */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Home;
