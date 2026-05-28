import React from 'react';
import { Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ConfigPanel = ({ 
  targetFps, setTargetFps, 
  paperThickness, setPaperThickness, 
  bindingMargin, setBindingMargin,
  pageSize, setPageSize,
  layoutMode, setLayoutMode,
  gridCols, setGridCols,
  gridRows, setGridRows,
  showProgressBar, setShowProgressBar,
  progressBarColor, setProgressBarColor,
  marginColor, setMarginColor,
  showBorders, setShowBorders,
  borderColor, setBorderColor,
  borderWidth, setBorderWidth
}) => {
  return (
    <div className="glass-panel p-6 flex flex-col gap-8 h-full overflow-y-auto max-h-[85vh] custom-scrollbar">
      <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
        <Settings className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Configuration</h2>
      </div>

      {/* General Settings */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">General</h3>
        
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-300 flex justify-between">
            <span>Target FPS</span>
            <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">{targetFps} FPS</span>
          </label>
          <input 
            type="range" min="8" max="24" step="1" 
            value={targetFps} onChange={(e) => setTargetFps(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Paper Thickness (mm)</label>
          <select 
            value={paperThickness} onChange={(e) => setPaperThickness(Number(e.target.value))}
            className="glass-input text-slate-200 w-full"
          >
            <option value="0.1">Standard Paper (0.1mm)</option>
            <option value="0.2">Light Cardstock (0.2mm)</option>
            <option value="0.3">Thick Glossy Card (0.3mm)</option>
          </select>
        </div>
      </div>

      {/* Page Layout */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Layout & Margins</h3>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Page Size</label>
          <select 
            value={pageSize} onChange={(e) => setPageSize(e.target.value)}
            className="glass-input text-slate-200 w-full"
          >
            <option value="a4">A4 (210 x 297 mm)</option>
            <option value="a3">A3 (297 x 420 mm)</option>
            <option value="letter">US Letter (8.5 x 11 in)</option>
            <option value="legal">US Legal (8.5 x 14 in)</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 mt-1">
          <label className="text-sm font-medium text-slate-300">Layout Optimization</label>
          <div className="flex gap-2 p-1 bg-slate-900/60 rounded-xl border border-slate-700/50">
            <button 
              className={`flex-1 py-2.5 text-sm rounded-lg transition-all duration-300 ${layoutMode === 'auto' ? 'bg-gradient-to-r from-primary to-accent text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => setLayoutMode('auto')}
            >
              Auto Best Fit
            </button>
            <button 
              className={`flex-1 py-2.5 text-sm rounded-lg transition-all duration-300 ${layoutMode === 'manual' ? 'bg-gradient-to-r from-primary to-accent text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => setLayoutMode('manual')}
            >
              Manual Grid
            </button>
          </div>
        </div>

        <AnimatePresence>
          {layoutMode === 'manual' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-6 bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 mt-1">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-slate-300 flex justify-between">
                    <span>Columns</span>
                    <span className="text-primary font-bold">{gridCols}</span>
                  </label>
                  <input 
                    type="range" min="1" max="10" step="1" 
                    value={gridCols} onChange={(e) => setGridCols(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-slate-300 flex justify-between">
                    <span>Rows</span>
                    <span className="text-primary font-bold">{gridRows}</span>
                  </label>
                  <input 
                    type="range" min="1" max="10" step="1" 
                    value={gridRows} onChange={(e) => setGridRows(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <p className="text-xs text-slate-400 col-span-2 text-center">
                  Images scale up geometrically to perfectly fit this grid.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3 mt-1">
          <label className="text-sm font-medium text-slate-300 flex justify-between">
            <span>Binding Margin Width</span>
            <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">{bindingMargin} px</span>
          </label>
          <input 
            type="range" min="50" max="600" step="10" 
            value={bindingMargin} onChange={(e) => setBindingMargin(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300 flex justify-between items-center bg-slate-800/30 p-3 rounded-xl border border-slate-700/30">
            <span>Margin Color</span>
            <input 
              type="color" value={marginColor} onChange={(e) => setMarginColor(e.target.value)}
              className="w-8 h-8 rounded-full overflow-hidden cursor-pointer bg-transparent border-0"
            />
          </label>
        </div>
      </div>

      {/* Visual Options */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xs font-bold text-accent uppercase tracking-widest">Visuals</h3>
        
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-3 cursor-pointer bg-slate-800/30 p-3 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
            <input 
              type="checkbox" checked={showProgressBar} onChange={(e) => setShowProgressBar(e.target.checked)}
              className="w-5 h-5 accent-primary rounded bg-slate-800"
            />
            <span className="text-sm font-medium text-slate-300">Include Progress Bar</span>
          </label>
          
          <AnimatePresence>
            {showProgressBar && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-4 pr-3 py-3 mt-1 flex justify-between items-center border-l-2 border-slate-700 ml-4">
                  <span className="text-sm font-medium text-slate-400">Progress Bar Color</span>
                  <input 
                    type="color" value={progressBarColor} onChange={(e) => setProgressBarColor(e.target.value)}
                    className="w-8 h-8 rounded-full overflow-hidden cursor-pointer bg-transparent border-0"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-3 cursor-pointer bg-slate-800/30 p-3 rounded-xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
            <input 
              type="checkbox" checked={showBorders} onChange={(e) => setShowBorders(e.target.checked)}
              className="w-5 h-5 accent-primary rounded bg-slate-800"
            />
            <span className="text-sm font-medium text-slate-300">Add Border to Frame</span>
          </label>

          <AnimatePresence>
            {showBorders && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-4 pr-3 py-4 mt-1 flex flex-col gap-5 border-l-2 border-slate-700 ml-4">
                  <label className="text-sm font-medium text-slate-400 flex justify-between items-center">
                    <span>Border Color</span>
                    <input 
                      type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)}
                      className="w-8 h-8 rounded-full overflow-hidden cursor-pointer bg-transparent border-0"
                    />
                  </label>
                  
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-slate-400 flex justify-between">
                      <span>Border Width</span>
                      <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">{borderWidth} px</span>
                    </label>
                    <input 
                      type="range" min="1" max="20" step="1" 
                      value={borderWidth} onChange={(e) => setBorderWidth(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};
