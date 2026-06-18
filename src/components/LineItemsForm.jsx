import React from 'react';
import { Save, Download, PlusCircle, Trash2 } from 'lucide-react';

export default function LineItemsForm({
  lineItems,
  setLineItems,
  date,
  setDate,
  note,
  setNote,
  parsedAmount,
  splits,
  handleSaveAndGenerate,
  status,
  splitSylviaLillian,
  setSplitSylviaLillian
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const isDownload = e.nativeEvent.submitter?.name === 'download';
    handleSaveAndGenerate(isDownload);
  };
  const handleAddLineItem = () => setLineItems([...lineItems, { name: '', amount: '' }]);
  const handleRemoveLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };
  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    setLineItems(newItems);
  };

  return (
    <form onSubmit={handleFormSubmit} className="split-form">
      <div className="line-items-section">
        <div className="line-items-header">
          <h3>Line Items</h3>
        </div>
        {lineItems.map((item, index) => (
          <div key={index} className="line-item-row">
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                placeholder="Item Name (e.g., Logo Design)"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.amount}
                onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)}
                placeholder="Amount ($)"
                required
              />
            </div>
            {lineItems.length > 1 && (
              <button 
                type="button" 
                className="icon-btn text-danger" 
                onClick={() => handleRemoveLineItem(index)}
                title="Remove Item"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
        <button type="button" className="text-btn add-item-btn" onClick={handleAddLineItem}>
          <PlusCircle size={16} /> Add Another Item
        </button>
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

      <div className="form-group checkbox-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input 
          type="checkbox" 
          id="splitSylviaLillian" 
          checked={splitSylviaLillian}
          onChange={(e) => setSplitSylviaLillian(e.target.checked)}
          style={{ width: 'auto', marginBottom: 0 }}
        />
        <label htmlFor="splitSylviaLillian" style={{ margin: 0, cursor: 'pointer' }}>
          Split 65% between Sylvia and Lillian independently
        </label>
      </div>

      <div className="breakdown">
        <div className="breakdown-header">
          <h3>Breakdown</h3>
          <span className="total-badge">Total: ${parsedAmount.toFixed(2)}</span>
        </div>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="label">Taxes (15%)</span>
            <span className="value">${splits.taxes.toFixed(2)}</span>
          </div>
          <div className="breakdown-item">
            <span className="label">Utilities (Electricity & Wifi) (5%)</span>
            <span className="value">${splits.electricity.toFixed(2)}</span>
          </div>
          <div className="breakdown-item">
            <span className="label">Laurence (15%)</span>
            <span className="value">${splits.laurence.toFixed(2)}</span>
          </div>
          {!splitSylviaLillian ? (
            <div className="breakdown-item highlight">
              <span className="label">Sylvia & Lillian (65%)</span>
              <span className="value">${splits.sylviaLillian.toFixed(2)}</span>
            </div>
          ) : (
            <>
              <div className="breakdown-item highlight">
                <span className="label">Sylvia (32.5%)</span>
                <span className="value">${splits.sylvia.toFixed(2)}</span>
              </div>
              <div className="breakdown-item highlight">
                <span className="label">Lillian (32.5%)</span>
                <span className="value">${splits.lillian.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" name="save" className="secondary-btn" style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}>
          <Save size={18} />
          Save Only
        </button>
        <button type="submit" name="download" className="primary-btn" style={{ flex: 1 }}>
          <Download size={18} />
          Save & Download
        </button>
      </div>
      {status && <div className="status-message">{status}</div>}
    </form>
  );
}
