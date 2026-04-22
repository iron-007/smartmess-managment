import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ConsumptionEntry = () => {
  const [students, setStudents] = useState([]);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    extras: [{ item: '', quantity: 1, price: 0 }],
    guestMeals: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, menuRes] = await Promise.all([
          api.get('/api/butler/students'),
          api.get('/api/menu/today')
        ]);
        
        setStudents(studentsRes.data);
        
        // Extract extras from today's menu
        if (menuRes.data) {
          const extras = [];
          if (menuRes.data.breakfast?.extra) extras.push(menuRes.data.breakfast.extra);
          if (menuRes.data.lunch?.extra) extras.push(menuRes.data.lunch.extra);
          if (menuRes.data.dinner?.extra) extras.push(menuRes.data.dinner.extra);
          
          // Add some common ones if they aren't there
          ['Milk', 'Egg', 'Chicken'].forEach(item => {
            if (!extras.includes(item)) extras.push(item);
          });

          setAvailableExtras(extras);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const addExtraRow = () => {
    setFormData({
      ...formData,
      extras: [...formData.extras, { item: '', quantity: 1, price: 0 }]
    });
  };

  const removeExtraRow = (index) => {
    const newExtras = [...formData.extras];
    newExtras.splice(index, 1);
    setFormData({ ...formData, extras: newExtras });
  };

  const handleExtraChange = (index, field, value) => {
    const newExtras = [...formData.extras];
    newExtras[index][field] = value;
    setFormData({ ...formData, extras: newExtras });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) return alert("Please select a student");
    
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/api/butler/add-consumption', formData);
      setMessage({ type: 'success', text: 'Consumption logged successfully!' });
      setFormData({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        extras: [{ item: '', quantity: 1, price: 0 }],
        guestMeals: 0
      });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to log consumption' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title fw-bold mb-4">Extras & Guest Entry</h5>
        
        {message && <div className={`alert alert-${message.type} py-2 small`}>{message.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">Select Student</label>
              <select 
                className="form-select" 
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                required
              >
                <option value="">Choose student...</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.messAccount})</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">Logging For</label>
              <div className="bg-light p-2 rounded border d-flex align-items-center">
                <i className="bi bi-calendar-check text-primary me-2"></i>
                <span className="fw-bold text-dark">
                  {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="badge bg-primary ms-auto">TODAY</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label small fw-bold mb-0">Extras</label>
              <button type="button" className="btn btn-sm btn-link text-primary p-0" onClick={addExtraRow}>
                + Add Item
              </button>
            </div>
            
            {formData.extras.map((extra, index) => (
              <div key={index} className="row g-2 mb-2 align-items-end">
                <div className="col-5">
                  <select 
                    className="form-select form-select-sm" 
                    value={extra.item}
                    onChange={(e) => handleExtraChange(index, 'item', e.target.value)}
                  >
                    <option value="">Select item...</option>
                    {availableExtras.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <input 
                    type="number" 
                    className="form-control form-control-sm" 
                    placeholder="Qty"
                    value={extra.quantity}
                    onChange={(e) => handleExtraChange(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="col-1 text-end">
                  <button type="button" className="btn btn-sm btn-outline-danger border-0" onClick={() => removeExtraRow(index)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 mb-4">
            <label className="form-label small fw-bold">Guest Meals</label>
            <input 
              type="number" 
              className="form-control w-25" 
              value={formData.guestMeals}
              onChange={(e) => setFormData({...formData, guestMeals: parseInt(e.target.value) || 0})}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
            {loading ? 'Logging...' : 'Submit Consumption'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsumptionEntry;
