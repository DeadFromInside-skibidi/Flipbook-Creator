import React, { useState, useRef } from 'react';
import { Upload, FileVideo, Download, Loader2, PlaySquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigPanel } from './components/ConfigPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { extractFrames } from './lib/ffmpeg';
import { processFrameCanvas } from './lib/canvasProcessor';
import { generatePDF } from './lib/pdfGenerator';
import { calculateLayout } from './lib/layoutCalculator';

function App() {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [videoDim, setVideoDim] = useState({ w: 0, h: 0 });
  const [previewFrameUrl, setPreviewFrameUrl] = useState(null);
  
  // General & Layout Settings
  const [targetFps, setTargetFps] = useState(12);
  const [paperThickness, setPaperThickness] = useState(0.3);
  const [bindingMargin, setBindingMargin] = useState(200);
  const [pageSize, setPageSize] = useState('a3');
  
  // Layout Options
  const [layoutMode, setLayoutMode] = useState('auto'); // 'auto' or 'manual'
  const [gridCols, setGridCols] = useState(3);
  const [gridRows, setGridRows] = useState(4);
  
  // Customization Options
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [progressBarColor, setProgressBarColor] = useState('#3b82f6');
  const [marginColor, setMarginColor] = useState('#ffffff');
  const [showBorders, setShowBorders] = useState(false);
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState(4);
  
  // Processing State
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);

  const config = { showProgressBar, progressBarColor, marginColor, showBorders, borderColor, borderWidth };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.onloadeddata = () => {
        setDuration(video.duration);
        setVideoDim({ w: video.videoWidth, h: video.videoHeight });
        video.currentTime = Math.min(1, video.duration / 2);
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setPreviewFrameUrl(canvas.toDataURL('image/jpeg'));
        URL.revokeObjectURL(url);
      };
      video.src = url;
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);

    try {
      setProgressMsg('Extracting frames from video...');
      const totalFrames = Math.ceil(duration * targetFps);
      
      const frames = await extractFrames(file, targetFps, (ratio) => {
        setProgress(Math.round(ratio * 40)); 
      });

      setProgressMsg('Compositing frames for print...');
      const processedDataUrls = [];
      
      for (let i = 0; i < frames.length; i++) {
        const dataUrl = await processFrameCanvas(frames[i], i, totalFrames, bindingMargin, config);
        processedDataUrls.push(dataUrl);
        URL.revokeObjectURL(frames[i]);
        
        setProgress(40 + Math.round(((i + 1) / frames.length) * 40));
      }

      setProgressMsg(`Generating ${pageSize.toUpperCase()} PDF...`);
      const layout = calculateLayout(pageSize, layoutMode, gridCols, gridRows, bindingMargin, videoDim, config);
      await generatePDF(processedDataUrls, pageSize, layout);
      
      setProgress(100);
      setProgressMsg('PDF Downloaded successfully!');

    } catch (err) {
      console.error(err);
      setProgressMsg('An error occurred during processing.');
    } finally {
      setTimeout(() => {
        setProcessing(false);
        setProgressMsg('');
        setProgress(0);
      }, 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-7xl">
      <motion.header 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-12 md:mb-16"
      >
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <PlaySquare className="w-10 h-10 md:w-12 md:h-12 text-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-primary tracking-tight">
            Flipbook Creator
          </h1>
        </div>
        <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Turn any short video into a printable PDF of sequential image frames. Cut them out, clamp them, and bring your video to life on paper!
        </p>
      </motion.header>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10"
      >
        
        {/* Left Column: Upload, Preview & Generate */}
        <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col gap-8">
          <div className="glass-panel p-6 md:p-10 text-center border-dashed border-2 border-slate-700/60 hover:border-primary/60 hover:bg-slate-800/40 transition-all duration-300 relative group overflow-hidden">
            <input 
              type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={processing}
            />
            
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-10 md:py-16"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-800/80 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all duration-500">
                    <Upload className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Upload a Video</h3>
                  <p className="text-slate-400 text-sm md:text-base">Drag and drop or tap to select (MP4, WebM)</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="file"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-8 md:py-12"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <FileVideo className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 break-all px-4">{file.name}</h3>
                  <p className="text-slate-400 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB • {duration.toFixed(1)}s</p>
                  <button 
                    onClick={(e) => { e.preventDefault(); setFile(null); setDuration(0); setVideoDim({w:0,h:0}); setPreviewFrameUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="mt-6 text-sm md:text-base font-medium text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-lg transition-colors relative z-20" 
                    disabled={processing}
                  >
                    Remove Video
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-8"
              >
                <PreviewPanel 
                  previewFrameUrl={previewFrameUrl}
                  config={config}
                  pageSize={pageSize}
                  layoutMode={layoutMode}
                  gridCols={gridCols}
                  gridRows={gridRows}
                  bindingMargin={bindingMargin}
                  videoDim={videoDim}
                />

                <div className="flex flex-col gap-4">
                  <button onClick={handleGenerate} disabled={processing} className="btn-primary w-full py-5 text-xl font-bold flex items-center justify-center gap-3">
                    {processing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        Generate PDF
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {processing && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-panel p-5 flex flex-col gap-3"
                      >
                        <div className="flex justify-between text-sm md:text-base text-slate-300 font-medium">
                          <span>{progressMsg}</span>
                          <span className="font-mono text-primary">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "easeOut" }}
                            className="bg-gradient-to-r from-primary to-accent h-full rounded-full"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right Column: Settings & Summary */}
        <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col gap-8">
          <ConfigPanel 
            targetFps={targetFps} setTargetFps={setTargetFps}
            paperThickness={paperThickness} setPaperThickness={setPaperThickness}
            bindingMargin={bindingMargin} setBindingMargin={setBindingMargin}
            pageSize={pageSize} setPageSize={setPageSize}
            layoutMode={layoutMode} setLayoutMode={setLayoutMode}
            gridCols={gridCols} setGridCols={setGridCols}
            gridRows={gridRows} setGridRows={setGridRows}
            showProgressBar={showProgressBar} setShowProgressBar={setShowProgressBar}
            progressBarColor={progressBarColor} setProgressBarColor={setProgressBarColor}
            marginColor={marginColor} setMarginColor={setMarginColor}
            showBorders={showBorders} setShowBorders={setShowBorders}
            borderColor={borderColor} setBorderColor={setBorderColor}
            borderWidth={borderWidth} setBorderWidth={setBorderWidth}
          />

          <AnimatePresence>
            {duration > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <SummaryPanel 
                  duration={duration} 
                  targetFps={targetFps} 
                  paperThickness={paperThickness} 
                  pageSize={pageSize}
                  layoutMode={layoutMode}
                  gridCols={gridCols}
                  gridRows={gridRows}
                  bindingMargin={bindingMargin}
                  videoDim={videoDim}
                  config={config}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.main>
    </div>
  );
}

export default App;
