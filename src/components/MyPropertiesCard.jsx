import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPropertyTypeInfo, getPropertyTypeDetails, formatPrice, formatLocation, sampleImages } from '../utils/propertyTypeConfigs';

const MyPropertiesCard = ({ property, properties, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCardClick = () => {
        // Navigate to property details page with image index
        const imageIndex = property.id ? parseInt(property.id.slice(-1), 16) % sampleImages.length : 0;
        navigate(`/property-details?id=${property.id}&img=${imageIndex}`);
    };

    const handleEdit = (e) => {
        e.stopPropagation(); // Prevent card click
        setShowDropdown(false);
        onEdit(property.id);
    };

    const handleDelete = (e) => {
        e.stopPropagation(); // Prevent card click
        setShowDropdown(false);
        onDelete(property.id, property.name);
    };

    const handleViewDetails = (e) => {
        e.stopPropagation(); // Prevent card click
        setShowDropdown(false);
        handleCardClick();
    };

    const toggleDropdown = (e) => {
        e.stopPropagation(); // Prevent card click
        setShowDropdown(!showDropdown);
    };

    const propertyTypeInfo = getPropertyTypeInfo(property.propertyType);
    const typeDetails = getPropertyTypeDetails(property);
    const priceText = formatPrice(property);
    const { location, cityState } = formatLocation(property);

    // Get sample image based on property index in the array (fallback if no ID)
    const propertyIndex = properties ? properties.findIndex(p => p.id === property.id) : 0;
    const imageIndex = propertyIndex >= 0 ? propertyIndex % sampleImages.length : 0;
    const displayImage = sampleImages[imageIndex];

    return (
        <div className="col-lg-4 col-md-6 col-12">
            <div className="card h-100 shadow-sm property-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
                <div className="position-relative">
                    <img
                        src={displayImage}
                        className="card-img-top"
                        alt={property.name}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                        }}
                        style={{ height: '200px', objectFit: 'cover' }}
                    />

                    {/* Property Type Badge */}
                    <div className="position-absolute top-0 start-0 m-2">
                        <span className={`badge bg-${propertyTypeInfo.color} rounded-pill`}>
                            <i className={`${propertyTypeInfo.icon} me-1`}></i>
                            {propertyTypeInfo.displayName}
                        </span>
                    </div>

                    {/* Listing Type Badge */}
                    <div className="position-absolute top-0 end-0 m-2">
                        <span className={`badge bg-${property.listingType === 'rent' ? 'info' : 'success'} rounded-pill`}>
                            For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                        </span>
                    </div>
                </div>

                <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{property.name}</h5>

                    {typeDetails && (
                        <p className="card-text">
                            <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                {typeDetails}
                            </small>
                        </p>
                    )}

                    <p className="card-text">
                        <small className="text-muted">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {location}
                        </small>
                    </p>

                    {cityState && (
                        <p className="card-text">
                            <small className="text-muted">
                                <i className="fas fa-city me-1"></i>
                                {cityState}
                            </small>
                        </p>
                    )}

                    <p className="card-text mt-auto">
                        <strong className="text-primary">{priceText}</strong>
                    </p>

                    {/* Created Date */}
                    {property.createdAt && (
                        <p className="card-text">
                            <small className="text-muted">
                                <i className="fas fa-calendar me-1"></i>
                                Listed: {property.createdAt.toDate ?
                                    property.createdAt.toDate().toLocaleDateString() :
                                    new Date(property.createdAt).toLocaleDateString()}
                            </small>
                        </p>
                    )}
                </div>
            </div>

            {/* Dropdown Menu - Positioned outside card */}
            <div className="position-relative" style={{ height: 0 }}>
                <div
                    ref={dropdownRef}
                    className="position-absolute"
                    style={{
                        top: '-50px',
                        right: '10px',
                        zIndex: 1050
                    }}
                >
                    <div className="dropdown">
                        <button
                            className="btn btn-sm btn-light dropdown-toggle"
                            type="button"
                            onClick={toggleDropdown}
                            aria-expanded={showDropdown}
                            style={{
                                border: '1px solid #dee2e6',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                        {showDropdown && (
                            <ul className="dropdown-menu dropdown-menu-end shadow-lg show" style={{ minWidth: '200px' }}>
                                <li>
                                    <button
                                        className="dropdown-item d-flex align-items-center"
                                        type="button"
                                        onClick={handleViewDetails}
                                    >
                                        <i className="fas fa-eye me-2"></i>
                                        <span>View Details</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item d-flex align-items-center"
                                        type="button"
                                        onClick={handleEdit}
                                    >
                                        <i className="fas fa-edit me-2"></i>
                                        <span>Edit Property</span>
                                    </button>
                                </li>
                                <li><hr className="dropdown-divider"></hr></li>
                                <li>
                                    <button
                                        className="dropdown-item text-danger d-flex align-items-center"
                                        type="button"
                                        onClick={handleDelete}
                                    >
                                        <i className="fas fa-trash me-2"></i>
                                        <span>Delete Property</span>
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPropertiesCard;
