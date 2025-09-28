import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, getDoc, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { checkUserRole } from '../services/authService';

const Requests = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentFilter, setCurrentFilter] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Check if user is SuperAdmin (temporarily disabled for testing)
    useEffect(() => {
        const checkAdminAccess = async () => {
            if (isAuthenticated) {
                try {
                    const role = await checkUserRole(window.auth?.currentUser?.uid);
                    setUserRole(role);
                    // Temporarily allow all authenticated users to access requests
                    // if (role !== 'superadmin') {
                    //     alert('Access denied. Only Super Admins can access this page.');
                    //     navigate('/home');
                    //     return;
                    // }
                    await loadRequests('pending');
                } catch (error) {
                    console.error('Error checking admin access:', error);
                    await loadRequests('pending'); // Still load data even if role check fails
                }
            }
        };
        checkAdminAccess();
    }, [isAuthenticated, navigate]);

    const loadRequests = async (filter = 'pending') => {
        setLoading(true);
        try {
            // Build query based on filter
            let queryRef = collection(db, 'roleRequests');
            if (filter !== 'all') {
                queryRef = query(queryRef, where('status', '==', filter));
            }

            const snapshot = await getDocs(queryRef);

            if (snapshot.empty) {
                setRequests([]);
                setLoading(false);
                return;
            }

            // Convert to array and sort by createdAt in JavaScript
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

            // Get all unique user IDs to batch fetch user data
            const userIds = [...new Set(requestsData.map(request => request.userId).filter(id => id))];
            const userDataMap = {};

            console.log('Found user IDs:', userIds);
            console.log('Total requests:', requestsData.length);

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

            setRequests(requestsWithUserData);
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': '<span class="badge bg-warning">Pending</span>',
            'approved': '<span class="badge bg-success">Approved</span>',
            'rejected': '<span class="badge bg-danger">Rejected</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
    };

    const getRoleBadge = (role) => {
        const badges = {
            'user': '<span class="badge bg-secondary">User</span>',
            'broker': '<span class="badge bg-primary">Broker</span>',
            'admin': '<span class="badge bg-danger">Admin</span>',
            'superadmin': '<span class="badge bg-dark">Super Admin</span>'
        };
        return badges[role] || '<span class="badge bg-secondary">Unknown</span>';
    };

    const viewRequestDetails = (requestId) => {
        const request = requests.find(r => r.id === requestId);
        if (request) {
            setSelectedRequest(request);
            setShowRequestModal(true);
        }
    };

    const processRequest = async (requestId, newStatus) => {
        try {
            console.log('Processing request:', requestId, newStatus);
            const request = requests.find(r => r.id === requestId);
            if (!request) {
                console.error('Request not found:', requestId);
                alert('Request not found.');
                return;
            }

            console.log('Found request:', request);

            // Update request status
            console.log('Updating request status...');
            await updateDoc(doc(db, 'roleRequests', requestId), {
                status: newStatus,
                processedAt: new Date(),
                processedBy: user?.uid
            });
            console.log('Request status updated successfully');

            // If approved, update user's role
            if (newStatus === 'approved') {
                console.log('Updating user role...');
                await updateDoc(doc(db, 'users', request.userId), {
                    role: request.requestedRole,
                    updatedAt: new Date()
                });
                console.log('User role updated successfully');
            }

            // Reload requests
            console.log('Reloading requests...');
            await loadRequests(currentFilter);

            // Close modal
            setShowRequestModal(false);

            const action = newStatus === 'approved' ? 'approved' : 'rejected';
            alert(`Request ${action} successfully!`);

        } catch (error) {
            console.error('Error processing request:', error);
            alert('Error processing request. Please try again.');
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

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="display-6 fw-bold text-primary"><i className="fas fa-user-cog me-3"></i>Role Requests Management</h1>
                            <p className="lead text-muted">Manage user role upgrade requests</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className={`btn ${currentFilter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => {
                                    setCurrentFilter('pending');
                                    loadRequests('pending');
                                }}
                            >
                                <i className="fas fa-clock me-2"></i>Pending
                            </button>
                            <button
                                className={`btn ${currentFilter === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => {
                                    setCurrentFilter('approved');
                                    loadRequests('approved');
                                }}
                            >
                                <i className="fas fa-check me-2"></i>Approved
                            </button>
                            <button
                                className={`btn ${currentFilter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => {
                                    setCurrentFilter('rejected');
                                    loadRequests('rejected');
                                }}
                            >
                                <i className="fas fa-times me-2"></i>Rejected
                            </button>
                            <button
                                className={`btn ${currentFilter === 'all' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                onClick={() => {
                                    setCurrentFilter('all');
                                    loadRequests('all');
                                }}
                            >
                                <i className="fas fa-list me-2"></i>All
                            </button>
                        </div>
                    </div>

                    {/* Requests Table */}
                    <div className="card shadow-lg">
                        <div className="card-header bg-primary text-white" style={{ padding: '0.75rem 1.25rem' }}>
                            <h5 className="mb-0">
                                <i className="fas fa-table me-2"></i>
                                <span>
                                    {currentFilter === 'pending' ? 'Pending Role Requests' :
                                     currentFilter === 'approved' ? 'Approved Role Requests' :
                                     currentFilter === 'rejected' ? 'Rejected Role Requests' :
                                     'All Role Requests'}
                                </span>
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Requested Role</th>
                                            <th>Current Role</th>
                                            <th>Status</th>
                                            <th>Request Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map(request => {
                                            const requestDate = request.createdAt ?
                                                new Date(request.createdAt.seconds * 1000).toLocaleDateString() :
                                                'Unknown';

                                            return (
                                                <tr key={request.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={request.userData.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80'}
                                                                className="rounded-circle me-2"
                                                                width="40"
                                                                height="40"
                                                                alt="User"
                                                            />
                                                            <div>
                                                                <div className="fw-bold">{request.userData.name || 'Unknown User'}</div>
                                                                <small className="text-muted">{request.userId}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{request.userData.email}</td>
                                                    <td dangerouslySetInnerHTML={{ __html: getRoleBadge(request.requestedRole) }}></td>
                                                    <td dangerouslySetInnerHTML={{ __html: getRoleBadge(request.userData.role || 'user') }}></td>
                                                    <td dangerouslySetInnerHTML={{ __html: getStatusBadge(request.status) }}></td>
                                                    <td>{requestDate}</td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => viewRequestDetails(request.id)}
                                                                title="View Details"
                                                            >
                                                                <i className="fas fa-eye"></i> View
                                                            </button>
                                                            {request.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        className="btn btn-outline-success btn-sm"
                                                                        onClick={() => processRequest(request.id, 'approved')}
                                                                        title="Approve Request"
                                                                    >
                                                                        <i className="fas fa-check"></i>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-outline-danger btn-sm"
                                                                        onClick={() => processRequest(request.id, 'rejected')}
                                                                        title="Reject Request"
                                                                    >
                                                                        <i className="fas fa-times"></i>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* No Requests Message */}
                            {requests.length === 0 && (
                                <div className="text-center py-5">
                                    <div className="display-1 text-muted mb-3">📋</div>
                                    <h3 className="text-muted">No requests found</h3>
                                    <p className="text-muted">No role upgrade requests to display</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Details Modal */}
            {showRequestModal && selectedRequest && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Request Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRequestModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-4 text-center mb-3">
                                        <img
                                            src={selectedRequest.userData.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80'}
                                            className="rounded-circle mb-2"
                                            width="100"
                                            height="100"
                                            alt="User"
                                        />
                                        <h5>{selectedRequest.userData.name || 'Unknown User'}</h5>
                                        <p className="text-muted">{selectedRequest.userData.email}</p>
                                    </div>
                                    <div className="col-md-8">
                                        <table className="table table-borderless">
                                            <tr>
                                                <th>Current Role:</th>
                                                <td dangerouslySetInnerHTML={{ __html: getRoleBadge(selectedRequest.userData.role || 'user') }}></td>
                                            </tr>
                                            <tr>
                                                <th>Requested Role:</th>
                                                <td dangerouslySetInnerHTML={{ __html: getRoleBadge(selectedRequest.requestedRole) }}></td>
                                            </tr>
                                            <tr>
                                                <th>Status:</th>
                                                <td dangerouslySetInnerHTML={{ __html: getStatusBadge(selectedRequest.status) }}></td>
                                            </tr>
                                            <tr>
                                                <th>Request Date:</th>
                                                <td>{selectedRequest.createdAt ? new Date(selectedRequest.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}</td>
                                            </tr>
                                            <tr>
                                                <th>User ID:</th>
                                                <td><code>{selectedRequest.userId}</code></td>
                                            </tr>
                                            <tr>
                                                <th>Mobile:</th>
                                                <td>{selectedRequest.userData.mobile || 'Not provided'}</td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>Close</button>
                                {selectedRequest.status === 'pending' && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={() => processRequest(selectedRequest.id, 'rejected')}
                                        >
                                            <i className="fas fa-times me-2"></i>Reject
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={() => processRequest(selectedRequest.id, 'approved')}
                                        >
                                            <i className="fas fa-check me-2"></i>Approve
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requests;
