import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addToFavorites, removeFromFavorites, isPropertyInFavorites } from '../services/favoritesService';
import { loadPropertyDetails, getSampleImages, getLocationText, getPriceText, getPropertyTypeDisplay, generateShareMessage } from '../services/firebase/propertyDetailsService';
import '../styles/styles.css';

// Helper function to conditionally render fields - hide if empty/null/undefined
const renderField = (value, formatter = null) => {
    if (value === null || value === undefined || value === '') return null;

    if (formatter && typeof formatter === 'function') {
        return formatter(value);
    }

    return value;
};

// Helper function to render field with label in a consistent format
const renderFieldWithLabel = (label, value, formatter = null, unit = '') => {
    const displayValue = renderField(value, formatter);
    if (displayValue === null) return null;

    return (
        <div className="col-md-6">
            <small className="text-muted">{label}:</small>
            <div className="fw-bold">{displayValue}{unit}</div>
        </div>
    );
};

// Helper function to check if a section has any visible fields
const hasVisibleFields = (fields) => {
    return fields.some(field => renderField(field) !== null);
};

// Helper function to render a section with conditional visibility
const renderSection = (title, icon, content, fields = []) => {
    // If fields array is provided, check if any fields are visible
    if (fields.length > 0 && !hasVisibleFields(fields)) {
        return null;
    }

    return (
        <div className="mb-3">
            <h6 className="text-primary mb-2">
                <i className={`${icon} me-2`}></i>{title}
            </h6>
            {content}
        </div>
    );
};

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
                                        <i className="fas fa-map-marker-alt me-2"></i>{getLocationText(property)}
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
                                        <h3 className="text-gradient mb-0">{getPriceText(property)}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Property Features */}
                            <div className="row g-3 mb-4">
                                {property.propertyType === 'residential' && (
                                    <>
                                        {renderField(property.bhkConfig) && (
                                        <div className="col-6 col-md-3">
                                            <div className="feature-card text-center p-3">
                                                <i className="fas fa-home text-primary mb-2"></i>
                                                    <h5 className="mb-0">{property.bhkConfig}</h5>
                                                <small className="text-muted">BHK</small>
                                            </div>
                                        </div>
                                        )}
                                        {renderField(property.builtUpArea) && (
                                        <div className="col-6 col-md-3">
                                            <div className="feature-card text-center p-3">
                                                <i className="fas fa-ruler-combined text-primary mb-2"></i>
                                                    <h5 className="mb-0">{property.builtUpArea} sq ft</h5>
                                                <small className="text-muted">Built-up Area</small>
                                            </div>
                                        </div>
                                        )}
                                        {renderField(property.bathrooms) && (
                                        <div className="col-6 col-md-3">
                                            <div className="feature-card text-center p-3">
                                                <i className="fas fa-bath text-primary mb-2"></i>
                                                    <h5 className="mb-0">{property.bathrooms}</h5>
                                                <small className="text-muted">Bathrooms</small>
                                            </div>
                                        </div>
                                        )}
                                        {renderField(property.balconies) && (
                                        <div className="col-6 col-md-3">
                                            <div className="feature-card text-center p-3">
                                                <i className="fas fa-building text-primary mb-2"></i>
                                                    <h5 className="mb-0">{property.balconies}</h5>
                                                <small className="text-muted">Balconies</small>
                                            </div>
                                        </div>
                                        )}
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
                                {renderSection(
                                    'Type & Category',
                                    'fas fa-tags',
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <small className="text-muted">Property Type:</small>
                                            <div className="fw-bold">{getPropertyTypeDisplay(property.propertyType)}</div>
                                        </div>
                                        {renderFieldWithLabel('BHK Configuration', property.bhkConfig)}
                                        {renderFieldWithLabel('Commercial Type', property.commercialType)}
                                        {renderFieldWithLabel('Industrial Type', property.industrialType)}
                                        {renderFieldWithLabel('Land Type', property.landType)}
                                    </div>,
                                    [property.bhkConfig, property.commercialType, property.industrialType, property.landType]
                                )}

                                {/* Location & Building (All Types) */}
                                {renderSection(
                                    'Location & Building',
                                    'fas fa-map-marker-alt',
                                    <div className="row g-2">
                                        {renderFieldWithLabel('Building/Project/Society Name', property.buildingName)}
                                        {renderFieldWithLabel('Locality', property.locality)}
                                        {renderFieldWithLabel('Zone Type', property.zoneType)}
                                        {renderFieldWithLabel('Location Hub', property.locationHub)}
                                    </div>,
                                    [property.buildingName, property.locality, property.zoneType, property.locationHub]
                                )}

                                {/* Status & Availability (All Types) */}
                                {renderSection(
                                    'Status & Availability',
                                    'fas fa-clock',
                                    <div className="row g-2">
                                        {renderFieldWithLabel('Possession Status', property.possessionStatus)}
                                        {renderFieldWithLabel('Available From', property.availableFrom)}
                                    </div>,
                                    [property.possessionStatus, property.availableFrom]
                                )}

                                {/* Property & Legal (All Types) */}
                                {renderSection(
                                    'Property & Legal',
                                    'fas fa-gavel',
                                    <div className="row g-2">
                                        {renderFieldWithLabel('Property Condition', property.propertyCondition)}
                                        {renderFieldWithLabel('Ownership', property.ownership)}
                                        {renderFieldWithLabel('Plot Area', property.plotArea, null, ' sq ft')}
                                        {renderFieldWithLabel('Built-up Area', property.builtUpArea, null, ' sq ft')}
                                        {renderFieldWithLabel('Carpet Area', property.carpetArea, null, ' sq ft')}
                                        {renderFieldWithLabel('Total Construction Area', property.totalConstructionArea, null, ' sq ft')}
                                        {renderFieldWithLabel('Frontage', property.frontage, null, ' ft')}
                                        {renderFieldWithLabel('Road Access', property.roadAccess, null, ' ft')}
                                    </div>,
                                    [property.propertyCondition, property.ownership, property.plotArea, property.builtUpArea, property.carpetArea, property.totalConstructionArea, property.frontage, property.roadAccess]
                                )}

                                {/* Industrial/Shed Specific (Industrial Only) */}
                                {property.propertyType === 'industrial' && renderSection(
                                    'Industrial/Shed Specific',
                                    'fas fa-cog',
                                        <div className="row g-2">
                                        {renderFieldWithLabel('Shed Height', property.shedHeight, null, ' ft')}
                                        {renderFieldWithLabel('Shed Side Wall Height', property.shedSideWallHeight, null, ' ft')}
                                        {renderFieldWithLabel('Plot Dimensions', property.plotDimensions)}
                                        {renderFieldWithLabel('Shed Built-up Area', property.shedBuiltUpArea, null, ' sq ft')}
                                        {renderFieldWithLabel('Built-up Construction Area', property.builtUpConstructionArea, null, ' sq ft')}
                                        {renderFieldWithLabel('Electricity Load', property.electricityLoad)}
                                        {renderFieldWithLabel('Water Available', property.waterAvailable)}
                                        {renderFieldWithLabel('Pre-leased', property.preLeased)}
                                        {renderFieldWithLabel('Pre-rented', property.preRented)}
                                    </div>,
                                    [property.shedHeight, property.shedSideWallHeight, property.plotDimensions, property.shedBuiltUpArea, property.builtUpConstructionArea, property.electricityLoad, property.waterAvailable, property.preLeased, property.preRented]
                                )}

                                {/* Lease & Financials (All Types) */}
                                {renderSection(
                                    'Lease & Financials',
                                    'fas fa-money-bill-wave',
                                    <div className="row g-2">
                                        {renderFieldWithLabel('Expected Rent', property.expectedRent, (val) => `₹${val}`)}
                                        {renderFieldWithLabel('Rent Negotiable', property.rentNegotiable)}
                                        {renderFieldWithLabel('Security Deposit', property.securityDeposit)}
                                        {renderFieldWithLabel('Rent Increase', property.rentIncrease)}
                                        {renderFieldWithLabel('Lock-in Period', property.lockInPeriod)}
                                    </div>,
                                    [property.expectedRent, property.rentNegotiable, property.securityDeposit, property.rentIncrease, property.lockInPeriod]
                                )}

                                {/* Charges & Inclusions (All Types) */}
                                {renderSection(
                                    'Charges & Inclusions',
                                    'fas fa-calculator',
                                    <div className="row g-2">
                                        {renderFieldWithLabel('Damp UPS Included', property.dampUpsIncluded)}
                                        {renderFieldWithLabel('Electricity Included', property.electricityIncluded)}
                                        {renderFieldWithLabel('Water Charges Included', property.waterChargesIncluded)}
                                    </div>,
                                    [property.dampUpsIncluded, property.electricityIncluded, property.waterChargesIncluded]
                                )}

                                {/* Floors & Elevation (All Types) */}
                                {renderSection(
                                    'Floors & Elevation',
                                    'fas fa-building',
                                    <div className="row g-2">
                                        {renderFieldWithLabel('Your Floor', property.yourFloor)}
                                        {renderFieldWithLabel('Total Floors', property.totalFloors)}
                                        {renderFieldWithLabel('Staircases', property.staircases)}
                                        {renderFieldWithLabel('Passenger Lift', property.passengerLift)}
                                        {renderFieldWithLabel('Service Lift', property.serviceLift)}
                                    </div>,
                                    [property.yourFloor, property.totalFloors, property.staircases, property.passengerLift, property.serviceLift]
                                )}

                                {/* Parking & Washrooms (All Types) */}
                                {renderSection(
                                    'Parking & Washrooms',
                                    'fas fa-parking',
                                    <div className="row g-2">
                                        {renderFieldWithLabel('Parking Type', property.parkingType)}
                                        {renderFieldWithLabel('Washroom Type', property.washroomType)}
                                    </div>,
                                    [property.parkingType, property.washroomType]
                                )}

                                {/* Facing & Facilities (All Types) */}
                                {renderSection(
                                    'Facing & Facilities',
                                    'fas fa-compass',
                                    <div className="row g-2">
                                        {renderFieldWithLabel('Rear Facing', property.rearFacing)}
                                        {renderFieldWithLabel('Facing', property.facing)}
                                        {renderFieldWithLabel('Road Facing', property.roadFacing)}
                                    </div>,
                                    [property.rearFacing, property.facing, property.roadFacing]
                                )}

                                {/* Residential Specific Fields */}
                                {property.propertyType === 'residential' && hasVisibleFields([
                                    property.propertyAge, property.floorNumber, property.bathrooms, property.balconies, property.furnishing,
                                    property.coveredParking, property.openParking, property.parkingCharges,
                                    property.tenantType, property.petFriendly, property.maintenanceCharges,
                                    property.servantRoom, property.amenitiesText,
                                    property.residentsCount
                                ]) && (
                                    <>
                                        {/* Configuration & Area (Residential) */}
                                        {renderSection(
                                            'Configuration & Area',
                                            'fas fa-ruler-combined',
                                            <div className="row g-2">
                                                {renderFieldWithLabel('Property Age', property.propertyAge)}
                                                {renderFieldWithLabel('Floor Number', property.floorNumber)}
                                                {renderFieldWithLabel('Bathrooms', property.bathrooms)}
                                                {renderFieldWithLabel('Balconies', property.balconies)}
                                                {renderFieldWithLabel('Furnishing', property.furnishing)}
                                            </div>,
                                            [property.propertyAge, property.floorNumber, property.bathrooms, property.balconies, property.furnishing]
                                        )}

                                        {/* Parking & Accessibility (Residential) */}
                                        {renderSection(
                                            'Parking & Accessibility',
                                            'fas fa-parking',
                                            <div className="row g-2">
                                                {renderFieldWithLabel('Covered Parking', property.coveredParking)}
                                                {renderFieldWithLabel('Open Parking', property.openParking)}
                                                {renderFieldWithLabel('Parking Charges', property.parkingCharges)}
                                            </div>,
                                            [property.coveredParking, property.openParking, property.parkingCharges]
                                        )}

                                        {/* Tenancy Details (Residential) */}
                                        {renderSection(
                                            'Tenancy Details',
                                            'fas fa-users',
                                            <div className="row g-2">
                                                {renderFieldWithLabel('Preferred Tenant', property.tenantType)}
                                                {renderFieldWithLabel('Pet Friendly', property.petFriendly)}
                                                {renderFieldWithLabel('Maintenance Charges', property.maintenanceCharges)}
                                            </div>,
                                            [property.tenantType, property.petFriendly, property.maintenanceCharges]
                                        )}

                                        {/* Room & Facilities (Residential) */}
                                        {renderSection(
                                            'Room & Facilities',
                                            'fas fa-bed',
                                            <div className="row g-2">
                                                {renderFieldWithLabel('Servant Room', property.servantRoom)}
                                                {renderFieldWithLabel('Additional Amenities', property.amenitiesText)}
                                            </div>,
                                            [property.servantRoom, property.amenitiesText]
                                        )}

                                        {/* Residency & Location (Residential) */}
                                        {renderSection(
                                            'Residency & Location',
                                            'fas fa-map-marker-alt',
                                            <div className="row g-2">
                                                {renderFieldWithLabel('Current Residents', property.residentsCount)}
                                            </div>,
                                            [property.residentsCount]
                                        )}
                                    </>
                                )}

                                {/* Commercial Specific Fields */}
                                {property.propertyType === 'commercial' && hasVisibleFields([property.availableFrom]) && (
                                    <>
                                        {/* Status & Availability (Commercial) */}
                                        {renderSection(
                                            'Status & Availability',
                                            'fas fa-clock',
                                            <div className="row g-2">
                                                {renderFieldWithLabel('Available From', property.availableFrom)}
                                            </div>,
                                            [property.availableFrom]
                                        )}
                                    </>
                                )}

                                {/* Land Specific Fields */}
                                {property.propertyType === 'land' && hasVisibleFields([property.areaAcres, property.landFacing, property.roadWidth, property.landStatus]) && (
                                    <>
                                        {/* Land Features (Land) */}
                                        {renderSection(
                                            'Land Features',
                                            'fas fa-map',
                                            <div className="row g-2">
                                                {renderFieldWithLabel('Area (Acres)', property.areaAcres, null, ' acres')}
                                                {renderFieldWithLabel('Land Facing', property.landFacing)}
                                                {renderFieldWithLabel('Road Width', property.roadWidth, null, ' ft')}
                                                {renderFieldWithLabel('Land Status', property.landStatus)}
                                            </div>,
                                            [property.areaAcres, property.landFacing, property.roadWidth, property.landStatus]
                                        )}
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
                                {renderField(property.createdAt?.toDate?.()?.toLocaleDateString()) && (
                                <div className="stat-item d-flex justify-content-between mb-2">
                                    <span className="text-muted">Listed:</span>
                                    <span className="fw-bold">
                                            {property.createdAt?.toDate?.()?.toLocaleDateString()}
                                    </span>
                                </div>
                                )}
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
                                            <i className="fas fa-map-marker-alt me-1"></i>{getLocationText(property)}
                                        </p>
                                        <p className="text-primary mb-0">{getPriceText(property)}</p>
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
