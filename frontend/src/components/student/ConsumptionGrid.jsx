import React from 'react';

const ConsumptionGrid = ({ consumption }) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group consumption by week for rendering
  const weeks = [];
  let currentWeek = [];

  // Need to find which day of the week the month starts on
  if (Array.isArray(consumption) && consumption.length > 0) {
    const firstDate = new Date(consumption[0].date);
    const firstDay = firstDate.getDay();

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    consumption.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add empty cells for days after the end of the month
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
  }

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="card-title fw-bold text-primary mb-4">Consumption History</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-sm text-center">
            <thead className="bg-light">
              <tr>
                {daysOfWeek.map(day => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wIndex) => (
                <tr key={wIndex}>
                  {week.map((day, dIndex) => {
                    if (!day) return <td key={dIndex} className="bg-light"></td>;
                    
                    const dateObj = new Date(day.date);
                    const isToday = new Date().toDateString() === dateObj.toDateString();
                    
                    return (
                      <td key={dIndex} className={`${isToday ? "border border-primary border-2" : ""} p-0 position-relative cell-hover`}>
                        <div className="d-flex flex-column h-100 p-2 min-h-80">
                          <span className={`small fw-bold ${isToday ? "text-primary" : ""}`}>{dateObj.getDate()}</span>
                          <div className="my-1">
                            {day.messStatus === 'ND' ? (
                              <span className="small text-muted fw-bold" style={{ fontSize: '0.6rem' }}>ND</span>
                            ) : (
                              <span 
                                className={`rounded-circle d-inline-block`} 
                                style={{ 
                                  width: '10px', 
                                  height: '10px', 
                                  backgroundColor: day.messStatus === 'OPEN' ? '#28a745' : '#dc3545' 
                                }}
                                title={`Mess Status: ${day.messStatus}`}
                              ></span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.65rem' }}>
                            {day.guestMeals > 0 && <div className="text-info">G: {day.guestMeals}</div>}
                            {day.extras.length > 0 && <div className="text-muted">E: {day.extras.length}</div>}
                          </div>
                        </div>

                        {/* Hover Popover */}
                        <div className="hover-details shadow-lg border-0 rounded-4 overflow-hidden bg-white">
                          <div className="bg-primary bg-opacity-10 p-2 border-bottom">
                            <h6 className="small fw-bold text-primary mb-0">{dateObj.toLocaleDateString()}</h6>
                          </div>
                          <div className="p-3">
                            <div className="mb-3 d-flex justify-content-between align-items-center">
                              <span className="small text-muted">Mess Status</span>
                              <span className={`badge ${day.messStatus === 'ND' ? 'bg-secondary' : (day.messStatus === 'OPEN' ? 'bg-success' : 'bg-danger')} bg-opacity-10 ${day.messStatus === 'ND' ? 'text-muted' : (day.messStatus === 'OPEN' ? 'text-success' : 'text-danger')} border`}>
                                {day.messStatus === 'ND' ? 'No Data (Future)' : day.messStatus}
                              </span>
                            </div>

                            {(day.guestMeals === 0 && day.extras.length === 0) ? (
                              <div className="text-center py-2 text-muted small italic">No extra activity recorded.</div>
                            ) : (
                              ['Breakfast', 'Lunch', 'Dinner', 'N/A'].map(mealType => {
                                const mealExtras = day.extras.filter(ex => (ex.meal === mealType) || (mealType === 'N/A' && !ex.meal));
                                const mealGuests = day.guestDetails?.filter(g => (g.meal === mealType) || (mealType === 'N/A' && !g.meal));
                                
                                if (mealExtras.length === 0 && (!mealGuests || mealGuests.length === 0)) return null;

                                return (
                                  <div key={mealType} className="mb-3 last-child-mb-0">
                                    <div className="d-flex align-items-center mb-1">
                                      <span className="badge bg-secondary bg-opacity-10 text-secondary border small py-1 px-2">
                                        {mealType === 'N/A' ? 'Other / General' : mealType}
                                      </span>
                                    </div>
                                    {mealGuests?.map((g, i) => (
                                      <div key={i} className="small text-info fw-medium d-flex justify-content-between px-1">
                                        <span>{g.meal === 'N/A' ? 'Guest Meal' : `${g.meal} Guest`}</span>
                                        <span>₹{g.amount}</span>
                                      </div>
                                    ))}
                                    {mealExtras.map((ex, i) => (
                                      <div key={i} className="small text-dark d-flex justify-content-between px-1 border-top border-light mt-1 pt-1">
                                        <span className="text-truncate" style={{ maxWidth: '120px' }} title={ex.item}>
                                          {ex.item.replace('Extra: ', '')}
                                        </span>
                                        <span className="fw-bold ms-2">₹{ex.amount}</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })
                            )}
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
        <div className="d-flex justify-content-center mt-3 gap-3">
          <div className="small"><span className="badge rounded-pill bg-success p-1 me-1"> </span> Open</div>
          <div className="small"><span className="badge rounded-pill bg-danger p-1 me-1"> </span> Closed</div>
          <div className="small"><span className="text-muted fw-bold extra-small">ND</span> No Data</div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionGrid;
