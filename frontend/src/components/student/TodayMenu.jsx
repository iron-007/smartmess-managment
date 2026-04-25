import React from 'react';

const TodayMenu = ({ menu, timings }) => {
  if (!menu) return (
    <div className="glass-panel shadow-md border-0 mb-4 h-100 p-5 text-center d-flex flex-column justify-content-center align-items-center fade-in">
      <i className="bi bi-calendar-x fs-1 text-muted opacity-50 mb-3"></i>
      <h6 className="text-muted fw-medium">No menu available for today.</h6>
    </div>
  );

  const mealItems = [
    { type: 'Breakfast', icon: 'bi-sunrise text-warning', data: menu.breakfast, time: timings?.breakfast },
    { type: 'Lunch', icon: 'bi-sun text-info', data: menu.lunch, time: timings?.lunch },
    { type: 'Dinner', icon: 'bi-moon-stars text-primary', data: menu.dinner, time: timings?.dinner }
  ];

  return (
    <div className="glass-panel shadow-md border-0 mb-4 h-100 fade-in">
      <div className="card-header border-0 bg-transparent p-4 pb-0">
        <h5 className="mb-0 fw-bold text-gradient"><i className="bi bi-calendar-check me-2"></i>Today's Menu</h5>
      </div>
      <div className="card-body p-4 pt-3">
        <div className="d-flex flex-column gap-3">
          {mealItems.map(meal => (
            <div key={meal.type} className="p-3 rounded-4 bg-white shadow-sm border border-light transition-all hover-lift">
              <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                <h6 className="mb-0 fw-bold d-flex align-items-center">
                  <i className={`bi ${meal.icon} me-2 fs-5`}></i>
                  {meal.type}
                </h6>
                {meal.data?.extra && <span className="badge bg-warning text-dark small rounded-pill shadow-sm"><i className="bi bi-plus-circle me-1"></i>{meal.data.extra}</span>}
              </div>
              <div className="d-flex justify-content-between align-items-end mt-2">
                <p className="mb-0 text-dark fw-bold fs-6">{meal.data?.item || 'Not set'}</p>
                {meal.time && (
                  <span className="small text-muted fw-medium bg-light px-2 py-1 rounded-3 border">
                    <i className="bi bi-clock me-1 opacity-75"></i> {meal.time.start} - {meal.time.end}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodayMenu;
