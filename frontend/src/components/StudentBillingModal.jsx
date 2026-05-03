import React from 'react';
import StudentBillingContent from './StudentBillingContent';

const StudentBillingModal = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="modal-dialog modal-fullscreen-md-down modal-xl modal-dialog-centered m-0 m-md-auto" style={{ height: '100%', maxWidth: '1000px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 h-100 rounded-0 rounded-md-4 overflow-hidden">
          <div className="modal-header bg-dark text-white py-3 px-3 px-md-4">
            <div className="d-flex align-items-center w-100">
              <div className="bg-success rounded-circle p-2 me-3 d-flex justify-content-center align-items-center flex-shrink-0" style={{width: '38px', height: '38px'}}>
                <i className="bi bi-receipt fs-5"></i>
              </div>
              <div className="me-auto">
                <h5 className="modal-title fw-bold mb-0 text-truncate" style={{ maxWidth: '200px', fontSize: '1rem' }}>{student.name}</h5>
                <small className="opacity-75" style={{ fontSize: '0.7rem' }}>Billing Ledger</small>
              </div>
              <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
            </div>
          </div>
          <div className="modal-body p-0 overflow-auto bg-light">
            <StudentBillingContent student={student} isMobile={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentBillingModal;
