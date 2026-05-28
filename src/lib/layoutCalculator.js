export const calculateLayout = (pageSize, layoutMode, gridCols, gridRows, bindingMargin, videoDim, config) => {
  if (!videoDim || videoDim.w === 0) {
    return null;
  }

  const { showProgressBar } = config || {};

  // Calculate the aspect ratio of the COMPOSITED frame
  const videoWidth = videoDim.w;
  const videoHeight = videoDim.h;
  
  const progressBarHeight = showProgressBar ? Math.max(videoHeight * 0.05, 10) : 0;
  const bottomMargin = showProgressBar ? progressBarHeight * 2 : 0;

  const compositedWidth = bindingMargin + videoWidth;
  const compositedHeight = videoHeight + bottomMargin;
  
  const imgRatio = compositedWidth / compositedHeight;

  // Page dimensions mapping
  const sizes = {
    'a4': { w: 297, h: 210 },
    'a3': { w: 420, h: 297 },
    'letter': { w: 279.4, h: 215.9 }, 
    'legal': { w: 355.6, h: 215.9 }
  };

  const dims = sizes[pageSize] || sizes['a3'];
  const pageWidth = dims.w;
  const pageHeight = dims.h;
  const pageMargin = 10;
  const spacing = 4;
  
  const usableWidth = pageWidth - pageMargin * 2;
  const usableHeight = pageHeight - pageMargin * 2;

  let finalCols = 3;
  let finalRows = 4;
  let finalWidth = 0;
  let finalHeight = 0;

  if (layoutMode === 'manual') {
    finalCols = gridCols;
    finalRows = gridRows;
    
    // Scale frames to maximize space inside this specific grid
    const maxW = (usableWidth - (finalCols - 1) * spacing) / finalCols;
    const maxH = (usableHeight - (finalRows - 1) * spacing) / finalRows;

    if (maxW / imgRatio <= maxH) {
      finalWidth = maxW;
      finalHeight = finalWidth / imgRatio;
    } else {
      finalHeight = maxH;
      finalWidth = finalHeight * imgRatio;
    }
  } else {
    // AUTO MODE: Loop through all possible grids to find the one that utilizes the absolute highest % of paper area
    let maxCoverage = 0;

    for (let c = 1; c <= 8; c++) {
      for (let r = 1; r <= 8; r++) {
        const maxW = (usableWidth - (c - 1) * spacing) / c;
        const maxH = (usableHeight - (r - 1) * spacing) / r;

        let w, h;
        if (maxW / imgRatio <= maxH) {
          w = maxW; h = w / imgRatio;
        } else {
          h = maxH; w = h * imgRatio;
        }

        // Target flipbook width bounds (40mm to 140mm) so it's a realistic book size
        if (w >= 40 && w <= 140) {
          const area = c * r * w * h;
          if (area > maxCoverage) {
            maxCoverage = area;
            finalCols = c;
            finalRows = r;
            finalWidth = w;
            finalHeight = h;
          }
        }
      }
    }

    // Fallback if none perfectly matched the bounds
    if (maxCoverage === 0) {
      finalCols = 3;
      finalRows = 3;
      const maxW = (usableWidth - (finalCols - 1) * spacing) / finalCols;
      const maxH = (usableHeight - (finalRows - 1) * spacing) / finalRows;
      if (maxW / imgRatio <= maxH) {
        finalWidth = maxW; finalHeight = finalWidth / imgRatio;
      } else {
        finalHeight = maxH; finalWidth = finalHeight * imgRatio;
      }
    }
  }

  return {
    frameWidthMM: finalWidth,
    frameHeightMM: finalHeight,
    columns: finalCols,
    rows: finalRows,
    framesPerPage: finalCols * finalRows,
    imgRatio,
    usableWidth,
    usableHeight,
    spacing,
    pageMargin
  };
};
