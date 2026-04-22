import React from 'react';

const WeeklyMenuSection = ({ menu }) => {
  if (!menu || !menu.menu) return null;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = [
    { key: 'breakfast', display: 'Breakfast' },
    { key: 'lunch', display: 'Lunch' },
    { key: 'dinner', display: 'Dinner' }
  ];

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <div className="row align-items-center mb-4">
          <div className="col-md-4">
            <h5 className="card-title fw-bold text-primary mb-0">Weekly Meal Plan</h5>
          </div>
          <div className="col-md-8">
            {menu.timings && (
              <div className="d-flex justify-content-md-end flex-wrap gap-3">
                <div className="badge bg-light text-dark border fw-normal py-2 px-3">
                  <i className="bi bi-sun me-2 text-warning"></i>
                  <span className="fw-bold me-1">Breakfast:</span> 
                  {menu.timings.breakfast.start} - {menu.timings.breakfast.end}
                </div>
                <div className="badge bg-light text-dark border fw-normal py-2 px-3">
                  <i className="bi bi-brightness-high me-2 text-info"></i>
                  <span className="fw-bold me-1">Lunch:</span> 
                  {menu.timings.lunch.start} - {menu.timings.lunch.end}
                </div>
                <div className="badge bg-light text-dark border fw-normal py-2 px-3">
                  <i className="bi bi-moon-stars me-2 text-primary"></i>
                  <span className="fw-bold me-1">Dinner:</span> 
                  {menu.timings.dinner.start} - {menu.timings.dinner.end}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 border">
            <thead className="bg-light">
              <tr className="text-uppercase small fw-bold">
                <th style={{ width: '13%' }} className="ps-3 py-3">Day</th>
                <th style={{ width: '29%' }} className="py-3">Breakfast</th>
                <th style={{ width: '29%' }} className="py-3">Lunch</th>
                <th style={{ width: '29%' }} className="py-3">Dinner</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, index) => (
                <tr key={day} className={index % 2 === 0 ? 'bg-white' : 'bg-light bg-opacity-10'}>
                  <td className="fw-bold text-secondary ps-3">{day}</td>
                  {meals.map(meal => (
                    <td key={`${day}-${meal.key}`}>
                      <div className="fw-medium text-dark">{menu.menu[day][meal.key].item || '—'}</div>
                      {menu.menu[day][meal.key].extra && (
                        <div className="small text-warning fw-bold">+{menu.menu[day][meal.key].extra}</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenuSection;
