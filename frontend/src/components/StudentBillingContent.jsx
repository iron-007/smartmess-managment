import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const StudentBillingContent = ({ student, isMobile }) => {
  const [consumption, setConsumption] = useState([]);
  const [fetchingConsumption, setFetchingConsumption] = useState(true);
  const [selectedDayData, setSelectedDayData] = useState(null);
  
  const [isEditingDues, setIsEditingDues] = useState(false);
  const [editForm, setEditForm] = useState({
    previousDues: student?.previousDues || 0,
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchConsumption = async () => {
      setFetchingConsumption(true);
      try {
        const response = await api.get(`/api/admin/students/${student._id}/consumption`);
        const data = response.data;
        if (data.success) {
          setConsumption(data.consumption);
        }
      } catch (err) {
        console.error("Error fetching consumption:", err);
      } finally {
        setFetchingConsumption(false);
      }
    };

    if (student?._id) {
      fetchConsumption();
    }
  }, [student]);

  // Calendar Logic
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeks = [];
  let currentWeek = [];

  if (Array.isArray(consumption) && consumption.length > 0) {
    const firstDate = new Date(consumption[0].date);
    const firstDay = firstDate.getDay();

    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    consumption.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
  }

  const handleUpdateDues = async () => {
    setUpdating(true);
    try {
      const updateData = { previousDues: editForm.previousDues };
      const response = await api.put(`/api/admin/students/${student._id}`, updateData);
      const data = response.data;
      if (data.success) {
        alert("Dues updated successfully!");
        setIsEditingDues(false);
        student.previousDues = parseInt(editForm.previousDues);
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update dues.");
    } finally {
      setUpdating(false);
    }
  };

  if (!student) return null;

  // Derive new terms
  const totalFees = (student.currentMonthBill || 0) + (student.fineAmount || 0);
  // Backend doesn't track explicitly paid amounts in the student object without ledger aggregation. 
  // We'll show 0 for Paid Amount for now.
  const paidAmount = 0; 
  const remainingBalance = totalFees + (student.previousDues || 0) - paidAmount;

  return (
    <div className={`row g-0 ${!isMobile ? 'bg-light rounded-4 border m-3 shadow-inner' : ''}`}>
      {/* Left Column: Financial Summary */}
      <div className="col-md-4 border-end bg-white p-4">
        <h6 className="text-uppercase small fw-bold text-muted mb-3">Financial Ledger</h6>
        <div className="d-flex flex-column gap-3">
          
          <div className="bg-light p-3 rounded-3 border">
            <div className="d-flex justify-content-between mb-2">
              <span className="small text-muted">Current Month Bill</span>
              <span className="fw-bold text-dark">₹{student.currentMonthBill?.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="small text-muted">Fines</span>
              <span className={`fw-bold ${student.fineAmount > 0 ? 'text-danger' : 'text-success'}`}>₹{(student.fineAmount || 0).toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2 mb-2">
              <span className="small fw-bold text-dark">Total Fees</span>
              <span className="fw-bold text-dark">₹{totalFees.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="small text-muted">Previous Dues</span>
              <span className={`fw-bold ${student.previousDues > 0 ? 'text-danger' : 'text-success'}`}>₹{student.previousDues?.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="small text-muted">Paid Amount</span>
              <span className="fw-bold text-success">₹{paidAmount.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2">
              <span className="fw-bold text-dark" style={{fontSize: '1.1rem'}}>Remaining Balance</span>
              <span className={`fw-bold ${remainingBalance > 0 ? 'text-danger' : 'text-success'}`} style={{fontSize: '1.1rem'}}>
                ₹{remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-3 border border-primary">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="small text-primary fw-bold mb-0"><i className="bi bi-currency-rupee"></i> Adjust Previous Dues</label>
              <button className="btn btn-sm btn-link p-0 text-primary" onClick={() => setIsEditingDues(!isEditingDues)}>
                {isEditingDues ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {isEditingDues ? (
              <>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">₹</span>
                  <input 
                    type="number" 
                    className="form-control fw-bold" 
                    value={editForm.previousDues}
                    onChange={(e) => setEditForm({...editForm, previousDues: e.target.value})}
                  />
                </div>
                <button 
                  className="btn btn-primary btn-sm w-100 mt-2 rounded-pill fw-bold"
                  onClick={handleUpdateDues}
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <small className="text-muted extra-small d-block mt-1">Click edit to manually adjust pending dues from previous months.</small>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Consumption Calendar */}
      <div className="col-md-8 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-uppercase small fw-bold text-muted mb-0">Payment & Consumption History</h6>
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-normal">Current Month</span>
        </div>

        {fetchingConsumption ? (
          <div className="text-center py-5">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-12">
              <div className="table-responsive">
                <table className="table table-bordered table-sm text-center mb-0" style={{ tableLayout: 'fixed' }}>
                  <thead className="bg-light">
                    <tr>
                      {daysOfWeek.map(day => <th key={day} className="py-2 extra-small text-muted text-uppercase">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((week, wIndex) => (
                      <tr key={wIndex}>
                        {week.map((day, dIndex) => {
                          if (!day) return <td key={dIndex} className="bg-light border-0"></td>;
                          
                          const isSelected = selectedDayData?.date === day.date;
                          const isToday = new Date().toDateString() === new Date(day.date).toDateString();
                          
                          return (
                            <td 
                              key={dIndex} 
                              className={`p-0 position-relative cursor-pointer transition-all ${isSelected ? 'bg-primary bg-opacity-10 border-primary' : (isToday ? 'border-primary border-2' : '')}`}
                              style={{ height: '70px', cursor: 'pointer' }}
                              onClick={() => setSelectedDayData(day)}
                            >
                              <div className="d-flex flex-column justify-content-between h-100 p-2">
                                <div className="d-flex justify-content-between align-items-start">
                                  <span className={`fw-bold ${isSelected || isToday ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>{day.day}</span>
                                  {day.messStatus !== 'ND' && (
                                    <span 
                                      className="rounded-circle" 
                                      style={{ 
                                        width: '8px', 
                                        height: '8px', 
                                        backgroundColor: day.messStatus === 'OPEN' ? '#28a745' : '#dc3545'
                                      }}
                                    ></span>
                                  )}
                                </div>
                                
                                <div className="text-center">
                                  {day.dailyBill > 0 ? (
                                    <span className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>₹{day.dailyBill}</span>
                                  ) : (
                                    <span className="text-muted opacity-50" style={{ fontSize: '0.7rem' }}>—</span>
                                  )}
                                </div>

                                <div className="d-flex justify-content-center gap-1 mt-1">
                                  {day.guestMeals > 0 && <span className="badge bg-info text-dark p-0 d-flex justify-content-center align-items-center" style={{ width: '14px', height: '14px', fontSize: '0.6rem' }} title="Guests">G</span>}
                                  {day.extras.length > 0 && <span className="badge bg-warning text-dark p-0 d-flex justify-content-center align-items-center" style={{ width: '14px', height: '14px', fontSize: '0.6rem' }} title="Extras">E</span>}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Day Detail Selection */}
            {selectedDayData && (
              <div className="col-12">
                <div className="card border-0 bg-light rounded-3 animate__animated animate__fadeInUp" style={{ animationDuration: '0.3s' }}>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                      <h6 className="mb-0 fw-bold small text-dark">
                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                        Details for {new Date(selectedDayData.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </h6>
                      <button className="btn-close small" style={{ fontSize: '0.5rem' }} onClick={() => setSelectedDayData(null)}></button>
                    </div>
                    
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="bg-white p-2 rounded border-start border-3 border-primary">
                          <span className="extra-small text-muted d-block">Mess Status</span>
                          <span className={`fw-bold small ${selectedDayData.messStatus === 'OPEN' ? 'text-success' : 'text-danger'}`}>
                            {selectedDayData.messStatus === 'ND' ? 'No Data' : selectedDayData.messStatus}
                          </span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="bg-white p-2 rounded border-start border-3 border-dark">
                          <span className="extra-small text-muted d-block">Total Daily Bill</span>
                          <span className="fw-bold small text-dark">₹{selectedDayData.dailyBill || 0}</span>
                        </div>
                      </div>

                      {/* Extras Section */}
                      {selectedDayData.extras.length > 0 && (
                        <div className="col-12 mt-2">
                          <span className="extra-small fw-bold text-uppercase text-muted mb-1 d-block">Extras Consumed</span>
                          <div className="bg-white p-2 rounded border">
                            {selectedDayData.extras.map((ex, idx) => (
                              <div key={idx} className="d-flex justify-content-between align-items-center small py-1 border-bottom last-child-border-0">
                                <span>
                                  <span className={`badge ${
                                    ex.meal === 'Breakfast' ? 'bg-info text-dark' : 
                                    ex.meal === 'Lunch' ? 'bg-warning text-dark' : 
                                    ex.meal === 'Dinner' ? 'bg-dark text-white' : 'bg-light text-dark'
                                  } border me-2 extra-small fw-normal`}>
                                    {ex.meal || 'N/A'}
                                  </span>
                                  {ex.item.replace('Extra: ', '')}
                                </span>
                                <span className="fw-bold">₹{ex.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Guests Section */}
                      {selectedDayData.guestDetails.length > 0 && (
                        <div className="col-12 mt-2">
                          <span className="extra-small fw-bold text-uppercase text-muted mb-1 d-block">Guest Meals</span>
                          <div className="bg-white p-2 rounded border">
                            {selectedDayData.guestDetails.map((g, idx) => (
                              <div key={idx} className="d-flex justify-content-between align-items-center small py-1 border-bottom last-child-border-0">
                                <span>
                                  <span className={`badge ${
                                    g.meal === 'Breakfast' ? 'bg-info text-dark' : 
                                    g.meal === 'Lunch' ? 'bg-warning text-dark' : 
                                    g.meal === 'Dinner' ? 'bg-dark text-white' : 'bg-light text-dark'
                                  } border me-2 extra-small fw-normal`}>
                                    {g.meal || 'N/A'}
                                  </span>
                                  <i className="bi bi-person-fill me-1 opacity-50"></i> Guest
                                </span>
                                <span className="fw-bold">₹{g.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedDayData.extras.length === 0 && selectedDayData.guestDetails.length === 0 && (
                        <div className="col-12 mt-1">
                          <p className="extra-small text-center text-muted italic p-2 bg-white rounded border">No extra items or guests on this day.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-center gap-3 mt-3">
          <small className="text-muted extra-small"><i className="bi bi-circle-fill text-success me-1"></i> Open</small>
          <small className="text-muted extra-small"><i className="bi bi-circle-fill text-danger me-1"></i> Closed</small>
          <small className="text-muted extra-small"><i className="bi bi-circle-fill text-info me-1"></i> Guests</small>
          <small className="text-muted extra-small"><i className="bi bi-circle-fill text-warning me-1"></i> Extras</small>
        </div>
      </div>
    </div>
  );
};

export default StudentBillingContent;
