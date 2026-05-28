export const processFrameCanvas = async (imageUrl, frameIndex, totalPages, bindingMargin, config) => {
  const {
    showProgressBar,
    progressBarColor,
    marginColor,
    showBorders,
    borderColor,
    borderWidth
  } = config;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const videoWidth = img.width;
      const videoHeight = img.height;
      const progressBarHeight = showProgressBar ? Math.max(videoHeight * 0.05, 10) : 0;
      const bottomMargin = showProgressBar ? progressBarHeight * 2 : 0;

      canvas.width = bindingMargin + videoWidth;
      canvas.height = videoHeight + bottomMargin;

      // Base background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bindingMargin, 0, videoWidth, videoHeight);

      // Draw the clip clamp margin
      ctx.fillStyle = marginColor;
      ctx.fillRect(0, 0, bindingMargin, canvas.height);

      // Draw the bottom progress bar margin
      if (showProgressBar) {
        ctx.fillStyle = marginColor; 
        ctx.fillRect(bindingMargin, videoHeight, videoWidth, bottomMargin);
      }

      // Draw image at top-right
      ctx.drawImage(img, bindingMargin, 0, videoWidth, videoHeight);

      // Draw border around the video frame
      if (showBorders) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth; 
        
        // Inset the stroke slightly so it doesn't get clipped by the canvas edge
        const halfWidth = ctx.lineWidth / 2;
        ctx.strokeRect(
          bindingMargin + halfWidth, 
          halfWidth, 
          videoWidth - ctx.lineWidth, 
          videoHeight - ctx.lineWidth
        );
      }

      // Draw progress bar fill
      if (showProgressBar) {
        const fillWidth = ((frameIndex + 1) / totalPages) * videoWidth;
        ctx.fillStyle = progressBarColor;
        ctx.fillRect(bindingMargin, videoHeight + (progressBarHeight / 2), fillWidth, progressBarHeight);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};
