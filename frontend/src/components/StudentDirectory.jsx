import React, { useState, useEffect } from 'react';
import StudentDetailModal from './StudentDetailModal';

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dayHeaders, setDayHeaders] = useState(Array.from({ length: 31 }, (_, i) => i + 1));

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('http://localhost:5000/api/admin/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch student data.');
        }
        const data = await response.json();
        
        if (data.success) {
          setStudents(data.students);
          // Uses the dynamic calendar days sent from our backend!
          if (data.daysInMonth) {
            setDayHeaders(Array.from({ length: data.daysInMonth }, (_, i) => i + 1));
          }
        } else {
          throw new Error('Failed to fetch student data.');
        }
      } catch (err) {
        console.error("API Error:", err.message);
        setError('Failed to load student directory. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const results = students.filter(student =>
        student.messAccount.includes(searchQuery)
      );
      setFilteredStudents(results);
    }
  }, [searchQuery, students]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  // --- Premium Sticky Column Styles ---
  // Matches the new dark sidebar theme
  const stickyHeaderStyle = {
    position: 'sticky',
    zIndex: 10,
    backgroundColor: '#16181d', 
    color: '#ffffff',
    boxShadow: '1px 0 0 rgba(255,255,255,0.1)' // Replaces border to prevent overlap glitches
  };

  const stickyCellStyle = {
    position: 'sticky',
    zIndex: 5,
    backgroundColor: '#ffffff',
    boxShadow: '1px 0 0 #eef0f4' 
  };

  const totalColumns = dayHeaders.length + 7;

  return (
    <div className="container-fluid py-2">
      
      {/* PAGE HEADER */}
      <div className="mb-4">
        <h2 className="nav-title fw-bold m-0">
          <i className="bi bi-people-fill me-2"></i>Student Directory & Billing
        </h2>
        <p className="text-muted small mt-1 mb-0">A complete bird's-eye view of student attendance and finances.</p>
      </div>

      {/* MODERN SEARCH BAR */}
      <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row">
            <div className="col-md-6 col-lg-4">
              <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
                <span className="input-group-text bg-white border-0 text-muted ps-4">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="number"
                  className="form-control border-0 modern-input bg-white fs-6"
                  placeholder="Search by Mess Account Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE DATA GRID CARD */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-5">
        
        {/* Dark Header anchoring the Grid */}
        <div className="bg-sidebar-dark p-3 px-4 d-flex justify-content-between align-items-center">
           <h5 className="fw-bold m-0 text-white">
             <i className="bi bi-grid-3x3-gap text-white-50 me-2"></i>Attendance Ledger
           </h5>
           <span className="badge bg-light text-dark rounded-pill shadow-sm px-3 py-2">
             <i className="bi bi-person-lines-fill me-1"></i> {filteredStudents.length} Records
           </span>
        </div>

        <div className="card-body p-0 bg-white">
          <div className="table-responsive">
            <table className="table table-borderless table-hover align-middle mb-0" style={{ minWidth: '3500px' }}>
              
              {/* Table Header */}
              <thead className="menu-table-header">
                <tr>
                  {/* Zone A: Sticky Student Info */}
                  <th className="py-3 px-4 small text-uppercase" style={{ ...stickyHeaderStyle, left: 0, minWidth: '220px' }}>Student Name</th>
                  <th className="py-3 px-3 small text-uppercase" style={{ ...stickyHeaderStyle, left: '220px', minWidth: '130px' }}>Account No.</th>
                  <th className="py-3 px-3 small text-uppercase" style={{ ...stickyHeaderStyle, left: '350px', minWidth: '100px' }}>Year</th>
                  <th className="py-3 px-3 small text-uppercase text-center" style={{ ...stickyHeaderStyle, left: '450px', minWidth: '140px', boxShadow: '2px 0 5px rgba(0,0,0,0.2)' }}>Actions</th>

                  {/* Zone B: The Dynamic Attendance Tracker */}
                  {dayHeaders.map(day => (
                    <th key={day} className="py-3 text-center small text-uppercase" style={{ minWidth: '60px' }}>{day}</th>
                  ))}

                  {/* Zone C: The Financial Totals */}
                  <th className="py-3 px-4 text-end small text-uppercase" style={{ minWidth: '150px' }}>Current Bill</th>
                  <th className="py-3 px-4 text-end small text-uppercase" style={{ minWidth: '150px' }}>Previous Dues</th>
                  <th className="py-3 px-4 text-end small text-uppercase" style={{ minWidth: '160px' }}>Net Payable</th>
                </tr>
              </thead>
              
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={totalColumns} className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 fw-medium text-muted">Calculating financial ledgers...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={totalColumns} className="text-center p-5 text-danger bg-danger bg-opacity-10">
                      <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-2"></i>
                      <h5 className="fw-bold">Could not load data</h5>
                      <p className="mb-0">{error}</p>
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => {
                    const netPayable = student.currentMonthBill + student.previousDues;
                    return (
                      <tr key={student._id} className={index !== filteredStudents.length - 1 ? "border-bottom" : ""}>
                        
                        {/* Zone A: Sticky Student Info */}
                        <td className="fw-bold text-dark py-3 px-4" style={{ ...stickyCellStyle, left: 0 }}>
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle d-flex justify-content-center align-items-center me-3 border" style={{width: '35px', height: '35px'}}>
                              <i className="bi bi-person text-secondary"></i>
                            </div>
                            {student.name}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-secondary fw-medium" style={{ ...stickyCellStyle, left: '220px' }}>{student.messAccount}</td>
                        <td className="py-3 px-3 text-secondary" style={{ ...stickyCellStyle, left: '350px' }}>{student.year}</td>
                        <td className="py-3 px-3 text-center" style={{ ...stickyCellStyle, left: '450px', boxShadow: '2px 0 8px rgba(0,0,0,0.05)' }}>
                          <button className="btn btn-light text-primary btn-sm rounded-pill px-3 fw-bold border hover-shadow" onClick={() => handleViewDetails(student)}>
                            <i className="bi bi-eye me-1"></i> Details
                          </button>
                        </td>

                        {/* Zone B: The Day Attendance Tracker */}
                        {student.monthlyStatus.map((isPresent, dayIndex) => (
                          <td key={dayIndex} className="text-center align-middle py-3">
                            <i className={`bi bi-circle-fill ${isPresent ? 'text-success' : 'text-danger opacity-50'} small`}></i>
                          </td>
                        ))}

                        {/* Zone C: The Financial Totals */}
                        <td className="text-end py-3 px-4 text-secondary fw-medium">
                          ₹{student.currentMonthBill.toLocaleString()}
                        </td>
                        <td className={`text-end py-3 px-4 fw-semibold ${student.previousDues > 0 ? 'text-danger' : 'text-secondary'}`}>
                          ₹{student.previousDues.toLocaleString()}
                        </td>
                        <td className="text-end py-3 px-4 bg-light fw-bold text-dark border-start">
                          ₹{netPayable.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={totalColumns} className="text-center p-5 text-muted">
                      <i className="bi bi-search fs-1 d-block mb-3 opacity-25"></i>
                      <h5 className="fw-medium">No records found</h5>
                      <p className="small mb-0">Try adjusting your mess account search criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default StudentDirectory;