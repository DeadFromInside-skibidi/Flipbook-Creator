import React from 'react';
import { FileBarChart2 } from 'lucide-react';
import { calculateLayout } from '../lib/layoutCalculator';
import { motion } from 'framer-motion';

export const SummaryPanel = ({ 
  duration, 
  targetFps, 
  paperThickness,
  pageSize,
  layoutMode,
  gridCols,
  gridRows,
  bindingMargin,
  videoDim,
  config
}) => {
  const totalFrames = Math.ceil(duration * targetFps);
  const spineThickness = (totalFrames * paperThickness).toFixed(2);
  
  let printedPages = '?';
  let layout = null;
  
  if (videoDim && videoDim.w > 0) {
    layout = calculateLayout(pageSize, layoutMode, gridCols, gridRows, bindingMargin, videoDim, config);
    if (layout && layout.framesPerPage > 0) {
      printedPages = Math.ceil(totalFrames / layout.framesPerPage);
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="glass-panel p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4 relative z-10">
        <FileBarChart2 className="w-6 h-6 text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
        <h2 className="text-xl font-bold tracking-tight">Project Summary</h2>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 relative z-10"
      >
        <motion.div variants={item} className="flex flex-col bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 shadow-inner group hover:bg-slate-800/80 transition-colors">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Duration</span>
          <span className="text-3xl font-black text-white mt-2 tracking-tighter">{duration.toFixed(1)}<span className="text-lg font-bold text-slate-500 ml-1">s</span></span>
        </motion.div>
        
        <motion.div variants={item} className="flex flex-col bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 shadow-inner group hover:bg-slate-800/80 transition-colors">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Total Frames</span>
          <span className="text-3xl font-black text-white mt-2 tracking-tighter">{totalFrames}</span>
        </motion.div>

        <motion.div variants={item} className="flex flex-col bg-gradient-to-br from-primary/20 to-accent/10 p-5 rounded-2xl border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.1)] group hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all">
          <span className="text-xs text-primary font-bold uppercase tracking-widest">Printed Pages</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">{printedPages}</span>
            <span className="text-sm font-bold text-primary/80 uppercase">({pageSize})</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="flex flex-col bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 shadow-inner group hover:bg-slate-800/80 transition-colors">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Spine Thickness</span>
          <span className="text-3xl font-black text-white mt-2 tracking-tighter">{spineThickness}<span className="text-lg font-bold text-slate-500 ml-1">mm</span></span>
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-2 relative z-10"
      >
        <p className="text-sm text-blue-200 leading-relaxed">
          <strong className="text-primary font-bold uppercase tracking-wider text-xs mr-2 border border-primary/30 bg-primary/20 px-2 py-0.5 rounded">Tip</strong> 
          You will need a binder clip or binding spine capable of securely holding <span className="text-white font-bold">{Math.ceil(spineThickness)}mm</span> of stacked paper.
        </p>
      </motion.div>
    </div>
  );
};
