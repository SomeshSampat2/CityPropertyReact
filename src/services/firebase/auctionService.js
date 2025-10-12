import { db } from '../../config/firebase';
import {
    collection,
    getDocs,
    getDoc,
    query,
    where,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

/**
 * Auction Firebase Service
 * Handles all Firebase operations related to auction properties
 */

// Load all available auctions (auctionDate >= now)
export const loadAvailableAuctions = async () => {
    try {
        const now = Timestamp.now();

        // First get all active auctions, then filter by date and sort in memory
        const queryRef = query(
            collection(db, 'auctions'),
            where('status', '==', 'Active')
        );

        const snapshot = await getDocs(queryRef);

        if (snapshot.empty) {
            return [];
        }

        const auctions = [];
        snapshot.forEach(doc => {
            const data = doc.data();

            // Filter by auction date (avoiding composite index requirement)
            // Handle dates stored as strings (YYYY-MM-DDTHH:mm:ss.sssZ format)
            let auctionDateValue = null;
            if (data.auctionDate) {
                if (data.auctionDate.toDate && typeof data.auctionDate.toDate === 'function') {
                    // It's a Firestore Timestamp
                    auctionDateValue = data.auctionDate.toDate();
                } else if (typeof data.auctionDate === 'string') {
                    // It's a string date - extract just the date part for comparison
                    auctionDateValue = new Date(data.auctionDate.split('T')[0]);
                } else {
                    auctionDateValue = data.auctionDate;
                }
            }

            if (auctionDateValue && auctionDateValue >= now.toDate()) {
                auctions.push({
                    id: doc.id,
                    ...data,
                    // Keep original date format for display
                    auctionDate: data.auctionDate,
                    inspectionDate: data.inspectionDate,
                    emdSubmissionDate: data.emdSubmissionDate,
                });
            }
        });

        // Sort by auction date (newest first, but since we're filtering future dates, earliest first makes sense)
        auctions.sort((a, b) => {
            const aTime = a.auctionDate ? (a.auctionDate instanceof Date ? a.auctionDate.getTime() : a.auctionDate) : 0;
            const bTime = b.auctionDate ? (b.auctionDate instanceof Date ? b.auctionDate.getTime() : b.auctionDate) : 0;
            return aTime - bTime; // Earliest first
        });

        return auctions;
    } catch (error) {
        console.error('Error loading available auctions:', error);
        throw error;
    }
};

// Load upcoming auctions (past auctions for owner only)
export const loadUpcomingAuctions = async (userId) => {
    try {
        // First get all auctions by owner, then filter by date and sort in memory
        const queryRef = query(
            collection(db, 'auctions'),
            where('ownerId', '==', userId)
        );

        const snapshot = await getDocs(queryRef);

        if (snapshot.empty) {
            return [];
        }

        const now = Timestamp.now();
        const auctions = [];
        snapshot.forEach(doc => {
            const data = doc.data();

            // Filter by past auction date (avoiding composite index requirement)
            // Handle dates stored as strings (YYYY-MM-DDTHH:mm:ss.sssZ format)
            let auctionDateValue = null;
            if (data.auctionDate) {
                if (data.auctionDate.toDate && typeof data.auctionDate.toDate === 'function') {
                    // It's a Firestore Timestamp
                    auctionDateValue = data.auctionDate.toDate();
                } else if (typeof data.auctionDate === 'string') {
                    // It's a string date - extract just the date part for comparison
                    auctionDateValue = new Date(data.auctionDate.split('T')[0]);
                } else {
                    auctionDateValue = data.auctionDate;
                }
            }

            if (auctionDateValue && auctionDateValue < now.toDate()) {
                auctions.push({
                    id: doc.id,
                    ...data,
                    // Convert timestamp to Date for easier handling in UI
                    auctionDate: auctionDateValue,
                    inspectionDate: data.inspectionDate?.toDate?.() || data.inspectionDate,
                    emdSubmissionDate: data.emdSubmissionDate?.toDate?.() || data.emdSubmissionDate,
                });
            }
        });

        // Sort by auction date (most recent first for past auctions)
        auctions.sort((a, b) => {
            const aTime = a.auctionDate ? (a.auctionDate instanceof Date ? a.auctionDate.getTime() : a.auctionDate) : 0;
            const bTime = b.auctionDate ? (b.auctionDate instanceof Date ? b.auctionDate.getTime() : b.auctionDate) : 0;
            return bTime - aTime; // Most recent first
        });

        return auctions;
    } catch (error) {
        console.error('Error loading upcoming auctions:', error);
        throw error;
    }
};

// Add a new auction property
export const addAuction = async (auctionData, userId, userRole) => {
    try {
        // Check if user is admin or superadmin
        if (userRole !== 'admin' && userRole !== 'superadmin') {
            throw new Error('Only Admin and SuperAdmin can add auctions');
        }

        const docRef = await addDoc(collection(db, 'auctions'), {
            ...auctionData,
            createdBy: userId,
            ownerId: userId,
            lastUpdatedBy: userId,
            lastUpdatedAt: serverTimestamp(),
            status: 'Active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding auction:', error);
        throw error;
    }
};

// Update an existing auction
export const updateAuction = async (auctionId, auctionData, userId) => {
    try {
        const auctionRef = doc(db, 'auctions', auctionId);

        await updateDoc(auctionRef, {
            ...auctionData,
            lastUpdatedBy: userId,
            lastUpdatedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return auctionId;
    } catch (error) {
        console.error('Error updating auction:', error);
        throw error;
    }
};

// Delete an auction
export const deleteAuction = async (auctionId, userId) => {
    try {
        const auctionRef = doc(db, 'auctions', auctionId);

        await updateDoc(auctionRef, {
            status: 'Archived',
            lastUpdatedBy: userId,
            lastUpdatedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return auctionId;
    } catch (error) {
        console.error('Error deleting auction:', error);
        throw error;
    }
};

// Get auction by ID
export const getAuctionById = async (auctionId) => {
    try {
        const auctionRef = doc(db, 'auctions', auctionId);
        const auctionSnap = await getDoc(auctionRef);

        if (auctionSnap.exists()) {
            const data = auctionSnap.data();
            return {
                id: auctionSnap.id,
                ...data,
                // Convert timestamp to Date for easier handling in UI
                auctionDate: data.auctionDate?.toDate?.() || data.auctionDate,
                inspectionDate: data.inspectionDate?.toDate?.() || data.inspectionDate,
                emdSubmissionDate: data.emdSubmissionDate?.toDate?.() || data.emdSubmissionDate,
            };
        } else {
            throw new Error('Auction not found');
        }
    } catch (error) {
        console.error('Error getting auction:', error);
        throw error;
    }
};

// Filter auctions by city, property type, or bank/agency
export const filterAuctions = async (filters) => {
    try {
        const { city, propertyType, bankAgency } = filters;

        // Get all active auctions first
        const queryRef = query(
            collection(db, 'auctions'),
            where('status', '==', 'Active')
        );

        const snapshot = await getDocs(queryRef);

        if (snapshot.empty) {
            return [];
        }

        const now = Timestamp.now();
        let auctions = [];
        snapshot.forEach(doc => {
            const data = doc.data();

            // Filter by future auction date (avoiding composite index requirement)
            // Handle dates stored as strings (YYYY-MM-DDTHH:mm:ss.sssZ format)
            let auctionDateValue = null;
            if (data.auctionDate) {
                if (data.auctionDate.toDate && typeof data.auctionDate.toDate === 'function') {
                    // It's a Firestore Timestamp
                    auctionDateValue = data.auctionDate.toDate();
                } else if (typeof data.auctionDate === 'string') {
                    // It's a string date - extract just the date part for comparison
                    auctionDateValue = new Date(data.auctionDate.split('T')[0]);
                } else {
                    auctionDateValue = data.auctionDate;
                }
            }

            if (auctionDateValue && auctionDateValue >= now.toDate()) {
                auctions.push({
                    id: doc.id,
                    ...data,
                    // Keep original date format for display
                    auctionDate: data.auctionDate,
                    inspectionDate: data.inspectionDate,
                    emdSubmissionDate: data.emdSubmissionDate,
                });
            }
        });

        // Apply additional filters in memory
        if (city) {
            auctions = auctions.filter(auction => auction.city === city);
        }

        if (propertyType) {
            auctions = auctions.filter(auction => auction.propertyType === propertyType);
        }

        if (bankAgency) {
            auctions = auctions.filter(auction =>
                auction.bankAgency && auction.bankAgency.toLowerCase().includes(bankAgency.toLowerCase())
            );
        }

        // Sort by auction date (earliest first)
        auctions.sort((a, b) => {
            const aTime = a.auctionDate ? (a.auctionDate instanceof Date ? a.auctionDate.getTime() : a.auctionDate) : 0;
            const bTime = b.auctionDate ? (b.auctionDate instanceof Date ? b.auctionDate.getTime() : b.auctionDate) : 0;
            return aTime - bTime; // Earliest first
        });

        return auctions;
    } catch (error) {
        console.error('Error filtering auctions:', error);
        throw error;
    }
};

// Get auction statistics for dashboard
export const getAuctionStats = async (userId) => {
    try {
        const now = Timestamp.now();

        // Get all active auctions (avoiding composite index)
        const activeQuery = query(
            collection(db, 'auctions'),
            where('status', '==', 'Active')
        );

        // Get user's auctions (both active and past)
        const userQuery = query(
            collection(db, 'auctions'),
            where('ownerId', '==', userId)
        );

        const [activeSnapshot, userSnapshot] = await Promise.all([
            getDocs(activeQuery),
            getDocs(userQuery)
        ]);

        // Filter active auctions by future date in memory
        let totalActive = 0;
        activeSnapshot.forEach(doc => {
            const data = doc.data();

            // Handle dates stored as strings (YYYY-MM-DDTHH:mm:ss.sssZ format)
            let auctionDateValue = null;
            if (data.auctionDate) {
                if (data.auctionDate.toDate && typeof data.auctionDate.toDate === 'function') {
                    // It's a Firestore Timestamp
                    auctionDateValue = data.auctionDate.toDate();
                } else if (typeof data.auctionDate === 'string') {
                    // It's a string date - extract just the date part for comparison
                    auctionDateValue = new Date(data.auctionDate.split('T')[0]);
                } else {
                    auctionDateValue = data.auctionDate;
                }
            }

            if (auctionDateValue && auctionDateValue >= now.toDate()) {
                totalActive++;
            }
        });

        const stats = {
            totalActive: totalActive,
            myAuctions: userSnapshot.size,
            upcoming: 0,
            past: 0
        };

        // Count user's past auctions and upcoming auctions
        userSnapshot.forEach(doc => {
            const data = doc.data();

            // Handle dates stored as strings (YYYY-MM-DDTHH:mm:ss.sssZ format)
            let auctionDateValue = null;
            if (data.auctionDate) {
                if (data.auctionDate.toDate && typeof data.auctionDate.toDate === 'function') {
                    // It's a Firestore Timestamp
                    auctionDateValue = data.auctionDate.toDate();
                } else if (typeof data.auctionDate === 'string') {
                    // It's a string date - extract just the date part for comparison
                    auctionDateValue = new Date(data.auctionDate.split('T')[0]);
                } else {
                    auctionDateValue = data.auctionDate;
                }
            }

            if (auctionDateValue) {
                if (auctionDateValue < now.toDate()) {
                    stats.past++;
                } else {
                    stats.upcoming++;
                }
            }
        });

        return stats;
    } catch (error) {
        console.error('Error getting auction stats:', error);
        throw error;
    }
};

// Helper function to format auction data for display
export const formatAuctionForDisplay = (auction) => {
    // Ensure auctionDate is a proper Date object for formatting
    let auctionDateForDisplay = auction.auctionDate;
    if (auction.auctionDate && typeof auction.auctionDate === 'string') {
        auctionDateForDisplay = new Date(auction.auctionDate);
    }

    let inspectionDateForDisplay = auction.inspectionDate;
    if (auction.inspectionDate && typeof auction.inspectionDate === 'string') {
        inspectionDateForDisplay = new Date(auction.inspectionDate);
    }

    return {
        ...auction,
        formattedReservePrice: auction.reservePrice ? `₹${auction.reservePrice.toLocaleString('en-IN')}` : 'N/A',
        formattedEMDAmount: auction.emdAmount ? `₹${auction.emdAmount.toLocaleString('en-IN')}` : 'N/A',
        formattedBidIncrement: auction.bidIncrement ? `₹${auction.bidIncrement.toLocaleString('en-IN')}` : 'N/A',
        auctionDateFormatted: auctionDateForDisplay ? auctionDateForDisplay.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) : 'N/A',
        inspectionDateFormatted: inspectionDateForDisplay ? inspectionDateForDisplay.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) : 'N/A'
    };
};
