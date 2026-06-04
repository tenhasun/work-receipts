# Agents

This file serves as a reference for autonomous agents and tools operating in this repository.

## Project Overview

**Payment Splitter (work-receipts)** is a minimalist, local-first web application designed to automatically split income payments and generate professional PDF receipts. 

### Core Features
- **Dynamic Line Items**: Users input itemized service names and amounts. The total is automatically derived.
- **Fixed Split Logic**: Payments are automatically broken down into predefined tiers:
  - Taxes (15%)
  - Utilities (Electricity & Wifi) (5%)
  - Laurence (15%)
  - Sylvia & Lillian (65%)
- **Local Storage (No Backend)**: Uses the browser's **File System Access API** to read, write, and append directly to a local `.csv` file. 
- **Caching**: The spreadsheet data is cached locally via IndexedDB (`idb-keyval`) so past history loads instantly without re-requesting browser file permissions on refresh.
- **Client-Side PDF Generation**: Uses a hidden HTML template paired with `html2canvas` (using fast JPEG compression for smaller sizes) and `jspdf` to generate styled PDF receipts on the fly.

## Technical Stack & Key Notes

- **Framework**: React + Vite
- **Package Manager**: pnpm
- **Styling**: Vanilla CSS (`src/index.css`) with a focus on premium aesthetics, micro-animations, and glassmorphism.
- **Icons**: Lucide React
- **Architecture**: Separated components in `src/components/`:
  - `SplitCalculator.jsx` (Main state and layout container)
  - `StorageSection.jsx` (File loading / creation UI)
  - `LineItemsForm.jsx` (Dynamic itemized inputs)
  - `HistoryTable.jsx` (Past CSV records display)
  - `ReceiptTemplate.jsx` (Hidden DOM template for PDFs)
  - `DeleteModal.jsx` (Custom deletion warning)

### Design Directives
- **Aesthetics First**: Avoid generic AI-looking UIs. Emphasize bold typography (Google Sans/Outfit), clear hierarchy, and minimalist design.
- **Zero-Backend Constraint**: Do not introduce databases or external servers; all data must securely persist locally via the File System Access API and browser storage.
