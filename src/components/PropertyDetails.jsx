import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addToFavorites, removeFromFavorites, isPropertyInFavorites } from '../services/favoritesService';
import { loadPropertyDetails, getSampleImages, getLocationText, getPriceText, getPropertyTypeDisplay, generateShareMessage } from '../services/firebase/propertyDetailsService';
import '../styles/styles.css';

const PropertyDetails = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const propertyId = searchParams.get('id');
    const imageIndex = parseInt(searchParams.get('img')) || 0;
    const isShared = searchParams.get('shared') === 'true';

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(imageIndex);
    const [totalImages, setTotalImages] = useState(1);
    const [propertyImages, setPropertyImages] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Load property details
    useEffect(() => {
        if (isAuthenticated && propertyId) {
            loadPropertyDetailsFromService();
            checkFavoriteStatus();
        }
    }, [isAuthenticated, propertyId]);

    const loadPropertyDetailsFromService = async () => {
        setLoading(true);
        try {
            const propertyData = await loadPropertyDetails(propertyId);

            if (propertyData) {
                setProperty(propertyData);

                // Setup images
                const images = propertyData.images && propertyData.images.length > 0
                    ? propertyData.images
                    : getSampleImages();
                setPropertyImages(images);
                setTotalImages(images.length);
                setCurrentImageIndex(imageIndex % images.length);

                // Show shared notification if needed
                if (isShared) {
                    setTimeout(() => {
                        alert('You\'re viewing a shared property! Explore more amazing properties.');
                    }, 2000);
                }
            } else {
                alert('Property not found');
                navigate('/home');
            }
        } catch (error) {
            console.error('Error loading property details:', error);
            alert('Error loading property details');
        } finally {
            setLoading(false);
        }
    };

    const checkFavoriteStatus = async () => {
        if (!user || !propertyId) return;

        try {
            const isFavorited = await isPropertyInFavorites(user.uid, propertyId);
            setIsFavorited(isFavorited);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };


    const toggleFavorite = async () => {
        if (!user) {
            alert('Please log in to manage favorites.');
            return;
        }

        try {
            if (isFavorited) {
                // Remove from favorites
                await removeFromFavorites(user.uid, propertyId);
                setIsFavorited(false);
            } else {
                // Add to favorites
                await addToFavorites(user.uid, propertyId);
                setIsFavorited(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Error updating favorites. Please try again.');
        }
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

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        // Contact functionality would be implemented here
        alert('Contact functionality coming soon!');
        setShowContactModal(false);
    };

    const handleShare = (platform) => {
        if (!property) return;

        const shareableUrl = `${window.location.origin}/property-details?id=${property.id}&shared=true`;
        const message = generateShareMessage(property, shareableUrl);

        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                break;
            case 'email':
                window.location.href = `mailto:?subject=${encodeURIComponent(`Check out this property: ${property.name}`)}&body=${encodeURIComponent(message)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareableUrl);
                alert('Property link copied to clipboard!');
                break;
            default:
                break;
        }
    };


    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">
                    Property not found
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Back Button */}
            <div className="mb-4">
                <button onClick={() => navigate('/home')} className="btn btn-outline-primary">
                    <i className="fas fa-arrow-left me-2"></i>Back to Properties
                </button>
            </div>

            <div className="row">
                {/* Property Image */}
                <div className="col-lg-8 mb-4">
                    <div className="card shadow-custom">
                        <div className="property-image-container position-relative">
                            <div className="image-carousel">
                                <img
                                    src={propertyImages[currentImageIndex]}
                                    className="card-img-top property-hero-image current-image"
                                    alt="Property Image"
                                    style={{ height: '400px', objectFit: 'cover' }}
                                />
                            </div>

                            {/* Property Type Badge */}
                            <div className="property-category-badge">
                                <span className="badge property-category bg-primary">
                                    <i className="fas fa-home me-1"></i>
                                    {getPropertyTypeDisplay(property.propertyType)}
                                </span>
                            </div>

                            {/* Listing Type Badge */}
                            <div className="listing-type-badge">
                                <span className="badge listing-type bg-info">
                                    For {property.listingType === 'sale' ? 'Sale' : 'Rent'}
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
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h1 className="h2 fw-bold text-gradient mb-2">{property.name}</h1>
                                    <p className="text-muted mb-0">
                                        <i className="fas fa-map-marker-alt me-2"></i>{getLocationText()}
                                    </p>
                                </div>
                                <div className="text-end d-flex flex-column align-items-end">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <button
                                            className="btn btn-outline-success share-details-btn"
                                            onClick={() => setShowShareModal(true)}
                                            title="Share this property"
                                        >
                                            <i className="fas fa-share-alt"></i>
                                            <span className="ms-2 d-none d-md-inline">Share Property</span>
                                        </button>
                                        <button
                                            className={`btn ${isFavorited ? 'btn-favorite' : 'btn-outline-favorite'} favorite-details-btn`}
                                            onClick={toggleFavorite}
                                            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <i className={`favorite-heart ${isFavorited ? 'fas' : 'far'}`}></i>
                                            <span className="ms-2 d-none d-md-inline">{isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-gradient mb-0">{getPriceText()}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Property Features */}
                            <div className="row g-3 mb-4">
                                {property.propertyType === 'residential' && (
                                    <>
                                        <div className="col-6 col-md-3">
                                            <div className="feature-card text-center p-3">
                                                <i className="fas fa-home text-primary mb-2"></i>
                                                <h5 className="mb-0">{property.bhkConfig || 'N/A'}</h5>
                                                <small className="text-muted">BHK</small>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <div className="feature-card text-center p-3">
                                                <i className="fas fa-ruler-combined text-primary mb-2"></i>
                                                <h5 className="mb-0">{property.builtUpArea ? `${property.builtUpArea} sq ft` : 'N/A'}</h5>
                                                <small className="text-muted">Built-up Area</small>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <div className="feature-card text-center p-3">
                                                <i className="fas fa-bath text-primary mb-2"></i>
                                                <h5 className="mb-0">{property.bathrooms || 'N/A'}</h5>
                                                <small className="text-muted">Bathrooms</small>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <div className="feature-card text-center p-3">
                                                <i className="fas fa-building text-primary mb-2"></i>
                                                <h5 className="mb-0">{property.balconies || 'N/A'}</h5>
                                                <small className="text-muted">Balconies</small>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <h4 className="h5 mb-3">Description</h4>
                                <p className="text-muted">
                                    {property.description || 'No description available for this property.'}
                                </p>
                            </div>

                            {/* Amenities */}
                            {property.amenities && property.amenities.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="h5 mb-3">Amenities</h4>
                                    <div className="row g-2">
                                        {property.amenities.map((amenity, index) => (
                                            <div key={index} className="col-md-3 col-6">
                                                <div className="amenity-item">
                                                    <i className="fas fa-check text-primary"></i>
                                                    <span>{amenity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed Property Information */}
                            <div className="mb-4">
                                <h4 className="h5 mb-3">Property Details</h4>

                                {/* Type & Category (All Types) */}
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2"><i className="fas fa-tags me-2"></i>Type & Category</h6>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <small className="text-muted">Property Type:</small>
                                            <div className="fw-bold">{getPropertyTypeDisplay(property.propertyType)}</div>
                                        </div>
                                        {property.propertyType === 'residential' && (
                                            <div className="col-md-6">
                                                <small className="text-muted">BHK Configuration:</small>
                                                <div className="fw-bold">{property.bhkConfig || 'N/A'}</div>
                                            </div>
                                        )}
                                        {property.propertyType === 'commercial' && (
                                            <div className="col-md-6">
                                                <small className="text-muted">Commercial Type:</small>
                                                <div className="fw-bold">{property.commercialType || 'N/A'}</div>
                                            </div>
                                        )}
                                        {property.propertyType === 'industrial' && (
                                            <div className="col-md-6">
                                                <small className="text-muted">Industrial Type:</small>
                                                <div className="fw-bold">{property.industrialType || 'N/A'}</div>
                                            </div>
                                        )}
                                        {property.propertyType === 'land' && (
                                            <div className="col-md-6">
                                                <small className="text-muted">Land Type:</small>
                                                <div className="fw-bold">{property.landType || 'N/A'}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Location & Building (All Types) */}
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2"><i className="fas fa-map-marker-alt me-2"></i>Location & Building</h6>
                                    <div className="row g-2">
                                        <div className="col-12">
                                            <small className="text-muted">Building/Project/Society Name:</small>
                                            <div className="fw-bold">{property.buildingName || 'N/A'}</div>
                                        </div>
                                        <div className="col-12">
                                            <small className="text-muted">Locality:</small>
                                            <div className="fw-bold">{property.locality || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Zone Type:</small>
                                            <div className="fw-bold">{property.zoneType || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Location Hub:</small>
                                            <div className="fw-bold">{property.locationHub || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Availability (All Types) */}
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2"><i className="fas fa-clock me-2"></i>Status & Availability</h6>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <small className="text-muted">Possession Status:</small>
                                            <div className="fw-bold">{property.possessionStatus || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Available From:</small>
                                            <div className="fw-bold">{property.availableFrom || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Property & Legal (All Types) */}
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2"><i className="fas fa-gavel me-2"></i>Property & Legal</h6>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <small className="text-muted">Property Condition:</small>
                                            <div className="fw-bold">{property.propertyCondition || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Ownership:</small>
                                            <div className="fw-bold">{property.ownership || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Plot Area:</small>
                                            <div className="fw-bold">{property.plotArea ? `${property.plotArea} sq ft` : 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Built-up Area:</small>
                                            <div className="fw-bold">{property.builtUpArea ? `${property.builtUpArea} sq ft` : 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Carpet Area:</small>
                                            <div className="fw-bold">{property.carpetArea ? `${property.carpetArea} sq ft` : 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Total Construction Area:</small>
                                            <div className="fw-bold">{property.totalConstructionArea ? `${property.totalConstructionArea} sq ft` : 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Frontage:</small>
                                            <div className="fw-bold">{property.frontage ? `${property.frontage} ft` : 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Road Access:</small>
                                            <div className="fw-bold">{property.roadAccess ? `${property.roadAccess} ft` : 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Industrial/Shed Specific (Industrial Only) */}
                                {property.propertyType === 'industrial' && (
                                    <div className="mb-3">
                                        <h6 className="text-primary mb-2"><i className="fas fa-cog me-2"></i>Industrial/Shed Specific</h6>
                                        <div className="row g-2">
                                            <div className="col-md-6">
                                                <small className="text-muted">Shed Height:</small>
                                                <div className="fw-bold">{property.shedHeight ? `${property.shedHeight} ft` : 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted">Shed Side Wall Height:</small>
                                                <div className="fw-bold">{property.shedSideWallHeight ? `${property.shedSideWallHeight} ft` : 'N/A'}</div>
                                            </div>
                                            <div className="col-12">
                                                <small className="text-muted">Plot Dimensions:</small>
                                                <div className="fw-bold">{property.plotDimensions || 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted">Shed Built-up Area:</small>
                                                <div className="fw-bold">{property.shedBuiltUpArea ? `${property.shedBuiltUpArea} sq ft` : 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted">Built-up Construction Area:</small>
                                                <div className="fw-bold">{property.builtUpConstructionArea ? `${property.builtUpConstructionArea} sq ft` : 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted">Electricity Load:</small>
                                                <div className="fw-bold">{property.electricityLoad || 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted">Water Available:</small>
                                                <div className="fw-bold">{property.waterAvailable || 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted">Pre-leased:</small>
                                                <div className="fw-bold">{property.preLeased || 'N/A'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <small className="text-muted">Pre-rented:</small>
                                                <div className="fw-bold">{property.preRented || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Lease & Financials (All Types) */}
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2"><i className="fas fa-money-bill-wave me-2"></i>Lease & Financials</h6>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <small className="text-muted">Expected Rent:</small>
                                            <div className="fw-bold">{property.expectedRent ? `₹${property.expectedRent}` : 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Rent Negotiable:</small>
                                            <div className="fw-bold">{property.rentNegotiable || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Security Deposit:</small>
                                            <div className="fw-bold">{property.securityDeposit || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Rent Increase:</small>
                                            <div className="fw-bold">{property.rentIncrease || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Lock-in Period:</small>
                                            <div className="fw-bold">{property.lockInPeriod || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Charges & Inclusions (All Types) */}
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2"><i className="fas fa-calculator me-2"></i>Charges & Inclusions</h6>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <small className="text-muted">Damp UPS Included:</small>
                                            <div className="fw-bold">{property.dampUpsIncluded || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Electricity Included:</small>
                                            <div className="fw-bold">{property.electricityIncluded || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Water Charges Included:</small>
                                            <div className="fw-bold">{property.waterChargesIncluded || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floors & Elevation (All Types) */}
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2"><i className="fas fa-building me-2"></i>Floors & Elevation</h6>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <small className="text-muted">Your Floor:</small>
                                            <div className="fw-bold">{property.yourFloor || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Total Floors:</small>
                                            <div className="fw-bold">{property.totalFloors || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Staircases:</small>
                                            <div className="fw-bold">{property.staircases || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Passenger Lift:</small>
                                            <div className="fw-bold">{property.passengerLift || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Service Lift:</small>
                                            <div className="fw-bold">{property.serviceLift || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Parking & Washrooms (All Types) */}
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2"><i className="fas fa-parking me-2"></i>Parking & Washrooms</h6>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <small className="text-muted">Parking Type:</small>
                                            <div className="fw-bold">{property.parkingType || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Washroom Type:</small>
                                            <div className="fw-bold">{property.washroomType || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Facing & Facilities (All Types) */}
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2"><i className="fas fa-compass me-2"></i>Facing & Facilities</h6>
                                    <div className="row g-2">
                                        <div className="col-12">
                                            <small className="text-muted">Rear Facing:</small>
                                            <div className="fw-bold">{property.rearFacing || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Facing:</small>
                                            <div className="fw-bold">{property.facing || 'N/A'}</div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">Road Facing:</small>
                                            <div className="fw-bold">{property.roadFacing || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Residential Specific Fields */}
                                {property.propertyType === 'residential' && (
                                    <>
                                        {/* Configuration & Area (Residential) */}
                                        <div className="mb-3">
                                            <h6 className="text-primary mb-2"><i className="fas fa-ruler-combined me-2"></i>Configuration & Area</h6>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <small className="text-muted">Property Age:</small>
                                                    <div className="fw-bold">{property.propertyAge || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Floor Number:</small>
                                                    <div className="fw-bold">{property.floorNumber || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Bathrooms:</small>
                                                    <div className="fw-bold">{property.bathrooms || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Balconies:</small>
                                                    <div className="fw-bold">{property.balconies || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Furnishing:</small>
                                                    <div className="fw-bold">{property.furnishing || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Parking & Accessibility (Residential) */}
                                        <div className="mb-3">
                                            <h6 className="text-primary mb-2"><i className="fas fa-parking me-2"></i>Parking & Accessibility</h6>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <small className="text-muted">Covered Parking:</small>
                                                    <div className="fw-bold">{property.coveredParking || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Open Parking:</small>
                                                    <div className="fw-bold">{property.openParking || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Parking Charges:</small>
                                                    <div className="fw-bold">{property.parkingCharges || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tenancy Details (Residential) */}
                                        <div className="mb-3">
                                            <h6 className="text-primary mb-2"><i className="fas fa-users me-2"></i>Tenancy Details</h6>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <small className="text-muted">Preferred Tenant:</small>
                                                    <div className="fw-bold">{property.tenantType || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Pet Friendly:</small>
                                                    <div className="fw-bold">{property.petFriendly || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Maintenance Charges:</small>
                                                    <div className="fw-bold">{property.maintenanceCharges || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Room & Facilities (Residential) */}
                                        <div className="mb-3">
                                            <h6 className="text-primary mb-2"><i className="fas fa-bed me-2"></i>Room & Facilities</h6>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <small className="text-muted">Servant Room:</small>
                                                    <div className="fw-bold">{property.servantRoom || 'N/A'}</div>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted">Additional Amenities:</small>
                                                    <div className="fw-bold">{property.amenitiesText || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Residency & Location (Residential) */}
                                        <div className="mb-3">
                                            <h6 className="text-primary mb-2"><i className="fas fa-map-marker-alt me-2"></i>Residency & Location</h6>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <small className="text-muted">Current Residents:</small>
                                                    <div className="fw-bold">{property.residentsCount || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Commercial Specific Fields */}
                                {property.propertyType === 'commercial' && (
                                    <>
                                        {/* Status & Availability (Commercial) */}
                                        <div className="mb-3">
                                            <h6 className="text-primary mb-2"><i className="fas fa-clock me-2"></i>Status & Availability</h6>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <small className="text-muted">Available From:</small>
                                                    <div className="fw-bold">{property.availableFrom || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Land Specific Fields */}
                                {property.propertyType === 'land' && (
                                    <>
                                        {/* Land Features (Land) */}
                                        <div className="mb-3">
                                            <h6 className="text-primary mb-2"><i className="fas fa-map me-2"></i>Land Features</h6>
                                            <div className="row g-2">
                                                <div className="col-md-6">
                                                    <small className="text-muted">Area (Acres):</small>
                                                    <div className="fw-bold">{property.areaAcres ? `${property.areaAcres} acres` : 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Land Facing:</small>
                                                    <div className="fw-bold">{property.landFacing || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Road Width:</small>
                                                    <div className="fw-bold">{property.roadWidth ? `${property.roadWidth} ft` : 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6">
                                                    <small className="text-muted">Land Status:</small>
                                                    <div className="fw-bold">{property.landStatus || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Sidebar */}
                <div className="col-lg-4">
                    <div className="card shadow-custom sticky-top">
                        <div className="card-header">
                            <h4 className="mb-0">Contact Property Owner</h4>
                        </div>
                        <div className="card-body">
                            {/* Owner Info */}
                            <div className="d-flex align-items-center mb-3">
                                <img
                                    src={property.ownerPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60&q=80'}
                                    className="rounded-circle me-3 owner-photo"
                                    alt="Owner"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                />
                                <div>
                                    <h6 className="mb-0">{property.ownerName || 'Property Owner'}</h6>
                                    <small className="text-muted">Property Manager</small>
                                </div>
                            </div>

                            <div className="d-grid gap-2 mb-3">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => setShowContactModal(true)}
                                >
                                    <i className="fas fa-envelope me-2"></i>Contact Owner
                                </button>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => window.open(`tel:+1234567890`)}
                                >
                                    <i className="fas fa-phone me-2"></i>Call Now
                                </button>
                                <button
                                    className="btn btn-outline-success"
                                    onClick={() => window.open('https://wa.me/1234567890')}
                                >
                                    <i className="fab fa-whatsapp me-2"></i>WhatsApp
                                </button>
                            </div>

                            <hr />

                            <div className="property-stats">
                                <h5 className="mb-3">Property Stats</h5>
                                <div className="stat-item d-flex justify-content-between mb-2">
                                    <span className="text-muted">Property ID:</span>
                                    <span className="fw-bold">#{property.id?.substring(0, 8)?.toUpperCase()}</span>
                                </div>
                                <div className="stat-item d-flex justify-content-between mb-2">
                                    <span className="text-muted">Listed:</span>
                                    <span className="fw-bold">
                                        {property.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                    </span>
                                </div>
                                <div className="stat-item d-flex justify-content-between mb-2">
                                    <span className="text-muted">Views:</span>
                                    <span className="fw-bold">247</span>
                                </div>
                                <div className="stat-item d-flex justify-content-between">
                                    <span className="text-muted">Type:</span>
                                    <span className="fw-bold">{property.listingType === 'rent' ? 'Rental' : 'Sale'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Contact Property Owner</h5>
                                <button type="button" className="btn-close" onClick={() => setShowContactModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleContactSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="contact-name" className="form-label">Your Name</label>
                                        <input type="text" className="form-control" id="contact-name" required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="contact-email" className="form-label">Your Email</label>
                                        <input type="email" className="form-control" id="contact-email" required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="contact-phone" className="form-label">Your Phone</label>
                                        <input type="tel" className="form-control" id="contact-phone" required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="contact-message" className="form-label">Message</label>
                                        <textarea
                                            className="form-control"
                                            id="contact-message"
                                            rows="4"
                                            placeholder="I'm interested in this property..."
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Send Message</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-share-alt me-2"></i>Share This Property
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowShareModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <h6 className="text-muted mb-3">Share this amazing property with your friends and family</h6>
                                    <div className="property-share-preview p-3 bg-light rounded">
                                        <h6 className="mb-1">{property.name}</h6>
                                        <p className="text-muted mb-1">
                                            <i className="fas fa-map-marker-alt me-1"></i>{getLocationText()}
                                        </p>
                                        <p className="text-primary mb-0">{getPriceText()}</p>
                                    </div>
                                </div>

                                {/* Sharing Options */}
                                <div className="row g-3">
                                    <div className="col-6">
                                        <button
                                            className="btn btn-success w-100 share-option-btn"
                                            onClick={() => handleShare('whatsapp')}
                                        >
                                            <i className="fab fa-whatsapp fa-2x mb-2"></i>
                                            <div>WhatsApp</div>
                                        </button>
                                    </div>
                                    <div className="col-6">
                                        <button
                                            className="btn btn-primary w-100 share-option-btn"
                                            onClick={() => handleShare('copy')}
                                        >
                                            <i className="fas fa-copy fa-2x mb-2"></i>
                                            <div>Copy Link</div>
                                        </button>
                                    </div>
                                    <div className="col-6">
                                        <button
                                            className="btn btn-info w-100 share-option-btn"
                                            onClick={() => handleShare('email')}
                                        >
                                            <i className="fas fa-envelope fa-2x mb-2"></i>
                                            <div>Email</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetails;
