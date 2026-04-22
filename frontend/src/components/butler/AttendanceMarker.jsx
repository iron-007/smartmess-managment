import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AttendanceMarker = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/butler/students');
        setStudents(response.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  const handleMark = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return alert("Please select a student");
    
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/api/butler/mark-attendance', {
        studentId: selectedStudent,
        mealType
      });
      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      setSelectedStudent('');
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to mark attendance' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body p-4">
        <h5 className="fw-bold text-dark mb-3"><i className="bi bi-qr-code-scan me-2 text-primary"></i>Meal Attendance Entry</h5>
        
        {message && (
          <div className={`alert alert-${message.type} py-2 small d-flex align-items-center`}>
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
            {message.text}
          </div>
        )}

        <form onSubmit={handleMark}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Scan or Select Student</label>
            <select 
              className="form-select border-0 bg-light" 
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              <option value="">Select student...</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.messAccount})</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="form-label small fw-bold text-muted">Current Meal</label>
            <div className="d-flex gap-2">
              {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                <button
                  key={meal}
                  type="button"
                  className={`btn flex-grow-1 py-2 fw-bold rounded-3 ${mealType === meal ? 'btn-primary' : 'btn-outline-light text-dark'}`}
                  onClick={() => setMealType(meal)}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-dark w-100 py-2 fw-bold rounded-3 shadow-sm" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check2-circle me-2"></i>}
            Confirm Attendance
          </button>
        </form>
      </div>
    </div>
  );
};

export default AttendanceMarker;
