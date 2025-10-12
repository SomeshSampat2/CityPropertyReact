import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const EditAuctionModal = ({ show, auction, onHide, onSubmit }) => {
    const { user, userRole, isAdmin } = useAuth();
    const [formData, setFormData] = useState({
        // Main Auction Details
        auctionType: 'Physical',
        city: '',
        bankAgency: '',
        propertyType: 'residential',
        address: '',
        description: '',
        possession: 'Vacant',
        reservePrice: '',
        emdAmount: '',
        bidIncrement: '',
                auctionDate: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
                inspectionDate: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
                emdSubmissionDate: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
        location: '',
        contact: '',
        paperNotice: false,
        cersaiId: '',
        auctionAct: 'SARFAESI Act',

        // Property Boundaries
        boundaries: {
            east: '',
            west: '',
            north: '',
            south: ''
        },

        // Registration Details
        registrationInfo: {
            name: '',
            bankAgency: '',
            state: '',
            zone: '',
            email: '',
            address: '',
            contact: '',
            requestStatus: 'Request'
        }
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Populate form when auction data is available
    useEffect(() => {
        if (show && auction) {
            setFormData({
                auctionType: auction.auctionType || 'Physical',
                city: auction.city || '',
                bankAgency: auction.bankAgency || '',
                propertyType: auction.propertyType || 'residential',
                address: auction.address || '',
                description: auction.description || '',
                possession: auction.possession || 'Vacant',
                reservePrice: auction.reservePrice || '',
                emdAmount: auction.emdAmount || '',
                bidIncrement: auction.bidIncrement || '',
                auctionDate: auction.auctionDate ? new Date(auction.auctionDate).toISOString().slice(0, 16) : '',
                inspectionDate: auction.inspectionDate ? new Date(auction.inspectionDate).toISOString().slice(0, 16) : '',
                emdSubmissionDate: auction.emdSubmissionDate ? new Date(auction.emdSubmissionDate).toISOString().slice(0, 16) : '',
                location: auction.location || '',
                contact: auction.contact || '',
                paperNotice: auction.paperNotice || false,
                cersaiId: auction.cersaiId || '',
                auctionAct: auction.auctionAct || 'SARFAESI Act',
                boundaries: {
                    east: auction.boundaries?.east || '',
                    west: auction.boundaries?.west || '',
                    north: auction.boundaries?.north || '',
                    south: auction.boundaries?.south || ''
                },
                registrationInfo: {
                    name: auction.registrationInfo?.name || '',
                    bankAgency: auction.registrationInfo?.bankAgency || '',
                    state: auction.registrationInfo?.state || '',
                    zone: auction.registrationInfo?.zone || '',
                    email: auction.registrationInfo?.email || '',
                    address: auction.registrationInfo?.address || '',
                    contact: auction.registrationInfo?.contact || '',
                    requestStatus: auction.registrationInfo?.requestStatus || 'Request'
                }
            });
            setErrors({});
        }
    }, [show, auction]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleBoundaryChange = (direction, value) => {
        setFormData(prev => ({
            ...prev,
            boundaries: {
                ...prev.boundaries,
                [direction]: value
            }
        }));
    };

    const handleRegistrationChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            registrationInfo: {
                ...prev.registrationInfo,
                [field]: value
            }
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.auctionType) newErrors.auctionType = 'Auction type is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.bankAgency) newErrors.bankAgency = 'Bank/Agency is required';
        if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.possession) newErrors.possession = 'Possession status is required';
        if (!formData.reservePrice) newErrors.reservePrice = 'Reserve price is required';
        if (!formData.emdAmount) newErrors.emdAmount = 'EMD amount is required';
        if (!formData.bidIncrement) newErrors.bidIncrement = 'Bid increment is required';
        if (!formData.auctionDate) newErrors.auctionDate = 'Auction date is required';
        if (!formData.inspectionDate) newErrors.inspectionDate = 'Inspection date is required';
        if (!formData.emdSubmissionDate) newErrors.emdSubmissionDate = 'EMD submission date is required';
        if (!formData.location) newErrors.location = 'Auction location is required';
        if (!formData.contact) newErrors.contact = 'Contact is required';

        // Numeric validations
        if (formData.reservePrice && isNaN(formData.reservePrice)) {
            newErrors.reservePrice = 'Reserve price must be a valid number';
        }
        if (formData.emdAmount && isNaN(formData.emdAmount)) {
            newErrors.emdAmount = 'EMD amount must be a valid number';
        }
        if (formData.bidIncrement && isNaN(formData.bidIncrement)) {
            newErrors.bidIncrement = 'Bid increment must be a valid number';
        }

        // Date validations
        if (formData.auctionDate && new Date(formData.auctionDate) <= new Date()) {
            newErrors.auctionDate = 'Auction date must be in the future';
        }
        if (formData.inspectionDate && formData.auctionDate && new Date(formData.inspectionDate) >= new Date(formData.auctionDate)) {
            newErrors.inspectionDate = 'Inspection date must be before auction date';
        }
        if (formData.emdSubmissionDate && formData.auctionDate && new Date(formData.emdSubmissionDate) >= new Date(formData.auctionDate)) {
            newErrors.emdSubmissionDate = 'EMD submission date must be before auction date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
            if (error.message) {
                setErrors({ submit: error.message });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!show || !auction) return null;

    return (
        <div
            className="modal fade show"
            style={{
                display: 'block',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1055,
                width: '100%',
                height: '100%',
                overflowX: 'hidden',
                overflowY: 'auto',
                outline: 0
            }}
            tabIndex="-1"
        >
            <div className="modal-dialog modal-xl" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-edit me-2 text-primary"></i>
                            Edit Auction Property
                        </h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {errors.submit && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.submit}
                                </div>
                            )}

                            {/* Warning about date change */}
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                <strong>Note:</strong> Changing the auction date will move this auction to the Available tab if it becomes a future date.
                            </div>

                            {/* Main Auction Details */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h6 className="section-title">
                                        <i className="fas fa-gavel me-2"></i>
                                        Main Auction Details
                                    </h6>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Auction Type <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${errors.auctionType ? 'is-invalid' : ''}`}
                                            value={formData.auctionType}
                                            onChange={(e) => handleInputChange('auctionType', e.target.value)}
                                        >
                                            <option value="Physical">Physical</option>
                                            <option value="Symbolic">Symbolic</option>
                                            <option value="Upcoming">Upcoming</option>
                                        </select>
                                        {errors.auctionType && <div className="invalid-feedback">{errors.auctionType}</div>}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            City <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${errors.city ? 'is-invalid' : ''}`}
                                            value={formData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                        >
                                            <option value="">Select City</option>
                                            <option value="Mumbai">Mumbai</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Bangalore">Bangalore</option>
                                            <option value="Hyderabad">Hyderabad</option>
                                            <option value="Ahmedabad">Ahmedabad</option>
                                            <option value="Chennai">Chennai</option>
                                            <option value="Kolkata">Kolkata</option>
                                            <option value="Surat">Surat</option>
                                            <option value="Pune">Pune</option>
                                            <option value="Jaipur">Jaipur</option>
                                            <option value="Lucknow">Lucknow</option>
                                            <option value="Kanpur">Kanpur</option>
                                            <option value="Nagpur">Nagpur</option>
                                            <option value="Indore">Indore</option>
                                            <option value="Thane">Thane</option>
                                            <option value="Bhopal">Bhopal</option>
                                            <option value="Visakhapatnam">Visakhapatnam</option>
                                            <option value="Pimpri-Chinchwad">Pimpri-Chinchwad</option>
                                            <option value="Patna">Patna</option>
                                            <option value="Vadodara">Vadodara</option>
                                            <option value="Ghaziabad">Ghaziabad</option>
                                        </select>
                                        {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Bank/Agency <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.bankAgency ? 'is-invalid' : ''}`}
                                            value={formData.bankAgency}
                                            onChange={(e) => handleInputChange('bankAgency', e.target.value)}
                                            placeholder="Enter bank or agency name"
                                        />
                                        {errors.bankAgency && <div className="invalid-feedback">{errors.bankAgency}</div>}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Property Type <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${errors.propertyType ? 'is-invalid' : ''}`}
                                            value={formData.propertyType}
                                            onChange={(e) => handleInputChange('propertyType', e.target.value)}
                                        >
                                            <option value="residential">Residential</option>
                                            <option value="commercial">Commercial</option>
                                            <option value="industrial">Industrial</option>
                                            <option value="agricultural">Agricultural</option>
                                            <option value="plot">Plot</option>
                                            <option value="land">Land</option>
                                        </select>
                                        {errors.propertyType && <div className="invalid-feedback">{errors.propertyType}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Address/Area <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            placeholder="Enter property address"
                                        />
                                        {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Possession Status <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${errors.possession ? 'is-invalid' : ''}`}
                                            value={formData.possession}
                                            onChange={(e) => handleInputChange('possession', e.target.value)}
                                        >
                                            <option value="Vacant">Vacant</option>
                                            <option value="Occupied">Occupied</option>
                                            <option value="Under Construction">Under Construction</option>
                                        </select>
                                        {errors.possession && <div className="invalid-feedback">{errors.possession}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Property Description <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Detailed description of the property"
                                />
                                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                            </div>

                            <div className="row">
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Reserve Price (₹) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.reservePrice ? 'is-invalid' : ''}`}
                                            value={formData.reservePrice}
                                            onChange={(e) => handleInputChange('reservePrice', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {errors.reservePrice && <div className="invalid-feedback">{errors.reservePrice}</div>}
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            EMD Amount (₹) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.emdAmount ? 'is-invalid' : ''}`}
                                            value={formData.emdAmount}
                                            onChange={(e) => handleInputChange('emdAmount', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {errors.emdAmount && <div className="invalid-feedback">{errors.emdAmount}</div>}
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Bid Increment (₹) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.bidIncrement ? 'is-invalid' : ''}`}
                                            value={formData.bidIncrement}
                                            onChange={(e) => handleInputChange('bidIncrement', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {errors.bidIncrement && <div className="invalid-feedback">{errors.bidIncrement}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Auction Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            ref={(el) => {
                                                if (el) {
                                                    el.addEventListener('click', () => el.showPicker?.());
                                                }
                                            }}
                                            type="date"
                                            className={`form-control ${errors.auctionDate ? 'is-invalid' : ''}`}
                                            value={formData.auctionDate ? formData.auctionDate.split('T')[0] : ''}
                                            onChange={(e) => {
                                                const date = e.target.value;
                                                handleInputChange('auctionDate', date ? `${date}T00:00:00.000Z` : '');
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {errors.auctionDate && <div className="invalid-feedback">{errors.auctionDate}</div>}
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Inspection Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            ref={(el) => {
                                                if (el) {
                                                    el.addEventListener('click', () => el.showPicker?.());
                                                }
                                            }}
                                            type="date"
                                            className={`form-control ${errors.inspectionDate ? 'is-invalid' : ''}`}
                                            value={formData.inspectionDate ? formData.inspectionDate.split('T')[0] : ''}
                                            onChange={(e) => {
                                                const date = e.target.value;
                                                handleInputChange('inspectionDate', date ? `${date}T00:00:00.000Z` : '');
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {errors.inspectionDate && <div className="invalid-feedback">{errors.inspectionDate}</div>}
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            EMD Submission Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            ref={(el) => {
                                                if (el) {
                                                    el.addEventListener('click', () => el.showPicker?.());
                                                }
                                            }}
                                            type="date"
                                            className={`form-control ${errors.emdSubmissionDate ? 'is-invalid' : ''}`}
                                            value={formData.emdSubmissionDate ? formData.emdSubmissionDate.split('T')[0] : ''}
                                            onChange={(e) => {
                                                const date = e.target.value;
                                                handleInputChange('emdSubmissionDate', date ? `${date}T00:00:00.000Z` : '');
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {errors.emdSubmissionDate && <div className="invalid-feedback">{errors.emdSubmissionDate}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Auction Venue <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            placeholder="Venue or link for auction"
                                        />
                                        {errors.location && <div className="invalid-feedback">{errors.location}</div>}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Contact <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
                                            value={formData.contact}
                                            onChange={(e) => handleInputChange('contact', e.target.value)}
                                            placeholder="Contact person or phone"
                                        />
                                        {errors.contact && <div className="invalid-feedback">{errors.contact}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">CERSAI ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.cersaiId}
                                            onChange={(e) => handleInputChange('cersaiId', e.target.value)}
                                            placeholder="Optional CERSAI ID"
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Auction Act</label>
                                        <select
                                            className="form-select"
                                            value={formData.auctionAct}
                                            onChange={(e) => handleInputChange('auctionAct', e.target.value)}
                                        >
                                            <option value="SARFAESI Act">SARFAESI Act</option>
                                            <option value="DRT Act">DRT Act</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <div className="form-check mb-3">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="paperNotice"
                                            checked={formData.paperNotice}
                                            onChange={(e) => handleInputChange('paperNotice', e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="paperNotice">
                                            Paper Notice Available
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Property Boundaries */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h6 className="section-title">
                                        <i className="fas fa-map me-2"></i>
                                        Property Boundaries
                                    </h6>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">East</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.boundaries.east}
                                            onChange={(e) => handleBoundaryChange('east', e.target.value)}
                                            placeholder="East boundary"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">West</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.boundaries.west}
                                            onChange={(e) => handleBoundaryChange('west', e.target.value)}
                                            placeholder="West boundary"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">North</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.boundaries.north}
                                            onChange={(e) => handleBoundaryChange('north', e.target.value)}
                                            placeholder="North boundary"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">South</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.boundaries.south}
                                            onChange={(e) => handleBoundaryChange('south', e.target.value)}
                                            placeholder="South boundary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Registration Details */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h6 className="section-title">
                                        <i className="fas fa-user-plus me-2"></i>
                                        Auction Registration Details
                                    </h6>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.registrationInfo.name}
                                            onChange={(e) => handleRegistrationChange('name', e.target.value)}
                                            placeholder="Registrant name"
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Bank/Agency</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.registrationInfo.bankAgency}
                                            onChange={(e) => handleRegistrationChange('bankAgency', e.target.value)}
                                            placeholder="Bank or agency name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">State</label>
                                        <select
                                            className="form-select"
                                            value={formData.registrationInfo.state}
                                            onChange={(e) => handleRegistrationChange('state', e.target.value)}
                                        >
                                            <option value="">Select State</option>
                                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                                            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                            <option value="Assam">Assam</option>
                                            <option value="Bihar">Bihar</option>
                                            <option value="Chhattisgarh">Chhattisgarh</option>
                                            <option value="Goa">Goa</option>
                                            <option value="Gujarat">Gujarat</option>
                                            <option value="Haryana">Haryana</option>
                                            <option value="Himachal Pradesh">Himachal Pradesh</option>
                                            <option value="Jharkhand">Jharkhand</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Kerala">Kerala</option>
                                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Manipur">Manipur</option>
                                            <option value="Meghalaya">Meghalaya</option>
                                            <option value="Mizoram">Mizoram</option>
                                            <option value="Nagaland">Nagaland</option>
                                            <option value="Odisha">Odisha</option>
                                            <option value="Punjab">Punjab</option>
                                            <option value="Rajasthan">Rajasthan</option>
                                            <option value="Sikkim">Sikkim</option>
                                            <option value="Tamil Nadu">Tamil Nadu</option>
                                            <option value="Telangana">Telangana</option>
                                            <option value="Tripura">Tripura</option>
                                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                                            <option value="Uttarakhand">Uttarakhand</option>
                                            <option value="West Bengal">West Bengal</option>
                                            <option value="Delhi">Delhi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Zone</label>
                                        <select
                                            className="form-select"
                                            value={formData.registrationInfo.zone}
                                            onChange={(e) => handleRegistrationChange('zone', e.target.value)}
                                        >
                                            <option value="">Select Zone</option>
                                            <option value="North">North</option>
                                            <option value="South">South</option>
                                            <option value="East">East</option>
                                            <option value="West">West</option>
                                            <option value="Central">Central</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Email ID</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.registrationInfo.email}
                                            onChange={(e) => handleRegistrationChange('email', e.target.value)}
                                            placeholder="Email address"
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Contact</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.registrationInfo.contact}
                                            onChange={(e) => handleRegistrationChange('contact', e.target.value)}
                                            placeholder="Contact number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={formData.registrationInfo.address}
                                    onChange={(e) => handleRegistrationChange('address', e.target.value)}
                                    placeholder="Registration address"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onHide}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save me-2"></i>
                                        Update Auction
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditAuctionModal;
