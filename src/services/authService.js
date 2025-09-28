import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

// Hardcoded SuperAdmin emails
const SUPERADMIN_EMAILS = [
    'mtvhustlevideos@gmail.com',
    'someshbamayya@gmail.com'
];

// Handle post-login redirects (including return URLs)
// Note: Post-login redirect logic is now handled in the Login component
// using React Router navigation instead of window.location.href

// Google Sign-In function
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = result.credential;
        const token = credential.accessToken;
        const user = result.user;

        console.log("Signed in user:", user);

        // Check if this is a new user and create user document with appropriate role
        const userDocRef = doc(db, 'users', user.uid);

        try {
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                // Determine role based on email
                const userRole = SUPERADMIN_EMAILS.includes(user.email) ? 'superadmin' : 'user';

                // New user - create user document with appropriate role
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
                // For new users, always go to profile page unless there's a return URL
                handlePostLoginRedirect({ name: '', mobile: '' });
            } else {
                // Existing user - check if they should be upgraded to SuperAdmin
                const userData = docSnap.data();
                const shouldBeSuperAdmin = SUPERADMIN_EMAILS.includes(user.email);

                if (shouldBeSuperAdmin && userData.role !== 'superadmin') {
                    // Upgrade to SuperAdmin
                    await updateDoc(userDocRef, {
                        role: 'superadmin',
                        updatedAt: serverTimestamp()
                    });

                    console.log('User upgraded to SuperAdmin');
                    // Navigation is handled by the Login component's useEffect
                } else {
                    // Navigation is handled by the Login component's useEffect
                }
            }
        } catch (error) {
            console.error("Error checking/creating user document:", error);
            // Navigation is handled by the Login component's useEffect
        }

    } catch (error) {
        console.error("Google sign-in error:", error.message);
        throw error;
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
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
            return docSnap.data().role || 'user';
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
