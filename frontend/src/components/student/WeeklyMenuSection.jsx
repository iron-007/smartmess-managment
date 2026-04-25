import React from 'react';

const WeeklyMenuSection = ({ menu }) => {
  if (!menu || !menu.menu) return null;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = [
    { key: 'breakfast', display: 'Breakfast', icon: 'bi-sunrise text-warning' },
    { key: 'lunch', display: 'Lunch', icon: 'bi-sun text-info' },
    { key: 'dinner', display: 'Dinner', icon: 'bi-moon-stars text-primary' }
  ];

  return (
    <div className="glass-panel shadow-md border-0 mb-4 fade-in">
      <div className="card-body p-4">
        <div className="row align-items-center mb-4">
          <div className="col-md-4">
            <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-calendar-week me-2 text-primary"></i>Weekly Meal Plan</h5>
          </div>
          <div className="col-md-8">
            {menu.timings && (
              <div className="d-flex justify-content-md-end flex-wrap gap-2 mt-3 mt-md-0">
                <div className="badge bg-white text-dark border shadow-sm fw-normal py-2 px-3 rounded-pill">
                  <i className="bi bi-sunrise me-2 text-warning"></i>
                  <span className="fw-bold me-1">Breakfast:</span> 
                  {menu.timings.breakfast.start} - {menu.timings.breakfast.end}
                </div>
                <div className="badge bg-white text-dark border shadow-sm fw-normal py-2 px-3 rounded-pill">
                  <i className="bi bi-sun me-2 text-info"></i>
                  <span className="fw-bold me-1">Lunch:</span> 
                  {menu.timings.lunch.start} - {menu.timings.lunch.end}
                </div>
                <div className="badge bg-white text-dark border shadow-sm fw-normal py-2 px-3 rounded-pill">
                  <i className="bi bi-moon-stars me-2 text-primary"></i>
                  <span className="fw-bold me-1">Dinner:</span> 
                  {menu.timings.dinner.start} - {menu.timings.dinner.end}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="table-responsive rounded-4 border shadow-sm">
          <table className="table table-hover align-middle mb-0 border-0">
            <thead className="bg-light">
              <tr className="text-uppercase small fw-bold text-muted">
                <th style={{ width: '13%' }} className="ps-4 py-3 border-0 rounded-top-start-4">Day</th>
                <th style={{ width: '29%' }} className="py-3 border-0"><i className="bi bi-sunrise me-1 text-warning"></i> Breakfast</th>
                <th style={{ width: '29%' }} className="py-3 border-0"><i className="bi bi-sun me-1 text-info"></i> Lunch</th>
                <th style={{ width: '29%' }} className="py-3 border-0 rounded-top-end-4"><i className="bi bi-moon-stars me-1 text-primary"></i> Dinner</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {days.map((day, index) => {
                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
                return (
                  <tr key={day} className={`transition-all ${isToday ? 'bg-primary bg-opacity-10' : ''}`}>
                    <td className="fw-bold text-dark ps-4 py-3 border-bottom border-light">
                      {day} {isToday && <span className="badge bg-primary ms-1 py-1 px-2 rounded-pill small">Today</span>}
                    </td>
                    {meals.map(meal => (
                      <td key={`${day}-${meal.key}`} className="py-3 border-bottom border-light">
                        <div className="fw-medium text-dark">{menu.menu[day][meal.key].item || '—'}</div>
                        {menu.menu[day][meal.key].extra && (
                          <div className="small text-warning fw-bold mt-1 d-inline-block bg-warning bg-opacity-10 px-2 py-1 rounded-2 border border-warning border-opacity-25"><i className="bi bi-plus-circle me-1"></i>{menu.menu[day][meal.key].extra}</div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenuSection;
