import React from 'react';

const DuesSection = ({ dues }) => {

  return (
    <div className="glass-panel shadow-md border-0 mb-4 h-100 overflow-hidden fade-in">
      <div className="card-header border-0 p-4 pb-0 bg-transparent">
        <h5 className="mb-0 fw-bold text-gradient"><i className="bi bi-receipt me-2"></i>Current Month Bill</h5>
      </div>
      <div className="card-body p-4 pt-3">
        <div className="bill-items mb-4 p-3 rounded-4 bg-light bg-opacity-50 border border-light">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small text-muted fw-medium"><i className="bi bi-cup-hot me-2 text-primary opacity-75"></i>Daily Mess Bill</span>
            <span className="fw-bold text-dark">₹{dues.dailyMealsTotal?.toLocaleString()}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small text-muted fw-medium"><i className="bi bi-plus-circle me-2 text-warning opacity-75"></i>Extra Items</span>
            <span className="fw-bold text-dark">₹{dues.extraTotal?.toLocaleString()}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small text-muted fw-medium"><i className="bi bi-people me-2 text-info opacity-75"></i>Guest Meals</span>
            <span className="fw-bold text-dark">₹{dues.guestTotal?.toLocaleString()}</span>
          </div>
          {dues.fineTotal > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="small text-muted fw-medium"><i className="bi bi-exclamation-triangle me-2 text-danger opacity-75"></i>System Fines</span>
              <span className="fw-bold text-danger">+₹{dues.fineTotal?.toLocaleString()}</span>
            </div>
          )}
          {dues.paymentsTotal > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="small text-success fw-bold"><i className="bi bi-check-circle-fill me-2"></i>Payments Made</span>
              <span className="fw-bold text-success bg-success bg-opacity-10 px-2 py-1 rounded">-₹{dues.paymentsTotal?.toLocaleString()}</span>
            </div>
          )}
          {dues.rebateTotal > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="small text-success fw-bold"><i className="bi bi-tag-fill me-2"></i>Manual Rebates</span>
              <span className="fw-bold text-success bg-success bg-opacity-10 px-2 py-1 rounded">-₹{dues.rebateTotal?.toLocaleString()}</span>
            </div>
          )}
          
          <hr className="my-3 border-secondary opacity-25" />
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-dark fw-bold">Current Month Bill</span>
            <span className="fw-bold text-primary">₹{dues.currentMonthTotal?.toLocaleString()}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small text-danger fw-bold">Previous Dues</span>
            <span className="fw-bold text-danger">+ ₹{dues.previousDues?.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-3 border-top border-2 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Total Payable</h5>
            <small className="text-muted" style={{ fontSize: '0.7rem' }}><i className="bi bi-info-circle me-1"></i>Includes all charges & rebates</small>
          </div>
          <h2 className="mb-0 fw-bold text-gradient">₹{dues.totalPayable?.toLocaleString()}</h2>
        </div>
      </div>
    </div>
  );
};

export default DuesSection;
