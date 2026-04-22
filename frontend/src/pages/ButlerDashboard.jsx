import React from 'react';
import LiveAttendance from '../components/butler/LiveAttendance';
import MonthlyAttendance from '../components/butler/MonthlyAttendance';
import ConsumptionEntry from '../components/butler/ConsumptionEntry';
import BillOverview from '../components/butler/BillOverview';
import MonthlyBreakdown from '../components/butler/MonthlyBreakdown';
import AttendanceMarker from '../components/butler/AttendanceMarker';

const ButlerDashboard = () => {
  return (
    <div className="p-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Butler Command Center</h2>
          <p className="text-muted small mb-0">Monitor live attendance, manage bills, and track consumption.</p>
        </div>
        <div className="badge bg-primary px-3 py-2">Butler Role</div>
      </div>

      <LiveAttendance />

      <div className="row g-4">
        <div className="col-12">
           <BillOverview />
        </div>
        <div className="col-lg-8">
          <MonthlyBreakdown />
          <MonthlyAttendance />
          <div className="card border-0 shadow-sm mt-4 bg-primary text-white">
            <div className="card-body p-4">
              <h5 className="fw-bold">Operational Tip</h5>
              <p className="mb-0 opacity-75">
                Attendance is tracked in real-time. Please ensure you log guest meals as they arrive to maintain accurate billing and inventory status.
              </p>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <AttendanceMarker />
          <ConsumptionEntry />
        </div>
      </div>
    </div>
  );
};

export default ButlerDashboard;
