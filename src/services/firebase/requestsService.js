import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Requests Service
 * Handles all Firebase operations related to role requests management
 * Provides clean separation between UI and Firebase operations
 */

// Load role requests with filtering and user data
export const loadRoleRequests = async (filter = 'pending') => {
    try {
        console.log('Loading role requests with filter:', filter);

        // Build query based on filter
        let queryRef = collection(db, 'roleRequests');
        if (filter !== 'all') {
            queryRef = query(queryRef, where('status', '==', filter));
        }

        const snapshot = await getDocs(queryRef);

        if (snapshot.empty) {
            console.log('No requests found');
            return [];
        }

        // Convert to array and sort by createdAt (newest first)
        const requestsData = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            requestsData.push({
                id: doc.id,
                ...data
            });
        });

        // Sort by createdAt (newest first)
        requestsData.sort((a, b) => {
            const aTime = a.createdAt ? (a.createdAt.seconds || a.createdAt.getTime?.() / 1000 || 0) : 0;
            const bTime = b.createdAt ? (b.createdAt.seconds || b.createdAt.getTime?.() / 1000 || 0) : 0;
            return bTime - aTime;
        });

        console.log('Loaded requests:', requestsData.length);

        // Get all unique user IDs to batch fetch user data
        const userIds = [...new Set(requestsData.map(request => request.userId).filter(id => id))];
        const userDataMap = {};

        console.log('Found user IDs:', userIds);

        // Fetch user data for all requesters
        for (const userId of userIds) {
            try {
                console.log('Fetching user data for:', userId);
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log('Found user data:', userData);
                    userDataMap[userId] = userData;
                } else {
                    console.log('User document not found for:', userId);
                    userDataMap[userId] = { name: 'Unknown User', email: 'unknown@example.com', role: 'user' };
                }
            } catch (error) {
                console.error(`Error fetching user data for ${userId}:`, error);
                userDataMap[userId] = { name: 'Unknown User', email: 'unknown@example.com', role: 'user' };
            }
        }

        // Add user data to requests
        const requestsWithUserData = requestsData.map(request => ({
            ...request,
            userData: userDataMap[request.userId] || { name: 'Unknown User', email: 'unknown@example.com', role: 'user' }
        }));

        console.log('Requests with user data loaded successfully');
        return requestsWithUserData;

    } catch (error) {
        console.error('Error loading role requests:', error);
        throw error;
    }
};

// Process a role request (approve or reject)
export const processRoleRequest = async (requestId, newStatus, currentUserId) => {
    try {
        console.log('Processing request:', requestId, 'Status:', newStatus);

        // First, get the request details to access userId and requestedRole
        const requestDoc = await getDoc(doc(db, 'roleRequests', requestId));
        if (!requestDoc.exists()) {
            throw new Error('Request not found');
        }

        const request = requestDoc.data();
        console.log('Found request:', request);

        // Update request status
        console.log('Updating request status...');
        await updateDoc(doc(db, 'roleRequests', requestId), {
            status: newStatus,
            processedAt: serverTimestamp(),
            processedBy: currentUserId
        });
        console.log('Request status updated successfully');

        // If approved, update user's role
        if (newStatus === 'approved') {
            console.log('Updating user role...');
            await updateDoc(doc(db, 'users', request.userId), {
                role: request.requestedRole,
                updatedAt: serverTimestamp()
            });
            console.log('User role updated successfully');
        }

        console.log(`Request ${newStatus} successfully`);
        return { success: true, action: newStatus };

    } catch (error) {
        console.error('Error processing role request:', error);
        throw error;
    }
};

// Get user data for a specific user ID
export const getUserData = async (userId) => {
    try {
        console.log('Fetching user data for:', userId);
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Found user data:', userData);
            return userData;
        } else {
            console.log('User document not found for:', userId);
            return { name: 'Unknown User', email: 'unknown@example.com', role: 'user' };
        }
    } catch (error) {
        console.error(`Error fetching user data for ${userId}:`, error);
        return { name: 'Unknown User', email: 'unknown@example.com', role: 'user' };
    }
};

// Get role requests count by status
export const getRequestsCount = async (status = null) => {
    try {
        let queryRef = collection(db, 'roleRequests');
        if (status) {
            queryRef = query(queryRef, where('status', '==', status));
        }

        const snapshot = await getDocs(queryRef);
        return snapshot.size;
    } catch (error) {
        console.error('Error getting requests count:', error);
        return 0;
    }
};
