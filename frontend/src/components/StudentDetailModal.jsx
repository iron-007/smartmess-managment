import React, { useState, useEffect } from 'react';

const StudentDetailModal = ({ student, onClose }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    previousDues: student?.previousDues || 0,
    phone: student?.phone || '',
    department: student?.department || '',
    messAccount: student?.messAccount || ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/admin/students/${student._id}/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setAttendance(data.attendance);
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    if (student?._id) {
      fetchAttendance();
    }
  }, [student]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/admin/students/${student._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (data.success) {
        alert("Student data updated successfully!");
        setIsEditing(false);
        // We update local state so the UI reflects changes without full reload
        student.previousDues = parseInt(editForm.previousDues);
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
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="modal-header bg-dark text-white py-3 px-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle p-2 me-3 d-flex justify-content-center align-items-center" style={{width: '40px', height: '40px'}}>
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
          <div className="modal-body p-0">
            <div className="row g-0">
              {/* Left Column: Profile Info */}
              <div className="col-md-5 border-end bg-light p-4">
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
                          onChange={(e) => setEditForm({...editForm, messAccount: e.target.value})}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="small text-muted d-block mb-1">Department</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          value={editForm.department}
                          onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="small text-muted d-block mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        />
                      </div>
                      <div className="bg-white p-3 rounded-3 border border-primary">
                        <label className="small text-primary fw-bold d-block mb-2"><i className="bi bi-currency-rupee"></i> Adjust Previous Dues</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input 
                            type="number" 
                            className="form-control fw-bold" 
                            value={editForm.previousDues}
                            onChange={(e) => setEditForm({...editForm, previousDues: e.target.value})}
                          />
                        </div>
                        <small className="text-muted extra-small mt-2 d-block">Changes reflect immediately in student's total bill.</small>
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
                      <hr className="my-2" />
                      <div className="bg-white p-3 rounded-3 border">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="small text-muted">Current Month Bill</span>
                          <span className="fw-bold text-primary">₹{student.currentMonthBill?.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="small text-muted">Previous Dues</span>
                          <span className={`fw-bold ${student.previousDues > 0 ? 'text-danger' : 'text-success'}`}>₹{student.previousDues?.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between border-top pt-2">
                          <span className="small fw-bold text-dark">Total Payable</span>
                          <span className="fw-bold text-dark">₹{(student.currentMonthBill + (student.previousDues || 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Attendance History */}
              <div className="col-md-7 p-4 bg-white">
                <h6 className="text-uppercase small fw-bold text-muted mb-3 d-flex justify-content-between align-items-center">
                  Recent Meal Attendance
                  <span className="badge bg-light text-dark border fw-normal">Last 50 Meals</span>
                </h6>
                
                <div className="attendance-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      <p className="small text-muted mt-2">Loading attendance logs...</p>
                    </div>
                  ) : attendance.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      <i className="bi bi-calendar-x d-block fs-3 mb-2 opacity-50"></i>
                      No live attendance records found.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover mb-0">
                        <thead className="table-light sticky-top">
                          <tr className="small text-muted">
                            <th>Date</th>
                            <th>Meal</th>
                            <th className="text-end">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((record, idx) => (
                            <tr key={idx}>
                              <td className="small">{new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</td>
                              <td>
                                <span className={`badge ${
                                  record.mealType === 'Breakfast' ? 'bg-info text-dark' : 
                                  record.mealType === 'Lunch' ? 'bg-warning text-dark' : 'bg-dark'
                                } small`}>
                                  {record.mealType}
                                </span>
                              </td>
                              <td className="text-end small text-muted">
                                {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {/* Zone 3: 30-Day Monthly Status Grid */}
                <div className="mt-4 pt-4 border-top">
                  <h6 className="text-uppercase small fw-bold text-muted mb-3">Monthly Mess Status (Current Month)</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {student.monthlyStatus && student.monthlyStatus.map((isOpen, dayIdx) => (
                      <div 
                        key={dayIdx} 
                        className={`d-flex flex-column align-items-center justify-content-center rounded border ${isOpen ? 'bg-success bg-opacity-10 border-success' : 'bg-danger bg-opacity-10 border-danger'}`}
                        style={{ width: '40px', height: '40px' }}
                        title={`Day ${dayIdx + 1}: ${isOpen ? 'Open' : 'Closed (Leave)'}`}
                      >
                        <span className="fw-bold" style={{ fontSize: '0.7rem', color: isOpen ? '#198754' : '#dc3545' }}>{dayIdx + 1}</span>
                        <i className={`bi bi-circle-fill`} style={{ fontSize: '0.4rem', color: isOpen ? '#198754' : '#dc3545' }}></i>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex gap-3 mt-3">
                    <small className="text-muted"><i className="bi bi-circle-fill text-success me-1"></i> Account Open</small>
                    <small className="text-muted"><i className="bi bi-circle-fill text-danger me-1"></i> On Leave / Closed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-top p-3 bg-light">
            <button type="button" className="btn btn-dark px-4 fw-bold rounded-pill" onClick={onClose}>Close Portal</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;