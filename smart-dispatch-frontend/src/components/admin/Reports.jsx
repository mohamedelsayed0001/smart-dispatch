import React from 'react';
import './styles/Reports.css';

const Reports = ({ reports, totalPages, currentPage, setCurrentPage }) => {
  return (
    <div className="view-container">
      <h1 className="page-title">Reports</h1>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Report Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.title}</td>
                <td>{report.type}</td>
                <td>{report.date}</td>
                <td>
                  <span className={`badge ${report.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-primary"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
