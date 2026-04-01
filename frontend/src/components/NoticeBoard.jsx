import React, { useState, useEffect } from "react";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [attachment, setAttachment] = useState(null);
  const [validUntil, setValidUntil] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [editingId, setEditingId] = useState(null);
  const [expandedNotices, setExpandedNotices] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [minDateTime] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    // Format for datetime-local input min attribute
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  // Force re-render every minute to update the 5-min edit window
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial notices on component mount
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/admin/notices", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setNotices(data.notices || []);
        }
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      }
    };
    fetchNotices();
  }, []);

  const toggleExpand = (id) => {
    setExpandedNotices(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const canEdit = (createdAt) => {
    if (!createdAt) return false;
    const createdTime = new Date(createdAt).getTime();
    return (currentTime - createdTime) <= 5 * 60 * 1000;
  };

  const handleEdit = (notice) => {
    setEditingId(notice._id);
    setTitle(notice.title);
    setContent(notice.content);
    setPriority(notice.priority);
    setValidUntil(notice.validUntil ? new Date(notice.validUntil).toISOString().slice(0, 16) : "");
    setAttachment(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("priority", priority);
    if (!editingId) {
      formData.append("date", new Date().toISOString());
    }
    
    if (attachment) {
      formData.append("attachment", attachment);
    }
    if (validUntil) {
      formData.append("validUntil", validUntil);
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingId 
        ? `http://localhost:5000/api/admin/notices/${editingId}`
        : "http://localhost:5000/api/admin/notices";
      const method = editingId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          setNotices(notices.map(n => n._id === editingId ? data.notice : n));
        } else {
          setNotices([data.notice, ...notices]); // Add the newly created notice from the backend to the top
        }
        resetForm();
      } else {
        const errData = await response.json();
        alert(errData.message || "Failed to save notice");
      }
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("Network error occurred.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPriority("Normal");
    setAttachment(null);
    setValidUntil("");
    setEditingId(null);
    const fileInput = document.getElementById("noticeAttachment");
    if (fileInput) fileInput.value = "";
  };

  const handleDelete = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/admin/notices/${_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      setNotices(notices.filter(notice => notice._id !== _id));
    } else {
      alert("Failed to delete notice");
    }
  };

  const now = new Date();
  
  const activeNotices = notices.filter(notice => !notice.validUntil || new Date(notice.validUntil) >= now);
  const historyNotices = notices.filter(notice => notice.validUntil && new Date(notice.validUntil) < now);
    
  const displayedNotices = activeTab === 'active' ? activeNotices : historyNotices;

  return (
    <div className="container-fluid">
      <h2 className="mb-4 fw-bold text-primary">Notice Board</h2>
      
      <div className="row g-4">
        {/* Add New Notice Form */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4">{editingId ? "Edit Notice" : "Publish New Notice"}</h5>
              <form onSubmit={handleSubmit}>
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

                <div className="mb-4">
                  <label className="form-label fw-semibold">Valid Until (Optional)</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    min={minDateTime}
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                  <div className="form-text small">Notice will automatically vanish after this date and time.</div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Attachment {editingId ? "(Leave blank to keep existing)" : "(Optional)"}</label>
                  <input 
                    type="file" 
                    id="noticeAttachment"
                    className="form-control" 
                    accept=".pdf,image/*"
                    onChange={(e) => setAttachment(e.target.files[0])}
                  />
                  <div className="form-text small">Accepts PDF or image files.</div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary btn-lg w-100 fw-semibold">
                    <i className="bi bi-megaphone me-2"></i> {editingId ? "Update Notice" : "Publish Notice"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-secondary btn-lg fw-semibold" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Notices List (Active / History) */}
        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">{activeTab === 'active' ? 'Active Notices' : 'Notice History'}</h5>
            <div className="btn-group" role="group">
              <button 
                type="button" 
                className={`btn btn-sm ${activeTab === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('active')}
              >
                Active
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>
          </div>

          <div className="d-flex flex-column gap-3">
            {displayedNotices.length === 0 ? (
              <div className="text-center text-muted p-5 bg-white rounded-4 shadow-sm">
                {activeTab === 'active' ? "No active notices." : "No expired notices in history."}
              </div>
            ) : (
              displayedNotices.map(notice => {
                const isExpanded = expandedNotices[notice._id];
                return (
                <div key={notice._id} className={`card shadow-sm border-0 rounded-4 border-start border-4 ${notice.priority === 'High' ? 'border-danger' : 'border-primary'} ${activeTab === 'history' ? 'opacity-75 bg-light' : ''}`}>
                  <div className="card-body p-4" onClick={() => toggleExpand(notice._id)} style={{ cursor: 'pointer' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold mb-0">
                        <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} me-2 small text-muted`}></i>
                        {notice.title}
                      </h5>
                      <div onClick={(e) => e.stopPropagation()}>
                        {canEdit(notice.createdAt) && (
                          <button className="btn btn-sm btn-outline-secondary border-0 me-2" onClick={() => handleEdit(notice)} title="Edit Notice">
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                        <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(notice._id)} title="Delete Notice">
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-3">
                        <p className="text-muted mb-3">{notice.content}</p>
                        {notice.attachmentUrl && (
                          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                            <a href={`http://localhost:5000/${notice.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-paperclip me-1"></i> View Attachment
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="text-muted small">
                        <i className="bi bi-calendar-event me-1"></i> Published: {new Date(notice.date).toLocaleString()}
                        {notice.validUntil && (
                          <span className="ms-3 text-warning">
                            <i className="bi bi-hourglass-split me-1"></i> {activeTab === 'history' ? 'Expired:' : 'Expires:'} {new Date(notice.validUntil).toLocaleString()}
                          </span>
                        )}
                      </span>
                      <span className={`badge ${notice.priority === 'High' ? 'bg-danger' : 'bg-primary'}`}>{notice.priority}</span>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;