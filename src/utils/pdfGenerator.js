import jsPDF from 'jspdf';

export function generatePDF(data) {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.text('Payment Split Receipt', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Date: ${data.date}`, 20, 50);
  if (data.note) doc.text(`Note: ${data.note}`, 20, 60);
  
  doc.setFontSize(16);
  doc.text(`Total Amount: $${data.totalAmount.toFixed(2)}`, 20, 80);
  
  doc.setFontSize(14);
  doc.text('Breakdown:', 20, 100);
  
  doc.setFontSize(12);
  doc.text(`Electricity (5%): $${data.splits.electricity.toFixed(2)}`, 30, 120);
  doc.text(`Laurence (15%): $${data.splits.laurence.toFixed(2)}`, 30, 135);
  doc.text(`Taxes (15%): $${data.splits.taxes.toFixed(2)}`, 30, 150);
  doc.text(`Sylvia & Lillian (65%): $${data.splits.sylviaLillian.toFixed(2)}`, 30, 165);
  
  doc.save(`receipt_${data.date}.pdf`);
}
