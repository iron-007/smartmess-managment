import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import StudentDetailModal from './StudentDetailModal';
import StudentDetailContent from './StudentDetailContent';
import StudentBillingModal from './StudentBillingModal';
import StudentBillingContent from './StudentBillingContent';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dayHeaders, setDayHeaders] = useState(Array.from({ length: 31 }, (_, i) => i + 1));
  const [isLedgerRunning, setIsLedgerRunning] = useState(false); // NEW STATE
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [expandedDetailsId, setExpandedDetailsId] = useState(null);
  const [selectedBillingStudent, setSelectedBillingStudent] = useState(null);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // 1. Extracted fetch function so we can refresh the grid manually
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/students');

      const data = response.data;

      if (data.success) {
        setStudents(data.students);
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
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    if (isMobile) {
      setSelectedStudent(student);
      setIsModalOpen(true);
    } else {
      setExpandedDetailsId(expandedDetailsId === student._id ? null : student._id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleViewBilling = (student) => {
    if (isMobile) {
      setSelectedBillingStudent(student);
      setIsBillingModalOpen(true);
    } else {
      setExpandedRowId(expandedRowId === student._id ? null : student._id);
    }
  };

  const handleCloseBillingModal = () => {
    setIsBillingModalOpen(false);
    setSelectedBillingStudent(null);
  };

  // 2. NEW: Function to manually trigger the cron job for presentations!
  const handleRunLedger = async () => {
    if (window.confirm("Trigger the Midnight Ledger? This will lock in today's meal prices for all active students.")) {
      setIsLedgerRunning(true);
      try {
        const response = await api.post('/api/admin/trigger-billing');
        const data = response.data;
        if (data.success) {
          // Instantly refresh the grid to show the new numbers!
          await fetchStudents();
          alert(`Success! ${data.message}`);
        } else {
          alert(`Error: ${data.message || 'Failed to process ledger'}`);
        }
      } catch (err) {
        console.error("Ledger Error:", err);
        alert("Failed to connect to the backend ledger system.");
      } finally {
        setIsLedgerRunning(false);
      }
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape'); // Landscape for more columns

    // Header
    doc.setFontSize(20);
    doc.setTextColor(22, 24, 29); // #16181d
    doc.text('SmartMess - Comprehensive Student Billing Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Records: ${filteredStudents.length}`, 14, 33);

    // Table
    const tableColumn = ["Account #", "Student Name", "Year", "Dept.", "Extras", "Fine", "Curr. Bill", "Prev. Dues", "Net Payable"];
    const tableRows = filteredStudents.map(student => [
      student.messAccount,
      student.name,
      student.year,
      student.department,
      `Rs. ${student.totalExtras || 0}`,
      `Rs. ${student.fineAmount || 0}`,
      `Rs. ${student.currentMonthBill}`,
      `Rs. ${student.previousDues}`,
      `Rs. ${student.currentMonthBill + student.previousDues}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [22, 24, 29], textColor: 255 },
      styles: { fontSize: 8 },
      columnStyles: {
        8: { fontStyle: 'bold' }
      }
    });

    doc.save(`SmartMess_Directory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // --- Premium Sticky Column Styles ---
  const stickyHeaderStyle = {
    position: 'sticky',
    zIndex: 10,
    backgroundColor: '#16181d',
    color: '#ffffff',
    boxShadow: '1px 0 0 rgba(255,255,255,0.1)'
  };

  const stickyCellStyle = {
    position: 'sticky',
    zIndex: 5,
    backgroundColor: '#ffffff',
    boxShadow: '1px 0 0 #eef0f4'
  };

  const standardHeaderStyle = {
    backgroundColor: '#16181d',
    color: '#ffffff',
    borderBottom: 'none'
  };

  const totalColumns = 10;

  return (
    <div className="container-fluid py-2">

      {/* 3. UPDATED PAGE HEADER WITH RUN LEDGER BUTTON */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="nav-title fw-bold m-0">
            <i className="bi bi-people-fill me-2"></i>Student Directory & Billing
          </h2>
          <p className="text-muted small mt-1 mb-0">A complete bird's-eye view of student attendance and finances.</p>
        </div>

        {/* Action Buttons */}
        <div className="d-grid gap-2 d-md-flex w-100 w-md-auto">
          <button
            onClick={exportPDF}
            className="btn btn-outline-dark fw-bold shadow-sm rounded-pill px-4 py-2"
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>Export PDF
          </button>

          <button
            onClick={handleRunLedger}
            disabled={isLedgerRunning || loading}
            className="btn btn-gradient rounded-pill px-4 py-2 fw-bold"
          >
            {isLedgerRunning ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Auditing...</>
            ) : (
              <><i className="bi bi-lightning-charge-fill me-2"></i>Run Audit</>
            )}
          </button>
        </div>
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

        <div className="bg-sidebar-dark p-3 px-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#16181d' }}>
          <h5 className="fw-bold m-0 text-white">
            <i className="bi bi-grid-3x3-gap text-white-50 me-2"></i>Attendance Ledger
          </h5>
          <span className="badge bg-light text-dark rounded-pill shadow-sm px-3 py-2">
            <i className="bi bi-person-lines-fill me-1"></i> {filteredStudents.length} Records
          </span>
        </div>

        <div className="card-body p-0 bg-white">
          <div className="table-responsive">
            <table className="table table-borderless table-hover align-middle mb-0">

              <thead className="menu-table-header">
                <tr>
                  <th className="py-3 px-3 small text-uppercase" style={{ ...stickyHeaderStyle, left: 0, minWidth: '160px', maxWidth: '180px', boxShadow: '2px 0 5px rgba(0,0,0,0.2)' }}>Student Name</th>
                  <th className="py-3 px-3 small text-uppercase" style={{ ...standardHeaderStyle, minWidth: '160px' }}>Actions</th>
                  <th className="py-3 px-3 small text-uppercase d-none d-md-table-cell" style={{ ...standardHeaderStyle, minWidth: '130px' }}>Account No.</th>
                  <th className="py-3 px-3 small text-uppercase d-none d-md-table-cell" style={{ ...standardHeaderStyle, minWidth: '100px' }}>Year</th>

                  <th className="py-3 px-4 text-end small text-uppercase d-none d-md-table-cell" style={{ ...standardHeaderStyle }}>Daily Bill</th>
                  <th className="py-3 px-4 text-end small text-uppercase d-none d-md-table-cell" style={{ ...standardHeaderStyle }}>Extras</th>
                  <th className="py-3 px-4 text-end small text-uppercase d-none d-md-table-cell" style={{ ...standardHeaderStyle }}>Guest</th>
                  <th className="py-3 px-4 text-end small text-uppercase d-none d-md-table-cell" style={{ ...standardHeaderStyle }}>Fine</th>
                  <th className="py-3 px-4 text-end small text-uppercase d-none d-md-table-cell" style={{ ...standardHeaderStyle }}>Prev. Dues</th>
                  <th className="py-3 px-4 text-end small text-uppercase d-none d-md-table-cell" style={{ ...standardHeaderStyle }}>Net Payable</th>
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
                    return (
                      <React.Fragment key={student._id}>
                        <tr className={index !== filteredStudents.length - 1 || expandedRowId === student._id || expandedDetailsId === student._id ? "border-bottom" : ""}>

                          <td className="fw-bold text-dark py-3 px-3" style={{ ...stickyCellStyle, left: 0, boxShadow: '2px 0 8px rgba(0,0,0,0.05)', maxWidth: '180px' }}>
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded-circle flex-shrink-0 d-flex justify-content-center align-items-center me-2 border" style={{ width: '32px', height: '32px' }}>
                                <i className="bi bi-person text-secondary" style={{ fontSize: '0.9rem' }}></i>
                              </div>
                              <span className="text-truncate small" title={student.name}>{student.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              <button className="btn btn-light text-primary btn-sm rounded-pill px-2 fw-bold border hover-shadow flex-fill" onClick={() => handleViewDetails(student)}>
                                <i className="bi bi-eye d-xl-none"></i> <span className="d-none d-xl-inline">Details</span>
                              </button>
                              <button className="btn btn-light text-success btn-sm rounded-pill px-2 fw-bold border hover-shadow flex-fill" onClick={() => handleViewBilling(student)}>
                                <i className="bi bi-receipt d-xl-none"></i> <span className="d-none d-xl-inline">Billing</span>
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-secondary fw-medium d-none d-md-table-cell">{student.messAccount}</td>
                          <td className="py-3 px-3 text-secondary d-none d-md-table-cell">{student.year}</td>

                          <td className="text-end py-3 px-4 text-secondary d-none d-md-table-cell">
                            ₹{(student.dailyMealsTotal || 0).toLocaleString()}
                          </td>
                          <td className="text-end py-3 px-4 text-secondary d-none d-md-table-cell">
                            ₹{(student.totalExtras || 0).toLocaleString()}
                          </td>
                          <td className="text-end py-3 px-4 text-secondary d-none d-md-table-cell">
                            ₹{(student.totalGuestAmount || 0).toLocaleString()}
                          </td>
                          <td className="text-end py-3 px-4 text-danger fw-bold d-none d-md-table-cell">
                            ₹{(student.fineAmount || 0).toLocaleString()}
                          </td>
                          <td className={`text-end py-3 px-4 fw-semibold d-none d-md-table-cell ${student.previousDues > 0 ? 'text-danger' : 'text-secondary'}`}>
                            ₹{student.previousDues.toLocaleString()}
                          </td>
                          <td className="text-end py-3 px-4 bg-light fw-bold text-dark border-start d-none d-md-table-cell">
                            ₹{(student.dailyMealsTotal + student.totalExtras + student.totalGuestAmount + student.fineAmount + student.previousDues).toLocaleString()}
                          </td>
                        </tr>
                        {/* INLINE EXPANDABLE ROW FOR DESKTOP - BILLING */}
                        {expandedRowId === student._id && !isMobile && (
                          <tr key={`${student._id}-expanded-billing`} className="bg-light border-bottom border-success border-2">
                            <td colSpan={totalColumns} className="p-0 position-relative">
                              <div className="w-100 overflow-hidden" style={{ position: 'sticky', left: 0, right: 0 }}>
                                <StudentBillingContent student={student} isMobile={false} />
                              </div>
                            </td>
                          </tr>
                        )}
                        {/* INLINE EXPANDABLE ROW FOR DESKTOP - DETAILS */}
                        {expandedDetailsId === student._id && !isMobile && (
                          <tr key={`${student._id}-expanded-details`} className="bg-light border-bottom border-primary border-2">
                            <td colSpan={totalColumns} className="p-0 position-relative">
                              <div className="w-100 overflow-hidden" style={{ position: 'sticky', left: 0, right: 0 }}>
                                <StudentDetailContent student={student} isMobile={false} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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

      {isModalOpen && selectedStudent && isMobile && (
        <StudentDetailModal student={selectedStudent} onClose={handleCloseModal} />
      )}

      {isBillingModalOpen && selectedBillingStudent && isMobile && (
        <StudentBillingModal student={selectedBillingStudent} onClose={handleCloseBillingModal} />
      )}
    </div>
  );
};

export default StudentDirectory;