import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

export default function StorageSection({
  fileHandle,
  historyLength,
  loadHistory,
  handleSelectFile,
  handleCreateFile
}) {
  return (
    <div className="storage-section">
      <div className="file-status">
        <FileSpreadsheet size={20} />
        <span>
          {fileHandle ? (
            <>Linked to local spreadsheet: <strong>{fileHandle.name}</strong></>
          ) : (
            'No local spreadsheet linked'
          )}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {fileHandle && historyLength === 0 && (
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
  );
}
