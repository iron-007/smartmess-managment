import React from 'react';

const TodayMenu = ({ menu, timings }) => {
  if (!menu) return <div className="glass-panel shadow-md border-0 mb-4 h-100 p-4 text-center">No menu available for today.</div>;

  const mealItems = [
    { type: 'Breakfast', data: menu.breakfast, time: timings?.breakfast },
    { type: 'Lunch', data: menu.lunch, time: timings?.lunch },
    { type: 'Dinner', data: menu.dinner, time: timings?.dinner }
  ];

  return (
    <div className="glass-panel shadow-md border-0 mb-4 h-100">
      <div className="card-body">
        <h5 className="card-title fw-bold text-gradient mb-4">Today's Menu</h5>
        <div className="list-group list-group-flush bg-transparent">
          {mealItems.map(meal => (
            <div key={meal.type} className="list-group-item px-0 border-0 mb-3 bg-transparent">
              <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                <h6 className="mb-0 fw-bold">{meal.type}</h6>
                {meal.data?.extra && <span className="badge bg-warning text-dark small rounded-pill">Extra: {meal.data.extra}</span>}
              </div>
              {meal.time && (
                <div className="small text-muted mb-2">
                  <i className="bi bi-clock me-1"></i> {meal.time.start} - {meal.time.end}
                </div>
              )}
              <p className="mb-1 text-dark fw-medium">{meal.data?.item || 'Not set'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodayMenu;
