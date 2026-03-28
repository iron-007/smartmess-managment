import React, { useState } from "react";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([
    { _id: "mock1", title: "Mess Closed for Maintenance", content: "The mess will be closed from 3 PM to 5 PM today for deep cleaning.", priority: "High", date: "2023-10-25" },
    { _id: "mock2", title: "Special Diwali Menu", content: "Check out the special menu for Diwali this Sunday! Guests are welcome at ₹120 per plate.", priority: "Normal", date: "2023-10-24" }
  ]);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("Normal");

  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNotice = {
      _id: Date.now().toString(), // Using Date.now for mock _id
      title,
      content,
      priority,
      date: new Date().toISOString().split("T")[0]
    };

    setNotices([newNotice, ...notices]);
    setTitle("");
    setContent("");
    setPriority("Normal");
    
    // 👉 Future Backend API integration goes here
    // fetch('/api/admin/notices', { method: 'POST', body: JSON.stringify(newNotice) })
  };

  const handleDelete = (_id) => {
    setNotices(notices.filter(notice => notice._id !== _id));
    // 👉 Future Backend API integration goes here
    // fetch(`/api/admin/notices/${id}`, { method: 'DELETE' })
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4 fw-bold text-primary">Notice Board</h2>
      
      <div className="row g-4">
        {/* Add New Notice Form */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">Publish New Notice</h5>
              <form onSubmit={handleAddNotice}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter notice title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Content</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Notice details..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required 
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Priority</label>
                  <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Normal">Normal</option>
                    <option value="High">High / Urgent</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold">
                  <i className="bi bi-megaphone me-2"></i> Publish Notice
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Active Notices List */}
        <div className="col-lg-7">
          <div className="d-flex flex-column gap-3">
            {notices.length === 0 ? (
              <div className="text-center text-muted p-5 bg-white rounded-4 shadow-sm">No active notices.</div>
            ) : (
              notices.map(notice => (
                <div key={notice._id} className={`card shadow-sm border-0 rounded-4 border-start border-4 ${notice.priority === 'High' ? 'border-danger' : 'border-primary'}`}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold mb-0">{notice.title}</h5>
                      <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(notice._id)} title="Delete Notice">
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                    <p className="text-muted mb-3">{notice.content}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small"><i className="bi bi-calendar-event me-1"></i> {notice.date}</span>
                      <span className={`badge ${notice.priority === 'High' ? 'bg-danger' : 'bg-primary'}`}>{notice.priority}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;