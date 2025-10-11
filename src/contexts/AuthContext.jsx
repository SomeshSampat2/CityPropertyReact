import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { checkUserRole, hasRole, getCurrentUserRole, isSuperAdminEmail } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);
    const [unsubscribeFirestore, setUnsubscribeFirestore] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
            // Clean up any existing Firestore listener
            if (unsubscribeFirestore) {
                unsubscribeFirestore();
            }

            if (currentUser) {
                setUser(currentUser);

                // Set up Firestore listener for real-time updates
                const userDocRef = doc(db, 'users', currentUser.uid);
                const unsubscribeFirestoreListener = onSnapshot(userDocRef,
                    (doc) => {
                        console.log('AuthContext: Firestore listener triggered, doc exists:', doc.exists());
                        if (doc.exists()) {
                            const userData = doc.data();
                            console.log('AuthContext: User document updated:', userData);
                            console.log('AuthContext: hasCompleteProfile will be:', !!(userData && userData.name && userData.mobile));
                            setUserData(userData);

                            // Check if user is blocked
                            const blocked = userData.blocked === true;
                            setIsBlocked(blocked);
                        } else {
                            console.log('AuthContext: User document does not exist - new user');
                            setUserData(null);
                            setIsBlocked(false);
                        }
                    },
                    (error) => {
                        console.error('AuthContext: Firestore listener error:', error);
                        setUserData(null);
                        setIsBlocked(false);
                    }
                );

                setUnsubscribeFirestore(unsubscribeFirestoreListener);

                // Initial fetch to set user data immediately (before listener kicks in)
                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserData(userData);

                        // Check if user is blocked
                        const blocked = userData.blocked === true;
                        setIsBlocked(blocked);

                        // Check if user should be superadmin but role is not set correctly
                        const shouldBeSuperAdmin = isSuperAdminEmail(currentUser.email);
                        if (shouldBeSuperAdmin && userData.role !== 'superadmin') {
                            try {
                                await updateDoc(userDocRef, {
                                    role: 'superadmin',
                                    updatedAt: new Date()
                                });
                                setUserRole('superadmin');
                            } catch (updateError) {
                                console.error('Error updating user role:', updateError);
                                setUserRole('superadmin');
                            }
                        }
                    } else {
                        console.log('AuthContext: Initial fetch - user document does not exist (new user)');
                        setUserData(null);
                        setIsBlocked(false);
                    }

                    // Fetch and set user role
                    try {
                        const role = await checkUserRole(currentUser.uid);
                        setUserRole(role);
                    } catch (error) {
                        console.error('Error fetching user role:', error);
                        // For new users, default to 'user' unless they're superadmin by email
                        const isSuperAdmin = isSuperAdminEmail(currentUser.email);
                        setUserRole(isSuperAdmin ? 'superadmin' : 'user');
                    }
                } catch (error) {
                    console.error('Error fetching initial user data:', error);
                    setUserData(null);
                    setUserRole(null);
                }
            } else {
                setUser(null);
                setUserData(null);
                setUserRole(null);
                setIsBlocked(false);
            }
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeFirestore) {
                unsubscribeFirestore();
            }
        };
    }, []);

    // Manual updater function for external components to force AuthContext refresh
    const updateAuthContext = (newUserData) => {
        console.log('AuthContext: Manual update triggered with:', newUserData);
        if (newUserData) {
            setUserData(newUserData);
            // Check if user is blocked
            const blocked = newUserData.blocked === true;
            setIsBlocked(blocked);
        }
    };

    const value = {
        user,
        userData,
        userRole,
        loading,
        isAuthenticated: !!user,
        isBlocked,
        hasCompleteProfile: userData && userData.name && userData.mobile,
        isSuperAdmin: userRole === 'superadmin',
        isAdmin: userRole === 'admin' || userRole === 'superadmin',
        isBroker: userRole === 'broker' || userRole === 'admin' || userRole === 'superadmin',
        checkRole: hasRole,
        getCurrentRole: getCurrentUserRole,
        updateAuthContext // Expose for manual updates
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
