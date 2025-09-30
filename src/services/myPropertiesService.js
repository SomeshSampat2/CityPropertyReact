import { db, auth } from '../config/firebase';
import { collection, doc, getDocs, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';

// Get user's properties from Firestore
export const getUserProperties = async (userId) => {
    try {
        console.log('Loading properties for user:', userId);

        // Query properties where owner equals current user's UID and isActive is true
        // Note: Removed orderBy to avoid requiring composite index - matches JS implementation
        const propertiesQuery = query(
            collection(db, 'properties'),
            where('owner', '==', userId),
            where('isActive', '==', true)
        );

        const snapshot = await getDocs(propertiesQuery);

        console.log('Found', snapshot.size, 'properties');

        const userProperties = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            userProperties.push({
                id: doc.id,
                ...data
            });
        });

        // Sort by created date (newest first) - matches JS implementation
        userProperties.sort((a, b) => {
            const aTime = a.createdAt ? (a.createdAt.seconds || a.createdAt.getTime?.() / 1000 || 0) : 0;
            const bTime = b.createdAt ? (b.createdAt.seconds || b.createdAt.getTime?.() / 1000 || 0) : 0;
            return bTime - aTime;
        });

        return userProperties;

    } catch (error) {
        console.error('Error loading user properties:', error);
        throw error;
    }
};

// Update property in Firestore
export const updateProperty = async (propertyId, propertyData) => {
    try {
        console.log('Updating property:', propertyId, propertyData);

        const propertyRef = doc(db, 'properties', propertyId);

        // Add updated timestamp
        const updatedData = {
            ...propertyData,
            updatedAt: serverTimestamp()
        };

        await updateDoc(propertyRef, updatedData);

        console.log('Property updated successfully');
        return true;

    } catch (error) {
        console.error('Error updating property:', error);
        throw error;
    }
};

// Soft delete property (set isActive to false)
export const deleteProperty = async (propertyId) => {
    try {
        console.log('Deleting property:', propertyId);

        const propertyRef = doc(db, 'properties', propertyId);

        await updateDoc(propertyRef, {
            isActive: false,
            deletedAt: serverTimestamp(),
            deletedBy: auth.currentUser.uid
        });

        console.log('Property deleted successfully');
        return true;

    } catch (error) {
        console.error('Error deleting property:', error);
        throw error;
    }
};

// Get property by ID
export const getPropertyById = async (propertyId) => {
    try {
        console.log('Loading property:', propertyId);

        const propertyDoc = await getDocs(
            query(collection(db, 'properties'), where('__name__', '==', propertyId))
        );

        if (propertyDoc.empty) {
            throw new Error('Property not found');
        }

        const propertyData = propertyDoc.docs[0].data();
        return {
            id: propertyDoc.docs[0].id,
            ...propertyData
        };

    } catch (error) {
        console.error('Error loading property:', error);
        throw error;
    }
};

// Check if user has permission to edit property
export const checkEditPermission = async (propertyId, userId) => {
    try {
        const property = await getPropertyById(propertyId);

        // Check if user is the owner or admin/superadmin
        if (property.owner === userId) {
            return true;
        }

        // TODO: Check user role for admin/superadmin permissions
        // For now, just check ownership
        return false;

    } catch (error) {
        console.error('Error checking edit permission:', error);
        return false;
    }
};
