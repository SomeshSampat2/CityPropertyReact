import { db } from '../../config/firebase';
import { collection, getDocs, doc, updateDoc, getDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

/**
 * Dashboard Service
 * Handles all Firebase operations related to admin dashboard functionality
 * Provides clean separation between UI and Firebase operations
 */

// Load users with filtering and sorting
export const loadUsers = async (filter = 'all') => {
    try {
        console.log('Loading users with filter:', filter);

        const snapshot = await getDocs(collection(db, 'users'));
        const usersData = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            usersData.push({
                id: doc.id,
                ...data
            });
        });

        // Filter users based on selection
        let filteredUsers = usersData;
        if (filter === 'active') {
            filteredUsers = usersData.filter(user => !user.blocked);
        } else if (filter === 'blocked') {
            filteredUsers = usersData.filter(user => user.blocked === true);
        }

        // Sort by creation date (newest first)
        filteredUsers.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
            return dateB - dateA;
        });

        console.log(`Loaded ${filteredUsers.length} users with filter: ${filter}`);
        return filteredUsers;

    } catch (error) {
        console.error('Error loading users:', error);
        throw error;
    }
};

// Load property requests with user data
export const loadPropertyRequests = async () => {
    try {
        console.log('Loading property requests');

        const requestsSnapshot = await getDocs(
            query(collection(db, 'propertyRequests'), orderBy('createdAt', 'desc'))
        );

        if (requestsSnapshot.empty) {
            console.log('No property requests found');
            return [];
        }

        // Get all unique user IDs from requests
        const userIds = new Set();
        requestsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.userId) {
                userIds.add(data.userId);
            }
        });

        // Fetch user data for all user IDs
        const userPromises = Array.from(userIds).map(userId =>
            getDoc(doc(db, 'users', userId))
        );

        const userSnapshots = await Promise.all(userPromises);
        const userMap = new Map();

        userSnapshots.forEach(snapshot => {
            if (snapshot.exists) {
                const data = snapshot.data();
                userMap.set(snapshot.id, data);
            }
        });

        // Process requests with user data
        const requestsData = [];
        requestsSnapshot.forEach(doc => {
            const data = doc.data();
            const userData = userMap.get(data.userId) || {};

            requestsData.push({
                id: doc.id,
                ...data,
                userName: userData.name || userData.email || 'Anonymous',
                userEmail: userData.email || 'N/A',
                userMobile: userData.mobile || 'Not available'
            });
        });

        console.log(`Loaded ${requestsData.length} property requests`);
        return requestsData;

    } catch (error) {
        console.error('Error loading property requests:', error);
        throw error;
    }
};

// Toggle user block status
export const toggleUserBlock = async (userId) => {
    try {
        console.log('Toggling block status for user:', userId);

        // First get current user data to check current block status
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const userData = userDoc.data();
        const currentBlockedStatus = userData.blocked || false;

        // Update user block status
        await updateDoc(doc(db, 'users', userId), {
            blocked: !currentBlockedStatus,
            updatedAt: serverTimestamp()
        });

        console.log(`User ${!currentBlockedStatus ? 'blocked' : 'unblocked'} successfully`);
        return { success: true, blocked: !currentBlockedStatus };

    } catch (error) {
        console.error('Error toggling user block status:', error);
        throw error;
    }
};

// Update user role
export const updateUserRole = async (userId, newRole) => {
    try {
        console.log('Updating user role:', userId, 'to:', newRole);

        await updateDoc(doc(db, 'users', userId), {
            role: newRole,
            updatedAt: serverTimestamp()
        });

        console.log(`User role updated to ${newRole} successfully`);
        return { success: true, newRole };

    } catch (error) {
        console.error('Error updating user role:', error);
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
            return null;
        }
    } catch (error) {
        console.error(`Error fetching user data for ${userId}:`, error);
        return null;
    }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
    try {
        console.log('Loading dashboard statistics');

        // Get total users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;
        const activeUsers = usersSnapshot.docs.filter(doc => !doc.data().blocked).length;
        const blockedUsers = usersSnapshot.docs.filter(doc => doc.data().blocked).length;

        // Get role distribution
        const roleStats = { user: 0, broker: 0, admin: 0, superadmin: 0 };
        usersSnapshot.forEach(doc => {
            const role = doc.data().role || 'user';
            if (roleStats[role] !== undefined) {
                roleStats[role]++;
            }
        });

        // Get property requests count
        const requestsSnapshot = await getDocs(collection(db, 'propertyRequests'));
        const totalRequests = requestsSnapshot.size;

        const stats = {
            totalUsers,
            activeUsers,
            blockedUsers,
            roleStats,
            totalRequests
        };

        console.log('Dashboard stats loaded:', stats);
        return stats;

    } catch (error) {
        console.error('Error loading dashboard statistics:', error);
        throw error;
    }
};
