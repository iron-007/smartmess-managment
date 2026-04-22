import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BillOverview = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(2000);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/butler/student-bills');
      if (response.data.success) {
        setBills(response.data.bills);
      }
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bill.messAccount.includes(searchTerm);
    const exceedsThreshold = bill.previousDues >= threshold;
    return matchesSearch && exceedsThreshold;
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('SmartMess - High Balance Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Previous Dues Threshold: >= ₹${threshold}`, 14, 35);
    
    // Table
    const tableColumn = ["Account #", "Student Name", "Prev. Dues", "Curr. Month", "Total Payable"];
    const tableRows = filteredBills.map(bill => [
      bill.messAccount,
      bill.name,
      `Rs. ${bill.previousDues}`,
      `Rs. ${bill.currentMonthTotal}`,
      `Rs. ${bill.totalPayable}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: '#16181d', textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        4: { fontStyle: 'bold' }
      }
    });

    doc.save(`Mess_High_Balance_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="card border-0 shadow-sm overflow-hidden mb-4">
      <div className="card-header bg-sidebar-dark text-white p-3 border-0 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold"><i className="bi bi-wallet2 me-2"></i>High Balance Alerts</h5>
        <button className="btn btn-sm btn-light fw-bold px-3" onClick={exportPDF} disabled={filteredBills.length === 0}>
          <i className="bi bi-file-earmark-pdf me-1"></i> Export PDF
        </button>
      </div>
      <div className="card-body p-4">
        
        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-muted">Min. Previous Dues (Threshold)</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0">₹</span>
              <input 
                type="number" 
                className="form-control bg-light border-0" 
                value={threshold} 
                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)} 
              />
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold text-muted">Search Student</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0"><i className="bi bi-search"></i></span>
              <input 
                type="text" 
                className="form-control bg-light border-0" 
                placeholder="Name or Account #" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-dark fw-medium">Calculating real-time bills...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="small text-uppercase fw-bold text-dark">Student</th>
                  <th className="small text-uppercase fw-bold text-dark">Account</th>
                  <th className="small text-uppercase fw-bold text-dark text-end">Prev. Dues</th>
                  <th className="small text-uppercase fw-bold text-dark text-end">Current Month</th>
                  <th className="small text-uppercase fw-bold text-dark text-end">Total Payable</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted italic">No students exceed the threshold.</td>
                  </tr>
                ) : (
                  filteredBills.map(bill => (
                    <tr key={bill._id}>
                      <td className="fw-bold text-dark">{bill.name}</td>
                      <td><span className="badge bg-light text-dark border fw-bold">{bill.messAccount}</span></td>
                      <td className="text-end text-dark">₹{bill.previousDues.toLocaleString()}</td>
                      <td className="text-end text-dark">₹{bill.currentMonthTotal.toLocaleString()}</td>
                      <td className="text-end"><span className="fw-bold text-danger fs-5">₹{bill.totalPayable.toLocaleString()}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 text-center">
          <small className="text-dark fw-bold">
            <i className="bi bi-info-circle me-1 text-primary"></i>
            Showing {filteredBills.length} students with Previous Dues {'>'}= ₹{threshold}
          </small>
        </div>
      </div>
    </div>
  );
};

export default BillOverview;
