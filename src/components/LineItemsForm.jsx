import React from 'react';
import { Save, PlusCircle, Trash2 } from 'lucide-react';

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
  status
}) {
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
    <form onSubmit={handleSaveAndGenerate} className="split-form">
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
  );
}
