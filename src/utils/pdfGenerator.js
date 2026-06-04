import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(elementId, filename = 'receipt.pdf') {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Temporarily make it visible for capture if it's hidden via CSS classes
  const originalDisplay = element.style.display;
  element.style.display = 'block';

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Good quality but smaller file size
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    // Use JPEG compression to significantly reduce file size
    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Center it a bit, add top margin
    const margin = 40;
    const renderWidth = pdfWidth - (margin * 2);
    const renderHeight = (canvas.height * renderWidth) / canvas.width;
    
    // Add image with FAST compression flag for even smaller size
    pdf.addImage(imgData, 'JPEG', margin, margin, renderWidth, renderHeight, undefined, 'FAST');
    pdf.save(filename);
  } finally {
    element.style.display = originalDisplay;
  }
}
