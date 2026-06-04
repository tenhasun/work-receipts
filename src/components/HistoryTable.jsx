import React from 'react';
import { History, Download, Trash2 } from 'lucide-react';

export default function HistoryTable({
  history,
  loadHistory,
  handleGenerateHistoryPDF,
  handleDeleteClick
}) {
  if (history.length === 0) return null;

  return (
    <div className="history-section">
      <div className="history-header">
        <h3><History size={18} /> Recent History</h3>
        <button className="text-btn" onClick={() => loadHistory()} type="button">Refresh</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Tax</th>
              <th>Util.</th>
              <th>Lrn.</th>
              <th>S&L</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 5).map((row, i) => (
              <tr key={i}>
                <td>{row.Date}</td>
                <td className="note-cell" style={{ maxWidth: '150px' }}>{row['Line Items'] || '-'}</td>
                <td><b>${row['Total Amount']}</b></td>
                <td>${row.Taxes}</td>
                <td>${row.Electricity}</td>
                <td>${row.Laurence}</td>
                <td>${row['Sylvia & Lillian']}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      type="button" 
                      className="icon-btn" 
                      onClick={() => handleGenerateHistoryPDF(row)}
                      title="Download Receipt"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      type="button" 
                      className="icon-btn text-danger" 
                      onClick={() => handleDeleteClick(i)}
                      title="Delete Record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
