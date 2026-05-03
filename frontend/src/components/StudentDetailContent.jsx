import React, { useState } from 'react';
import api from '../utils/api';

const StudentDetailContent = ({ student, isMobile }) => {
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
    <div className={`row g-0 ${!isMobile ? 'bg-light rounded-4 border m-3 shadow-inner' : 'h-100'}`}>
      <div className={`col-12 bg-white p-4 ${!isMobile ? 'rounded-4' : 'min-vh-100 min-vh-md-auto'}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-uppercase small fw-bold text-muted mb-0">Student Profile</h6>
          <button
            className={`btn btn-sm ${isEditing ? 'btn-danger' : 'btn-outline-primary'} rounded-pill px-3`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : <><i className="bi bi-pencil-square me-1"></i> Edit</>}
          </button>
        </div>
        
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
              <div className="row">
                <div className="col-12 mb-2">
                  <label className="small text-muted d-block mb-1">Department</label>
                  <span className="fw-semibold text-dark">{student.department || 'N/A'}</span>
                </div>
                <div className="col-6 mb-2">
                  <label className="small text-muted d-block mb-1">URN</label>
                  <span className="fw-semibold text-dark">{student.urn}</span>
                </div>
                <div className="col-6 mb-2">
                  <label className="small text-muted d-block mb-1">CRN</label>
                  <span className="fw-semibold text-dark">{student.crn}</span>
                </div>
                <div className="col-12 mb-2">
                  <label className="small text-muted d-block mb-1">Phone Number</label>
                  <span className="fw-semibold text-dark">{student.phone}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailContent;
