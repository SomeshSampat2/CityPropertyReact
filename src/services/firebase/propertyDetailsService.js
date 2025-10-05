import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Property Details Firebase Service
 * Handles all Firebase operations related to property details screen
 */

/**
 * Load property details by ID from Firestore
 * @param {string} propertyId - The ID of the property to load
 * @returns {Promise<Object|null>} Property data or null if not found
 */
export const loadPropertyDetails = async (propertyId) => {
    try {
        console.log('Loading property details for ID:', propertyId);

        const propertyDoc = await getDoc(doc(db, 'properties', propertyId));

        if (propertyDoc.exists()) {
            const propertyData = { id: propertyDoc.id, ...propertyDoc.data() };
            console.log('Property details loaded successfully:', propertyData.name);
            return propertyData;
        } else {
            console.log('Property not found:', propertyId);
            return null;
        }
    } catch (error) {
        console.error('Error loading property details:', error);
        throw error;
    }
};

/**
 * Get sample images for properties without images
 * @returns {Array<string>} Array of sample image URLs
 */
export const getSampleImages = () => {
    return [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
};

/**
 * Get formatted location text for display
 * @param {Object} property - Property data object
 * @returns {string} Formatted location string
 */
export const getLocationText = (property) => {
    if (!property) return '';

    if (property.buildingName && property.locationDetails) {
        return `${property.buildingName}, ${property.locationDetails}`;
    } else if (property.buildingName) {
        return property.buildingName;
    } else if (property.locationDetails) {
        return property.locationDetails;
    } else if (property.address) {
        return property.address;
    } else if (property.location) {
        return property.location;
    }
    return 'Location not specified';
};

/**
 * Get formatted price text for display
 * @param {Object} property - Property data object
 * @returns {string} Formatted price string
 */
export const getPriceText = (property) => {
    if (!property) return '';
    const listingType = property.listingType || 'rent';
    return listingType === 'rent' ? `Rs. ${property.price}/month` : `Rs. ${property.price}`;
};

/**
 * Get property type display name
 * @param {string} type - Property type
 * @returns {string} Display name for the property type
 */
export const getPropertyTypeDisplay = (type) => {
    const types = {
        'residential': 'Residential',
        'commercial': 'Commercial',
        'industrial': 'Industrial',
        'land': 'Land'
    };
    return types[type] || type || 'Property';
};

/**
 * Generate shareable message for the property
 * @param {Object} property - Property data object
 * @param {string} shareableUrl - URL to share
 * @returns {string} Formatted message for sharing
 */
export const generateShareMessage = (property, shareableUrl) => {
    return `🏠 Check out this amazing property!\n\n${property.name}\n📍 ${getLocationText(property)}\n💰 ${getPriceText(property)}\n\nView full details: ${shareableUrl}`;
};
