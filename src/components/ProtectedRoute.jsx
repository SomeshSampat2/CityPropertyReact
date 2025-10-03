import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { checkUserRole } from '../services/authService';

const ProtectedRoute = ({ children, requiredRole = null, requireAll = false }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }

                    // Check user role if requiredRole is specified
                    if (requiredRole) {
                        try {
                            const role = await checkUserRole(currentUser.uid);
                            setUserRole(role);
                        } catch (error) {
                            console.error('Error checking user role:', error);
                            setUserRole('user'); // Default fallback
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setUser(null);
                setUserData(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [requiredRole]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Check if profile is incomplete
    if (userData && (!userData.name || !userData.mobile)) {
        return <Navigate to="/profile" replace />;
    }

    // Check role requirements if specified
    if (requiredRole && userRole) {
        const roleHierarchy = ['user', 'broker', 'admin', 'superadmin'];
        const userRoleIndex = roleHierarchy.indexOf(userRole);
        const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

        // Check if user has sufficient role level
        if (userRoleIndex < requiredRoleIndex) {
            return <Navigate to="/home" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
