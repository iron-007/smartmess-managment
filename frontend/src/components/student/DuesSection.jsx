import React from 'react';

const DuesSection = ({ dues }) => {
  const breakdown = [
    { label: 'Base Mess Fee', value: dues.baseFee, type: 'charge' },
    { label: 'Extras & Guest', value: (dues.extraTotal || 0) + (dues.guestTotal || 0), type: 'charge' },
    { label: 'System Fines', value: dues.fineTotal, type: 'charge' },
    { label: 'Mess Rebate (Account Closed)', value: dues.rebateTotal, type: 'rebate' },
  ];

  return (
    <div className="card shadow-sm border-0 mb-4 h-100 overflow-hidden">
      <div className="card-header bg-primary text-white p-3 border-0">
        <h6 className="mb-0 fw-bold"><i className="bi bi-receipt me-2"></i>Current Month Bill Summary</h6>
      </div>
      <div className="card-body p-4">
        <div className="bill-items mb-4">
          {breakdown.map((item, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center mb-2">
              <span className={`small ${item.type === 'rebate' ? 'text-success fw-bold' : 'text-muted'}`}>
                {item.type === 'rebate' && <i className="bi bi-dash-circle me-1"></i>}
                {item.label}
              </span>
              <span className={`fw-bold ${item.type === 'rebate' ? 'text-success' : 'text-dark'}`}>
                {item.type === 'rebate' ? '-' : ''}₹{item.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-light p-3 rounded-4 mb-4 border border-light">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small text-muted">Current Month Subtotal</span>
            <span className="fw-bold">₹{dues.currentMonthTotal?.toLocaleString()}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-muted">Carry Forward Dues</span>
            <span className="fw-bold text-danger">+ ₹{dues.previousDues?.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-3 border-top d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold text-dark">Total Payable</h5>
            <small className="text-muted extra-small">Includes all charges & rebates</small>
          </div>
          <h2 className="mb-0 fw-bold text-primary">₹{dues.totalPayable?.toLocaleString()}</h2>
        </div>
      </div>
    </div>
  );
};

export default DuesSection;
