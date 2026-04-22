import React from 'react';

const NoticeFeed = ({ notices }) => {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="card-title fw-bold text-primary mb-4">Notice Board</h5>
        {(!notices || notices.length === 0) ? (
          <p className="text-muted small">No active notices.</p>
        ) : (
          <div className="overflow-auto" style={{ maxHeight: '400px' }}>
            {notices.map((notice, index) => (
              <div key={index} className="mb-4 pb-3 border-bottom last-child-border-0">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="fw-bold mb-0 text-dark">{notice.title}</h6>
                  {notice.priority === 'High' && <span className="badge bg-danger ms-2">High</span>}
                </div>
                <small className="text-muted d-block mb-2">Posted on: {new Date(notice.createdAt).toLocaleDateString()}</small>
                <p className="small text-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>
                  {notice.content}
                </p>
                {notice.attachmentUrl && (
                  <a 
                    href={`/${notice.attachmentUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary mt-2 py-1 px-2 small"
                  >
                    View Attachment
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeFeed;
