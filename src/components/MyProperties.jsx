import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProperties, deleteProperty } from '../services/myPropertiesService';
import MyPropertiesCard from './MyPropertiesCard';
import EditPropertyModal from './EditPropertyModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const MyProperties = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [editingProperty, setEditingProperty] = useState(null);
    const [deletingProperty, setDeletingProperty] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Load user properties
    useEffect(() => {
        if (isAuthenticated && user) {
            loadProperties();
        }
    }, [isAuthenticated, user]);

    // Filter properties when properties or filter changes
    useEffect(() => {
        if (currentFilter === 'all') {
            setFilteredProperties(properties);
        } else {
            setFilteredProperties(properties.filter(property => property.listingType === currentFilter));
        }
    }, [properties, currentFilter]);

    const loadProperties = async () => {
        try {
            setLoading(true);
            setError(null);
            const userProperties = await getUserProperties(user.uid);
            setProperties(userProperties);
        } catch (error) {
            console.error('Error loading properties:', error);
            setError('Failed to load properties. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filter) => {
        setCurrentFilter(filter);
    };

    const handleEdit = (propertyId) => {
        const property = properties.find(p => p.id === propertyId);
        if (property) {
            console.log('Opening edit modal for property:', property);
            setEditingProperty(property);
        } else {
            console.error('Property not found for editing:', propertyId);
        }
    };

    const handleDelete = (propertyId, propertyName) => {
        setDeletingProperty({ id: propertyId, name: propertyName });
    };

    const confirmDelete = async () => {
        if (!deletingProperty) return;

        try {
            await deleteProperty(deletingProperty.id);
            setProperties(properties.filter(p => p.id !== deletingProperty.id));
            setDeletingProperty(null);
            // Show success message (you could add a toast here)
            console.log('Property deleted successfully');
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Error deleting property. Please try again.');
        }
    };

    const handleSave = () => {
        loadProperties(); // Refresh the properties list
        setEditingProperty(null);
    };

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="display-6 fw-bold text-primary mb-2">
                        <i className="fas fa-building me-2"></i>My Properties
                    </h1>
                    <p className="lead text-muted">View and manage all your listed properties</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-4">
                <div className="btn-group" role="group">
                    <input
                        type="radio"
                        className="btn-check"
                        name="propertyFilter"
                        id="all-properties"
                        checked={currentFilter === 'all'}
                        onChange={() => handleFilterChange('all')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="all-properties">
                        All Properties ({properties.length})
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name="propertyFilter"
                        id="rent-properties"
                        checked={currentFilter === 'rent'}
                        onChange={() => handleFilterChange('rent')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="rent-properties">
                        For Rent ({properties.filter(p => p.listingType === 'rent').length})
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name="propertyFilter"
                        id="sale-properties"
                        checked={currentFilter === 'sale'}
                        onChange={() => handleFilterChange('sale')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="sale-properties">
                        For Sale ({properties.filter(p => p.listingType === 'sale').length})
                    </label>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3">Loading your properties...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button className="btn btn-outline-danger btn-sm ms-3" onClick={loadProperties}>
                        <i className="fas fa-refresh me-1"></i>Retry
                    </button>
                </div>
            )}

            {/* No Properties Message */}
            {!loading && !error && filteredProperties.length === 0 && (
                <div className="text-center py-5">
                    <div className="display-1 text-muted mb-3">🏠</div>
                    <h4 className="text-muted mb-3">
                        {properties.length === 0 ? 'No Properties Listed' : 'No Properties Found'}
                    </h4>
                    <p className="text-muted mb-4">
                        {properties.length === 0
                            ? "You haven't listed any properties yet."
                            : `No properties found for the selected filter: ${currentFilter === 'rent' ? 'For Rent' : currentFilter === 'sale' ? 'For Sale' : 'All'}.`
                        }
                    </p>
                    {properties.length === 0 && (
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
                            <i className="fas fa-home me-2"></i>Add Your First Property
                        </button>
                    )}
                </div>
            )}

            {/* Properties Grid */}
            {!loading && !error && filteredProperties.length > 0 && (
                <div className="row g-4">
                    {filteredProperties.map(property => (
                        <MyPropertiesCard
                            key={property.id}
                            property={property}
                            properties={filteredProperties}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modal Backdrop */}
            {(editingProperty || deletingProperty) && (
                <div
                    className="modal-backdrop fade show"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1040
                    }}
                    onClick={() => {
                        setEditingProperty(null);
                        setDeletingProperty(null);
                    }}
                />
            )}

            {/* Edit Property Modal */}
            <EditPropertyModal
                show={!!editingProperty}
                onHide={() => setEditingProperty(null)}
                property={editingProperty}
                onSave={handleSave}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={!!deletingProperty}
                onHide={() => setDeletingProperty(null)}
                onConfirm={confirmDelete}
                propertyName={deletingProperty?.name || ''}
            />
        </div>
    );
};

export default MyProperties;
