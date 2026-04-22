import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const InventorySnapshot = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/api/butler/inventory');
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CRITICAL': return 'bg-danger';
      case 'LOW': return 'bg-warning text-dark';
      default: return 'bg-success';
    }
  };

  if (loading) return <div>Loading inventory...</div>;

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title fw-bold mb-4 d-flex justify-content-between align-items-center">
          Inventory Snapshot
          <button className="btn btn-sm btn-outline-secondary border-0" onClick={fetchInventory}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </h5>
        
        {items.length === 0 ? (
          <div className="text-center py-4 text-muted">No inventory records found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase">
                  <th>Item</th>
                  <th className="text-center">Stock</th>
                  <th className="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{item.itemName}</td>
                    <td className="text-center">
                      <span className="fs-5">{item.quantity}</span>
                      <small className="ms-1 text-muted">{item.unit}</small>
                    </td>
                    <td className="text-end">
                      <span className={`badge rounded-pill ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventorySnapshot;
