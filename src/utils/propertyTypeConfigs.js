// Property type configurations matching the JS project
export const propertyTypeConfigs = {
    residential: {
        title: "Residential Property",
        icon: "fas fa-home",
        color: "primary",
        displayName: "Residential"
    },
    commercial: {
        title: "Commercial Property",
        icon: "fas fa-building",
        color: "success",
        displayName: "Commercial"
    },
    industrial: {
        title: "Industrial Property",
        icon: "fas fa-industry",
        color: "warning",
        displayName: "Industrial"
    },
    land: {
        title: "Land Property",
        icon: "fas fa-map",
        color: "info",
        displayName: "Land"
    }
};

// Sample images array for fallback display (same as JS project)
export const sampleImages = [
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

// Helper function to get property type display info
export const getPropertyTypeInfo = (propertyType) => {
    return propertyTypeConfigs[propertyType] || {
        title: "Property",
        icon: "fas fa-home",
        color: "primary",
        displayName: "Property"
    };
};

// Helper function to format property type specific details
export const getPropertyTypeDetails = (property) => {
    const propertyType = property.propertyType || 'residential';

    switch (propertyType) {
        case 'residential':
            const bedrooms = property.bedrooms ? `${property.bedrooms} BHK` : '';
            const area = property.area ? `${property.area} sq ft` : '';
            return [bedrooms, area].filter(Boolean).join(' • ');

        case 'commercial':
            const commercialType = property.commercialType || 'Commercial';
            const commercialArea = property.area ? `${property.area} sq ft` : '';
            return [commercialType, commercialArea].filter(Boolean).join(' • ');

        case 'industrial':
            const industrialType = property.industrialType || 'Industrial';
            const industrialArea = property.area ? `${property.area} sq ft` : '';
            return [industrialType, industrialArea].filter(Boolean).join(' • ');

        case 'land':
            const landType = property.landType || 'Land';
            const landArea = property.area ? `${property.area} sq ft` : '';
            return [landType, landArea].filter(Boolean).join(' • ');

        default:
            return '';
    }
};

// Helper function to format price with listing type
export const formatPrice = (property) => {
    const listingType = property.listingType || 'rent';
    const price = property.price;

    if (listingType === 'rent') {
        return `Rs. ${price}/month`;
    } else {
        return `Rs. ${price}`;
    }
};

// Helper function to format location
export const formatLocation = (property) => {
    const location = property.address || property.location || 'Location not specified';
    const cityState = property.city && property.state ? `${property.city}, ${property.state}` : '';

    return {
        location,
        cityState
    };
};
