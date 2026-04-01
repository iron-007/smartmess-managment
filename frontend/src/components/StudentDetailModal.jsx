import React from 'react';

const StudentDetailModal = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content shadow border-0">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">Student Details: {student.name}</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <div className="row mb-3 border-bottom pb-2">
              <div className="col-5 fw-semibold text-muted">URN:</div>
              <div className="col-7 text-dark">{student.urn}</div>
            </div>
            <div className="row mb-3 border-bottom pb-2">
              <div className="col-5 fw-semibold text-muted">CRN:</div>
              <div className="col-7 text-dark">{student.crn}</div>
            </div>
            <div className="row mb-3 border-bottom pb-2">
              <div className="col-5 fw-semibold text-muted">Department:</div>
              <div className="col-7 text-dark">{student.department}</div>
            </div>
            <div className="row mb-3 border-bottom pb-2">
            <div className="col-5 fw-semibold text-muted">Phone No:</div>
            <div className="col-7 text-dark">{student.phone}</div>
            </div>
            <div className="row mb-2">
              <div className="col-5 fw-semibold text-muted">Mess Account No:</div>
              <div className="col-7 text-dark fw-bold">{student.messAccount}</div>
            </div>
          </div>
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-secondary px-4 fw-semibold" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;