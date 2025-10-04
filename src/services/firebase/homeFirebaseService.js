import { db } from '../../config/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { addToFavorites, removeFromFavorites } from '../favoritesService';

/**
 * Home Screen Firebase Service
 * Handles all Firebase operations related to the home screen
 */

// Load all active properties from Firestore
export const loadAllProperties = async () => {
    try {
        const queryRef = query(
            collection(db, 'properties'),
            where('isActive', '==', true)
        );

        const snapshot = await getDocs(queryRef);

        if (snapshot.empty) {
            return [];
        }

        // Convert to array and sort by createdAt (newest first)
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

        return propertiesData;
    } catch (error) {
        console.error('Error loading properties:', error);
        throw error;
    }
};

// Load user's favorite property IDs
export const loadFavorites = async (userId) => {
    try {
        const favoritesSnapshot = await getDocs(
            collection(db, 'users', userId, 'favorites')
        );

        const favoriteIds = new Set();
        favoritesSnapshot.forEach(doc => {
            favoriteIds.add(doc.id);
        });

        return favoriteIds;
    } catch (error) {
        console.error('Error loading favorites:', error);
        throw error;
    }
};

// Toggle favorite status for a property
export const toggleFavorite = async (userId, propertyId, isCurrentlyFavorited) => {
    try {
        if (isCurrentlyFavorited) {
            // Remove from favorites
            await removeFromFavorites(userId, propertyId);
            return false; // No longer favorited
        } else {
            // Add to favorites
            await addToFavorites(userId, propertyId);
            return true; // Now favorited
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
    }
};

// Add a new property to Firestore
export const addProperty = async (propertyData) => {
    try {
        const docRef = await addDoc(collection(db, 'properties'), {
            ...propertyData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isActive: true
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding property:', error);
        throw error;
    }
};

// Submit a property request to Firestore
export const submitPropertyRequest = async (requestData) => {
    try {
        const docRef = await addDoc(collection(db, 'propertyRequests'), {
            ...requestData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'pending'
        });

        return docRef.id;
    } catch (error) {
        console.error('Error submitting property request:', error);
        throw error;
    }
};

// Get property type display name
export const getPropertyTypeDisplay = (type) => {
    const types = {
        'residential': 'Residential',
        'commercial': 'Commercial',
        'industrial': 'Industrial',
        'land': 'Land'
    };
    return types[type] || type || 'Property';
};
