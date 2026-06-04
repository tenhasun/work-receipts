import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { getSavedFileHandle, selectNewFile, createNewFile, appendToCSV, readCSV, getCachedHistory, saveFullCSV } from '../utils/storage';
import { generatePDF } from '../utils/pdfGenerator';

import StorageSection from './StorageSection';
import LineItemsForm from './LineItemsForm';
import HistoryTable from './HistoryTable';
import ReceiptTemplate from './ReceiptTemplate';
import DeleteModal from './DeleteModal';

const getFormattedFilename = (baseDateStr) => {
  const d = new Date();
  const datePart = baseDateStr.replace(/-/g, '.');
  
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');
  
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  const timePart = `${hoursStr}.${minutes}.${seconds}${ampm}`;
  return `Receipt ${datePart}-${timePart}.pdf`;
};

export default function SplitCalculator() {
  // State
  const [lineItems, setLineItems] = useState([{ name: '', amount: '' }]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  const [fileHandle, setFileHandle] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('');
  const [pdfData, setPdfData] = useState(null); 
  const [itemToDelete, setItemToDelete] = useState(null);

  // Derived Calculations
  const parsedAmount = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
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
    splits,
    lineItems
  };

  // Lifecycle
  useEffect(() => {
    async function loadInitialData() {
      const handle = await getSavedFileHandle();
      if (handle) setFileHandle(handle);
      
      const cachedHistory = await getCachedHistory();
      if (cachedHistory && cachedHistory.length > 0) {
        setHistory(cachedHistory.reverse());
      }
    }
    loadInitialData();
  }, []);

  // Handlers - Storage
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
      setHistory(data.reverse());
    } catch (e) {
      console.error(e);
      setStatus('Could not read history. Please select the file again.');
    }
  };

  // Handlers - Form & PDF Generation
  const handleSaveAndGenerate = async (e) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setStatus('Please enter valid line items.');
      return;
    }

    const validLineItems = lineItems.filter(item => item.name && item.amount);
    const lineItemsStr = validLineItems
      .map(item => `${item.name} ($${parseFloat(item.amount).toFixed(2)})`)
      .join(', ');

    const data = {
      totalAmount: parsedAmount,
      lineItemsStr,
      date,
      note,
      splits,
    };

    try {
      await generatePDF('receipt-template', getFormattedFilename(date));

      if (fileHandle) {
        await appendToCSV(fileHandle, data);
        setStatus('Saved to spreadsheet and PDF downloaded.');
        loadHistory();
      } else {
        setStatus('PDF generated. (No spreadsheet selected to save to).');
      }

      setLineItems([{ name: '', amount: '' }]);
      setNote('');
    } catch (e) {
      console.error(e);
      setStatus(e.message || 'Error saving to spreadsheet.');
    }
  };

  const handleGenerateHistoryPDF = async (row) => {
    try {
      const lineItemsStr = row['Line Items'] || '';
      const parsedItems = [];
      const regex = /([^,]+)\s+\(\$([\d.]+)\)/g;
      let match;
      while ((match = regex.exec(lineItemsStr)) !== null) {
        parsedItems.push({ name: match[1].trim(), amount: parseFloat(match[2]) });
      }

      if (parsedItems.length === 0) {
        parsedItems.push({ name: 'Payment', amount: parseFloat(row['Total Amount']) });
      }

      const data = {
        totalAmount: parseFloat(row['Total Amount']),
        date: row.Date,
        note: row.Note || '',
        lineItems: parsedItems,
        splits: {
          electricity: parseFloat(row.Electricity || row.Utilities),
          laurence: parseFloat(row.Laurence),
          taxes: parseFloat(row.Taxes),
          sylviaLillian: parseFloat(row['Sylvia & Lillian']),
        }
      };

      flushSync(() => {
        setPdfData(data);
      });
      
      await generatePDF('receipt-template', getFormattedFilename(data.date));
      
      flushSync(() => {
        setPdfData(null);
      });
    } catch (e) {
      console.error('Error generating history PDF', e);
      setStatus('Failed to generate PDF from history.');
    }
  };

  // Handlers - Deletion
  const handleDeleteClick = (index) => setItemToDelete(index);
  const cancelDelete = () => setItemToDelete(null);
  
  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    try {
      const newHistory = history.filter((_, i) => i !== itemToDelete);
      const csvData = [...newHistory].reverse();
      
      await saveFullCSV(fileHandle, csvData);
      
      setHistory(newHistory);
      setStatus('Record deleted successfully.');
    } catch (e) {
      console.error(e);
      setStatus(e.message || 'Error deleting record.');
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="calculator-container">
      <div className="header">
        <h1>Payment Splitter</h1>
        <p>A minimalist tool for splitting payments</p>
      </div>

      <StorageSection 
        fileHandle={fileHandle}
        historyLength={history.length}
        loadHistory={loadHistory}
        handleSelectFile={handleSelectFile}
        handleCreateFile={handleCreateFile}
      />

      <LineItemsForm 
        lineItems={lineItems}
        setLineItems={setLineItems}
        date={date}
        setDate={setDate}
        note={note}
        setNote={setNote}
        parsedAmount={parsedAmount}
        splits={splits}
        handleSaveAndGenerate={handleSaveAndGenerate}
        status={status}
      />

      <HistoryTable 
        history={history}
        loadHistory={loadHistory}
        handleGenerateHistoryPDF={handleGenerateHistoryPDF}
        handleDeleteClick={handleDeleteClick}
      />

      <ReceiptTemplate activeData={activeData} />

      <DeleteModal 
        itemToDelete={itemToDelete}
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
      />
    </div>
  );
}
