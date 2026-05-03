import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const StudentDetailModal = ({ student, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: student?.phone || '',
    department: student?.department || '',
    messAccount: student?.messAccount || ''
  });
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const response = await api.put(`/api/admin/students/${student._id}`, editForm);
      const data = response.data;
      if (data.success) {
        alert("Student data updated successfully!");
        setIsEditing(false);
        // We update local state so the UI reflects changes without full reload
        student.phone = editForm.phone;
        student.department = editForm.department;
        student.messAccount = editForm.messAccount;
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update student.");
    } finally {
      setUpdating(false);
    }
  };

  if (!student) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="modal-dialog modal-fullscreen-md-down modal-dialog-centered m-0 m-md-auto" style={{ height: '100%', maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 h-100 rounded-0 rounded-md-4 overflow-hidden">
          <div className="modal-header bg-dark text-white py-3 px-3 px-md-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle p-2 me-3 d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-person-fill fs-5"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">{student.name}</h5>
                <small className="opacity-75">Account: {student.messAccount}</small>
              </div>
            </div>
            <div className="ms-auto d-flex gap-2 align-items-center">
              <button
                className={`btn btn-sm ${isEditing ? 'btn-danger' : 'btn-outline-light'} rounded-pill px-3`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel Edit' : <><i className="bi bi-pencil-square me-1"></i> Edit Profile</>}
              </button>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
            </div>
          </div>
          <div className="modal-body p-0 overflow-auto bg-light">
            <div className="row g-0 h-100">
              {/* Profile Info */}
              <div className="col-12 bg-white p-4 min-vh-100 min-vh-md-auto">
                <h6 className="text-uppercase small fw-bold text-muted mb-3">Student Profile</h6>
                <div className="d-flex flex-column gap-3">

                  {isEditing ? (
                    <>
                      <div className="mb-2">
                        <label className="small text-muted d-block mb-1">Account Number</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editForm.messAccount}
                          onChange={(e) => setEditForm({ ...editForm, messAccount: e.target.value })}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="small text-muted d-block mb-1">Department</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="small text-muted d-block mb-1">Phone Number</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      </div>

                      <button
                        className="btn btn-primary w-100 mt-3 rounded-pill fw-bold"
                        onClick={handleUpdate}
                        disabled={updating}
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="small text-muted d-block mb-1">Department</label>
                        <span className="fw-semibold text-dark">{student.department || 'N/A'}</span>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label className="small text-muted d-block mb-1">URN</label>
                          <span className="fw-semibold text-dark">{student.urn}</span>
                        </div>
                        <div className="col-6">
                          <label className="small text-muted d-block mb-1">CRN</label>
                          <span className="fw-semibold text-dark">{student.crn}</span>
                        </div>
                      </div>
                      <div>
                        <label className="small text-muted d-block mb-1">Phone Number</label>
                        <span className="fw-semibold text-dark">{student.phone}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;