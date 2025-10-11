import React, { useState, useEffect } from 'react';
import { updateProperty } from '../services/myPropertiesService';

// Property type configurations (same as in Home.jsx)
const propertyTypeConfigs = {
    residential: {
        title: "Residential Property",
        icon: "fas fa-home",
        color: "primary",
        description: "Houses, apartments, condos, and other residential properties",
        fields: [
            {
                section: "Configuration & Area",
                icon: "fas fa-ruler-combined",
                    fields: [
                        { type: "select", id: "bhkConfig", label: "BHK Configuration", options: ["1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "4+ BHK"], default: "2 BHK", required: true },
                        { type: "number", id: "builtUpArea", label: "Built Up Area (sq ft)", placeholder: "e.g., 1200", required: true },
                        { type: "number", id: "carpetArea", label: "Carpet Area (sq ft)", placeholder: "e.g., 1000" },
                        { type: "select", id: "propertyAge", label: "Age of Property", options: ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "More than 10 years"], default: "Less than 1 year" },
                        { type: "select", id: "totalFloors", label: "Total Floors in Building", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10-20", "20+"], default: "5" },
                        { type: "select", id: "floorNumber", label: "Floor Number", options: ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor", "6th Floor", "7th Floor", "8th Floor", "9th Floor", "10th Floor", "11+ Floor"], default: "Ground Floor" },
                        { type: "select", id: "bathrooms", label: "Number of Bathrooms", options: ["1", "2", "3", "4+"], default: "2" },
                        { type: "select", id: "balconies", label: "Number of Balconies", options: ["0", "1", "2", "3", "4+"], default: "1" },
                        { type: "select", id: "furnishing", label: "Furnishing Status", options: ["Fully Furnished", "Semi-Furnished", "Unfurnished"], default: "Semi-Furnished" }
                    ]
            },
            {
                section: "Parking & Accessibility",
                icon: "fas fa-parking",
                fields: [
                    { type: "select", id: "coveredParking", label: "Covered Parking", options: ["No", "1 slot", "2 slots", "3 slots", "4+ slots"], default: "1 slot" },
                    { type: "select", id: "openParking", label: "Open Parking", options: ["No", "1 slot (2-wheeler)", "1 slot (4-wheeler)", "2 slots", "3+ slots"], default: "No" },
                    { type: "select", id: "parkingCharges", label: "Parking Charges", options: ["Included in rent", "Separate charges"], default: "Included in rent" }
                ]
            },
            {
                section: "Tenancy Details",
                icon: "fas fa-users",
                fields: [
                    { type: "select", id: "tenantType", label: "Preferred Tenant Type", options: ["Family", "Bachelors", "Company"], default: "Family" },
                    { type: "radio", id: "petFriendly", label: "Pet Friendly", options: ["Yes", "No"], default: "Yes" },
                    { type: "select", id: "availableFrom", label: "Available From", options: ["Immediate", "Within 15 days", "Within 30 days", "After 30 days"], default: "Immediate" },
                    { type: "select", id: "maintenanceCharges", label: "Maintenance Charges", options: ["Included in rent", "Separate charges"], default: "Included in rent" }
                ]
            },
            {
                section: "Payments & Contracts",
                icon: "fas fa-money-bill-wave",
                fields: [
                    { type: "select", id: "securityDeposit", label: "Security Deposit", options: ["None", "1 month", "2 months", "Custom amount"], default: "1 month" },
                    { type: "select", id: "lockInPeriod", label: "Lock-in Period", options: ["None", "1 month", "6 months", "Custom period"], default: "None" },
                    { type: "select", id: "brokerageRequired", label: "Brokerage Required", options: ["No", "15 days rent", "30 days rent", "Custom amount"], default: "No" },
                    { type: "radio", id: "nonVegAllowed", label: "Non-veg Allowed", options: ["Yes", "No"], default: "Yes" }
                ]
            },
            {
                section: "Room & Facilities",
                icon: "fas fa-bed",
                fields: [
                    { type: "radio", id: "servantRoom", label: "Servant Room Available", options: ["Yes", "No"], default: "No" },
                    { type: "select", id: "facing", label: "Property Facing", options: ["North", "East", "West", "South", "North-East", "North-West", "South-East", "South-West"], default: "North" }
                ]
            },
            {
                section: "Amenities",
                icon: "fas fa-star",
                fields: [
                    { type: "checkbox", id: "amenity-pool", label: "Swimming Pool", value: "Swimming Pool" },
                    { type: "checkbox", id: "amenity-gym", label: "Gym", value: "Gym" },
                    { type: "checkbox", id: "amenity-garden", label: "Garden", value: "Garden" },
                    { type: "checkbox", id: "amenity-security", label: "Security", value: "Security" },
                    { type: "checkbox", id: "amenity-elevator", label: "Elevator", value: "Elevator" },
                    { type: "checkbox", id: "amenity-balcony", label: "Balcony", value: "Balcony" },
                    { type: "checkbox", id: "amenity-ac", label: "Air Conditioning", value: "Air Conditioning" },
                    { type: "checkbox", id: "amenity-heating", label: "Heating", value: "Heating" },
                    { type: "checkbox", id: "amenity-laundry", label: "Laundry", value: "Laundry" },
                    { type: "checkbox", id: "amenity-storage", label: "Storage", value: "Storage" },
                    { type: "checkbox", id: "amenity-internet", label: "High-Speed Internet", value: "Internet" },
                    { type: "checkbox", id: "amenity-furnished", label: "Furnished", value: "Furnished" },
                    { type: "checkbox", id: "amenity-parking", label: "Parking", value: "Parking" },
                    { type: "checkbox", id: "amenity-power-backup", label: "Power Backup", value: "Power Backup" },
                    { type: "checkbox", id: "amenity-water-supply", label: "Water Supply", value: "Water Supply" },
                    { type: "checkbox", id: "amenity-waste-disposal", label: "Waste Disposal", value: "Waste Disposal" },
                    { type: "checkbox", id: "amenity-landscaping", label: "Landscaping", value: "Landscaping" },
                    { type: "checkbox", id: "amenity-cctv", label: "CCTV", value: "CCTV" },
                    { type: "checkbox", id: "amenity-gated-community", label: "Gated Community", value: "Gated Community" },
                    { type: "checkbox", id: "amenity-intercom", label: "Intercom", value: "Intercom" },
                    { type: "checkbox", id: "amenity-visitor-parking", label: "Visitor Parking", value: "Visitor Parking" }
                ]
            },
            {
                section: "Residency Details",
                icon: "fas fa-users",
                fields: [
                    { type: "select", id: "residentsCount", label: "Current Number of Residents", options: ["1", "2", "3", "4", "5", "6", "7"], default: "2" }
                ]
            }
        ]
    },
    commercial: {
        title: "Commercial Property",
        icon: "fas fa-building",
        color: "success",
        description: "Offices, retail spaces, restaurants, and business properties",
        fields: [
            {
                section: "Type & Category",
                icon: "fas fa-tags",
                    fields: [
                        { type: "select", id: "commercialType", label: "Commercial Type", options: ["Office Space", "Retail Shop", "Showroom", "Restaurant", "Cafe", "Other"], default: "Office Space" }
                    ]
            },
            {
                section: "Location & Building",
                icon: "fas fa-map-marker-alt",
                fields: [
                    { type: "text", id: "buildingName", label: "Building/Project/Society/MIDC Name", placeholder: "e.g., Phoenix Mall" },
                    { type: "text", id: "locality", label: "Locality", placeholder: "e.g., Andheri East" },
                    { type: "select", id: "zoneType", label: "Zone Type", options: ["Commercial", "Industrial", "Residential", "Special Economic", "Open Space", "Agricultural Zone", "Other"], default: "Commercial" },
                    { type: "select", id: "locationHub", label: "Location Hub", options: ["IT Park", "Business Park", "Other"], default: "Other" }
                ]
            },
            {
                section: "Status & Availability",
                icon: "fas fa-clock",
                fields: [
                    { type: "select", id: "possessionStatus", label: "Possession Status", options: ["Ready to Move", "Under Construction"], default: "Ready to Move" },
                    { type: "select", id: "availableFrom", label: "Available From", options: ["Immediate", "Within 15 Days", "Within 30 Days", "After 30 Days"], default: "Immediate" }
                ]
            },
            {
                section: "Property & Legal",
                icon: "fas fa-gavel",
                fields: [
                    { type: "select", id: "propertyCondition", label: "Property Condition", options: ["Ready to Use", "Bare Shell"], default: "Ready to Use" },
                    { type: "select", id: "ownership", label: "Ownership", options: ["Freehold", "Leasehold", "Cooperative Society", "Power of Attorney"], default: "Leasehold" },
                    { type: "number", id: "plotArea", label: "Plot Area (sq ft)", placeholder: "e.g., 5000" },
                    { type: "number", id: "builtUpArea", label: "Built-up Area (sq ft)", placeholder: "e.g., 3000", required: true },
                    { type: "number", id: "carpetArea", label: "Carpet Area (sq ft)", placeholder: "e.g., 2500" },
                    { type: "number", id: "totalConstructionArea", label: "Total Construction Area (sq ft)", placeholder: "e.g., 3500" },
                    { type: "number", id: "frontage", label: "Frontage (ft)", placeholder: "e.g., 50" },
                    { type: "number", id: "roadAccess", label: "Road Access (ft)", placeholder: "e.g., 40" }
                ]
            },
            {
                section: "Lease & Financials",
                icon: "fas fa-money-bill-wave",
                fields: [
                    { type: "number", id: "expectedRent", label: "Expected Rent (₹)", placeholder: "e.g., 50000", required: true },
                    { type: "radio", id: "rentNegotiable", label: "Is Rent Negotiable", options: ["Yes", "No"], default: "No" },
                    { type: "select", id: "securityDeposit", label: "Security Deposit", options: ["1 month", "2 months", "3 months", "Custom amount"], default: "2 months" },
                    { type: "select", id: "rentIncrease", label: "Expected Rent Increase", options: ["5% annually", "10% annually", "15% annually", "Custom", "No increase"], default: "10% annually" },
                    { type: "select", id: "lockInPeriod", label: "Lock-in Period", options: ["None", "6 months", "1 year", "2 years", "Custom"], default: "1 year" }
                ]
            },
            {
                section: "Charges & Inclusions",
                icon: "fas fa-calculator",
                fields: [
                    { type: "radio", id: "dampUpsIncluded", label: "Damp UPS Charge Included", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "electricityIncluded", label: "Electricity Charge Included", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "waterChargesIncluded", label: "Water Charges Included", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Floors & Elevation",
                icon: "fas fa-building",
                fields: [
                    { type: "text", id: "yourFloor", label: "Your Floor", placeholder: "e.g., 3rd Floor" },
                    { type: "select", id: "totalFloors", label: "Total Floors", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10-20", "20+"], default: "5" },
                    { type: "select", id: "staircases", label: "Number of Staircases", options: ["1", "2", "3", "4+"], default: "1" },
                    { type: "radio", id: "passengerLift", label: "Passenger Lift", options: ["Yes", "No"], default: "Yes" },
                    { type: "radio", id: "serviceLift", label: "Service Lift", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Parking & Washrooms",
                icon: "fas fa-parking",
                fields: [
                    { type: "select", id: "parkingType", label: "Parking", options: ["Private", "Public"], default: "Private" },
                    { type: "select", id: "washroomType", label: "Washroom", options: ["Private", "Public"], default: "Private" }
                ]
            },
            {
                section: "Facing & Facilities",
                icon: "fas fa-compass",
                fields: [
                    { type: "text", id: "rearFacing", label: "Rear", placeholder: "e.g., Garden" },
                    { type: "select", id: "facing", label: "Facing", options: ["North", "East", "West", "South", "North-East", "North-West", "South-East", "South-West"], default: "North" },
                    { type: "text", id: "roadFacing", label: "Road", placeholder: "e.g., Main Road" }
                ]
            }
        ]
    },
    industrial: {
        title: "Industrial Property",
        icon: "fas fa-industry",
        color: "warning",
        description: "Warehouses, factories, manufacturing facilities",
        fields: [
            {
                section: "Type & Category",
                icon: "fas fa-tags",
                    fields: [
                        { type: "select", id: "industrialType", label: "Industrial Type", options: ["Warehouse", "Plot", "Industrial Shed"], default: "Warehouse" }
                    ]
            },
            {
                section: "Location & Building",
                icon: "fas fa-map-marker-alt",
                fields: [
                    { type: "text", id: "building-name", label: "Building/Project/Society/MIDC Name", placeholder: "e.g., MIDC Industrial Area" },
                    { type: "text", id: "locality", label: "Locality", placeholder: "e.g., Waluj MIDC" },
                    { type: "select", id: "zoneType", label: "Zone Type", options: ["Commercial", "Industrial", "Residential", "Special Economic", "Open Space", "Agricultural Zone", "Other"], default: "Industrial" },
                    { type: "select", id: "locationHub", label: "Location Hub", options: ["IT Park", "Business Park", "Other"], default: "Other" }
                ]
            },
            {
                section: "Status & Availability",
                icon: "fas fa-clock",
                fields: [
                    { type: "select", id: "possessionStatus", label: "Possession Status", options: ["Ready to Move", "Under Construction"], default: "Ready to Move" },
                    { type: "select", id: "availableFrom", label: "Available From", options: ["Immediate", "Within 15 Days", "Within 30 Days", "After 30 Days"], default: "Immediate" }
                ]
            },
            {
                section: "Property & Legal",
                icon: "fas fa-gavel",
                fields: [
                    { type: "select", id: "propertyCondition", label: "Property Condition", options: ["Ready to Use", "Bare Shell"], default: "Ready to Use" },
                    { type: "select", id: "ownership", label: "Ownership", options: ["Freehold", "Leasehold", "Cooperative Society", "Power of Attorney"], default: "Leasehold" },
                    { type: "number", id: "plotArea", label: "Plot Area (sq ft)", placeholder: "e.g., 10000", required: true },
                    { type: "number", id: "builtUpArea", label: "Built-up Area (sq ft)", placeholder: "e.g., 8000" },
                    { type: "number", id: "carpetArea", label: "Carpet Area (sq ft)", placeholder: "e.g., 7000" },
                    { type: "number", id: "totalConstructionArea", label: "Total Construction Area (sq ft)", placeholder: "e.g., 9000" },
                    { type: "number", id: "frontage", label: "Frontage (ft)", placeholder: "e.g., 100" },
                    { type: "number", id: "roadAccess", label: "Road Access (ft)", placeholder: "e.g., 80" }
                ]
            },
            {
                section: "Industrial/Shed Specific",
                icon: "fas fa-cog",
                fields: [
                    { type: "number", id: "shedHeight", label: "Shed Height (ft)", placeholder: "e.g., 20" },
                    { type: "number", id: "shedSideWallHeight", label: "Shed Side Wall Height (ft)", placeholder: "e.g., 15" },
                    { type: "text", id: "plotDimensions", label: "Width, Length", placeholder: "e.g., 100 ft x 200 ft" },
                    { type: "number", id: "shedBuiltUpArea", label: "Built-up Area (Shed) (sq ft)", placeholder: "e.g., 5000" },
                    { type: "number", id: "builtUpConstructionArea", label: "Built-up Construction Area (sq ft)", placeholder: "e.g., 6000" },
                    { type: "select", id: "electricityLoad", label: "Electricity Load", options: ["Up to 50 KW", "50-100 KW", "100-500 KW", "500+ KW"], default: "Up to 50 KW" },
                    { type: "radio", id: "waterAvailable", label: "Water", options: ["Yes", "No"], default: "Yes" },
                    { type: "radio", id: "preLeased", label: "Is it Pre-leased", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "preRented", label: "Is it Pre-rented", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Lease & Financials",
                icon: "fas fa-money-bill-wave",
                fields: [
                    { type: "number", id: "expectedRent", label: "Expected Rent (₹)", placeholder: "e.g., 100000", required: true },
                    { type: "radio", id: "rentNegotiable", label: "Is Rent Negotiable", options: ["Yes", "No"], default: "No" },
                    { type: "select", id: "securityDeposit", label: "Security Deposit", options: ["1 month", "2 months", "3 months", "Custom amount"], default: "2 months" },
                    { type: "select", id: "rentIncrease", label: "Expected Rent Increase", options: ["5% annually", "10% annually", "15% annually", "Custom", "No increase"], default: "10% annually" },
                    { type: "select", id: "lockInPeriod", label: "Lock-in Period", options: ["None", "6 months", "1 year", "2 years", "Custom"], default: "1 year" }
                ]
            },
            {
                section: "Charges & Inclusions",
                icon: "fas fa-calculator",
                fields: [
                    { type: "radio", id: "dampUpsIncluded", label: "Damp UPS Charge Included", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "electricityIncluded", label: "Electricity Charge Included", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "waterChargesIncluded", label: "Water Charges Included", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Floors & Elevation",
                icon: "fas fa-building",
                fields: [
                    { type: "text", id: "yourFloor", label: "Your Floor", placeholder: "e.g., Ground Floor" },
                    { type: "select", id: "totalFloors", label: "Total Floors", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10-20", "20+"], default: "1" },
                    { type: "select", id: "staircases", label: "Number of Staircases", options: ["1", "2", "3", "4+"], default: "1" },
                    { type: "radio", id: "passengerLift", label: "Passenger Lift", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "serviceLift", label: "Service Lift", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Parking & Washrooms",
                icon: "fas fa-parking",
                fields: [
                    { type: "select", id: "parkingType", label: "Parking", options: ["Private", "Public"], default: "Private" },
                    { type: "select", id: "washroomType", label: "Washroom", options: ["Private", "Public"], default: "Private" }
                ]
            },
            {
                section: "Facing & Facilities",
                icon: "fas fa-compass",
                fields: [
                    { type: "text", id: "rearFacing", label: "Rear", placeholder: "e.g., Open Space" },
                    { type: "select", id: "facing", label: "Facing", options: ["North", "East", "West", "South", "North-East", "North-West", "South-East", "South-West"], default: "North" },
                    { type: "text", id: "roadFacing", label: "Road", placeholder: "e.g., Service Road" }
                ]
            }
        ]
    },
    land: {
        title: "Land Property",
        icon: "fas fa-map",
        color: "info",
        description: "Vacant land, plots, agricultural land",
        fields: [
            {
                section: "Land Features",
                icon: "fas fa-map",
                fields: [
                    { type: "select", id: "landType", label: "Land Type", options: ["Residential Plot", "Commercial Plot", "Industrial Plot", "Agricultural Land", "Farm Land", "NA Plot"], default: "Residential Plot" },
                    { type: "number", id: "propertyArea", label: "Area (sq ft)", placeholder: "e.g., 5000", required: true },
                    { type: "number", id: "areaAcres", label: "Area (Acres)", placeholder: "e.g., 0.11" },
                    { type: "select", id: "landFacing", label: "Facing", options: ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"], default: "North" },
                    { type: "select", id: "roadWidth", label: "Road Width", options: ["Less than 20 ft", "20-30 ft", "30-40 ft", "40-60 ft", "60+ ft"], default: "20-30 ft" },
                    { type: "select", id: "landStatus", label: "Status", options: ["Clear Title", "Litigation", "Under Development", "Ready for Construction"], default: "Clear Title" }
                ]
            },
            {
                section: "Land Amenities",
                icon: "fas fa-leaf",
                fields: [
                    { type: "checkbox", id: "amenity-water-supply", label: "Water Supply", value: "Water Supply" },
                    { type: "checkbox", id: "amenity-electricity", label: "Electricity Connection", value: "Electricity Connection" },
                    { type: "checkbox", id: "amenity-drainage", label: "Drainage", value: "Drainage" },
                    { type: "checkbox", id: "amenity-road-access", label: "Road Access", value: "Road Access" },
                    { type: "checkbox", id: "amenity-boundary-wall", label: "Boundary Wall", value: "Boundary Wall" },
                    { type: "checkbox", id: "amenity-corner-plot", label: "Corner Plot", value: "Corner Plot" },
                    { type: "checkbox", id: "amenity-gated-community", label: "Gated Community", value: "Gated Community" },
                    { type: "checkbox", id: "amenity-park-facing", label: "Park Facing", value: "Park Facing" },
                    { type: "checkbox", id: "amenity-main-road", label: "Main Road Facing", value: "Main Road Facing" },
                    { type: "checkbox", id: "amenity-metro-nearby", label: "Metro Nearby", value: "Metro Nearby" },
                    { type: "checkbox", id: "amenity-school-nearby", label: "School Nearby", value: "School Nearby" },
                    { type: "checkbox", id: "amenity-hospital-nearby", label: "Hospital Nearby", value: "Hospital Nearby" }
                ]
            }
        ]
    }
};

// Generate dynamic form fields (same as in Home.jsx)
const generateDynamicFields = (propertyType, formData, handleInputChange, handleAmenityChange) => {
    const config = propertyTypeConfigs[propertyType];
    if (!config) return null;

    return config.fields.map((section, sectionIndex) => (
        <div key={sectionIndex} className="row mb-4">
            <div className="col-12">
                <h6 className={`text-${config.color} mb-3`}>
                    <i className={`${section.icon} me-2`}></i>{section.section}
                </h6>
            </div>
            {section.fields.map((field, fieldIndex) => (
                <React.Fragment key={fieldIndex}>
                    {renderField(field, formData, handleInputChange, handleAmenityChange)}
                </React.Fragment>
            ))}
        </div>
    ));
};

// Render individual field based on type (same as in Home.jsx)
const renderField = (field, formData, handleInputChange, handleAmenityChange) => {
    const value = formData[field.id] || '';

    switch (field.type) {
        case 'select':
            return (
                <div className="col-md-6 mb-3">
                    <label htmlFor={field.id} className="form-label">
                        {field.label}{field.required ? ' *' : ''}
                    </label>
                    <select
                        className="form-select"
                        id={field.id}
                        name={field.id}
                        value={value}
                        onChange={handleInputChange}
                        required={field.required}
                    >
                        <option value="">{field.placeholder || `Select ${field.label}`}</option>
                        {field.options.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            );

        case 'number':
            return (
                <div className="col-md-6 mb-3">
                    <label htmlFor={field.id} className="form-label">
                        {field.label}{field.required ? ' *' : ''}
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id={field.id}
                        name={field.id}
                        value={value}
                        onChange={handleInputChange}
                        placeholder={field.placeholder || ''}
                        required={field.required}
                    />
                </div>
            );

        case 'radio':
            return (
                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        {field.label}{field.required ? ' *' : ''}
                    </label>
                    <div className="row g-2">
                        {field.options.map((option, index) => (
                            <div key={index} className="col-auto">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name={field.id}
                                        value={option}
                                        id={`${field.id}-${option.toLowerCase().replace(/\s+/g, '-')}`}
                                        checked={value === option}
                                        onChange={handleInputChange}
                                        required={field.required}
                                    />
                                    <label className="form-check-label" htmlFor={`${field.id}-${option.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {option}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'checkbox':
            return (
                <div className="col-md-4 mb-2">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            name={field.id}
                            value={field.value}
                            id={field.id}
                            checked={formData.amenities ? formData.amenities.includes(field.value) : false}
                            onChange={(e) => handleAmenityChange(field.value, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={field.id}>
                            {field.label}
                        </label>
                    </div>
                </div>
            );

        default:
            return (
                <div className="col-md-6 mb-3">
                    <label htmlFor={field.id} className="form-label">
                        {field.label}{field.required ? ' *' : ''}
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id={field.id}
                        name={field.id}
                        value={value}
                        onChange={handleInputChange}
                        placeholder={field.placeholder || ''}
                        required={field.required}
                    />
                </div>
            );
    }
};

const EditPropertyModal = ({ show, onHide, property, onSave }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [amenities, setAmenities] = useState([]);

    // States and cities data (same as in Home.jsx)
    const statesAndCities = {
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Kadapa", "Kakinada", "Anantapur", "Tirupati"],
        "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Bomdila", "Ziro", "Along", "Tezu", "Seppa", "Changlang"],
        "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Karimganj"],
        "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"],
        "Chhattisgarh": ["Raipur", "Bhilai", "Korba", "Bilaspur", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Mahasamund"],
        "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Valpoi", "Pernem"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Navsari"],
        "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
        "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Hamirpur", "Una", "Bilaspur", "Chamba", "Kangra"],
        "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga"],
        "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Malappuram", "Kannur", "Kasaragod"],
        "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli", "Malegaon"],
        "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati", "Tamenglong", "Jiribam", "Moreh"],
        "Meghalaya": ["Shillong", "Tura", "Cherrapunji", "Jowai", "Nongpoh", "Baghmara", "Williamnagar", "Resubelpara", "Mawkyrwat", "Ampati"],
        "Mizoram": ["Aizawl", "Lunglei", "Serchhip", "Champhai", "Kolasib", "Lawngtlai", "Saiha", "Mamit", "Hnahthial", "Saitual"],
        "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Kiphire", "Longleng", "Peren"],
        "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
        "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Batala", "Pathankot"],
        "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
        "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Jorethang", "Naya Bazar", "Rangpo", "Singtam", "Pakyong", "Ravangla"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukkudi"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
        "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia", "Khowai", "Ambassa", "Ranir Bazar", "Sonamura", "Kumarghat"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Allahabad", "Bareilly", "Aligarh", "Moradabad"],
        "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Kotdwar", "Ramnagar", "Manglaur"],
        "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda", "Bardhaman", "Baharampur", "Habra", "Kharagpur"],
        "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi"]
    };

    useEffect(() => {
        setStates(Object.keys(statesAndCities));
    }, []);

    // Handle amenity changes
    const handleAmenityChange = (amenityValue, checked) => {
        setAmenities(prev => {
            if (checked) {
                return [...prev, amenityValue];
            } else {
                return prev.filter(item => item !== amenityValue);
            }
        });

        // Also update formData
        setFormData(prev => ({
            ...prev,
            amenities: checked
                ? [...(prev.amenities || []), amenityValue]
                : (prev.amenities || []).filter(item => item !== amenityValue)
        }));
    };

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

            // Prepare data for submission (same logic as Home.jsx)
            const submitData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                listingType: formData.listingType || 'rent',
                propertyType: formData.propertyType,
                buildingName: formData.buildingName,
                locationDetails: formData.locationDetails,
                state: formData.state,
                city: formData.city,
                pincode: formData.pincode,
                amenities: formData.amenities || []
            };

            // Add type-specific fields based on property type
            if (formData.propertyType === 'residential') {
                // Add residential-specific fields
                Object.assign(submitData, {
                    bhkConfig: formData.bhkConfig || null,
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
                    buildingName: formData.buildingName || null,
                    locality: formData.locality || null,
                    zoneType: formData.zoneType || null,
                    locationHub: formData.locationHub || null,
                    possessionStatus: formData.possessionStatus || null,
                    propertyCondition: formData.propertyCondition || null,
                    ownership: formData.ownership || null,
                    plotArea: formData.plotArea ? parseInt(formData.plotArea) : null,
                    builtUpArea: formData.builtUpArea ? parseInt(formData.builtUpArea) : null,
                    carpetArea: formData.carpetArea ? parseInt(formData.carpetArea) : null,
                    totalConstructionArea: formData.totalConstructionArea ? parseInt(formData.totalConstructionArea) : null,
                    frontage: formData.frontage ? parseInt(formData.frontage) : null,
                    roadAccess: formData.roadAccess ? parseInt(formData.roadAccess) : null,
                    expectedRent: formData.expectedRent ? parseInt(formData.expectedRent) : null,
                    rentNegotiable: formData.rentNegotiable || null,
                    securityDeposit: formData.securityDeposit || null,
                    rentIncrease: formData.rentIncrease || null,
                    lockInPeriod: formData.lockInPeriod || null,
                    dampUpsIncluded: formData.dampUpsIncluded || null,
                    electricityIncluded: formData.electricityIncluded || null,
                    waterChargesIncluded: formData.waterChargesIncluded || null,
                    yourFloor: formData.yourFloor || null,
                    totalFloors: formData.totalFloors || null,
                    staircases: formData.staircases || null,
                    passengerLift: formData.passengerLift || null,
                    serviceLift: formData.serviceLift || null,
                    parkingType: formData.parkingType || null,
                    washroomType: formData.washroomType || null,
                    rearFacing: formData.rearFacing || null,
                    facing: formData.facing || null,
                    roadFacing: formData.roadFacing || null
                });
            } else if (formData.propertyType === 'industrial') {
                // Add industrial-specific fields
                Object.assign(submitData, {
                    industrialType: formData.industrialType || null,
                    'building-name': formData['building-name'] || null,
                    locality: formData.locality || null,
                    zoneType: formData.zoneType || null,
                    locationHub: formData.locationHub || null,
                    possessionStatus: formData.possessionStatus || null,
                    propertyCondition: formData.propertyCondition || null,
                    ownership: formData.ownership || null,
                    plotArea: formData.plotArea ? parseInt(formData.plotArea) : null,
                    builtUpArea: formData.builtUpArea ? parseInt(formData.builtUpArea) : null,
                    carpetArea: formData.carpetArea ? parseInt(formData.carpetArea) : null,
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
                    securityDeposit: formData.securityDeposit || null,
                    rentIncrease: formData.rentIncrease || null,
                    lockInPeriod: formData.lockInPeriod || null,
                    dampUpsIncluded: formData.dampUpsIncluded || null,
                    electricityIncluded: formData.electricityIncluded || null,
                    waterChargesIncluded: formData.waterChargesIncluded || null,
                    yourFloor: formData.yourFloor || null,
                    totalFloors: formData.totalFloors || null,
                    staircases: formData.staircases || null,
                    passengerLift: formData.passengerLift || null,
                    serviceLift: formData.serviceLift || null,
                    parkingType: formData.parkingType || null,
                    washroomType: formData.washroomType || null,
                    rearFacing: formData.rearFacing || null,
                    facing: formData.facing || null,
                    roadFacing: formData.roadFacing || null
                });
            } else if (formData.propertyType === 'land') {
                // Add land-specific fields
                Object.assign(submitData, {
                    landType: formData.landType || null,
                    propertyArea: formData.propertyArea ? parseInt(formData.propertyArea) : null,
                    areaAcres: formData.areaAcres ? parseFloat(formData.areaAcres) : null,
                    landFacing: formData.landFacing || null,
                    roadWidth: formData.roadWidth || null,
                    landStatus: formData.landStatus || null
                });
            }

            // Add timestamp for update
            submitData.updatedAt = new Date();

            console.log('EditPropertyModal - Submitting data:', submitData);

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

                            {/* Dynamic Property Type Specific Fields */}
                            {formData.propertyType && generateDynamicFields(formData.propertyType, formData, handleInputChange, handleAmenityChange)}
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
