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

  // Effect to fetch data from the backend
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
        if (data.success && data.students) {
          setStudents(data.students);
          if (data.students.length > 0) {
            // Dynamically set day headers based on the data from the first student
            const daysInMonth = data.students[0].monthlyStatus.length;
            setDayHeaders(Array.from({ length: daysInMonth }, (_, i) => i + 1));
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

  // Effect to handle filtering based on search query
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

  // --- Styles for Sticky Columns ---
  const stickyHeaderStyle = {
    position: 'sticky',
    zIndex: 2,
    background: '#f8f9fa', // A light background to cover content during scroll
  };

  const stickyCellStyle = {
    position: 'sticky',
    zIndex: 1,
    background: '#ffffff', // Match row background
  };

  const totalColumns = dayHeaders.length + 7;

  return (
    <div className="container-fluid">
      <h2 className="mb-3 fw-bold text-primary">Student Attendance & Billing Grid</h2>
      <p className="text-muted">A complete bird's-eye view of student attendance and finances for the current month.</p>

      <div className="row mb-4">
        <div className="col-md-6 col-lg-4">
          <div className="input-group">
            <span className="input-group-text bg-white">
              &#128269;
            </span>
            <input
              type="number"
              className="form-control form-control-lg"
              placeholder="Search by Mess Account Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded-3">
        <table className="table table-bordered table-hover align-middle mb-0" style={{ minWidth: '4000px' }}>
          <thead className="table-light text-center text-muted">
            <tr>
              {/* Zone A: Sticky Student Info */}
              <th className="p-3 fs-6" style={{ ...stickyHeaderStyle, left: 0, minWidth: '250px' }}>Student Name</th>
              <th className="p-3 fs-6" style={{ ...stickyHeaderStyle, left: '250px', minWidth: '150px' }}>Account No.</th>
              <th className="p-3 fs-6" style={{ ...stickyHeaderStyle, left: '400px', minWidth: '100px' }}>Year</th>
              <th className="p-3 fs-6" style={{ ...stickyHeaderStyle, left: '500px', minWidth: '150px', borderRight: '2px solid #dee2e6' }}>Actions</th>

              {/* Zone B: The 31-Day Attendance Tracker */}
              {dayHeaders.map(day => (
                <th key={day} className="p-3 fs-6" style={{ minWidth: '70px' }}>{day}</th>
              ))}

              {/* Zone C: The Financial Totals */}
              <th className="p-3 fs-6" style={{ minWidth: '150px' }}>Current Bill</th>
              <th className="p-3 fs-6" style={{ minWidth: '150px' }}>Previous Dues</th>
              <th className="p-3 fs-6" style={{ minWidth: '150px' }}>Net Payable</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={totalColumns} className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading student data...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={totalColumns} className="text-center p-5 text-danger">
                  <h5 className="fw-bold">Could not load data</h5>
                  <p>{error}</p>
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const netPayable = student.currentMonthBill + student.previousDues;
                return (
                  <tr key={student._id}>
                    {/* Zone A: Sticky Student Info */}
                    <td className="fw-bold p-3 fs-5" style={{ ...stickyCellStyle, left: 0 }}>{student.name}</td>
                    <td className="p-3 fs-5" style={{ ...stickyCellStyle, left: '250px' }}>{student.messAccount}</td>
                    <td className="p-3 fs-5" style={{ ...stickyCellStyle, left: '400px' }}>{student.year}</td>
                    <td className="p-3" style={{ ...stickyCellStyle, left: '500px', borderRight: '2px solid #dee2e6' }}>
                      <button className="btn btn-outline-primary w-100 fw-semibold" onClick={() => handleViewDetails(student)}>
                        View Details
                      </button>
                    </td>

                    {/* Zone B: The Day Attendance Tracker */}
                    {student.monthlyStatus.map((isPresent, dayIndex) => (
                      <td key={dayIndex} className="text-center align-middle p-3">
                        <span className={`fs-2 lh-1 ${isPresent ? 'text-success' : 'text-danger'}`}>&#9679;</span>
                      </td>
                    ))}

                    {/* Zone C: The Financial Totals */}
                    <td className="text-end p-3 fs-5 align-middle">₹{student.currentMonthBill.toLocaleString()}</td>
                    <td className={`text-end p-3 fs-5 align-middle fw-semibold ${student.previousDues > 0 ? 'text-danger' : ''}`}>
                      ₹{student.previousDues.toLocaleString()}
                    </td>
                    <td className="text-end p-3 fs-5 align-middle fw-bold text-primary">₹{netPayable.toLocaleString()}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={totalColumns} className="text-center p-5 text-muted">
                  {searchQuery
                    ? 'No student found with this account number.'
                    : 'No students in the directory.'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default StudentDirectory;