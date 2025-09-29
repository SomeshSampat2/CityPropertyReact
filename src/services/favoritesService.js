import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

// Get user's favorite properties
export const getUserFavorites = async (userId) => {
    try {
        console.log('Loading favorites for user:', userId);

        // Get user's favorites collection
        const favoritesSnapshot = await getDocs(collection(db, 'users', userId, 'favorites'));

        if (favoritesSnapshot.empty) {
            console.log('No favorites found');
            return [];
        }

        // Get property IDs from favorites
        const propertyIds = [];
        favoritesSnapshot.forEach(doc => {
            propertyIds.push(doc.id); // The document ID is the property ID
        });

        console.log('Found favorite property IDs:', propertyIds);

        // Fetch property details for each favorite in batches
        const favoriteProperties = [];
        const batches = [];

        // Split into batches of 10 (Firestore 'in' query limit)
        for (let i = 0; i < propertyIds.length; i += 10) {
            const batch = propertyIds.slice(i, i + 10);
            batches.push(batch);
        }

        for (const batch of batches) {
            const propertiesQuery = query(
                collection(db, 'properties'),
                where('__name__', 'in', batch),
                where('isActive', '==', true)
            );

            const propertiesSnapshot = await getDocs(propertiesQuery);

            propertiesSnapshot.forEach(doc => {
                const propertyData = doc.data();
                favoriteProperties.push({
                    id: doc.id,
                    ...propertyData
                });
            });
        }

        console.log('Loaded favorite properties:', favoriteProperties.length);
        return favoriteProperties;

    } catch (error) {
        console.error('Error loading favorites:', error);
        throw error;
    }
};

// Remove a property from user's favorites
export const removeFromFavorites = async (userId, propertyId) => {
    try {
        console.log('Removing favorite:', propertyId);

        // Remove from Firestore
        await deleteDoc(doc(db, 'users', userId, 'favorites', propertyId));

        console.log('Favorite removed successfully');
        return true;
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

// Check if a property is in user's favorites
export const isPropertyInFavorites = async (userId, propertyId) => {
    try {
        const favoritesDoc = await getDocs(
            query(collection(db, 'users', userId, 'favorites'), where('__name__', '==', propertyId))
        );
        return !favoritesDoc.empty;
    } catch (error) {
        console.error('Error checking if property is in favorites:', error);
        return false;
    }
};

// Add a property to user's favorites
export const addToFavorites = async (userId, propertyId) => {
    try {
        console.log('Adding to favorites:', propertyId);

        // Add to Firestore (using server timestamp)
        await setDoc(doc(db, 'users', userId, 'favorites', propertyId), {
            addedAt: new Date()
        });

        console.log('Property added to favorites successfully');
        return true;
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw error;
    }
};
