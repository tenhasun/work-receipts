# Payment Splitter

A minimalist, client-side web application designed to take a total payment amount, calculate specific percentage splits, generate a clean PDF receipt, and sync history to a local CSV file.

## Features

- **Automated Splits**: Instantly calculates pre-defined payment splits:
  - 5% Electricity
  - 15% Laurence
  - 15% Taxes
  - 65% Sylvia & Lillian
- **Local Spreadsheet Sync**: Leverages the modern browser File System Access API to connect directly to a local `.csv` file. Payment history is automatically appended to your file.
- **Persistent Storage**: Remembers your spreadsheet across sessions using IndexedDB, meaning you only need to "allow access" without digging through folders again.
- **PDF Receipts**: Instantly generates clean, text-based PDF receipts summarizing the transaction.
- **Minimalist Design**: A calm, focused UI with smooth typography and dark/light accents.

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [pnpm](https://pnpm.io/) for package management
- `idb-keyval` for saving local file handles securely
- `papaparse` for reading and writing CSV files
- `jspdf` for creating local PDF receipts
- `lucide-react` for simple iconography
- Vanilla CSS with CSS Variables

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (v9+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tenhasun/work-receipts.git
   cd work-receipts
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm run dev
   ```

## Using the File System Storage

Because this application uses the **File System Access API**, it requires a secure context (HTTPS or `localhost`).
1. Click **Select CSV File**.
2. Select or create an empty `.csv` file anywhere on your computer.
3. Your web browser will ask for permission to edit the file.
4. From now on, whenever you save a receipt, it will directly modify that CSV file!

## Deployment

This project is configured to automatically deploy to **GitHub Pages** whenever you push to the `main` branch, via the included GitHub Actions workflow.

1. Ensure the `base` in `vite.config.js` matches your repository name (currently `/work-receipts/`).
2. Push your code to the `main` branch.
3. In your GitHub repository settings, go to **Pages** and ensure the source is set to **GitHub Actions**.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
