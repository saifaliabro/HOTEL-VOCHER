import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function downloadVoucherPdf(
  elementId: string,
  invoiceNo: string,
  guestName: string
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Voucher element not found');
  }

  try {
    // Generate high-DPI canvas
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Scale canvas to fit page width
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      // Fit to single page if slight overflow or add proportional sizing
      const scaleFactor = pageHeight / imgHeight;
      const fittedWidth = imgWidth * scaleFactor;
      const xOffset = (pageWidth - fittedWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, 0, fittedWidth, pageHeight);
    }

    const cleanGuest = (guestName || 'Guest').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Aero_Voucher_${invoiceNo}_${cleanGuest}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}

export function printVoucher(): void {
  window.print();
}
