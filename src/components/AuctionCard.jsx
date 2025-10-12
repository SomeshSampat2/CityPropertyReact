import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatAuctionForDisplay } from '../services/firebase';
import { sampleImages } from '../utils/propertyTypeConfigs';

const AuctionCard = ({ auction, onEdit, onDelete, index = 0 }) => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const handleCardClick = () => {
        navigate(`/auction-details?id=${auction.id}`);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(auction);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(auction);
        }
    };

    // Format auction data for display
    const displayAuction = formatAuctionForDisplay(auction);

    // Get property type info for styling (reuse existing utility if available)
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

    const imageIndex = index % sampleImages.length;
    const displayImage = sampleImages[imageIndex];

    return (
        <div className="col-md-4 col-sm-6 col-12 mb-4">
            <div className="card h-100 shadow-custom auction-card">
                <div className="position-relative">
                    <img
                        src={displayImage}
                        className="card-img-top"
                        alt={auction.address}
                        onClick={handleCardClick}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                        }}
                        style={{ height: '220px', objectFit: 'cover', cursor: 'pointer' }}
                    />

                    {/* Property Type Badge */}
                    <div className="position-absolute top-0 start-0 m-2">
                        <span className={`badge bg-${propertyTypeInfo.color} rounded-pill px-3 py-2`}>
                            <i className={`${propertyTypeInfo.icon} me-1`}></i>
                            {propertyTypeInfo.displayName}
                        </span>
                    </div>

                    {/* Auction Type Badge */}
                    <div className="position-absolute top-0 end-0 m-2">
                        <span className={`badge bg-${auction.auctionType === 'Physical' ? 'success' : auction.auctionType === 'Symbolic' ? 'warning' : 'info'} rounded-pill px-3 py-2`}>
                            {auction.auctionType || 'Auction'}
                        </span>
                    </div>

                    {/* Possession Status Badge */}
                    <div className="position-absolute bottom-0 start-0 m-2">
                        <span className={`badge bg-${auction.possession === 'Vacant' ? 'success' : auction.possession === 'Occupied' ? 'danger' : 'warning'} rounded-pill px-3 py-2`}>
                            {auction.possession || 'N/A'}
                        </span>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="position-absolute bottom-0 end-0 m-2 d-flex gap-2">
                            <button
                                className="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px' }}
                                onClick={handleEdit}
                                title="Edit auction"
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            <button
                                className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px' }}
                                onClick={handleDelete}
                                title="Delete auction"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    )}
                </div>

                <div
                    className="card-body d-flex flex-column p-3"
                    onClick={handleCardClick}
                    style={{ cursor: 'pointer' }}
                >
                    <h5 className="card-title text-truncate mb-2">{auction.address}</h5>
                    <p className="card-text description flex-grow-1 mb-3">
                        {auction.description || 'No description available'}
                    </p>

                    <div className="auction-details mb-3">
                        <div className="row g-2">
                            <div className="col-6">
                                <div className="text-center">
                                    <small className="text-muted d-block mb-1">Reserve Price</small>
                                    <strong className="text-success fs-6">{displayAuction.formattedReservePrice}</strong>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="text-center">
                                    <small className="text-muted d-block mb-1">EMD Amount</small>
                                    <strong className="text-info fs-6">{displayAuction.formattedEMDAmount}</strong>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="text-center">
                                    <small className="text-muted d-block mb-1">Auction Date</small>
                                    <strong className="text-primary fs-6">{auction.auctionDate ? new Date(auction.auctionDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    }) : 'N/A'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="auction-meta mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                {auction.city}
                            </small>
                            <small className="text-muted">
                                <i className="fas fa-building me-1"></i>
                                {auction.bankAgency}
                            </small>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button
                            className="btn btn-primary w-100 py-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick();
                            }}
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionCard;
