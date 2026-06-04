import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { getSavedFileHandle, selectNewFile, createNewFile, appendToCSV, readCSV, getCachedHistory } from '../utils/storage';
import { generatePDF } from '../utils/pdfGenerator';
import { FileSpreadsheet, Save, History, CheckCircle2, Download } from 'lucide-react';

export default function SplitCalculator() {
  const [totalAmount, setTotalAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  const [fileHandle, setFileHandle] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('');
  const [pdfData, setPdfData] = useState(null); // Used for rendering historical receipts

  // Derived calculations for the live form
  const parsedAmount = parseFloat(totalAmount) || 0;
  const splits = {
    electricity: parsedAmount * 0.05,
    laurence: parsedAmount * 0.15,
    taxes: parsedAmount * 0.15,
    sylviaLillian: parsedAmount * 0.65,
  };

  const activeData = pdfData || {
    totalAmount: parsedAmount,
    date,
    note,
    splits
  };

  useEffect(() => {
    async function loadInitialData() {
      // 1. Load the file handle if we have one
      const handle = await getSavedFileHandle();
      if (handle) {
        setFileHandle(handle);
      }
      
      // 2. Automatically load history from cache without needing permission
      const cachedHistory = await getCachedHistory();
      if (cachedHistory && cachedHistory.length > 0) {
        setHistory(cachedHistory.reverse());
      }
    }
    loadInitialData();
  }, []);

  const handleSelectFile = async () => {
    try {
      const handle = await selectNewFile();
      if (handle) {
        setFileHandle(handle);
        setStatus('Spreadsheet selected successfully.');
        loadHistory(handle);
      }
    } catch (e) {
      setStatus('Failed to select file.');
    }
  };

  const handleCreateFile = async () => {
    try {
      const handle = await createNewFile();
      if (handle) {
        setFileHandle(handle);
        setStatus('New spreadsheet created successfully.');
        loadHistory(handle);
      }
    } catch (e) {
      setStatus('Failed to create file.');
    }
  };

  const loadHistory = async (handle = fileHandle) => {
    if (!handle) return;
    try {
      const data = await readCSV(handle);
      setHistory(data.reverse()); // Show newest first
    } catch (e) {
      console.error(e);
      setStatus('Could not read history. Please select the file again.');
    }
  };

  const handleSaveAndGenerate = async (e) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setStatus('Please enter a valid amount.');
      return;
    }

    const data = {
      totalAmount: parsedAmount,
      date,
      note,
      splits,
    };

    try {
      // Generate the PDF from the hidden receipt element
      await generatePDF('receipt-template', `receipt_${date}.pdf`);

      if (fileHandle) {
        await appendToCSV(fileHandle, data);
        setStatus('Saved to spreadsheet and PDF downloaded.');
        loadHistory();
      } else {
        setStatus('PDF generated. (No spreadsheet selected to save to).');
      }

      // Reset form
      setTotalAmount('');
      setNote('');
    } catch (e) {
      console.error(e);
      setStatus(e.message || 'Error saving to spreadsheet.');
    }
  };

  const handleGenerateHistoryPDF = async (row) => {
    try {
      const data = {
        totalAmount: parseFloat(row['Total Amount']),
        date: row.Date,
        note: row.Note || '',
        splits: {
          electricity: parseFloat(row.Electricity),
          laurence: parseFloat(row.Laurence),
          taxes: parseFloat(row.Taxes),
          sylviaLillian: parseFloat(row['Sylvia & Lillian']),
        }
      };

      flushSync(() => {
        setPdfData(data);
      });
      
      await generatePDF('receipt-template', `receipt_${data.date}.pdf`);
      
      flushSync(() => {
        setPdfData(null);
      });
    } catch (e) {
      console.error('Error generating history PDF', e);
      setStatus('Failed to generate PDF from history.');
    }
  };

  return (
    <div className="calculator-container">
      <div className="header">
        <h1>Payment Splitter</h1>
        <p>A minimalist tool for splitting payments</p>
      </div>

      <div className="storage-section">
        <div className="file-status">
          <FileSpreadsheet size={20} />
          <span>
            {fileHandle ? `Linked to local spreadsheet: ${fileHandle.name}` : 'No local spreadsheet linked'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {fileHandle && history.length === 0 && (
            <button className="secondary-btn" onClick={() => loadHistory(fileHandle)} type="button">
              Load Previous Records
            </button>
          )}
          <button className="secondary-btn" onClick={handleSelectFile} type="button">
            {fileHandle ? 'Change File' : 'Open CSV'}
          </button>
          {!fileHandle && (
            <button className="secondary-btn" onClick={handleCreateFile} type="button">
              Create New CSV
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveAndGenerate} className="split-form">
        <div className="form-group">
          <label htmlFor="totalAmount">Total Amount ($)</label>
          <input
            type="number"
            id="totalAmount"
            step="0.01"
            min="0"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="0.00"
            required
            className="amount-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="note">Note (Optional)</label>
            <input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Client X payment"
            />
          </div>
        </div>

        <div className="breakdown">
          <h3>Breakdown</h3>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <span className="label">Electricity (5%)</span>
              <span className="value">${splits.electricity.toFixed(2)}</span>
            </div>
            <div className="breakdown-item">
              <span className="label">Laurence (15%)</span>
              <span className="value">${splits.laurence.toFixed(2)}</span>
            </div>
            <div className="breakdown-item">
              <span className="label">Taxes (15%)</span>
              <span className="value">${splits.taxes.toFixed(2)}</span>
            </div>
            <div className="breakdown-item highlight">
              <span className="label">Sylvia & Lillian (65%)</span>
              <span className="value">${splits.sylviaLillian.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button type="submit" className="primary-btn">
          <Save size={18} />
          Save & Generate PDF
        </button>
        {status && <div className="status-message">{status}</div>}
      </form>

      {history.length > 0 && (
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
                  <th>Amount</th>
                  <th>Electricity</th>
                  <th>Laurence</th>
                  <th>Taxes</th>
                  <th>S & L</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    <td>{row.Date}</td>
                    <td>${row['Total Amount']}</td>
                    <td>${row.Electricity}</td>
                    <td>${row.Laurence}</td>
                    <td>${row.Taxes}</td>
                    <td>${row['Sylvia & Lillian']}</td>
                    <td className="note-cell">{row.Note}</td>
                    <td>
                      <button 
                        type="button" 
                        className="text-btn" 
                        onClick={() => handleGenerateHistoryPDF(row)}
                        title="Download Receipt"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hidden Receipt Template for PDF Generation */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div id="receipt-template" className="receipt-template">
          <div className="receipt-header">
            <CheckCircle2 size={32} color="#000" />
            <h2>Payment Receipt</h2>
            <p className="receipt-date">{activeData.date}</p>
          </div>
          
          <div className="receipt-amount-box">
            <span>Total Received</span>
            <div className="receipt-big-amount">${activeData.totalAmount.toFixed(2)}</div>
            {activeData.note && <div className="receipt-note">"{activeData.note}"</div>}
          </div>

          <div className="receipt-breakdown">
            <div className="receipt-row">
              <span className="receipt-label">Electricity Fund (5%)</span>
              <span className="receipt-value">${activeData.splits.electricity.toFixed(2)}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Laurence (15%)</span>
              <span className="receipt-value">${activeData.splits.laurence.toFixed(2)}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Taxes (15%)</span>
              <span className="receipt-value">${activeData.splits.taxes.toFixed(2)}</span>
            </div>
            <div className="receipt-row receipt-highlight">
              <span className="receipt-label">Sylvia & Lillian (65%)</span>
              <span className="receipt-value">${activeData.splits.sylviaLillian.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="receipt-footer">
            Generated by Payment Splitter
          </div>
        </div>
      </div>
    </div>
  );
}
