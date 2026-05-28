import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

export const initFFmpeg = async () => {
  if (ffmpeg.loaded) return ffmpeg;
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
};

export const extractFrames = async (file, targetFps, onProgress) => {
  if (!ffmpeg.loaded) await initFFmpeg();

  ffmpeg.on('progress', ({ progress, time }) => {
    if (onProgress) onProgress(progress);
  });

  const inputName = 'input_video.mp4';
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Extract frames as PNGs
  // Output format: frame_0001.png
  await ffmpeg.exec([
    '-i', inputName,
    '-vf', `fps=${targetFps}`,
    'frame_%04d.png'
  ]);

  // Read the generated files
  const files = await ffmpeg.listDir('/');
  const frameFiles = files.filter(f => f.name.startsWith('frame_') && f.name.endsWith('.png')).sort((a, b) => a.name.localeCompare(b.name));

  const frameData = [];
  for (const f of frameFiles) {
    const data = await ffmpeg.readFile(f.name);
    // Convert Uint8Array to Blob URL
    const blob = new Blob([data.buffer], { type: 'image/png' });
    frameData.push(URL.createObjectURL(blob));
    // Cleanup virtual fs
    await ffmpeg.deleteFile(f.name);
  }

  // Cleanup input
  await ffmpeg.deleteFile(inputName);
  
  // Remove progress listener so it doesn't duplicate on next run
  ffmpeg.off('progress');

  return frameData; // Array of object URLs
};
