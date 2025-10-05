import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkUserRole } from '../services/authService';
import { loadUsers, loadPropertyRequests, toggleUserBlock, updateUserRole, getUserData } from '../services/firebase/dashboardService';

// Custom styles for dashboard
const dashboardStyles = `
    .user-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
    }

    .status-badge {
        font-size: 0.8rem;
        padding: 0.3rem 0.8rem;
    }

    .user-card {
        transition: all 0.3s ease;
        border: 1px solid #dee2e6;
    }

    .user-card:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }

    .user-stats {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 15px;
    }

    /* Compact card headers for dashboard tables */
    .card-header {
        padding: 0.75rem 1rem;
    }

    .card-header h6 {
        font-size: 1.1rem;
    }

    /* Custom table header colors - professional solid colors */
    .bg-primary-custom {
        background-color: #2563eb !important;  /* Professional blue */
    }

    .bg-success-custom {
        background-color: #059669 !important;  /* Professional green */
    }
`;

const DashboardComplete = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [users, setUsers] = useState([]);
    const [propertyRequests, setPropertyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
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
                    const role = await checkUserRole(auth?.currentUser?.uid);
                    setUserRole(role);
                    // Temporarily allow all authenticated users to access dashboard
                    // if (role !== 'superadmin') {
                    //     alert('Access denied. Only Super Admins can access this page.');
                    //     navigate('/home');
                    //     return;
                    // }
                    await loadDashboardData();
                } catch (error) {
                    console.error('Error checking admin access:', error);
                    await loadDashboardData(); // Still load data even if role check fails
                }
            }
        };
        checkAdminAccess();
    }, [isAuthenticated, navigate]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadUsersData('all'),
                loadPropertyRequestsData()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsersData = async (filter = 'all') => {
        try {
            console.log('Loading users with filter:', filter);
            const filteredUsers = await loadUsers(filter);
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadPropertyRequestsData = async () => {
        try {
            console.log('Loading property requests');
            const requestsData = await loadPropertyRequests();
            setPropertyRequests(requestsData);
        } catch (error) {
            console.error('Error loading property requests:', error);
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            'user': 'bg-secondary',
            'broker': 'bg-primary',
            'admin': 'bg-warning',
            'superadmin': 'bg-danger'
        };
        return colors[role] || 'bg-secondary';
    };

    const getPropertyTypeDisplay = (type) => {
        const types = {
            'residential': 'Residential',
            'commercial': 'Commercial',
            'industrial': 'Industrial',
            'land': 'Land'
        };
        return types[type] || type || 'Unknown';
    };


    const viewUser = (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setShowUserModal(true);
        }
    };

    const toggleUserBlock = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const action = user.blocked ? 'unblock' : 'block';
        const confirmMessage = `Are you sure you want to ${action} ${user.name || user.email}?`;

        if (!confirm(confirmMessage)) return;

        try {
            const result = await toggleUserBlock(userId);

            if (result.success) {
                console.log(`✅ User ${action}ed successfully`);
                await loadUsersData(currentFilter);
                alert(`User ${action}ed successfully!`);
            } else {
                alert(`Error ${action}ing user. Please try again.`);
            }
        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            alert(`Error ${action}ing user. Please try again.`);
        }
    };

    const changeUserRole = (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setShowRoleModal(true);
        }
    };

    const handleRoleChange = async (newRole) => {
        if (!selectedUser || selectedUser.role === newRole) {
            alert('No changes made.');
            return;
        }

        const confirmMessage = `Are you sure you want to change ${selectedUser.name || selectedUser.email}'s role to ${newRole}?`;
        if (!confirm(confirmMessage)) return;

        try {
            const result = await updateUserRole(selectedUser.id, newRole);

            if (result.success) {
                console.log(`✅ User role changed to ${newRole} successfully`);
                await loadUsersData(currentFilter);
                setShowRoleModal(false);
                alert(`User role changed to ${newRole} successfully!`);
            } else {
                alert('Error changing user role. Please try again.');
            }
        } catch (error) {
            console.error('Error changing user role:', error);
            alert('Error changing user role. Please try again.');
        }
    };

    const viewPropertyRequest = (requestId) => {
        const request = propertyRequests.find(r => r.id === requestId);
        if (request) {
            setSelectedRequest(request);
            setShowRequestModal(true);
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
        <>
            <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
            <div className="container mt-3 mb-4">
                <div className="row">
                    <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h3 className="fw-bold text-gradient mb-1">
                                <i className="fas fa-tachometer-alt me-2"></i>Admin Dashboard
                            </h3>
                            <p className="text-muted small mb-0">Manage users and system overview</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className={`btn ${currentFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => {
                                    setCurrentFilter('all');
                                    loadUsersData('all');
                                }}
                            >
                                <i className="fas fa-users me-2"></i>All Users
                            </button>
                            <button
                                className={`btn ${currentFilter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => {
                                    setCurrentFilter('active');
                                    loadUsersData('active');
                                }}
                            >
                                <i className="fas fa-check-circle me-2"></i>Active
                            </button>
                            <button
                                className={`btn ${currentFilter === 'blocked' ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => {
                                    setCurrentFilter('blocked');
                                    loadUsersData('blocked');
                                }}
                            >
                                <i className="fas fa-ban me-2"></i>Blocked
                            </button>
                            <button className="btn btn-outline-info" onClick={loadDashboardData}>
                                <i className="fas fa-refresh me-2"></i>Refresh
                            </button>
                        </div>
                    </div>

                    {/* Users Management Table */}
                    <div className="card shadow-lg">
                        <div className="card-header bg-primary-custom text-white">
                            <h6 className="mb-0">
                                <i className="fas fa-users me-2"></i>
                                <span>
                                    {currentFilter === 'all' ? 'All Users' :
                                     currentFilter === 'active' ? 'Active Users' :
                                     currentFilter === 'blocked' ? 'Blocked Users' : 'All Users'}
                                </span>
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Avatar</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Mobile</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => {
                                            const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random`;
                                            const statusBadge = user.blocked ?
                                                '<span class="badge bg-danger status-badge">Blocked</span>' :
                                                '<span class="badge bg-success status-badge">Active</span>';
                                            const roleColor = getRoleColor(user.role || 'user');
                                            const joinedDate = user.createdAt ?
                                                user.createdAt.toDate().toLocaleDateString() :
                                                'Unknown';

                                            return (
                                                <tr key={user.id} className="user-row" data-user-id={user.id}>
                                                    <td>
                                                        <img src={avatar} alt="Avatar" className="user-avatar" />
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold">{user.name || 'Not Set'}</div>
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>{user.mobile || 'Not Set'}</td>
                                                    <td>
                                                        <span className={`badge ${roleColor} status-badge`}>
                                                            {(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}
                                                        </span>
                                                    </td>
                                                    <td dangerouslySetInnerHTML={{ __html: statusBadge }}></td>
                                                    <td>{joinedDate}</td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => viewUser(user.id)}
                                                                title="View Details"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button
                                                                className={`btn btn-outline-${user.blocked ? 'success' : 'danger'} btn-sm`}
                                                                onClick={() => toggleUserBlock(user.id)}
                                                                title={`${user.blocked ? 'Unblock' : 'Block'} User`}
                                                            >
                                                                <i className={`fas fa-${user.blocked ? 'check' : 'ban'}`}></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-info btn-sm"
                                                                onClick={() => changeUserRole(user.id)}
                                                                title="Change Role"
                                                            >
                                                                <i className="fas fa-user-cog"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* No Users Message */}
                            {users.length === 0 && (
                                <div className="text-center py-5">
                                    <div className="display-1 text-muted mb-3">👥</div>
                                    <h3 className="text-muted">No users found</h3>
                                    <p className="text-muted">No users match the current filter</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Property Requests Table */}
                    <div className="card shadow-lg mt-4">
                        <div className="card-header bg-success-custom text-white">
                            <h6 className="mb-0">
                                <i className="fas fa-search me-2"></i>
                                Property Requests
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>User</th>
                                            <th>Type</th>
                                            <th>Area</th>
                                            <th>Budget</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {propertyRequests.map(request => {
                                            const requestDate = request.createdAt ?
                                                request.createdAt.toDate().toLocaleDateString() : 'Unknown';
                                            const budgetRange = `₹${request.minBudget?.toLocaleString() || 'N/A'} - ₹${request.maxBudget?.toLocaleString() || 'N/A'}`;

                                            const statusConfig = {
                                                'pending': { color: 'warning', text: 'Pending' },
                                                'fulfilled': { color: 'success', text: 'Fulfilled' },
                                                'cancelled': { color: 'danger', text: 'Cancelled' }
                                            };

                                            const config = statusConfig[request.status] || statusConfig['pending'];

                                            return (
                                                <tr key={request.id} className="property-request-row" data-request-id={request.id}>
                                                    <td>
                                                        <div className="fw-bold">{request.userName}</div>
                                                        <small className="text-muted">{request.userEmail}</small>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-info">{getPropertyTypeDisplay(request.propertyType)}</span>
                                                    </td>
                                                    <td>{request.area || 'Not specified'}</td>
                                                    <td>{budgetRange}</td>
                                                    <td>
                                                        <span className={`badge bg-${config.color} status-badge`}>
                                                            {config.text}
                                                        </span>
                                                    </td>
                                                    <td>{requestDate}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => viewPropertyRequest(request.id)}
                                                            title="View Details"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* No Property Requests Message */}
                            {propertyRequests.length === 0 && (
                                <div className="text-center py-5">
                                    <div className="display-1 text-muted mb-3">🏠</div>
                                    <h3 className="text-muted">No property requests found</h3>
                                    <p className="text-muted">No property requests have been submitted yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">User Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowUserModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-4 text-center">
                                        <img
                                            src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || selectedUser.email)}&background=random`}
                                            alt="Avatar"
                                            className="rounded-circle mb-3"
                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        />
                                        <h5>{selectedUser.name || 'Not Set'}</h5>
                                        <p className="text-muted">{selectedUser.email}</p>
                                        <span className={`badge ${selectedUser.blocked ? 'bg-danger' : 'bg-success'}`}>
                                            {selectedUser.blocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </div>
                                    <div className="col-md-8">
                                        <table className="table table-borderless">
                                            <tr>
                                                <td><strong>Name:</strong></td>
                                                <td>{selectedUser.name || 'Not Set'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Email:</strong></td>
                                                <td>{selectedUser.email}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Mobile:</strong></td>
                                                <td>{selectedUser.mobile || 'Not Set'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Role:</strong></td>
                                                <td>
                                                    <span className={`badge ${getRoleColor(selectedUser.role || 'user')}`}>
                                                        {(selectedUser.role || 'user').charAt(0).toUpperCase() + (selectedUser.role || 'user').slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><strong>Status:</strong></td>
                                                <td>
                                                    <span className={`badge ${selectedUser.blocked ? 'bg-danger' : 'bg-success'}`}>
                                                        {selectedUser.blocked ? 'Blocked' : 'Active'}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><strong>Joined:</strong></td>
                                                <td>{selectedUser.createdAt ? selectedUser.createdAt.toDate().toLocaleDateString() : 'Unknown'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Last Updated:</strong></td>
                                                <td>{selectedUser.updatedAt ? selectedUser.updatedAt.toDate().toLocaleDateString() : 'Unknown'}</td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Close</button>
                                <button
                                    type="button"
                                    className={`btn ${selectedUser.blocked ? 'btn-success' : 'btn-warning'}`}
                                    onClick={() => {
                                        toggleUserBlock(selectedUser.id);
                                        setShowUserModal(false);
                                    }}
                                >
                                    <i className={`fas fa-${selectedUser.blocked ? 'check' : 'ban'} me-2`}></i>
                                    {selectedUser.blocked ? 'Unblock User' : 'Block User'}
                                </button>
                                <button type="button" className="btn btn-info" onClick={() => {
                                    changeUserRole(selectedUser.id);
                                    setShowUserModal(false);
                                }}>
                                    <i className="fas fa-user-cog me-2"></i>Change Role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Role Modal */}
            {showRoleModal && selectedUser && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Change User Role</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRoleModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="new-role-select" className="form-label">Select New Role</label>
                                    <select className="form-select" id="new-role-select" defaultValue={selectedUser.role || 'user'}>
                                        <option value="user">User</option>
                                        <option value="broker">Broker</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                    </select>
                                </div>
                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <strong>Warning:</strong> Changing user roles will affect their access to system features.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => {
                                        const newRole = document.getElementById('new-role-select').value;
                                        handleRoleChange(newRole);
                                    }}
                                >
                                    <i className="fas fa-check me-2"></i>Confirm Change
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Property Request Details Modal */}
            {showRequestModal && selectedRequest && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-success-custom text-white">
                                <h5 className="modal-title">
                                    <i className="fas fa-search me-2"></i>Property Request Details
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRequestModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card border-0 shadow-sm mb-4">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-user me-2"></i>User Information
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <p><strong>Name:</strong> {selectedRequest.userName || 'Anonymous'}</p>
                                                        <p><strong>Email:</strong> {selectedRequest.userEmail || 'N/A'}</p>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p><strong>Mobile:</strong> {selectedRequest.userMobile || 'Not available'}</p>
                                                        <p><strong>Request Date:</strong> {selectedRequest.createdAt ? selectedRequest.createdAt.toDate().toLocaleDateString() : 'Unknown'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card border-0 shadow-sm mb-4">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-search me-2"></i>Property Requirements
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <p><strong>Property Type:</strong> <span className="badge bg-info">{getPropertyTypeDisplay(selectedRequest.propertyType)}</span></p>
                                                        <p><strong>Preferred Area:</strong> {selectedRequest.area || 'Not specified'}</p>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p><strong>Budget Range:</strong> ₹{selectedRequest.minBudget?.toLocaleString() || 'N/A'} - ₹{selectedRequest.maxBudget?.toLocaleString() || 'N/A'}</p>
                                                        <p><strong>Status:</strong> <span className={`badge bg-${selectedRequest.status === 'pending' ? 'warning' : selectedRequest.status === 'fulfilled' ? 'success' : 'danger'}`}>
                                                            {selectedRequest.status === 'pending' ? 'Pending' : selectedRequest.status === 'fulfilled' ? 'Fulfilled' : 'Cancelled'}
                                                        </span></p>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <strong>Description:</strong>
                                                    <div className="mt-2 p-3 bg-light rounded">
                                                        {selectedRequest.description || 'No description provided'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-clock me-2"></i>Request Timeline
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <p><strong>Submitted:</strong> {selectedRequest.createdAt ? selectedRequest.createdAt.toDate().toLocaleDateString() : 'Unknown'}</p>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p><strong>Last Updated:</strong> {selectedRequest.updatedAt ? selectedRequest.updatedAt.toDate().toLocaleDateString() : selectedRequest.createdAt ? selectedRequest.createdAt.toDate().toLocaleDateString() : 'Unknown'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                                    <i className="fas fa-times me-2"></i>Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default DashboardComplete;
