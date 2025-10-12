import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuctionById, formatAuctionForDisplay } from '../services/firebase/auctionService';
import { sampleImages } from '../utils/propertyTypeConfigs';
import '../styles/styles.css';

// Helper function to get sample images (same as PropertyDetails)
const getSampleImages = () => {
    return sampleImages;
};

const AuctionDetails = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [searchParams] = useSearchParams();
    const auctionId = searchParams.get('id');
    const imageIndex = parseInt(searchParams.get('img')) || 0;

    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(imageIndex);
    const [totalImages, setTotalImages] = useState(1);
    const [auctionImages, setAuctionImages] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (auctionId) {
            loadAuctionDetails();
        } else {
            setError('No auction ID provided');
            setLoading(false);
        }
    }, [auctionId]);

    const loadAuctionDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const auctionData = await getAuctionById(auctionId);

            if (auctionData) {
                setAuction(auctionData);

                // Setup images (same logic as PropertyDetails)
                const images = auctionData.images && auctionData.images.length > 0
                    ? auctionData.images
                    : getSampleImages();
                setAuctionImages(images);
                setTotalImages(images.length);
                setCurrentImageIndex(imageIndex % images.length);
            }
        } catch (error) {
            console.error('Error loading auction details:', error);
            setError('Failed to load auction details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/auctions');
    };

    const handleEdit = () => {
        // Navigate to edit auction modal or page
        navigate(`/auctions?edit=${auctionId}`);
    };

    const navigateImage = (direction) => {
        if (isAnimating) return;
        const newIndex = currentImageIndex + direction;

        if (newIndex >= 0 && newIndex < totalImages) {
            setIsAnimating(true);
            setCurrentImageIndex(newIndex);

            // Update URL without reloading
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('img', newIndex);
            window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);

            setTimeout(() => {
                setIsAnimating(false);
            }, 600);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading auction details...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button
                        className="btn btn-outline-danger ms-3"
                        onClick={handleBack}
                    >
                        Back to Auctions
                    </button>
                </div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Auction not found
                    <button
                        className="btn btn-outline-warning ms-3"
                        onClick={handleBack}
                    >
                        Back to Auctions
                    </button>
                </div>
            </div>
        );
    }

    // Format auction data for display
    const displayAuction = formatAuctionForDisplay(auction);

    // Get property type info for styling
    const getPropertyTypeInfo = (propertyType) => {
        const typeMap = {
            residential: { icon: 'fas fa-home', color: 'primary', displayName: 'Residential' },
            commercial: { icon: 'fas fa-building', color: 'info', displayName: 'Commercial' },
            industrial: { icon: 'fas fa-industry', color: 'warning', displayName: 'Industrial' },
            agricultural: { icon: 'fas fa-seedling', color: 'success', displayName: 'Agricultural' },
            plot: { icon: 'fas fa-map', color: 'secondary', displayName: 'Plot' },
            land: { icon: 'fas fa-mountain', color: 'dark', displayName: 'Land' }
        };
        return typeMap[propertyType] || { icon: 'fas fa-home', color: 'primary', displayName: 'Property' };
    };

    const propertyTypeInfo = getPropertyTypeInfo(auction.propertyType);

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center">
                            <button
                                className="btn btn-outline-secondary me-4 px-3 py-2"
                                onClick={handleBack}
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                Back to Auctions
                            </button>
                            <div>
                                <h2 className="mb-1">
                                    <i className="fas fa-gavel me-3 text-primary"></i>
                                    Auction Details
                                </h2>
                                <small className="text-muted">Auction ID: {auction.id}</small>
                            </div>
                        </div>

                        {isAdmin && (
                            <button
                                className="btn btn-primary px-4 py-2"
                                onClick={handleEdit}
                            >
                                <i className="fas fa-edit me-2"></i>
                                Edit Auction
                            </button>
                        )}
                    </div>

                    <div className="row g-4">
                        {/* Image Section */}
                        <div className="col-lg-8">
                            <div className="card shadow-custom">
                                <div className="property-image-container position-relative">
                                    <div className="image-carousel">
                                        <img
                                            src={auctionImages[currentImageIndex]}
                                            className="card-img-top property-hero-image current-image"
                                            alt={auction.address}
                                            style={{ height: '450px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                                            }}
                                        />
                                    </div>

                                    {/* Property Type Badge */}
                                    <div className="position-absolute top-0 start-0 m-3">
                                        <span className={`badge bg-${propertyTypeInfo.color} rounded-pill px-4 py-3 fs-6 fw-semibold`}>
                                            <i className={`${propertyTypeInfo.icon} me-2`}></i>
                                            {propertyTypeInfo.displayName}
                                        </span>
                                    </div>

                                    {/* Auction Type Badge */}
                                    <div className="position-absolute top-0 end-0 m-3">
                                        <span className={`badge bg-${auction.auctionType === 'Physical' ? 'success' : auction.auctionType === 'Symbolic' ? 'warning' : 'info'} rounded-pill px-4 py-3 fs-6 fw-semibold`}>
                                            {auction.auctionType || 'Auction'}
                                        </span>
                                    </div>

                                    {/* Possession Status Badge */}
                                    <div className="position-absolute bottom-0 start-0 m-3">
                                        <span className={`badge bg-${auction.possession === 'Vacant' ? 'success' : auction.possession === 'Occupied' ? 'danger' : 'warning'} rounded-pill px-4 py-3 fs-6 fw-semibold`}>
                                            {auction.possession || 'N/A'}
                                        </span>
                                    </div>

                                    {/* Navigation Arrows */}
                                    {totalImages > 1 && (
                                        <>
                                            <button
                                                className="btn btn-light btn-sm property-nav-btn property-prev-btn"
                                                onClick={() => navigateImage(-1)}
                                                disabled={currentImageIndex === 0 || isAnimating}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                            </button>
                                            <button
                                                className="btn btn-light btn-sm property-nav-btn property-next-btn"
                                                onClick={() => navigateImage(1)}
                                                disabled={currentImageIndex === totalImages - 1 || isAnimating}
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>

                                            {/* Image Counter */}
                                            <div className="property-image-counter">
                                                <span className="current-image">{currentImageIndex + 1}</span> / <span className="total-images">{totalImages}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="card-body p-4">
                                    <h3 className="card-title mb-3 h4">{auction.address}</h3>
                                    <p className="card-text text-muted mb-4 lead">
                                        {auction.description || 'No description available'}
                                    </p>

                                    {/* Quick Info */}
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-4">
                                            <div className="text-center p-4 bg-light rounded-3 border">
                                                <div className="h3 text-success mb-2">{displayAuction.formattedReservePrice}</div>
                                                <small className="text-muted fw-semibold">Reserve Price</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-center p-4 bg-light rounded-3 border">
                                                <div className="h3 text-info mb-2">{displayAuction.formattedEMDAmount}</div>
                                                <small className="text-muted fw-semibold">EMD Amount</small>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="text-center p-4 bg-light rounded-3 border">
                                                <div className="h3 text-primary mb-2">{auction.city}</div>
                                                <small className="text-muted fw-semibold">Location</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="col-lg-4">
                            <div className="card shadow-custom">
                                <div className="card-body p-4">
                                    <h5 className="card-title mb-4 h5">
                                        <i className="fas fa-info-circle me-2 text-primary"></i>
                                        Auction Information
                                    </h5>

                                    <div className="mb-4 p-3 bg-light rounded-3">
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <strong className="text-muted d-block mb-2">Auction Date</strong>
                                                <div className="fw-bold text-primary fs-6">{auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : 'N/A'}</div>
                                            </div>

                                            <div className="col-12">
                                                <strong className="text-muted d-block mb-2">Inspection Date</strong>
                                                <div className="fw-bold fs-6">{auction.inspectionDate ? new Date(auction.inspectionDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : 'N/A'}</div>
                                            </div>

                                            <div className="col-12">
                                                <strong className="text-muted d-block mb-2">EMD Submission Deadline</strong>
                                                <div className="fw-bold fs-6">{auction.emdSubmissionDate ? new Date(auction.emdSubmissionDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-4">
                                        <div className="col-12">
                                            <strong className="text-muted d-block mb-2">Auction Venue</strong>
                                            <div className="fw-bold">{auction.location || 'N/A'}</div>
                                        </div>

                                        <div className="col-12">
                                            <strong className="text-muted d-block mb-2">Contact</strong>
                                            <div className="fw-bold">{auction.contact || 'N/A'}</div>
                                        </div>

                                        <div className="col-12">
                                            <strong className="text-muted d-block mb-2">Bank/Agency</strong>
                                            <div className="fw-bold">{auction.bankAgency || 'N/A'}</div>
                                        </div>

                                        {auction.cersaiId && (
                                            <div className="col-12">
                                                <strong className="text-muted d-block mb-2">CERSAI ID</strong>
                                                <div className="fw-bold">{auction.cersaiId}</div>
                                            </div>
                                        )}

                                        <div className="col-12">
                                            <strong className="text-muted d-block mb-2">Auction Act</strong>
                                            <div className="fw-bold">{auction.auctionAct || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {auction.paperNotice && (
                                        <div className="mb-3">
                                            <span className="badge bg-success px-3 py-2 fs-6">
                                                <i className="fas fa-file-alt me-2"></i>
                                                Paper Notice Available
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information Section - Below the main content */}
                    {(auction.boundaries || auction.registrationInfo) && (
                        <div className="row g-4 mt-4">
                            <div className="col-lg-8">
                                <div className="card shadow-custom">
                                    <div className="card-body p-4">
                                        <div className="row g-4">
                                            {/* Property Boundaries */}
                                            {auction.boundaries && (
                                                <div className="col-lg-6">
                                                    <h5 className="h6 mb-3">
                                                        <i className="fas fa-map me-2 text-primary"></i>
                                                        Property Boundaries
                                                    </h5>

                                                    <div className="row g-3">
                                                        <div className="col-6">
                                                            <div className="text-center p-3 bg-light rounded-3">
                                                                <small className="text-muted d-block mb-1">East</small>
                                                                <div className="fw-bold fs-6">{auction.boundaries.east || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="col-6">
                                                            <div className="text-center p-3 bg-light rounded-3">
                                                                <small className="text-muted d-block mb-1">West</small>
                                                                <div className="fw-bold fs-6">{auction.boundaries.west || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="col-6">
                                                            <div className="text-center p-3 bg-light rounded-3">
                                                                <small className="text-muted d-block mb-1">North</small>
                                                                <div className="fw-bold fs-6">{auction.boundaries.north || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="col-6">
                                                            <div className="text-center p-3 bg-light rounded-3">
                                                                <small className="text-muted d-block mb-1">South</small>
                                                                <div className="fw-bold fs-6">{auction.boundaries.south || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Registration Details */}
                                            {auction.registrationInfo && (
                                                <div className="col-lg-6">
                                                    <h5 className="h6 mb-3">
                                                        <i className="fas fa-user-plus me-2 text-primary"></i>
                                                        Registration Details
                                                    </h5>

                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <div className="p-3 bg-light rounded-3">
                                                                <div className="mb-3">
                                                                    <small className="text-muted d-block mb-1">Name</small>
                                                                    <div className="fw-bold fs-6">{auction.registrationInfo.name || 'N/A'}</div>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <small className="text-muted d-block mb-1">Bank/Agency</small>
                                                                    <div className="fw-bold fs-6">{auction.registrationInfo.bankAgency || 'N/A'}</div>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <small className="text-muted d-block mb-1">State</small>
                                                                    <div className="fw-bold fs-6">{auction.registrationInfo.state || 'N/A'}</div>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <small className="text-muted d-block mb-1">Zone</small>
                                                                    <div className="fw-bold fs-6">{auction.registrationInfo.zone || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="p-3 bg-light rounded-3">
                                                                {auction.registrationInfo.email && (
                                                                    <div className="mb-3">
                                                                        <small className="text-muted d-block mb-1">Email</small>
                                                                        <div className="fw-bold fs-6">{auction.registrationInfo.email}</div>
                                                                    </div>
                                                                )}

                                                                {auction.registrationInfo.contact && (
                                                                    <div className="mb-3">
                                                                        <small className="text-muted d-block mb-1">Contact</small>
                                                                        <div className="fw-bold fs-6">{auction.registrationInfo.contact}</div>
                                                                    </div>
                                                                )}

                                                                {auction.registrationInfo.address && (
                                                                    <div className="mb-3">
                                                                        <small className="text-muted d-block mb-1">Address</small>
                                                                        <div className="fw-bold fs-6">{auction.registrationInfo.address}</div>
                                                                    </div>
                                                                )}

                                                                <div className="mt-3">
                                                                    <small className="text-muted d-block mb-2">Request Status</small>
                                                                    <div>
                                                                        <span className={`badge bg-${auction.registrationInfo.requestStatus === 'Approved' ? 'success' : auction.registrationInfo.requestStatus === 'Request' ? 'warning' : 'secondary'} px-3 py-2`}>
                                                                            {auction.registrationInfo.requestStatus || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuctionDetails;
