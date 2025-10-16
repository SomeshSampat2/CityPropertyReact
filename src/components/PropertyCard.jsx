import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { removeFromFavorites, addToFavorites } from '../services/favoritesService';
import { getPropertyTypeInfo, getPropertyTypeDetails, formatPrice, formatLocation, sampleImages } from '../utils/propertyTypeConfigs';

const PropertyCard = ({ property, index = 0, onRemoveFavorite }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCardClick = () => {
        // Navigate to property details page with image index (same as home screen)
        navigate(`/property-details?id=${property.id}&img=${imageIndex}`);
    };

    const handleRemoveFavorite = async (e) => {
        e.stopPropagation(); // Prevent card click

        if (!user) {
            alert('Please log in to manage favorites.');
            return;
        }

        try {
            await removeFromFavorites(user.uid, property.id);
            onRemoveFavorite(property.id);

            // Show success message (you might want to use a toast library)
            console.log('Property removed from favorites');
        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('Error removing favorite. Please try again.');
        }
    };

    const propertyTypeInfo = getPropertyTypeInfo(property.propertyType);
    const typeDetails = getPropertyTypeDetails(property);
    const priceText = formatPrice(property);
    const { location, cityState } = formatLocation(property);

    // Get sample image based on index (same logic as home screen)
    const displayImage = sampleImages[index % sampleImages.length];

    return (
        <div className="col-md-4 col-sm-6 col-12">
            <div className="card h-100 shadow-custom favorite-property-card">
                <div className="position-relative">
                    <img
                        src={displayImage}
                        className="card-img-top"
                        alt={property.name}
                        onClick={handleCardClick}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                        }}
                        style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
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

                    {/* Remove from Favorites Button */}
                    <div className="position-absolute bottom-0 end-0 m-2">
                        <button
                            className="btn btn-sm btn-favorite favorite-btn animate-heartbeat"
                            onClick={handleRemoveFavorite}
                            title="Remove from favorites"
                        >
                            <i className="fas fa-heart"></i>
                        </button>
                    </div>
                </div>

                <div
                    className="card-body d-flex flex-column"
                    onClick={handleCardClick}
                    style={{ cursor: 'pointer' }}
                >
                    <h5 className="card-title">{property.name}</h5>
                    <p className="card-text description flex-grow-1">{property.description}</p>

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

                    <p className="card-text">
                        <small className="text-muted">
                            <i className="fas fa-user me-1"></i>
                            Listed by: {property.ownerName || 'Property Owner'}
                        </small>
                    </p>

                    <p className="card-text mt-auto">
                        <strong className="text-primary">{priceText}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
