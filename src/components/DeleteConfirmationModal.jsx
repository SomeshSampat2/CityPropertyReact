import React from 'react';

const DeleteConfirmationModal = ({ show, onHide, onConfirm, itemName, itemType = "item" }) => {
    if (!show) return null;

    return (
        <div
            className="modal fade show"
            style={{
                display: 'block',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1055,
                width: '100%',
                height: '100%',
                overflowX: 'hidden',
                overflowY: 'auto',
                outline: 0
            }}
            tabIndex="-1"
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                            Confirm Delete
                        </h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>

                    <div className="modal-body">
                        <p>Are you sure you want to delete this {itemType}? This action cannot be undone.</p>
                        {itemName && (
                            <p className="text-muted small">
                                {itemType.charAt(0).toUpperCase() + itemType.slice(1)}: <strong>{itemName}</strong>
                            </p>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onHide}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>
                            <i className="fas fa-trash me-2"></i>
                            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
