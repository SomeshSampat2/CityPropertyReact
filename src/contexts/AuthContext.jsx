import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserData(userData);

                        // Check if user is blocked
                        const blocked = userData.blocked === true;
                        setIsBlocked(blocked);

                        // Check if user should be superadmin but role is not set correctly
                        const shouldBeSuperAdmin = isSuperAdminEmail(currentUser.email);
                        if (shouldBeSuperAdmin && userData.role !== 'superadmin') {
                            // console.log('AuthContext - User should be superadmin but role is:', userData.role, 'Updating...');
                            // Update role in database
                            try {
                                await updateDoc(doc(db, 'users', currentUser.uid), {
                                    role: 'superadmin',
                                    updatedAt: new Date()
                                });
                                // console.log('AuthContext - Updated user role to superadmin');
                                setUserRole('superadmin');
                            } catch (updateError) {
                                console.error('Error updating user role:', updateError);
                                setUserRole('superadmin'); // Set locally even if DB update fails
                            }
                        }
                    } else {
                        setUserData(null);
                        setIsBlocked(false);
                    }

                    // Fetch and set user role
                    try {
                        const role = await checkUserRole(currentUser.uid);
                        // console.log('AuthContext - Fetched user role:', role, 'for user:', currentUser.email);
                        setUserRole(role);
                    } catch (error) {
                        console.error('Error fetching user role:', error);
                        // For superadmin emails, default to superadmin if role fetch fails
                        const isSuperAdmin = isSuperAdminEmail(currentUser.email);
                        // console.log('AuthContext - Fallback role check:', isSuperAdmin ? 'superadmin' : 'user', 'for email:', currentUser.email);
                        setUserRole(isSuperAdmin ? 'superadmin' : 'user');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
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

        return unsubscribe;
    }, []);

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
        getCurrentRole: getCurrentUserRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
