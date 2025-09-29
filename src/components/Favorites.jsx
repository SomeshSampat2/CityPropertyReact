import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserFavorites } from '../services/favoritesService';
import { propertyTypeConfigs } from '../utils/propertyTypeConfigs';
import PropertyCard from './PropertyCard';

const Favorites = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [filteredFavorites, setFilteredFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [error, setError] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Load favorites when component mounts or user changes
    useEffect(() => {
        if (user && isAuthenticated) {
            loadFavorites();
        }
    }, [user, isAuthenticated]);

    // Filter favorites when filter or favorites change
    useEffect(() => {
        if (currentFilter === 'all') {
            setFilteredFavorites(favorites);
        } else {
            setFilteredFavorites(favorites.filter(property =>
                property.propertyType === currentFilter
            ));
        }
    }, [favorites, currentFilter]);

    const loadFavorites = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const userFavorites = await getUserFavorites(user.uid);
            setFavorites(userFavorites);
        } catch (error) {
            console.error('Error loading favorites:', error);
            setError('Error loading favorites. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = useCallback((propertyId) => {
        setFavorites(prev => prev.filter(property => property.id !== propertyId));
        // The filtered favorites will be updated automatically via useEffect
    }, []);

    const handleFilterChange = (filterType) => {
        setCurrentFilter(filterType);
    };

    const handleRefresh = () => {
        loadFavorites();
    };

    // Statistics
    const getStatistics = () => {
        const total = favorites.length;
        const residential = favorites.filter(p => p.propertyType === 'residential').length;
        const commercial = favorites.filter(p => p.propertyType === 'commercial').length;
        const industrial = favorites.filter(p => p.propertyType === 'industrial').length;
        const land = favorites.filter(p => p.propertyType === 'land').length;

        return { total, residential, commercial, industrial, land };
    };

    const stats = getStatistics();

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="container mt-4">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="display-6 fw-bold text-primary mb-2">
                        <i className="fas fa-heart me-3"></i>My Favorites
                    </h1>
                    {favorites.length > 0 && (
                        <p className="text-muted mb-0">
                            You have {stats.total} favorite{stats.total !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate('/home')}
                    >
                        <i className="fas fa-home me-2"></i>Browse Properties
                    </button>
                    <button
                        className="btn btn-outline-info"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <i className="fas fa-refresh me-2"></i>Refresh
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
                                        className={`btn w-100 favorites-filter-btn ${currentFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => handleFilterChange('all')}
                                    >
                                        <i className="fas fa-th-large me-1"></i>All
                                    </button>
                                </div>
                                {Object.entries(propertyTypeConfigs).map(([type, config]) => (
                                    <div key={type} className="col-lg-2 col-md-3 col-sm-6">
                                        <button
                                            className={`btn w-100 favorites-filter-btn ${currentFilter === type ? `btn-${config.color}` : 'btn-outline-primary'}`}
                                            onClick={() => handleFilterChange(type)}
                                        >
                                            <i className={`${config.icon} me-1`}></i>
                                            {config.displayName}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading your favorites...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="row">
                    <div className="col-12">
                        <div className="alert alert-danger">
                            <h4>Error</h4>
                            <p>{error}</p>
                            <button className="btn btn-outline-danger" onClick={loadFavorites}>
                                <i className="fas fa-refresh me-2"></i>Retry
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Favorites List */}
            {!loading && !error && (
                <>
                    {filteredFavorites.length === 0 && favorites.length === 0 ? (
                        /* No Favorites State */
                        <div className="text-center py-5">
                            <h3 className="text-muted">No favorites yet</h3>
                            <p className="text-muted mb-4">
                                Start exploring properties and save your favorites by clicking the heart icon
                            </p>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => navigate('/home')}
                            >
                                <i className="fas fa-home me-2"></i>Browse Properties
                            </button>
                        </div>
                    ) : filteredFavorites.length === 0 ? (
                        /* No Results for Current Filter */
                        <div className="text-center py-5">
                            <h4 className="text-muted">No {currentFilter === 'all' ? '' : propertyTypeConfigs[currentFilter]?.displayName + ' '}properties in favorites</h4>
                            <p className="text-muted mb-4">Try selecting a different filter</p>
                        </div>
                    ) : (
                        /* Favorites Grid */
                        <div className="row g-4">
                            {filteredFavorites.map(property => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    onRemoveFavorite={handleRemoveFavorite}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Favorites;
