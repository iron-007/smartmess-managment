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
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

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
          setNotices([data.notice, ...notices]); 
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
    <div className="container-fluid py-2">
      
      {/* PAGE HEADER */}
      <div className="mb-4">
        <h2 className="nav-title fw-bold m-0">
          <i className="bi bi-megaphone-fill me-2"></i>Notice Board
        </h2>
        <p className="text-muted small mt-1 mb-0">Broadcast announcements, rules, and updates to all students</p>
      </div>
      
      <div className="row g-4">
        
        {/* LEFT COLUMN: Form */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden sticky-top" style={{ top: '90px', zIndex: 1 }}>
            
            {/* Dark Header */}
            <div className="bg-sidebar-dark p-3 px-4">
               <h5 className="fw-bold m-0 text-white">
                 <i className="bi bi-pencil-square text-white-50 me-2"></i>
                 {editingId ? "Edit Notice" : "Compose Notice"}
               </h5>
            </div>

            <div className="card-body p-4 bg-white">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small">Notice Title</label>
                  <input 
                    type="text" 
                    className="form-control modern-input" 
                    placeholder="E.g., Mess closed for maintenance..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small">Message Content</label>
                  <textarea 
                    className="form-control modern-input" 
                    rows="4" 
                    placeholder="Type the full announcement here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required 
                  ></textarea>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary small">Priority Level</label>
                    <select className="form-select modern-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="Normal">Normal</option>
                      <option value="High">High / Urgent</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary small">Valid Until (Optional)</label>
                    <input
                      type="datetime-local"
                      className="form-control modern-input"
                      min={minDateTime}
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4 p-3 bg-light rounded-3 border border-light">
                  <label className="form-label fw-bold text-dark small mb-1">
                    <i className="bi bi-paperclip me-1"></i> Add Attachment {editingId ? "(Leave blank to keep current)" : ""}
                  </label>
                  <input 
                    type="file" 
                    id="noticeAttachment"
                    className="form-control form-control-sm modern-input bg-white" 
                    accept=".pdf,image/*"
                    onChange={(e) => setAttachment(e.target.files[0])}
                  />
                  <div className="form-text small mt-2">Upload a PDF or image if required.</div>
                </div>

                <div className="d-flex flex-column gap-2 mt-4">
                  <button type="submit" className="btn btn-gradient btn-lg w-100 fw-bold rounded-pill shadow-sm">
                    <i className="bi bi-send-fill me-2"></i> {editingId ? "Update Notice" : "Publish Announcement"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-light btn-lg fw-bold rounded-pill border text-muted hover-shadow" onClick={resetForm}>
                      Cancel Editing
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Notice Feed */}
        <div className="col-lg-7">
          
          {/* Feed Controls */}
          <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-light">
            <h5 className="fw-bold text-dark m-0 d-flex align-items-center">
              <i className={`bi ${activeTab === 'active' ? 'bi-broadcast text-success' : 'bi-archive text-secondary'} me-2`}></i>
              {activeTab === 'active' ? 'Live Announcements' : 'Notice Archive'}
            </h5>
            
            <div className="bg-light p-1 rounded-pill border">
              <button 
                type="button" 
                className={`btn btn-sm rounded-pill px-4 fw-semibold ${activeTab === 'active' ? 'btn-white shadow-sm text-dark bg-white' : 'btn-transparent text-muted border-0'}`}
                onClick={() => setActiveTab('active')}
              >
                Active
              </button>
              <button 
                type="button" 
                className={`btn btn-sm rounded-pill px-4 fw-semibold ${activeTab === 'history' ? 'btn-white shadow-sm text-dark bg-white' : 'btn-transparent text-muted border-0'}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>
          </div>

          {/* Notices List */}
          <div className="d-flex flex-column gap-3">
            {displayedNotices.length === 0 ? (
              <div className="text-center text-muted p-5 bg-white rounded-4 shadow-sm border border-light">
                <i className="bi bi-inbox fs-1 text-light mb-3 d-block"></i>
                <h5 className="fw-semibold">No notices found</h5>
                <p className="small">{activeTab === 'active' ? "Your active feed is empty." : "There are no expired notices in the archive."}</p>
              </div>
            ) : (
              displayedNotices.map(notice => {
                const isExpanded = expandedNotices[notice._id];
                const isHighPriority = notice.priority === 'High';
                
                return (
                <div key={notice._id} className={`card shadow-sm border-0 rounded-4 overflow-hidden ${activeTab === 'history' ? 'opacity-75 bg-light' : ''}`}>
                  
                  {/* Left-side color accent for High Priority */}
                  <div className="d-flex h-100">
                    <div className={`${isHighPriority ? 'bg-danger' : 'bg-primary'}`} style={{ width: '4px' }}></div>
                    
                    <div className="card-body p-4 w-100" onClick={() => toggleExpand(notice._id)} style={{ cursor: 'pointer' }}>
                      
                      {/* Notice Header */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                          {isHighPriority && <i className="bi bi-exclamation-circle-fill text-danger me-2"></i>}
                          <h5 className="fw-bold text-dark m-0">
                            {notice.title}
                          </h5>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {canEdit(notice.createdAt) && (
                            <button className="btn btn-sm btn-light text-primary border rounded-pill px-3 fw-medium hover-shadow" onClick={() => handleEdit(notice)}>
                              <i className="bi bi-pencil-square me-1"></i> Edit
                            </button>
                          )}
                          <button className="btn btn-sm btn-light text-danger border rounded-pill px-3 fw-medium hover-shadow" onClick={() => handleDelete(notice._id)}>
                            <i className="bi bi-trash3 me-1"></i> Delete
                          </button>
                        </div>
                      </div>

                      {/* Metadata row */}
                      <div className="d-flex align-items-center mb-3 gap-3">
                        <span className={`badge rounded-pill ${isHighPriority ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25' : 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25'}`}>
                          {notice.priority} Priority
                        </span>
                        <small className="text-muted fw-medium">
                          <i className="bi bi-clock me-1"></i> {new Date(notice.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>

                      {/* Expandable Content */}
                      {isExpanded ? (
                        <div className="mt-3 pt-3 border-top border-light animate__animated animate__fadeIn">
                          <p className="text-secondary mb-3" style={{ whiteSpace: 'pre-line' }}>{notice.content}</p>
                          
                          {notice.attachmentUrl && (
                            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                              <a href={`http://localhost:5000/${notice.attachmentUrl}`} target="_blank" rel="noopener noreferrer" 
                                 className="btn btn-light btn-sm border text-dark fw-medium rounded-pill shadow-sm px-4">
                                <i className="bi bi-file-earmark-text text-primary me-2"></i> View Attached Document
                              </a>
                            </div>
                          )}

                          {notice.validUntil && (
                            <div className="mt-3 p-2 bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-25 d-inline-block">
                              <small className="text-dark fw-medium">
                                <i className="bi bi-hourglass-split text-warning me-1"></i> 
                                {activeTab === 'history' ? 'Expired on:' : 'Valid until:'} {new Date(notice.validUntil).toLocaleString()}
                              </small>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted small mt-2">
                          <i className="bi bi-arrows-expand me-1"></i> Click to read full notice
                        </div>
                      )}
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