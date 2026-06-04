import { get, set } from 'idb-keyval';
import Papa from 'papaparse';

const FILE_HANDLE_KEY = 'spreadsheet_file_handle';

export async function getSavedFileHandle() {
  try {
    return await get(FILE_HANDLE_KEY);
  } catch (err) {
    console.error('Error getting file handle:', err);
    return null;
  }
}

export async function selectNewFile() {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'CSV Files',
          accept: {
            'text/csv': ['.csv'],
          },
        },
      ],
    });
    await set(FILE_HANDLE_KEY, fileHandle);
    return fileHandle;
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Error selecting file:', err);
    }
    return null;
  }
}

export async function createNewFile() {
  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: 'work_receipts.csv',
      types: [
        {
          description: 'CSV Files',
          accept: {
            'text/csv': ['.csv'],
          },
        },
      ],
    });
    
    const writable = await fileHandle.createWritable();
    await writable.write(''); // Initialize empty
    await writable.close();
    
    await set(FILE_HANDLE_KEY, fileHandle);
    return fileHandle;
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Error creating file:', err);
    }
    return null;
  }
}

export async function verifyPermission(fileHandle, readWrite = true) {
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}

export async function appendToCSV(fileHandle, rowData) {
  const hasPermission = await verifyPermission(fileHandle, true);
  if (!hasPermission) {
    throw new Error('Permission denied to write to file. Please select the file again.');
  }

  const file = await fileHandle.getFile();
  const text = await file.text();

  // Parse existing data
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  let data = parsed.data;

  const newRow = {
    Date: rowData.date,
    Note: rowData.note,
    'Total Amount': rowData.totalAmount.toFixed(2),
    Electricity: rowData.splits.electricity.toFixed(2),
    Laurence: rowData.splits.laurence.toFixed(2),
    Taxes: rowData.splits.taxes.toFixed(2),
    'Sylvia & Lillian': rowData.splits.sylviaLillian.toFixed(2),
  };

  data.push(newRow);

  const newCsv = Papa.unparse(data, { header: true });

  const writable = await fileHandle.createWritable();
  await writable.write(newCsv);
  await writable.close();
}

export async function readCSV(fileHandle) {
  const hasPermission = await verifyPermission(fileHandle, false);
  if (!hasPermission) {
    throw new Error('Permission denied to read file.');
  }
  const file = await fileHandle.getFile();
  const text = await file.text();
  return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
}
