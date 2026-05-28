import React, { useEffect, useState } from 'react';
import { processFrameCanvas } from '../lib/canvasProcessor';
import { calculateLayout } from '../lib/layoutCalculator';
import { Eye, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

export const PreviewPanel = ({ 
  previewFrameUrl, 
  config, 
  pageSize, 
  layoutMode,
  gridCols,
  gridRows,
  bindingMargin,
  videoDim
}) => {
  const [compositedUrl, setCompositedUrl] = useState(null);
  const [frameDimensions, setFrameDimensions] = useState(null);
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    if (!previewFrameUrl || !videoDim || videoDim.w === 0) return;

    const generatePreview = async () => {
      const dataUrl = await processFrameCanvas(previewFrameUrl, 2, 10, bindingMargin, config);
      setCompositedUrl(dataUrl);

      const calculatedLayout = calculateLayout(pageSize, layoutMode, gridCols, gridRows, bindingMargin, videoDim, config);
      if (calculatedLayout) {
        setLayout(calculatedLayout);
        setFrameDimensions({ 
          w: calculatedLayout.frameWidthMM.toFixed(1), 
          h: calculatedLayout.frameHeightMM.toFixed(1) 
        });
      }
    };
    
    generatePreview();
  }, [previewFrameUrl, config, bindingMargin, layoutMode, gridCols, gridRows, pageSize, videoDim]);

  if (!previewFrameUrl || !compositedUrl || !frameDimensions || !layout) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-6 md:p-8 flex flex-col gap-6"
    >
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
        <Eye className="w-6 h-6 text-accent drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
        <h2 className="text-xl font-bold tracking-tight">Live Preview</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        {/* Single Frame Preview */}
        <div className="flex flex-col gap-3 w-full md:w-1/2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Composited Frame
          </h3>
          <div className="bg-slate-900/80 rounded-2xl p-4 md:p-6 border border-slate-700/50 shadow-inner flex items-center justify-center min-h-[220px] relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <motion.img 
               key={compositedUrl}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               src={compositedUrl} 
               alt="Frame Preview" 
               className="max-w-full max-h-[180px] object-contain shadow-2xl relative z-10 rounded" 
             />
          </div>
          <div className="bg-slate-800/40 rounded-xl py-2 px-4 text-center border border-slate-700/30">
             <p className="text-xs text-slate-400">
               Physical Size: <strong className="text-white font-mono text-sm ml-1">{frameDimensions.w} x {frameDimensions.h} mm</strong>
             </p>
          </div>
        </div>

        {/* Page Context Preview */}
        <div className="flex flex-col gap-3 w-full md:w-1/2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Page Context ({pageSize.toUpperCase()})
          </h3>
          <div className="bg-slate-900/80 rounded-2xl p-4 md:p-6 border border-slate-700/50 shadow-inner flex flex-col items-center justify-center min-h-[220px]">
             <PageContextVisualizer layout={layout} compositedUrl={compositedUrl} />
          </div>
          <div className="bg-slate-800/40 rounded-xl py-2 px-4 text-center border border-slate-700/30 flex justify-center items-center gap-4">
             <p className="text-xs text-slate-400">
               Grid: <strong className="text-white font-mono text-sm ml-1">{layout.columns}x{layout.rows}</strong>
             </p>
             <div className="w-px h-3 bg-slate-600"></div>
             <p className="text-xs text-slate-400">
               <strong className="text-white font-mono text-sm mr-1">{layout.framesPerPage}</strong> frames / page
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const PageContextVisualizer = ({ layout, compositedUrl }) => {
  const { usableWidth, usableHeight, pageMargin } = layout;
  const pageWidth = usableWidth + pageMargin * 2;
  const pageHeight = usableHeight + pageMargin * 2;
  const pageRatio = pageWidth / pageHeight; 

  return (
    <motion.div 
      key={`${layout.columns}-${layout.rows}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white relative shadow-lg flex items-center justify-center rounded-sm overflow-hidden"
      style={{
        width: '100%',
        maxWidth: '300px',
        aspectRatio: `${pageRatio}`,
        padding: '3%' 
      }}
    >
       <div className="w-full h-full flex flex-col gap-[2px] items-center justify-center">
          {Array.from({ length: Math.min(layout.rows, 5) }).map((_, rIndex) => (
             <div key={rIndex} className="w-full flex gap-[2px] items-start justify-center">
                {Array.from({ length: layout.columns }).map((_, cIndex) => (
                  <div key={cIndex} className="border border-slate-300 flex-1 flex bg-slate-100/50">
                     <img src={compositedUrl} alt="" className="w-full h-auto object-contain opacity-90" />
                  </div>
                ))}
             </div>
          ))}
          {layout.rows > 5 && (
             <div className="text-slate-400 text-[9px] w-full text-center py-0.5 font-medium tracking-widest bg-slate-100 mt-1 rounded">
               +{layout.rows - 5} ROWS
             </div>
          )}
       </div>
    </motion.div>
  );
}
