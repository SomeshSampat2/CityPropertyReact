import React, { useState, useEffect } from 'react';
import { updateProperty } from '../services/myPropertiesService';
import { propertyTypeConfigs } from '../utils/propertyTypeConfigs';

const EditPropertyModal = ({ show, onHide, property, onSave }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Sample states and cities data (you might want to move this to a separate file)
    const statesAndCities = {
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Sangli', 'Satara', 'Ratnagiri'],
        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar'],
        'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere'],
        'Delhi': ['New Delhi', 'Delhi'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
        'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
        'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad'],
        'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur'],
        'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar'],
        'Andhra Pradesh': ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore'],
        'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam'],
        'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur'],
        'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
        'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
        'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar'],
        'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga']
    };

    useEffect(() => {
        setStates(Object.keys(statesAndCities));
    }, []);

    useEffect(() => {
        if (property) {
            console.log('EditPropertyModal - Property data received:', property);

            const newFormData = {
                name: property.name || '',
                description: property.description || '',
                price: property.price || '',
                buildingName: property.buildingName || '',
                locationDetails: property.locationDetails || '',
                state: property.state || '',
                city: property.city || '',
                pincode: property.pincode || '',
                propertyType: property.propertyType || 'residential',
                listingType: property.listingType || 'rent',
                // Residential fields
                builtUpArea: property.builtUpArea || '',
                carpetArea: property.carpetArea || '',
                propertyAge: property.propertyAge || '',
                totalFloors: property.totalFloors || '',
                floorNumber: property.floorNumber || '',
                bathrooms: property.bathrooms || '',
                balconies: property.balconies || '',
                furnishing: property.furnishing || '',
                coveredParking: property.coveredParking || '',
                openParking: property.openParking || '',
                parkingCharges: property.parkingCharges || '',
                tenantType: property.tenantType || '',
                petFriendly: property.petFriendly || '',
                availableFrom: property.availableFrom || '',
                maintenanceCharges: property.maintenanceCharges || '',
                securityDeposit: property.securityDeposit || '',
                lockInPeriod: property.lockInPeriod || '',
                brokerageRequired: property.brokerageRequired || '',
                nonVegAllowed: property.nonVegAllowed || '',
                servantRoom: property.servantRoom || '',
                facing: property.facing || '',
                residentsCount: property.residentsCount || '',
                amenities: property.amenities || [],
                // Commercial fields
                commercialType: property.commercialType || '',
                locality: property.locality || '',
                zoneType: property.zoneType || '',
                locationHub: property.locationHub || '',
                possessionStatus: property.possessionStatus || '',
                propertyCondition: property.propertyCondition || '',
                ownership: property.ownership || '',
                plotArea: property.plotArea || '',
                totalConstructionArea: property.totalConstructionArea || '',
                frontage: property.frontage || '',
                roadAccess: property.roadAccess || '',
                expectedRent: property.expectedRent || '',
                rentNegotiable: property.rentNegotiable || '',
                rentIncrease: property.rentIncrease || '',
                dampUpsIncluded: property.dampUpsIncluded || '',
                electricityIncluded: property.electricityIncluded || '',
                waterChargesIncluded: property.waterChargesIncluded || '',
                yourFloor: property.yourFloor || '',
                staircases: property.staircases || '',
                passengerLift: property.passengerLift || '',
                serviceLift: property.serviceLift || '',
                parkingType: property.parkingType || '',
                washroomType: property.washroomType || '',
                rearFacing: property.rearFacing || '',
                roadFacing: property.roadFacing || '',
                // Industrial fields
                industrialType: property.industrialType || '',
                shedHeight: property.shedHeight || '',
                shedSideWallHeight: property.shedSideWallHeight || '',
                plotDimensions: property.plotDimensions || '',
                shedBuiltUpArea: property.shedBuiltUpArea || '',
                builtUpConstructionArea: property.builtUpConstructionArea || '',
                electricityLoad: property.electricityLoad || '',
                waterAvailable: property.waterAvailable || '',
                preLeased: property.preLeased || '',
                preRented: property.preRented || ''
            };

            console.log('EditPropertyModal - Setting form data:', newFormData);
            setFormData(newFormData);

            // Update cities when state changes
            if (property.state && statesAndCities[property.state]) {
                setCities(statesAndCities[property.state]);
            }
        }
    }, [property]);

    useEffect(() => {
        if (formData.state && statesAndCities[formData.state]) {
            setCities(statesAndCities[formData.state]);
        } else {
            setCities([]);
        }
    }, [formData.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === 'amenities') {
            setFormData(prev => ({
                ...prev,
                amenities: checked
                    ? [...(prev.amenities || []), value]
                    : (prev.amenities || []).filter(amenity => amenity !== value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.description || !formData.price ||
                !formData.buildingName || !formData.locationDetails || !formData.state || !formData.city) {
                alert('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Prepare data for submission
            const submitData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                listingType: formData.listingType,
                propertyType: formData.propertyType,
                buildingName: formData.buildingName,
                locationDetails: formData.locationDetails,
                state: formData.state,
                city: formData.city,
                pincode: formData.pincode,
                amenities: formData.amenities || []
            };

            // Add type-specific fields
            if (formData.propertyType === 'residential') {
                // Add residential-specific fields
                Object.assign(submitData, {
                    builtUpArea: formData.builtUpArea ? parseInt(formData.builtUpArea) : null,
                    carpetArea: formData.carpetArea ? parseInt(formData.carpetArea) : null,
                    propertyAge: formData.propertyAge || null,
                    totalFloors: formData.totalFloors || null,
                    floorNumber: formData.floorNumber || null,
                    bathrooms: formData.bathrooms || null,
                    balconies: formData.balconies || null,
                    furnishing: formData.furnishing || null,
                    coveredParking: formData.coveredParking || null,
                    openParking: formData.openParking || null,
                    parkingCharges: formData.parkingCharges || null,
                    tenantType: formData.tenantType || null,
                    petFriendly: formData.petFriendly || null,
                    availableFrom: formData.availableFrom || null,
                    maintenanceCharges: formData.maintenanceCharges || null,
                    securityDeposit: formData.securityDeposit || null,
                    lockInPeriod: formData.lockInPeriod || null,
                    brokerageRequired: formData.brokerageRequired || null,
                    nonVegAllowed: formData.nonVegAllowed || null,
                    servantRoom: formData.servantRoom || null,
                    facing: formData.facing || null,
                    residentsCount: formData.residentsCount || null
                });
            } else if (formData.propertyType === 'commercial') {
                // Add commercial-specific fields
                Object.assign(submitData, {
                    commercialType: formData.commercialType || null,
                    locality: formData.locality || null,
                    zoneType: formData.zoneType || null,
                    locationHub: formData.locationHub || null,
                    possessionStatus: formData.possessionStatus || null,
                    propertyCondition: formData.propertyCondition || null,
                    ownership: formData.ownership || null,
                    plotArea: formData.plotArea ? parseInt(formData.plotArea) : null,
                    totalConstructionArea: formData.totalConstructionArea ? parseInt(formData.totalConstructionArea) : null,
                    frontage: formData.frontage ? parseInt(formData.frontage) : null,
                    roadAccess: formData.roadAccess ? parseInt(formData.roadAccess) : null,
                    expectedRent: formData.expectedRent ? parseInt(formData.expectedRent) : null,
                    rentNegotiable: formData.rentNegotiable || null,
                    rentIncrease: formData.rentIncrease || null,
                    dampUpsIncluded: formData.dampUpsIncluded || null,
                    electricityIncluded: formData.electricityIncluded || null,
                    waterChargesIncluded: formData.waterChargesIncluded || null,
                    yourFloor: formData.yourFloor || null,
                    staircases: formData.staircases || null,
                    passengerLift: formData.passengerLift || null,
                    serviceLift: formData.serviceLift || null,
                    parkingType: formData.parkingType || null,
                    washroomType: formData.washroomType || null,
                    rearFacing: formData.rearFacing || null,
                    roadFacing: formData.roadFacing || null
                });
            } else if (formData.propertyType === 'industrial') {
                // Add industrial-specific fields
                Object.assign(submitData, {
                    industrialType: formData.industrialType || null,
                    locality: formData.locality || null,
                    zoneType: formData.zoneType || null,
                    locationHub: formData.locationHub || null,
                    possessionStatus: formData.possessionStatus || null,
                    propertyCondition: formData.propertyCondition || null,
                    ownership: formData.ownership || null,
                    plotArea: formData.plotArea ? parseInt(formData.plotArea) : null,
                    totalConstructionArea: formData.totalConstructionArea ? parseInt(formData.totalConstructionArea) : null,
                    frontage: formData.frontage ? parseInt(formData.frontage) : null,
                    roadAccess: formData.roadAccess ? parseInt(formData.roadAccess) : null,
                    shedHeight: formData.shedHeight ? parseInt(formData.shedHeight) : null,
                    shedSideWallHeight: formData.shedSideWallHeight ? parseInt(formData.shedSideWallHeight) : null,
                    plotDimensions: formData.plotDimensions || null,
                    shedBuiltUpArea: formData.shedBuiltUpArea ? parseInt(formData.shedBuiltUpArea) : null,
                    builtUpConstructionArea: formData.builtUpConstructionArea ? parseInt(formData.builtUpConstructionArea) : null,
                    electricityLoad: formData.electricityLoad || null,
                    waterAvailable: formData.waterAvailable || null,
                    preLeased: formData.preLeased || null,
                    preRented: formData.preRented || null,
                    expectedRent: formData.expectedRent ? parseInt(formData.expectedRent) : null,
                    rentNegotiable: formData.rentNegotiable || null,
                    rentIncrease: formData.rentIncrease || null,
                    dampUpsIncluded: formData.dampUpsIncluded || null,
                    electricityIncluded: formData.electricityIncluded || null,
                    waterChargesIncluded: formData.waterChargesIncluded || null,
                    yourFloor: formData.yourFloor || null,
                    staircases: formData.staircases || null,
                    passengerLift: formData.passengerLift || null,
                    serviceLift: formData.serviceLift || null,
                    parkingType: formData.parkingType || null,
                    washroomType: formData.washroomType || null,
                    rearFacing: formData.rearFacing || null,
                    roadFacing: formData.roadFacing || null
                });
            }

            await updateProperty(property.id, submitData);
            onSave();
            onHide();

        } catch (error) {
            console.error('Error updating property:', error);
            alert('Error updating property: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!show || !property) return null;

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
                            <i className="fas fa-edit me-2"></i>Edit Property
                        </h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>

                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <input type="hidden" name="propertyType" value={formData.propertyType || 'residential'} />

                            {/* Basic Information */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h6 className="text-primary mb-3">
                                        <i className="fas fa-info-circle me-2"></i>Basic Information
                                    </h6>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Property Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Green Valley Apartments"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Monthly Rent (₹) *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={formData.price || ''}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., 25000"
                                        />
                                    </div>
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Description *</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        rows="3"
                                        value={formData.description || ''}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Describe your property in detail..."
                                    />
                                </div>
                            </div>

                            {/* Location Information */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h6 className="text-primary mb-3">
                                        <i className="fas fa-map-marker-alt me-2"></i>Location Information
                                    </h6>
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Building/Society/Apartment Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="buildingName"
                                        value={formData.buildingName || ''}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Green Valley Apartments"
                                    />
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Detailed Location *</label>
                                    <textarea
                                        className="form-control"
                                        name="locationDetails"
                                        rows="2"
                                        value={formData.locationDetails || ''}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter complete address including street, area, landmarks"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">State *</label>
                                    <select
                                        className="form-select"
                                        name="state"
                                        value={formData.state || ''}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">City *</label>
                                    <select
                                        className="form-select"
                                        name="city"
                                        value={formData.city || ''}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Pincode</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="pincode"
                                        value={formData.pincode || ''}
                                        onChange={handleInputChange}
                                        pattern="[0-9]{6}"
                                        placeholder="e.g., 400001"
                                    />
                                </div>
                            </div>

                            {/* Property Type Specific Fields */}
                            {formData.propertyType === 'residential' && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="fas fa-home me-2"></i>Residential Details
                                        </h6>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Built-up Area (sq ft)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="builtUpArea"
                                            value={formData.builtUpArea || ''}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 1000"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Carpet Area (sq ft)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="carpetArea"
                                            value={formData.carpetArea || ''}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 800"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Property Age</label>
                                        <select className="form-select" name="propertyAge" value={formData.propertyAge || ''} onChange={handleInputChange}>
                                            <option value="">Select Age</option>
                                            <option value="Under Construction">Under Construction</option>
                                            <option value="Less than 1 year">Less than 1 year</option>
                                            <option value="1-3 years">1-3 years</option>
                                            <option value="3-5 years">3-5 years</option>
                                            <option value="5-10 years">5-10 years</option>
                                            <option value="More than 10 years">More than 10 years</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Total Floors</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="totalFloors"
                                            value={formData.totalFloors || ''}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 10"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Floor Number</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="floorNumber"
                                            value={formData.floorNumber || ''}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 5"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Bathrooms</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="bathrooms"
                                            value={formData.bathrooms || ''}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 2"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Balconies</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="balconies"
                                            value={formData.balconies || ''}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 1"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Furnishing</label>
                                        <select className="form-select" name="furnishing" value={formData.furnishing || ''} onChange={handleInputChange}>
                                            <option value="">Select Furnishing</option>
                                            <option value="Unfurnished">Unfurnished</option>
                                            <option value="Semi-furnished">Semi-furnished</option>
                                            <option value="Fully furnished">Fully furnished</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Amenities Section for Residential */}
                            {formData.propertyType === 'residential' && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="fas fa-star me-2"></i>Amenities
                                        </h6>
                                    </div>
                                    <div className="col-12">
                                        <div className="row">
                                            {[
                                                'Swimming Pool', 'Gym', 'Garden', 'Security', 'Elevator', 'Air Conditioning',
                                                'Heating', 'Laundry', 'Storage', 'High-Speed Internet', 'Furnished', 'Parking',
                                                'Power Backup', 'Water Supply', 'Waste Disposal', 'Landscaping', 'CCTV',
                                                'Gated Community', 'Intercom', 'Visitor Parking'
                                            ].map(amenity => (
                                                <div key={amenity} className="col-md-4 col-sm-6 mb-2">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            name="amenities"
                                                            value={amenity}
                                                            checked={(formData.amenities || []).includes(amenity)}
                                                            onChange={handleCheckboxChange}
                                                            id={`amenity-${amenity.replace(/\s+/g, '-').toLowerCase()}`}
                                                        />
                                                        <label className="form-check-label" htmlFor={`amenity-${amenity.replace(/\s+/g, '-').toLowerCase()}`}>
                                                            {amenity}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onHide}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-2"></i>Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPropertyModal;
