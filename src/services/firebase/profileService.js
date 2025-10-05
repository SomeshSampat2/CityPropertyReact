import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Profile Service
 * Handles all Firebase operations related to user profiles and role requests
 * Provides clean separation between UI and Firebase operations
 */

// Fetch user's pending role requests
export const fetchPendingRequests = async (userId) => {
    try {
        console.log('Fetching pending requests for user:', userId);

        const q = query(
            collection(db, 'roleRequests'),
            where('userId', '==', userId),
            where('status', '==', 'pending')
        );

        const querySnapshot = await getDocs(q);
        const requests = [];

        querySnapshot.forEach((doc) => {
            requests.push(doc.data().requestedRole);
        });

        console.log('Found pending requests:', requests);
        return requests;
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        throw error;
    }
};

// Update user profile information
export const updateUserProfile = async (userId, profileData) => {
    try {
        console.log('Updating profile for user:', userId);

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...profileData,
            updatedAt: serverTimestamp()
        });

        console.log('Profile updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Submit a role upgrade request
export const submitRoleRequest = async (userId, requestedRole) => {
    try {
        console.log('Submitting role request for user:', userId, 'Role:', requestedRole);

        const requestData = {
            userId: userId,
            requestedRole: requestedRole,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'roleRequests'), requestData);

        console.log('Role request submitted successfully with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error submitting role request:', error);
        throw error;
    }
};

// Check if user already has a pending request for a specific role
export const checkExistingRequest = async (userId, requestedRole) => {
    try {
        const q = query(
            collection(db, 'roleRequests'),
            where('userId', '==', userId),
            where('requestedRole', '==', requestedRole),
            where('status', '==', 'pending')
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking existing request:', error);
        return false;
    }
};
