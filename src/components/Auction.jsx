import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    loadAvailableAuctions,
    loadUpcomingAuctions,
    addAuction,
    updateAuction,
    deleteAuction,
    filterAuctions,
    getAuctionStats
} from '../services/firebase/auctionService';
import AuctionCard from './AuctionCard';
import AddAuctionModal from './AddAuctionModal';
import EditAuctionModal from './EditAuctionModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import '../styles/styles.css';

const Auction = () => {
    const { user, userRole, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('available');
    const [availableAuctions, setAvailableAuctions] = useState([]);
    const [upcomingAuctions, setUpcomingAuctions] = useState([]);
    const [filteredAuctions, setFilteredAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        city: '',
        propertyType: '',
        bankAgency: ''
    });

    // Stats state
    const [stats, setStats] = useState({
        totalActive: 0,
        myAuctions: 0,
        upcoming: 0,
        past: 0
    });

    // Load auctions on component mount and when user changes
    useEffect(() => {
        if (user) {
            loadAuctions();
            loadStats();
        }
    }, [user, userRole]);

    // Apply filters when filters change
    useEffect(() => {
        applyFilters();
    }, [availableAuctions, filters]);

    const loadAuctions = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load available auctions (visible to all)
            const available = await loadAvailableAuctions();
            setAvailableAuctions(available);

            // Load upcoming auctions (only for admin/superadmin)
            if (isAdmin) {
                const upcoming = await loadUpcomingAuctions(user.uid);
                setUpcomingAuctions(upcoming);
            }
        } catch (error) {
            console.error('Error loading auctions:', error);
            setError('Failed to load auctions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            if (isAdmin) {
                const auctionStats = await getAuctionStats(user.uid);
                setStats(auctionStats);
            }
        } catch (error) {
            console.error('Error loading auction stats:', error);
        }
    };

    const applyFilters = async () => {
        try {
            if (filters.city || filters.propertyType || filters.bankAgency) {
                const filtered = await filterAuctions(filters);
                setFilteredAuctions(filtered);
            } else {
                setFilteredAuctions([]);
            }
        } catch (error) {
            console.error('Error applying filters:', error);
            setFilteredAuctions([]);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleAddAuction = () => {
        setShowAddModal(true);
    };

    const handleEditAuction = (auction) => {
        setSelectedAuction(auction);
        setShowEditModal(true);
    };

    const handleDeleteAuction = (auction) => {
        setSelectedAuction(auction);
        setShowDeleteModal(true);
    };

    const handleAddSubmit = async (auctionData) => {
        try {
            await addAuction(auctionData, user.uid, userRole);
            setShowAddModal(false);
            loadAuctions(); // Refresh the list
        } catch (error) {
            console.error('Error adding auction:', error);
            throw error; // Let the modal handle the error
        }
    };

    const handleEditSubmit = async (auctionData) => {
        try {
            await updateAuction(selectedAuction.id, auctionData, user.uid);
            setShowEditModal(false);
            setSelectedAuction(null);
            loadAuctions(); // Refresh the list
        } catch (error) {
            console.error('Error updating auction:', error);
            throw error; // Let the modal handle the error
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteAuction(selectedAuction.id, user.uid);
            setShowDeleteModal(false);
            setSelectedAuction(null);
            loadAuctions(); // Refresh the list
        } catch (error) {
            console.error('Error deleting auction:', error);
            throw error; // Let the modal handle the error
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // Get auctions to display based on current tab and filters
    const getDisplayAuctions = () => {
        if (activeTab === 'available') {
            return filteredAuctions.length > 0 ? filteredAuctions : availableAuctions;
        } else {
            return upcomingAuctions;
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading auctions...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="mb-0">
                                <i className="fas fa-gavel me-2 text-primary"></i>
                                Auction Properties
                            </h2>
                            {isAdmin && (
                                <div className="mt-2">
                                    <small className="text-muted">
                                        Active: {stats.totalActive} | My Auctions: {stats.myAuctions} |
                                        Upcoming: {stats.upcoming} | Past: {stats.past}
                                    </small>
                                </div>
                            )}
                        </div>
                        {isAdmin && (
                            <button
                                className="btn btn-primary"
                                onClick={handleAddAuction}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Add Auction Property
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <ul className="nav nav-tabs mb-4" id="auctionTabs" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
                                onClick={() => handleTabChange('available')}
                                type="button"
                                role="tab"
                            >
                                <i className="fas fa-eye me-2"></i>
                                Available Auctions
                                {availableAuctions.length > 0 && (
                                    <span className="badge bg-primary ms-2">{availableAuctions.length}</span>
                                )}
                            </button>
                        </li>
                        {isAdmin && (
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('upcoming')}
                                    type="button"
                                    role="tab"
                                >
                                    <i className="fas fa-clock me-2"></i>
                                    My Auctions
                                    {upcomingAuctions.length > 0 && (
                                        <span className="badge bg-secondary ms-2">{upcomingAuctions.length}</span>
                                    )}
                                </button>
                            </li>
                        )}
                    </ul>

                    {/* Filters */}
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                            >
                                <option value="">All Cities</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Pune">Pune</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Chennai">Chennai</option>
                                <option value="Hyderabad">Hyderabad</option>
                                <option value="Kolkata">Kolkata</option>
                                <option value="Ahmedabad">Ahmedabad</option>
                                <option value="Jaipur">Jaipur</option>
                                <option value="Surat">Surat</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={filters.propertyType}
                                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                            >
                                <option value="">All Property Types</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                                <option value="agricultural">Agricultural</option>
                                <option value="plot">Plot</option>
                                <option value="land">Land</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by Bank/Agency"
                                value={filters.bankAgency}
                                onChange={(e) => handleFilterChange('bankAgency', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={loadAuctions}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="tab-content" id="auctionTabContent">
                        {activeTab === 'available' && (
                            <div className="tab-pane fade show active" role="tabpanel">
                                {getDisplayAuctions().length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-gavel fa-3x text-muted mb-3"></i>
                                        <h4 className="text-muted">No auctions available</h4>
                                        <p className="text-muted">
                                            {filters.city || filters.propertyType || filters.bankAgency
                                                ? 'No auctions match your current filters.'
                                                : 'There are no active auction properties at the moment.'
                                            }
                                        </p>
                                        {(filters.city || filters.propertyType || filters.bankAgency) && (
                                            <button
                                                className="btn btn-outline-primary"
                                                onClick={() => setFilters({ city: '', propertyType: '', bankAgency: '' })}
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="row">
                                        {getDisplayAuctions().map((auction, index) => (
                                            <AuctionCard
                                                key={auction.id}
                                                auction={auction}
                                                index={index}
                                                onEdit={isAdmin ? handleEditAuction : null}
                                                onDelete={isAdmin ? handleDeleteAuction : null}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'upcoming' && isAdmin && (
                            <div className="tab-pane fade show active" role="tabpanel">
                                {upcomingAuctions.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-clock fa-3x text-muted mb-3"></i>
                                        <h4 className="text-muted">No past auctions</h4>
                                        <p className="text-muted">
                                            You haven't created any auction properties yet, or all your auctions are still active.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {upcomingAuctions.map((auction, index) => (
                                            <AuctionCard
                                                key={auction.id}
                                                auction={auction}
                                                index={index}
                                                onEdit={handleEditAuction}
                                                onDelete={handleDeleteAuction}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddAuctionModal
                    show={showAddModal}
                    onHide={() => setShowAddModal(false)}
                    onSubmit={handleAddSubmit}
                />
            )}

            {showEditModal && selectedAuction && (
                <EditAuctionModal
                    show={showEditModal}
                    auction={selectedAuction}
                    onHide={() => {
                        setShowEditModal(false);
                        setSelectedAuction(null);
                    }}
                    onSubmit={handleEditSubmit}
                />
            )}

            {showDeleteModal && selectedAuction && (
                <DeleteConfirmationModal
                    show={showDeleteModal}
                    onHide={() => {
                        setShowDeleteModal(false);
                        setSelectedAuction(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                    itemName={selectedAuction.address}
                    itemType="auction"
                />
            )}
        </div>
    );
};

export default Auction;
