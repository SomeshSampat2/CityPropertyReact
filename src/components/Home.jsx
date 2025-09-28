import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/styles.css';

// States and cities data
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

// Property type configurations
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
                    { type: "number", id: "built-up-area", label: "Built Up Area (sq ft)", placeholder: "e.g., 1200", required: true },
                    { type: "number", id: "carpet-area", label: "Carpet Area (sq ft)", placeholder: "e.g., 1000" },
                    { type: "select", id: "property-age", label: "Age of Property", options: ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "More than 10 years"], default: "Less than 1 year" },
                    { type: "select", id: "total-floors", label: "Total Floors in Building", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10-20", "20+"], default: "5" },
                    { type: "select", id: "floor-number", label: "Floor Number", options: ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor", "6th Floor", "7th Floor", "8th Floor", "9th Floor", "10th Floor", "11+ Floor"], default: "Ground Floor" },
                    { type: "select", id: "bathrooms", label: "Number of Bathrooms", options: ["1", "2", "3", "4+"], default: "2" },
                    { type: "select", id: "balconies", label: "Number of Balconies", options: ["0", "1", "2", "3", "4+"], default: "1" },
                    { type: "select", id: "furnishing", label: "Furnishing Status", options: ["Fully Furnished", "Semi-Furnished", "Unfurnished"], default: "Semi-Furnished" }
                ]
            },
            {
                section: "Parking & Accessibility",
                icon: "fas fa-parking",
                fields: [
                    { type: "select", id: "covered-parking", label: "Covered Parking", options: ["No", "1 slot", "2 slots", "3 slots", "4+ slots"], default: "1 slot" },
                    { type: "select", id: "open-parking", label: "Open Parking", options: ["No", "1 slot (2-wheeler)", "1 slot (4-wheeler)", "2 slots", "3+ slots"], default: "No" },
                    { type: "select", id: "parking-charges", label: "Parking Charges", options: ["Included in rent", "Separate charges"], default: "Included in rent" }
                ]
            },
            {
                section: "Tenancy Details",
                icon: "fas fa-users",
                fields: [
                    { type: "select", id: "tenant-type", label: "Preferred Tenant Type", options: ["Family", "Bachelors", "Company"], default: "Family" },
                    { type: "radio", id: "pet-friendly", label: "Pet Friendly", options: ["Yes", "No"], default: "Yes" },
                    { type: "select", id: "available-from", label: "Available From", options: ["Immediate", "Within 15 days", "Within 30 days", "After 30 days"], default: "Immediate" },
                    { type: "select", id: "maintenance-charges", label: "Maintenance Charges", options: ["Included in rent", "Separate charges"], default: "Included in rent" }
                ]
            },
            {
                section: "Payments & Contracts",
                icon: "fas fa-money-bill-wave",
                fields: [
                    { type: "select", id: "security-deposit", label: "Security Deposit", options: ["None", "1 month", "2 months", "Custom amount"], default: "1 month" },
                    { type: "select", id: "lock-in-period", label: "Lock-in Period", options: ["None", "1 month", "6 months", "Custom period"], default: "None" },
                    { type: "select", id: "brokerage-required", label: "Brokerage Required", options: ["No", "15 days rent", "30 days rent", "Custom amount"], default: "No" },
                    { type: "radio", id: "non-veg-allowed", label: "Non-veg Allowed", options: ["Yes", "No"], default: "Yes" }
                ]
            },
            {
                section: "Room & Facilities",
                icon: "fas fa-bed",
                fields: [
                    { type: "radio", id: "servant-room", label: "Servant Room Available", options: ["Yes", "No"], default: "No" },
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
                    { type: "select", id: "residents-count", label: "Current Number of Residents", options: ["1", "2", "3", "4", "5", "6", "7"], default: "2" }
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
                    { type: "select", id: "commercial-type", label: "Commercial Type", options: ["Office Space", "Retail Shop", "Showroom", "Restaurant", "Cafe", "Other"], default: "Office Space" }
                ]
            },
            {
                section: "Location & Building",
                icon: "fas fa-map-marker-alt",
                fields: [
                    { type: "text", id: "building-name", label: "Building/Project/Society/MIDC Name", placeholder: "e.g., Phoenix Mall" },
                    { type: "text", id: "locality", label: "Locality", placeholder: "e.g., Andheri East" },
                    { type: "select", id: "zone-type", label: "Zone Type", options: ["Commercial", "Industrial", "Residential", "Special Economic", "Open Space", "Agricultural Zone", "Other"], default: "Commercial" },
                    { type: "select", id: "location-hub", label: "Location Hub", options: ["IT Park", "Business Park", "Other"], default: "Other" }
                ]
            },
            {
                section: "Status & Availability",
                icon: "fas fa-clock",
                fields: [
                    { type: "select", id: "possession-status", label: "Possession Status", options: ["Ready to Move", "Under Construction"], default: "Ready to Move" },
                    { type: "select", id: "available-from", label: "Available From", options: ["Immediate", "Within 15 Days", "Within 30 Days", "After 30 Days"], default: "Immediate" }
                ]
            },
            {
                section: "Property & Legal",
                icon: "fas fa-gavel",
                fields: [
                    { type: "select", id: "property-condition", label: "Property Condition", options: ["Ready to Use", "Bare Shell"], default: "Ready to Use" },
                    { type: "select", id: "ownership", label: "Ownership", options: ["Freehold", "Leasehold", "Cooperative Society", "Power of Attorney"], default: "Leasehold" },
                    { type: "number", id: "plot-area", label: "Plot Area (sq ft)", placeholder: "e.g., 5000" },
                    { type: "number", id: "built-up-area", label: "Built-up Area (sq ft)", placeholder: "e.g., 3000", required: true },
                    { type: "number", id: "carpet-area", label: "Carpet Area (sq ft)", placeholder: "e.g., 2500" },
                    { type: "number", id: "total-construction-area", label: "Total Construction Area (sq ft)", placeholder: "e.g., 3500" },
                    { type: "number", id: "frontage", label: "Frontage (ft)", placeholder: "e.g., 50" },
                    { type: "number", id: "road-access", label: "Road Access (ft)", placeholder: "e.g., 40" }
                ]
            },
            {
                section: "Lease & Financials",
                icon: "fas fa-money-bill-wave",
                fields: [
                    { type: "number", id: "expected-rent", label: "Expected Rent (₹)", placeholder: "e.g., 50000", required: true },
                    { type: "radio", id: "rent-negotiable", label: "Is Rent Negotiable", options: ["Yes", "No"], default: "No" },
                    { type: "select", id: "security-deposit", label: "Security Deposit", options: ["1 month", "2 months", "3 months", "Custom amount"], default: "2 months" },
                    { type: "select", id: "rent-increase", label: "Expected Rent Increase", options: ["5% annually", "10% annually", "15% annually", "Custom", "No increase"], default: "10% annually" },
                    { type: "select", id: "lock-in-period", label: "Lock-in Period", options: ["None", "6 months", "1 year", "2 years", "Custom"], default: "1 year" }
                ]
            },
            {
                section: "Charges & Inclusions",
                icon: "fas fa-calculator",
                fields: [
                    { type: "radio", id: "damp-ups-included", label: "Damp UPS Charge Included", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "electricity-included", label: "Electricity Charge Included", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "water-charges-included", label: "Water Charges Included", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Floors & Elevation",
                icon: "fas fa-building",
                fields: [
                    { type: "text", id: "your-floor", label: "Your Floor", placeholder: "e.g., 3rd Floor" },
                    { type: "select", id: "total-floors", label: "Total Floors", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10-20", "20+"], default: "5" },
                    { type: "select", id: "staircases", label: "Number of Staircases", options: ["1", "2", "3", "4+"], default: "1" },
                    { type: "radio", id: "passenger-lift", label: "Passenger Lift", options: ["Yes", "No"], default: "Yes" },
                    { type: "radio", id: "service-lift", label: "Service Lift", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Parking & Washrooms",
                icon: "fas fa-parking",
                fields: [
                    { type: "select", id: "parking-type", label: "Parking", options: ["Private", "Public"], default: "Private" },
                    { type: "select", id: "washroom-type", label: "Washroom", options: ["Private", "Public"], default: "Private" }
                ]
            },
            {
                section: "Facing & Facilities",
                icon: "fas fa-compass",
                fields: [
                    { type: "text", id: "rear-facing", label: "Rear", placeholder: "e.g., Garden" },
                    { type: "select", id: "facing", label: "Facing", options: ["North", "East", "West", "South", "North-East", "North-West", "South-East", "South-West"], default: "North" },
                    { type: "text", id: "road-facing", label: "Road", placeholder: "e.g., Main Road" }
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
                    { type: "select", id: "industrial-type", label: "Industrial Type", options: ["Warehouse", "Plot", "Industrial Shed"], default: "Warehouse" }
                ]
            },
            {
                section: "Location & Building",
                icon: "fas fa-map-marker-alt",
                fields: [
                    { type: "text", id: "building-name", label: "Building/Project/Society/MIDC Name", placeholder: "e.g., MIDC Industrial Area" },
                    { type: "text", id: "locality", label: "Locality", placeholder: "e.g., Waluj MIDC" },
                    { type: "select", id: "zone-type", label: "Zone Type", options: ["Commercial", "Industrial", "Residential", "Special Economic", "Open Space", "Agricultural Zone", "Other"], default: "Industrial" },
                    { type: "select", id: "location-hub", label: "Location Hub", options: ["IT Park", "Business Park", "Other"], default: "Other" }
                ]
            },
            {
                section: "Status & Availability",
                icon: "fas fa-clock",
                fields: [
                    { type: "select", id: "possession-status", label: "Possession Status", options: ["Ready to Move", "Under Construction"], default: "Ready to Move" },
                    { type: "select", id: "available-from", label: "Available From", options: ["Immediate", "Within 15 Days", "Within 30 Days", "After 30 Days"], default: "Immediate" }
                ]
            },
            {
                section: "Property & Legal",
                icon: "fas fa-gavel",
                fields: [
                    { type: "select", id: "property-condition", label: "Property Condition", options: ["Ready to Use", "Bare Shell"], default: "Ready to Use" },
                    { type: "select", id: "ownership", label: "Ownership", options: ["Freehold", "Leasehold", "Cooperative Society", "Power of Attorney"], default: "Leasehold" },
                    { type: "number", id: "plot-area", label: "Plot Area (sq ft)", placeholder: "e.g., 10000", required: true },
                    { type: "number", id: "built-up-area", label: "Built-up Area (sq ft)", placeholder: "e.g., 8000" },
                    { type: "number", id: "carpet-area", label: "Carpet Area (sq ft)", placeholder: "e.g., 7000" },
                    { type: "number", id: "total-construction-area", label: "Total Construction Area (sq ft)", placeholder: "e.g., 9000" },
                    { type: "number", id: "frontage", label: "Frontage (ft)", placeholder: "e.g., 100" },
                    { type: "number", id: "road-access", label: "Road Access (ft)", placeholder: "e.g., 80" }
                ]
            },
            {
                section: "Industrial/Shed Specific",
                icon: "fas fa-cog",
                fields: [
                    { type: "number", id: "shed-height", label: "Shed Height (ft)", placeholder: "e.g., 20" },
                    { type: "number", id: "shed-side-wall-height", label: "Shed Side Wall Height (ft)", placeholder: "e.g., 15" },
                    { type: "text", id: "plot-dimensions", label: "Width, Length", placeholder: "e.g., 100 ft x 200 ft" },
                    { type: "number", id: "shed-built-up-area", label: "Built-up Area (Shed) (sq ft)", placeholder: "e.g., 5000" },
                    { type: "number", id: "built-up-construction-area", label: "Built-up Construction Area (sq ft)", placeholder: "e.g., 6000" },
                    { type: "select", id: "electricity-load", label: "Electricity Load", options: ["Up to 50 KW", "50-100 KW", "100-500 KW", "500+ KW"], default: "Up to 50 KW" },
                    { type: "radio", id: "water-available", label: "Water", options: ["Yes", "No"], default: "Yes" },
                    { type: "radio", id: "pre-leased", label: "Is it Pre-leased", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "pre-rented", label: "Is it Pre-rented", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Lease & Financials",
                icon: "fas fa-money-bill-wave",
                fields: [
                    { type: "number", id: "expected-rent", label: "Expected Rent (₹)", placeholder: "e.g., 100000", required: true },
                    { type: "radio", id: "rent-negotiable", label: "Is Rent Negotiable", options: ["Yes", "No"], default: "No" },
                    { type: "select", id: "security-deposit", label: "Security Deposit", options: ["1 month", "2 months", "3 months", "Custom amount"], default: "2 months" },
                    { type: "select", id: "rent-increase", label: "Expected Rent Increase", options: ["5% annually", "10% annually", "15% annually", "Custom", "No increase"], default: "10% annually" },
                    { type: "select", id: "lock-in-period", label: "Lock-in Period", options: ["None", "6 months", "1 year", "2 years", "Custom"], default: "1 year" }
                ]
            },
            {
                section: "Charges & Inclusions",
                icon: "fas fa-calculator",
                fields: [
                    { type: "radio", id: "damp-ups-included", label: "Damp UPS Charge Included", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "electricity-included", label: "Electricity Charge Included", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "water-charges-included", label: "Water Charges Included", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Floors & Elevation",
                icon: "fas fa-building",
                fields: [
                    { type: "text", id: "your-floor", label: "Your Floor", placeholder: "e.g., Ground Floor" },
                    { type: "select", id: "total-floors", label: "Total Floors", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10-20", "20+"], default: "1" },
                    { type: "select", id: "staircases", label: "Number of Staircases", options: ["1", "2", "3", "4+"], default: "1" },
                    { type: "radio", id: "passenger-lift", label: "Passenger Lift", options: ["Yes", "No"], default: "No" },
                    { type: "radio", id: "service-lift", label: "Service Lift", options: ["Yes", "No"], default: "No" }
                ]
            },
            {
                section: "Parking & Washrooms",
                icon: "fas fa-parking",
                fields: [
                    { type: "select", id: "parking-type", label: "Parking", options: ["Private", "Public"], default: "Private" },
                    { type: "select", id: "washroom-type", label: "Washroom", options: ["Private", "Public"], default: "Private" }
                ]
            },
            {
                section: "Facing & Facilities",
                icon: "fas fa-compass",
                fields: [
                    { type: "text", id: "rear-facing", label: "Rear", placeholder: "e.g., Open Space" },
                    { type: "select", id: "facing", label: "Facing", options: ["North", "East", "West", "South", "North-East", "North-West", "South-East", "South-West"], default: "North" },
                    { type: "text", id: "road-facing", label: "Road", placeholder: "e.g., Service Road" }
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
                    { type: "select", id: "land-type", label: "Land Type", options: ["Residential Plot", "Commercial Plot", "Industrial Plot", "Agricultural Land", "Farm Land", "NA Plot"], default: "Residential Plot" },
                    { type: "number", id: "property-area", label: "Area (sq ft)", placeholder: "e.g., 5000", required: true },
                    { type: "number", id: "area-acres", label: "Area (Acres)", placeholder: "e.g., 0.11" },
                    { type: "select", id: "land-facing", label: "Facing", options: ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"], default: "North" },
                    { type: "select", id: "road-width", label: "Road Width", options: ["Less than 20 ft", "20-30 ft", "30-40 ft", "40-60 ft", "60+ ft"], default: "20-30 ft" },
                    { type: "select", id: "land-status", label: "Status", options: ["Clear Title", "Litigation", "Under Development", "Ready for Construction"], default: "Clear Title" }
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

const Home = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [allProperties, setAllProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [favorites, setFavorites] = useState(new Set());
    const [filtering, setFiltering] = useState(false);
    const [selectedPropertyType, setSelectedPropertyType] = useState(null);
    const [formData, setFormData] = useState({});
    const [amenities, setAmenities] = useState([]);

    // Handle property type selection
    const handlePropertyTypeSelection = (propertyType) => {
        setSelectedPropertyType(propertyType);
        setFormData({});
        setAmenities([]);

        // Close property type modal and open add property modal
        const propertyTypeModalElement = document.getElementById('propertyTypeModal');
        const propertyTypeModal = window.bootstrap.Modal.getInstance(propertyTypeModalElement);

        if (propertyTypeModal) {
            // Hide the modal (let Bootstrap handle the closing animation)
            propertyTypeModal.hide();

            // Listen for when the modal is fully hidden
            const handleHidden = () => {
                // Now dispose the modal and clean up
                propertyTypeModal.dispose();

                // Remove any remaining backdrop elements
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());

                // Remove modal-open class from body
                document.body.classList.remove('modal-open');

                // Remove the event listener
                propertyTypeModalElement.removeEventListener('hidden.bs.modal', handleHidden);

                // Show the add property modal
                setTimeout(() => {
                    const addPropertyModalElement = document.getElementById('addPropertyModal');
                    const addPropertyModal = new window.bootstrap.Modal(addPropertyModalElement);
                    if (addPropertyModal) {
                        addPropertyModal.show();
                    }
                }, 100);
            };

            // Add the event listener for when modal is hidden
            propertyTypeModalElement.addEventListener('hidden.bs.modal', handleHidden);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [id]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [id]: value
            }));
        }
    };

    // Handle amenity changes
    const handleAmenityChange = (amenityValue, checked) => {
        setAmenities(prev => {
            if (checked) {
                return [...prev, amenityValue];
            } else {
                return prev.filter(item => item !== amenityValue);
            }
        });
    };

    // Handle property type change from within form
    const changePropertyType = () => {
        setSelectedPropertyType(null);
        setFormData({});
        setAmenities([]);

        // Close current modal and open property type modal
        const currentModalElement = document.getElementById('addPropertyModal');
        const currentModal = window.bootstrap.Modal.getInstance(currentModalElement);

        if (currentModal) {
            // Hide the modal (let Bootstrap handle the closing animation)
            currentModal.hide();

            // Listen for when the modal is fully hidden
            const handleHidden = () => {
                // Now dispose the modal and clean up
                currentModal.dispose();

                // Remove any remaining backdrop elements
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());

                // Remove modal-open class from body
                document.body.classList.remove('modal-open');

                // Remove the event listener
                currentModalElement.removeEventListener('hidden.bs.modal', handleHidden);

                // Show the property type modal
                setTimeout(() => {
                    const propertyTypeModal = new window.bootstrap.Modal(document.getElementById('propertyTypeModal'));
                    propertyTypeModal.show();
                }, 100);
            };

            // Add the event listener for when modal is hidden
            currentModalElement.addEventListener('hidden.bs.modal', handleHidden);
        }
    };

    // Handle modal close events and cleanup
    React.useEffect(() => {
        const handleModalClose = () => {
            // Remove any remaining backdrop elements
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());

            // Remove modal-open class from body
            document.body.classList.remove('modal-open');

            // Reset form state
            setSelectedPropertyType(null);
            setFormData({});
            setAmenities([]);
        };

        // Add event listeners for both modals
        const propertyTypeModal = document.getElementById('propertyTypeModal');
        const addPropertyModal = document.getElementById('addPropertyModal');

        if (propertyTypeModal) {
            propertyTypeModal.addEventListener('hidden.bs.modal', handleModalClose);
        }

        if (addPropertyModal) {
            addPropertyModal.addEventListener('hidden.bs.modal', handleModalClose);
        }

        // Cleanup event listeners
        return () => {
            if (propertyTypeModal) {
                propertyTypeModal.removeEventListener('hidden.bs.modal', handleModalClose);
            }
            if (addPropertyModal) {
                addPropertyModal.removeEventListener('hidden.bs.modal', handleModalClose);
            }
        };
    }, []);

    // Generate dynamic form fields (matching JS project exactly)
    const generateDynamicFields = (propertyType) => {
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
                        {renderField(field)}
                    </React.Fragment>
                ))}
            </div>
        ));
    };

    // Render individual field based on type (matching JS project exactly)
    const renderField = (field) => {
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
                                value={field.value}
                                id={field.id}
                                checked={amenities.includes(field.value)}
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
                            value={value}
                            onChange={handleInputChange}
                            placeholder={field.placeholder || ''}
                            required={field.required}
                        />
                    </div>
                );
        }
    };

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!selectedPropertyType) {
            alert('Please select a property type first');
            changePropertyType();
            return;
        }

        try {
            const propertyData = {
                // Basic information
                name: document.getElementById('property-name').value,
                description: document.getElementById('property-description').value,
                price: parseInt(document.getElementById('property-price').value),
                propertyType: selectedPropertyType,

                // Address information
                address: document.getElementById('property-address').value,
                location: document.getElementById('location-details').value,
                state: document.getElementById('property-state').value,
                city: document.getElementById('property-city').value,
                pincode: document.getElementById('property-pincode').value,

                // All form data fields
                ...formData,

                // Amenities
                amenities: amenities,

                // Metadata
                owner: user.uid,
                ownerName: user.displayName || 'Property Owner',
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'properties'), propertyData);

            // Reset form and properly dispose modal
            setFormData({});
            setAmenities([]);
            setSelectedPropertyType(null);

            const modalElement = document.getElementById('addPropertyModal');
            const modal = window.bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                // Hide the modal (let Bootstrap handle the closing animation)
                modal.hide();

                // Listen for when the modal is fully hidden
                const handleHidden = () => {
                    // Now dispose the modal and clean up
                    modal.dispose();

                    // Remove any remaining backdrop elements
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());

                    // Remove modal-open class from body
                    document.body.classList.remove('modal-open');

                    // Remove the event listener
                    modalElement.removeEventListener('hidden.bs.modal', handleHidden);
                };

                // Add the event listener for when modal is hidden
                modalElement.addEventListener('hidden.bs.modal', handleHidden);
            }

            alert('Property added successfully!');

        } catch (error) {
            console.error('Error adding property:', error);
            alert('Error adding property: ' + error.message);
        }
    };

    // Initialize state dropdown when modal is shown
    React.useEffect(() => {
        const initializeStates = () => {
            const stateSelect = document.getElementById('property-state');
            if (stateSelect) {
                stateSelect.innerHTML = '<option value="">Select State</option>';
                Object.keys(statesAndCities).forEach(state => {
                    const option = document.createElement('option');
                    option.value = state;
                    option.textContent = state;
                    stateSelect.appendChild(option);
                });
            }
        };

        // Initialize when modal is shown
        const addPropertyModal = document.getElementById('addPropertyModal');
        if (addPropertyModal) {
            const handleModalShow = () => initializeStates();
            addPropertyModal.addEventListener('show.bs.modal', handleModalShow);

            // Initialize immediately if modal is already visible
            if (addPropertyModal.classList.contains('show')) {
                initializeStates();
            }

            return () => {
                addPropertyModal.removeEventListener('show.bs.modal', handleModalShow);
            };
        }
    }, [selectedPropertyType]); // Re-run when property type changes

    // Handle state change to populate cities
    React.useEffect(() => {
        const setupStateCityHandlers = () => {
            const stateSelect = document.getElementById('property-state');
            const citySelect = document.getElementById('property-city');

            if (!stateSelect || !citySelect) return;

            const handleStateChange = () => {
                const selectedState = stateSelect.value;
                if (citySelect && selectedState && statesAndCities[selectedState]) {
                    citySelect.innerHTML = '<option value="">Select City</option>';
                    statesAndCities[selectedState].forEach(city => {
                        const option = document.createElement('option');
                        option.value = city;
                        option.textContent = city;
                        citySelect.appendChild(option);
                    });
                } else if (citySelect) {
                    citySelect.innerHTML = '<option value="">Select City</option>';
                }
            };

            // Remove existing listener if any
            stateSelect.removeEventListener('change', handleStateChange);
            // Add new listener
            stateSelect.addEventListener('change', handleStateChange);

            // Initialize cities if a state is already selected
            if (stateSelect.value) {
                handleStateChange();
            }
        };

        // Set up handlers when modal is shown
        const addPropertyModal = document.getElementById('addPropertyModal');
        if (addPropertyModal) {
            const handleModalShow = () => setupStateCityHandlers();
            addPropertyModal.addEventListener('show.bs.modal', handleModalShow);

            // Set up immediately if modal is already visible
            if (addPropertyModal.classList.contains('show')) {
                setupStateCityHandlers();
            }

            return () => {
                addPropertyModal.removeEventListener('show.bs.modal', handleModalShow);
            };
        }
    }, [selectedPropertyType]); // Re-run when property type changes

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
                            <div className="row g-4">
                                {Object.entries(propertyTypeConfigs).map(([key, config]) => (
                                    <div key={key} className="col-md-6">
                                        <div
                                            className="card h-100 property-type-card"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handlePropertyTypeSelection(key)}
                                        >
                                            <div className="card-body text-center p-4">
                                                <div className="mb-3">
                                                    <i className={`${config.icon} fa-3x text-${config.color}`}></i>
                                                </div>
                                                <h5 className="card-title">{config.title}</h5>
                                                <p className="card-text text-muted">{config.description}</p>
                                                <button
                                                    className={`btn btn-${config.color}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePropertyTypeSelection(key);
                                                    }}
                                                >
                                                    Select {config.title.split(' ')[0]}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Add Property Modal */}
            <div className="modal fade" id="addPropertyModal" tabIndex="-1" aria-labelledby="addPropertyModalLabel">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addPropertyModalLabel">
                                <i className={`${selectedPropertyType ? propertyTypeConfigs[selectedPropertyType]?.icon : 'fas fa-plus'} me-2`}></i>
                                {selectedPropertyType ? `Add ${propertyTypeConfigs[selectedPropertyType]?.title}` : 'Add New Property'}
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form id="add-property-form" onSubmit={handleFormSubmit}>
                                <input type="hidden" id="property-type" value={selectedPropertyType || ""} />

                                {/* Property Type Display */}
                                <div className="alert alert-info mb-4" id="property-type-display">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Property Type:</strong> <span id="selected-property-type">{selectedPropertyType ? propertyTypeConfigs[selectedPropertyType]?.title : 'Not Selected'}</span>
                                    <button type="button" className="btn btn-sm btn-outline-primary ms-2" onClick={changePropertyType}>
                                        <i className="fas fa-edit me-1"></i>Change Type
                                    </button>
                                </div>

                                {/* Basic Information */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="fas fa-info-circle me-2"></i>Basic Information
                                        </h6>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="property-name" className="form-label">Property Name *</label>
                                        <input type="text" className="form-control" id="property-name" required placeholder="e.g., Green Valley Apartments" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="property-price" className="form-label">Monthly Rent (₹) *</label>
                                        <div className="input-group">
                                            <span className="input-group-text">₹</span>
                                            <input type="number" className="form-control" id="property-price" required placeholder="e.g., 25000" />
                                        </div>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label htmlFor="property-description" className="form-label">Description *</label>
                                        <textarea className="form-control" id="property-description" rows="3" required placeholder="Describe your property in detail..."></textarea>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h6 className="text-primary mb-3">
                                            <i className="fas fa-map-marker-alt me-2"></i>Location Information
                                        </h6>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label htmlFor="property-address" className="form-label">Building/Society/Apartment Name *</label>
                                        <input type="text" className="form-control" id="property-address" required placeholder="e.g., Green Valley Apartments" />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label htmlFor="location-details" className="form-label">Detailed Location *</label>
                                        <textarea className="form-control" id="location-details" rows="2" required placeholder="Enter complete address including street, area, landmarks"></textarea>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="property-state" className="form-label">State *</label>
                                        <select className="form-select" id="property-state" required>
                                            <option value="">Select State</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="property-city" className="form-label">City *</label>
                                        <select className="form-select" id="property-city" required>
                                            <option value="">Select City</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="property-pincode" className="form-label">Pincode</label>
                                        <input type="text" className="form-control" id="property-pincode" pattern="[0-9]{6}" placeholder="e.g., 400001" />
                                    </div>
                                </div>


                                {/* Dynamic Form Fields */}
                                {selectedPropertyType ? generateDynamicFields(selectedPropertyType) : (
                                    <div className="text-center py-5">
                                        <i className="fas fa-home fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">Please select a property type to continue</h5>
                                        <p className="text-muted">Click the "Change Type" button above to choose your property type</p>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary btn-lg w-100">
                                    <i className="fas fa-save me-2"></i>Save Property
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
