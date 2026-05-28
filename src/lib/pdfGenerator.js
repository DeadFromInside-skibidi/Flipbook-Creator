import { jsPDF } from 'jspdf';

export const generatePDF = async (processedDataUrls, pageSize, layout) => {
  if (!processedDataUrls || processedDataUrls.length === 0 || !layout) return;

  const {
    frameWidthMM,
    frameHeightMM,
    columns,
    rows,
    usableWidth,
    usableHeight,
    spacing,
    pageMargin
  } = layout;

  // We use Landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: pageSize
  });

  // Calculate starting offsets to perfectly center the grid on the page
  const totalGridWidth = columns * frameWidthMM + (columns - 1) * spacing;
  const totalGridHeight = rows * frameHeightMM + (rows - 1) * spacing;
  
  const startX = pageMargin + (usableWidth - totalGridWidth) / 2;
  const startY = pageMargin + (usableHeight - totalGridHeight) / 2;

  let currentFrame = 0;

  while (currentFrame < processedDataUrls.length) {
    const pageFrameIndex = currentFrame % (columns * rows);
    
    if (currentFrame > 0 && pageFrameIndex === 0) {
      doc.addPage(pageSize, 'landscape');
    }

    const col = pageFrameIndex % columns;
    const row = Math.floor(pageFrameIndex / columns);

    const x = startX + col * (frameWidthMM + spacing);
    const y = startY + row * (frameHeightMM + spacing);

    doc.addImage(processedDataUrls[currentFrame], 'JPEG', x, y, frameWidthMM, frameHeightMM);

    // Draw cut lines (light gray borders) so the user knows where to scissor
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(x, y, frameWidthMM, frameHeightMM);

    currentFrame++;
  }

  doc.save('flipbook.pdf');
};
