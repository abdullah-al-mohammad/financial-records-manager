import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a multi-page A4 PDF from the pre-paginated report pages.
 *
 * How it works internally:
 * 1. Locates the `.printable-report-area` element in the DOM.
 * 2. Temporarily positions the container off-screen (left: -99999px) with display: block
 *    and exact A4 width (210mm) so html2canvas can measure and rasterize the DOM.
 * 3. Iterates through each `.print-page` element.
 * 4. Renders each page into a high-DPI canvas (scale: 2) preserving SVG logos,
 *    Bangla Taka currency symbol (৳), table borders, typography, and page footers.
 * 5. Compiles each rendered page into a standard A4 jsPDF document (210mm x 297mm).
 * 6. Adds "P.T.O." on intermediate pages and "End of Statement" on the final page as rendered.
 * 7. Triggers an automatic browser download with a clean, descriptive filename.
 * 8. Restores the DOM container to its hidden state in a `finally` block.
 *
 * @param {Object} options
 * @param {string} options.merchantName - Name of the selected merchant
 * @param {string} options.startDate - Bill report start date (YYYY-MM-DD)
 * @param {string} options.endDate - Bill report end date (YYYY-MM-DD)
 * @returns {Promise<boolean>} True if download succeeded
 */
export async function downloadReportPdf({ merchantName, startDate, endDate }) {
  const container = document.querySelector('.printable-report-area');
  if (!container) {
    throw new Error('Printable report container was not found in the DOM.');
  }

  // Backup existing inline styles so we can restore them cleanly
  const prevDisplay = container.style.display;
  const prevPosition = container.style.position;
  const prevLeft = container.style.left;
  const prevTop = container.style.top;
  const prevWidth = container.style.width;
  const prevBackground = container.style.background;
  const prevZIndex = container.style.zIndex;

  try {
    // Make container measurable off-screen at exact A4 width
    container.style.display = 'block';
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.background = '#ffffff';
    container.style.zIndex = '-9999';

    // Wait for DOM layout and web fonts to settle
    await new Promise(resolve => setTimeout(resolve, 80));

    // Find all rendered logical pages
    const pageElements = container.querySelectorAll('.print-page');
    if (!pageElements || pageElements.length === 0) {
      throw new Error('No printable report pages found.');
    }

    // Initialize standard A4 jsPDF instance in portrait mode
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      // Rasterize the page DOM element to canvas at high resolution (scale: 2)
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794, // 210mm at 96 DPI
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Add the page image fitting the exact A4 dimensions
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'FAST');
    }

    // Generate descriptive filename: MerchantName_Statement_2026-10-01_to_2026-10-31.pdf
    const safeMerchant = (merchantName || 'Merchant')
      .trim()
      .replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_');
    const safeStart = startDate || 'All';
    const safeEnd = endDate || 'Present';
    const filename = `${safeMerchant}_Statement_${safeStart}_to_${safeEnd}.pdf`;

    // Trigger browser file download
    pdf.save(filename);
    return true;
  } finally {
    // Restore original styles
    container.style.display = prevDisplay;
    container.style.position = prevPosition;
    container.style.left = prevLeft;
    container.style.top = prevTop;
    container.style.width = prevWidth;
    container.style.background = prevBackground;
    container.style.zIndex = prevZIndex;
  }
}

