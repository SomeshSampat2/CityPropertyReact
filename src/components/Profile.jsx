import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOutUser } from '../services/authService';

const Profile = () => {
    const navigate = useNavigate();
    const { user, userData, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentRole, setCurrentRole] = useState('user');
    const [pendingRequests, setPendingRequests] = useState([]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user && userData) {
                setCurrentRole(userData.role || 'user');
                await fetchPendingRequests();
                setLoading(false);
            }
        };

        if (user && userData) {
            fetchUserData();
        }
    }, [user, userData]);

    const fetchPendingRequests = async () => {
        if (!user) return;

        try {
            const q = query(
                collection(db, 'roleRequests'),
                where('userId', '==', user.uid),
                where('status', '==', 'pending')
            );
            const querySnapshot = await getDocs(q);
            const requests = [];
            querySnapshot.forEach((doc) => {
                requests.push(doc.data().requestedRole);
            });
            setPendingRequests(requests);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData(e.target);
            const profileData = {
                name: formData.get('name') || '',
                mobile: formData.get('mobile') || '',
                updatedAt: new Date()
            };

            if (user) {
                await updateDoc(doc(db, 'users', user.uid), profileData);
                console.log('✅ Profile saved successfully');
                // Show success message
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleRoleRequest = async (requestedRole) => {
        if (!user) return;

        try {
            // Check for existing pending request
            if (pendingRequests.includes(requestedRole)) {
                alert('You already have a pending request for this role.');
                return;
            }

            // Add the role request
            await addDoc(collection(db, 'roleRequests'), {
                userId: user.uid,
                requestedRole: requestedRole,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log('✅ Role request submitted successfully');
            alert(`Your request for ${requestedRole} role has been submitted and is pending approval.`);

            // Update pending requests state
            setPendingRequests(prev => [...prev, requestedRole]);

        } catch (error) {
            console.error('Error submitting role request:', error);
            alert('Error submitting request. Please try again.');
        }
    };

    const handleLogout = async () => {
        try {
            await signOutUser();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    const profileImageUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || user?.email || 'User')}&background=667eea&color=ffffff&size=150`;

    return (
        <React.Fragment>
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-lg">
                            <div className="card-header text-dark" style={{ borderBottom: '1px solid #dee2e6' }}>
                                <h5 className="mb-0 text-white"><i className="fas fa-user-circle me-2"></i>Your Profile</h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <img
                                        id="profile-pic"
                                        src={profileImageUrl}
                                        className="rounded-circle shadow"
                                        alt="Profile Picture"
                                        width="150"
                                        height="150"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>

                                {/* Current Role Display */}
                                <div className="alert alert-info text-center mb-4">
                                    <h5 className="mb-1"><i className="fas fa-id-badge me-2"></i>Current Role</h5>
                                    <span className="badge bg-primary fs-6">
                                        {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                                    </span>
                                </div>

                                <form onSubmit={handleSaveProfile}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="email" className="form-label"><i className="fas fa-envelope me-1"></i>Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={user?.email || ''}
                                                disabled
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="name" className="form-label"><i className="fas fa-user me-1"></i>Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="name"
                                                name="name"
                                                defaultValue={userData?.name || ''}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="mobile" className="form-label"><i className="fas fa-phone me-1"></i>Mobile Number *</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="mobile"
                                            name="mobile"
                                            defaultValue={userData?.mobile || ''}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-success w-100 mb-4"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>Save Profile
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Role Request Section */}
                                <div className="card border-0" style={{ backgroundColor: '#f8f9fa' }}>
                                    <div className="card-header border-0 pb-0">
                                        <h5 className="text-center mb-3"><i className="fas fa-user-plus me-2"></i>Role Upgrade Requests</h5>
                                        <p className="text-white text-center small mb-3 pb-2">Request higher privileges to access advanced features</p>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="d-grid">
                                                    <button
                                                        id="request-broker-btn"
                                                        className={`btn ${currentRole === 'broker' || currentRole === 'admin' || currentRole === 'superadmin' ? 'btn-secondary' : pendingRequests.includes('broker') ? 'btn-warning' : 'btn-primary'}`}
                                                        disabled={currentRole === 'broker' || currentRole === 'admin' || currentRole === 'superadmin' || pendingRequests.includes('broker')}
                                                        onClick={() => handleRoleRequest('broker')}
                                                    >
                                                        <i className="fas fa-briefcase me-2"></i>
                                                        {pendingRequests.includes('broker') ? 'Broker Request Pending' :
                                                         currentRole === 'broker' || currentRole === 'admin' || currentRole === 'superadmin' ? 'Already Broker+' :
                                                         'Request Broker Role'}
                                                    </button>
                                                    <small className="text-muted mt-1">Access to advanced property management features</small>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-grid">
                                                    <button
                                                        id="request-admin-btn"
                                                        className={`btn ${currentRole === 'admin' || currentRole === 'superadmin' ? 'btn-secondary' : pendingRequests.includes('admin') ? 'btn-warning' : 'btn-danger'}`}
                                                        disabled={currentRole === 'admin' || currentRole === 'superadmin' || pendingRequests.includes('admin')}
                                                        onClick={() => handleRoleRequest('admin')}
                                                    >
                                                        <i className="fas fa-user-shield me-2"></i>
                                                        {pendingRequests.includes('admin') ? 'Admin Request Pending' :
                                                         currentRole === 'admin' || currentRole === 'superadmin' ? 'Already Admin+' :
                                                         'Request Admin Role'}
                                                    </button>
                                                    <small className="text-muted mt-1">Administrative privileges and user management</small>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="alert alert-warning mt-3 mb-0">
                                            <i className="fas fa-info-circle me-2"></i>
                                            <strong>Note:</strong> Role upgrade requests must be approved by a Super Admin. You will be notified once your request is processed.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Profile;
