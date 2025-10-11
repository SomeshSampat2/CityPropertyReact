import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

// Hardcoded SuperAdmin emails
const SUPERADMIN_EMAILS = [
    'mtvhustlevideos@gmail.com',
    'someshbamayya@gmail.com'
];

// Handle post-login redirects (including return URLs)
function handlePostLoginRedirect(userData = null) {
    console.log('handlePostLoginRedirect called with userData:', userData);

    // Check for return URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');

    if (returnUrl) {
        console.log('Redirecting to return URL:', returnUrl);
        // Use React Router navigation if available, fallback to window.location
        if (window.ReactRouterNavigate) {
            window.ReactRouterNavigate(decodeURIComponent(returnUrl));
        } else {
            window.location.href = decodeURIComponent(returnUrl);
        }
        return;
    }

    // Default redirect logic based on profile completion
    if (userData && (!userData.name || !userData.mobile)) {
        console.log('User has incomplete profile, redirecting to /profile');
        if (window.ReactRouterNavigate) {
            window.ReactRouterNavigate('/profile');
        } else {
            window.location.href = "/profile";
        }
    } else {
        console.log('User has complete profile, redirecting to /home');
        if (window.ReactRouterNavigate) {
            window.ReactRouterNavigate('/home');
        } else {
            window.location.href = "/home";
        }
    }
}

// Google Sign-In function
export const signInWithGoogle = async () => {
    try {
        console.log("Starting Google sign-in popup...");

        // Add timeout to prevent hanging
        const authPromise = signInWithPopup(auth, googleProvider);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Authentication timeout - please check if popup was blocked")), 30000)
        );

        const result = await Promise.race([authPromise, timeoutPromise]);

        // Handle credential safely - it might be undefined in some cases
        let token = null;
        if (result.credential && result.credential.accessToken) {
            token = result.credential.accessToken;
        }

        const user = result.user;
        console.log("Signed in user:", user);
        console.log("Credential available:", !!result.credential);
        console.log("Access token available:", !!token);

        if (!user) {
            throw new Error("No user returned from authentication");
        }

        // Check if this is a new user and create user document with appropriate role
        const userDocRef = doc(db, 'users', user.uid);

        try {
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                // Determine role based on email
                const userRole = SUPERADMIN_EMAILS.includes(user.email) ? 'superadmin' : 'user';

                // New user - create user document with appropriate role
                console.log('Creating new user document...');
                await setDoc(userDocRef, {
                    name: user.displayName || '',
                    email: user.email,
                    photoURL: user.photoURL || '',
                    mobile: '',
                    role: userRole, // SuperAdmin for specific emails, User for others
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                console.log(`New user document created with ${userRole} role`);

                // Wait a moment for the document to be fully written and then verify it exists
                await new Promise(resolve => setTimeout(resolve, 100));

                // Verify the document was created successfully
                const verifyDoc = await getDoc(userDocRef);
                if (verifyDoc.exists()) {
                    console.log('User document verified successfully');
                    // For new users, always go to profile page unless there's a return URL
                    console.log('Redirecting new user to profile...');
                    handlePostLoginRedirect({ name: '', mobile: '' });
                } else {
                    throw new Error('Failed to create user document in Firestore');
                }
            } else {
                // Existing user - check if they should be upgraded to SuperAdmin
                const userData = docSnap.data();
                const shouldBeSuperAdmin = SUPERADMIN_EMAILS.includes(user.email);

                            if (shouldBeSuperAdmin && userData.role !== 'superadmin') {
                                // Upgrade to SuperAdmin
                                console.log('Upgrading user to SuperAdmin...');
                                await updateDoc(userDocRef, {
                                    role: 'superadmin',
                                    updatedAt: serverTimestamp()
                                });

                                // Wait for update to complete and verify
                                await new Promise(resolve => setTimeout(resolve, 100));
                                const updatedDoc = await getDoc(userDocRef);
                                const updatedData = updatedDoc.data();

                                console.log('User upgraded to SuperAdmin successfully');
                                // Use updated user data for navigation
                                console.log('Redirecting upgraded user...');
                                handlePostLoginRedirect(updatedData);
                            } else {
                                // Existing user - redirect based on profile completion or return URL
                                console.log('Redirecting existing user...');
                                handlePostLoginRedirect(userData);
                            }
            }
        } catch (error) {
            console.error("Error checking/creating user document:", error);
            // Default to profile page on error
            console.log('Redirecting on error...');
            handlePostLoginRedirect({ name: '', mobile: '' });
        }

    } catch (error) {
        console.error("Google sign-in error:", error);

        // Provide more specific error messages
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error("Sign-in popup was closed before completing. Please try again.");
        } else if (error.code === 'auth/popup-blocked') {
            throw new Error("Sign-in popup was blocked by your browser. Please allow popups for this site.");
        } else if (error.code === 'auth/cancelled-popup-request') {
            throw new Error("Sign-in request was cancelled. Please try again.");
        } else if (error.message && error.message.includes('accessToken')) {
            throw new Error("Authentication succeeded but token access failed. Please try again.");
        } else {
            throw new Error(`Authentication failed: ${error.message || 'Unknown error'}`);
        }
    }
};

// Sign out function
export const signOutUser = async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

// Role checking functions
export const checkUserRole = async (uid) => {
    try {
        if (!uid) {
            console.warn("No UID provided for role check");
            return 'user';
        }

        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
            const userData = docSnap.data();
            return userData?.role || 'user';
        }
        return 'user';
    } catch (error) {
        console.error("Error checking user role:", error);
        return 'user';
    }
};

export const hasRole = async (requiredRole) => {
    const user = auth.currentUser;
    if (!user) return false;

    const userRole = await checkUserRole(user.uid);
    const roleHierarchy = ['user', 'broker', 'admin', 'superadmin'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    return userRoleIndex >= requiredRoleIndex;
};

export const getCurrentUserRole = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await checkUserRole(user.uid);
};

export const isSuperAdminEmail = (email) => {
    return SUPERADMIN_EMAILS.includes(email);
};
