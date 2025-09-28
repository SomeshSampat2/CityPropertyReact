import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import '../styles/styles.css';

const Home = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [allProperties, setAllProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [favorites, setFavorites] = useState(new Set());
    const [filtering, setFiltering] = useState(false);

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Load all properties once on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadAllProperties();
            loadFavorites();
        }
    }, [isAuthenticated]);

    // Memoized filtered properties
    const filteredProperties = useMemo(() => {
        if (currentFilter === 'all') {
            return allProperties;
        }
        return allProperties.filter(property => property.propertyType === currentFilter);
    }, [allProperties, currentFilter]);

    const loadAllProperties = async () => {
        setLoading(true);
        try {
            const queryRef = query(
                collection(db, 'properties'),
                where('isActive', '==', true)
            );

            const snapshot = await getDocs(queryRef);

            if (snapshot.empty) {
                setAllProperties([]);
                setLoading(false);
                return;
            }

            // Convert to array and sort by createdAt
            const propertiesData = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                propertiesData.push({
                    id: doc.id,
                    ...data
                });
            });

            // Sort by createdAt (newest first)
            propertiesData.sort((a, b) => {
                const aTime = a.createdAt ? (a.createdAt.seconds || a.createdAt.getTime?.() / 1000 || 0) : 0;
                const bTime = b.createdAt ? (b.createdAt.seconds || b.createdAt.getTime?.() / 1000 || 0) : 0;
                return bTime - aTime;
            });

            setAllProperties(propertiesData);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFavorites = async () => {
        if (!user) return;

        try {
            const favoritesSnapshot = await getDocs(
                collection(db, 'users', user.uid, 'favorites')
            );

            const favoriteIds = new Set();
            favoritesSnapshot.forEach(doc => {
                favoriteIds.add(doc.id);
            });

            setFavorites(favoriteIds);
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const toggleFavorite = async (propertyId) => {
        if (!user) {
            alert('Please log in to manage favorites.');
            return;
        }

        try {
            const isFavorited = favorites.has(propertyId);

            if (isFavorited) {
                // Remove from favorites
                await db.collection('users').doc(user.uid).collection('favorites').doc(propertyId).delete();
                setFavorites(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(propertyId);
                    return newSet;
                });
                alert('Property removed from favorites');
            } else {
                // Add to favorites
                await db.collection('users').doc(user.uid).collection('favorites').doc(propertyId).set({
                    addedAt: new Date(),
                    userId: user.uid,
                    propertyId: propertyId
                });
                setFavorites(prev => new Set([...prev, propertyId]));
                alert('Property added to favorites!');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Error updating favorites. Please try again.');
        }
    };

    const getPropertyTypeDisplay = (type) => {
        const types = {
            'residential': 'Residential',
            'commercial': 'Commercial',
            'industrial': 'Industrial',
            'land': 'Land'
        };
        return types[type] || type || 'Property';
    };

    const sampleImages = [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ];

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

    return (
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

            {/* Property Type Filter Buttons */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow-custom">
                        <div className="card-body p-4">
                            <h5 className="card-title mb-3">
                                <i className="fas fa-filter me-2"></i>Filter by Property Type
                            </h5>
                            <div className="row g-2">
                                <div className="col-lg-2 col-md-3 col-sm-6">
                                    <button
                                        className={`btn w-100 property-filter-btn ${currentFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setCurrentFilter('all')}
                                    >
                                        <i className="fas fa-th-large me-1"></i>All
                                    </button>
                                </div>
                                <div className="col-lg-2 col-md-3 col-sm-6">
                                    <button
                                        className={`btn w-100 property-filter-btn ${currentFilter === 'residential' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setCurrentFilter('residential')}
                                    >
                                        <i className="fas fa-home me-1"></i>Residential
                                    </button>
                                </div>
                                <div className="col-lg-2 col-md-3 col-sm-6">
                                    <button
                                        className={`btn w-100 property-filter-btn ${currentFilter === 'commercial' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setCurrentFilter('commercial')}
                                    >
                                        <i className="fas fa-building me-1"></i>Commercial
                                    </button>
                                </div>
                                <div className="col-lg-2 col-md-3 col-sm-6">
                                    <button
                                        className={`btn w-100 property-filter-btn ${currentFilter === 'industrial' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setCurrentFilter('industrial')}
                                    >
                                        <i className="fas fa-industry me-1"></i>Industrial
                                    </button>
                                </div>
                                <div className="col-lg-2 col-md-3 col-sm-6">
                                    <button
                                        className={`btn w-100 property-filter-btn ${currentFilter === 'land' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setCurrentFilter('land')}
                                    >
                                        <i className="fas fa-map me-1"></i>Land
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Properties Grid */}
            <div className="row g-2" id="properties-list">
                {filteredProperties.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <div className="display-1 text-muted mb-3">🏠</div>
                        <h3 className="text-muted">No properties found</h3>
                        <p className="text-muted mb-4">Start by adding your first property to showcase</p>
                        <button className="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#propertyTypeModal">
                            <i className="fas fa-plus me-2"></i>Add Your First Property
                        </button>
                    </div>
                ) : (
                    filteredProperties.map((property, index) => {
                        const sampleImage = sampleImages[index % sampleImages.length];
                        const listingType = property.listingType || 'rent';
                        const priceText = listingType === 'rent' ? `Rs. ${property.price}/month` : `Rs. ${property.price}`;

                        // Format location
                        let location = '';
                        if (property.buildingName && property.locationDetails) {
                            location = `${property.buildingName}, ${property.locationDetails}`;
                        } else if (property.buildingName) {
                            location = property.buildingName;
                        } else if (property.locationDetails) {
                            location = property.locationDetails;
                        } else if (property.address) {
                            location = property.address;
                        } else if (property.location) {
                            location = property.location;
                        } else {
                            location = 'Location not specified';
                        }
                        const cityState = property.city && property.state ? `${property.city}, ${property.state}` : '';

                        return (
                            <div key={property.id} className="col-md-4 col-sm-6 col-12">
                                <div className="card h-100 shadow-custom" data-property-id={property.id}>
                                    <div className="position-relative">
                                        <img
                                            src={sampleImage}
                                            className="card-img-top"
                                            alt={property.name}
                                            onClick={() => navigate(`/property-details?id=${property.id}&img=${index}`)}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                                            }}
                                            style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                                        />
                                        <div className="position-absolute top-0 start-0 m-2">
                                            <span className="badge bg-primary rounded-pill">
                                                <i className="fas fa-home me-1"></i>{getPropertyTypeDisplay(property.propertyType)}
                                            </span>
                                        </div>
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <span className="badge bg-info rounded-pill">
                                                For {listingType === 'rent' ? 'Rent' : 'Sale'}
                                            </span>
                                        </div>
                                        <div className="position-absolute bottom-0 end-0 m-2">
                                            <button
                                                className={`btn btn-sm ${favorites.has(property.id) ? 'btn-favorite' : 'btn-outline-favorite'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(property.id);
                                                }}
                                                title={favorites.has(property.id) ? 'Remove from favorites' : 'Add to favorites'}
                                            >
                                                <i className={`favorite-heart ${favorites.has(property.id) ? 'fas' : 'far'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className="card-body d-flex flex-column"
                                        onClick={() => navigate(`/property-details?id=${property.id}&img=${index}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h5 className="card-title">{property.name}</h5>
                                        <p className="card-text flex-grow-1">
                                            <small className="text-muted">
                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                {location}
                                                {cityState && `, ${cityState}`}
                                            </small>
                                        </p>
                                        <p className="card-text mt-auto">
                                            <strong className="text-primary">{priceText}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Property Type Modal */}
            <div className="modal fade" id="propertyTypeModal" tabIndex="-1" aria-labelledby="propertyTypeModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
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
    );
};

export default Home;
