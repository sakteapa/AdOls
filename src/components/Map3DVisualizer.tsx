import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EcuMapDefinition } from '../types/ecu';
import { RotateCcw, Box, Eye, Layers, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

interface Map3DVisualizerProps {
  map: EcuMapDefinition;
  isMizo: boolean;
  onCellSelect?: (row: number, col: number) => void;
  selectedCell?: { row: number; col: number } | null;
}

export const Map3DVisualizer: React.FC<Map3DVisualizerProps> = ({
  map,
  isMizo,
  onCellSelect,
  selectedCell,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera angles (degrees) & zoom
  const [yaw, setYaw] = useState<number>(-40);
  const [pitch, setPitch] = useState<number>(35);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Drag & Touch interaction state
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistance = useRef<number | null>(null);

  // Map min/max for normalization
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    map.data.forEach(row => {
      row.forEach(val => {
        if (val < min) min = val;
        if (val > max) max = val;
      });
    });
    if (min === max) {
      min -= 1;
      max += 1;
    }
    return { minVal: min, maxVal: max };
  }, [map.data]);

  // Color gradient function (Blue -> Cyan -> Green -> Yellow -> Red)
  const getElevationColor = (val: number, alpha: number = 0.85): string => {
    const t = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal || 1)));
    let r = 0;
    let g = 0;
    let b = 0;

    if (t < 0.25) {
      // Blue to Cyan
      const factor = t / 0.25;
      r = 30;
      g = Math.round(100 + 120 * factor);
      b = 255;
    } else if (t < 0.5) {
      // Cyan to Green
      const factor = (t - 0.25) / 0.25;
      r = Math.round(30 + 30 * factor);
      g = 220;
      b = Math.round(255 * (1 - factor));
    } else if (t < 0.75) {
      // Green to Yellow
      const factor = (t - 0.5) / 0.25;
      r = Math.round(60 + 195 * factor);
      g = 220;
      b = 30;
    } else {
      // Yellow to Bright Red
      const factor = (t - 0.75) / 0.25;
      r = 255;
      g = Math.round(220 * (1 - factor * 0.7));
      b = 30;
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 3D Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewMode !== '3d') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Subtle background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, width, height);

    const rows = map.rows;
    const cols = map.cols;

    // Responsive scaling based on canvas height & width (optimized for mobile landscape)
    const boxSize = Math.min(width * 0.8, height * 1.1) * 0.55 * zoom;
    const heightScale = boxSize * 0.45;

    // Convert angles to radians
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;

    // Transformation projection helper
    const project = (r: number, c: number, v: number) => {
      // Center coordinates around (0, 0, 0)
      const x = ((c / (cols - 1)) - 0.5) * boxSize;
      const y = ((r / (rows - 1)) - 0.5) * boxSize;
      const normZ = (v - minVal) / (maxVal - minVal || 1);
      const z = (normZ - 0.3) * heightScale;

      // Rotate around Z axis (Yaw)
      const x1 = x * Math.cos(radYaw) - y * Math.sin(radYaw);
      const y1 = x * Math.sin(radYaw) + y * Math.cos(radYaw);
      const z1 = z;

      // Rotate around X axis (Pitch)
      const x2 = x1;
      const y2 = y1 * Math.cos(radPitch) - z1 * Math.sin(radPitch);
      const z2 = y1 * Math.sin(radPitch) + z1 * Math.cos(radPitch);

      // Perspective foreshortening
      const fov = 550;
      const scale = fov / (fov + y2);

      const screenX = width / 2 + x2 * scale;
      const screenY = height / 2 - z2 * scale + 15;

      return { x: screenX, y: screenY, depth: y2 };
    };

    // Build mesh polygons for painter's algorithm depth sorting
    interface Quad {
      r: number;
      c: number;
      pts: { x: number; y: number }[];
      avgDepth: number;
      avgVal: number;
      isModified: boolean;
      isSelected: boolean;
    }

    const quads: Quad[] = [];

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const v00 = map.data[r][c];
        const v01 = map.data[r][c + 1];
        const v10 = map.data[r + 1][c];
        const v11 = map.data[r + 1][c + 1];

        const orig00 = map.originalData[r]?.[c] ?? v00;
        const isMod = v00 !== orig00;
        const isSel = selectedCell?.row === r && selectedCell?.col === c;

        const p00 = project(r, c, v00);
        const p01 = project(r, c + 1, v01);
        const p11 = project(r + 1, c + 1, v11);
        const p10 = project(r + 1, c, v10);

        const avgDepth = (p00.depth + p01.depth + p11.depth + p10.depth) / 4;
        const avgVal = (v00 + v01 + v11 + v10) / 4;

        quads.push({
          r,
          c,
          pts: [p00, p01, p11, p10],
          avgDepth,
          avgVal,
          isModified: isMod,
          isSelected: isSel,
        });
      }
    }

    // Sort far to near (Painter's algorithm)
    quads.sort((a, b) => b.avgDepth - a.avgDepth);

    // Render Quads
    quads.forEach(quad => {
      ctx.beginPath();
      ctx.moveTo(quad.pts[0].x, quad.pts[0].y);
      for (let i = 1; i < quad.pts.length; i++) {
        ctx.lineTo(quad.pts[i].x, quad.pts[i].y);
      }
      ctx.closePath();

      if (!isWireframe) {
        ctx.fillStyle = getElevationColor(quad.avgVal, quad.isSelected ? 0.95 : 0.82);
        ctx.fill();
      }

      // Wireframe outlines
      ctx.strokeStyle = quad.isSelected
        ? '#ffffff'
        : quad.isModified
        ? 'rgba(245, 158, 11, 0.95)'
        : 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = quad.isSelected ? 2 : quad.isModified ? 1.5 : 0.8;
      ctx.stroke();
    });

    // Draw Coordinate Base Frame & Origin Lines
    const pOrigin = project(0, 0, minVal);
    const pRpmMax = project(0, cols - 1, minVal);
    const pLoadMax = project(rows - 1, 0, minVal);
    const pPeakZ = project(0, 0, maxVal);

    // RPM Axis line (X)
    ctx.beginPath();
    ctx.moveTo(pOrigin.x, pOrigin.y);
    ctx.lineTo(pRpmMax.x, pRpmMax.y);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Load Axis line (Y)
    ctx.beginPath();
    ctx.moveTo(pOrigin.x, pOrigin.y);
    ctx.lineTo(pLoadMax.x, pLoadMax.y);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Z Value Axis line
    ctx.beginPath();
    ctx.moveTo(pOrigin.x, pOrigin.y);
    ctx.lineTo(pPeakZ.x, pPeakZ.y);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis Labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText(`${map.xAxis.name} (${map.xAxis.unit}) →`, pRpmMax.x + 6, pRpmMax.y + 4);

    ctx.fillStyle = '#6ee7b7';
    ctx.fillText(`${map.yAxis.name} (${map.yAxis.unit}) →`, pLoadMax.x - 36, pLoadMax.y + 12);

    ctx.fillStyle = '#fcd34d';
    ctx.fillText(`Peak: ${maxVal} ${map.zUnit}`, pPeakZ.x - 24, pPeakZ.y - 6);
  }, [map, yaw, pitch, zoom, isWireframe, viewMode, selectedCell, minVal, maxVal]);

  // Mouse drag handlers for 3D orbit rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    setYaw(prev => (prev + deltaX * 0.6) % 360);
    setPitch(prev => Math.max(5, Math.min(85, prev - deltaY * 0.5)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch handlers for mobile & mobile landscape
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchDistance.current = null;
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      isDragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistance.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging.current) {
      const deltaX = e.touches[0].clientX - lastMousePos.current.x;
      const deltaY = e.touches[0].clientY - lastMousePos.current.y;

      setYaw(prev => (prev + deltaX * 0.7) % 360);
      setPitch(prev => Math.max(5, Math.min(85, prev - deltaY * 0.6)));

      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && touchDistance.current !== null) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / touchDistance.current;

      setZoom(prev => Math.max(0.6, Math.min(2.4, prev * (ratio > 1 ? 1.03 : 0.97))));
      touchDistance.current = newDist;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    touchDistance.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.max(0.6, Math.min(2.4, prev * factor)));
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl select-none transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
    >
      {/* 3D Visualizer Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5 shrink-0">
            <Box className="w-4 h-4 text-blue-400" />
            <span className="hidden xs:inline">{isMizo ? '3D Surface & Curve' : '3D Surface Topology'}</span>
            <span className="xs:hidden">3D</span>
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 truncate max-w-[140px] sm:max-w-none">
            {map.name} ({map.rows}×{map.cols})
          </span>
        </div>

        {/* View mode & control toggles */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                viewMode === '3d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                viewMode === '2d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D
            </button>
          </div>

          {viewMode === '3d' && (
            <>
              {/* Zoom buttons for touch devices */}
              <button
                onClick={() => setZoom(prev => Math.min(2.4, prev * 1.15))}
                title="Zoom In"
                className="p-1 sm:p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(0.6, prev * 0.85))}
                title="Zoom Out"
                className="p-1 sm:p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsWireframe(!isWireframe)}
                title={isMizo ? 'Wireframe inthlakna' : 'Toggle Wireframe'}
                className={`p-1 sm:p-1.5 rounded-lg border text-xs transition-colors ${
                  isWireframe
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setYaw(-40);
                  setPitch(35);
                  setZoom(1.0);
                }}
                title={isMizo ? 'Reset Camera' : 'Reset Camera'}
                className="p-1 sm:p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Fullscreen Toggle (Indispensable for Mobile Landscape) */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1 sm:p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport — Responsive height tuned for Mobile Landscape */}
      <div
        className={`relative w-full bg-slate-950 flex items-center justify-center overflow-hidden touch-none ${
          isFullscreen
            ? 'flex-1 h-full'
            : 'h-[230px] sm:h-[320px] lg:h-[400px] landscape:h-[220px] sm:landscape:h-[280px]'
        }`}
      >
        {viewMode === '3d' ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ) : (
          /* 2D Multi-Curve Viewer */
          <div className="w-full h-full p-3 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-mono text-[11px]">Y: {map.zUnit}</span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-blue-500 inline-block" />
                  Stock
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                  Tuned
                </span>
              </div>
            </div>

            {/* SVG 2D Line Chart */}
            <div className="relative flex-1 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240">
                {[0, 60, 120, 180, 240].map(y => (
                  <line
                    key={y}
                    x1="40"
                    y1={y}
                    x2="690"
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                ))}

                {[2, 6, 10, 15].map((rowIdx, i) => {
                  if (!map.data[rowIdx]) return null;
                  const rowData = map.data[rowIdx];
                  const origRow = map.originalData[rowIdx] || rowData;

                  const pointsTuned = rowData
                    .map((val, colIdx) => {
                      const x = 50 + (colIdx / (map.cols - 1)) * 630;
                      const norm = (val - minVal) / (maxVal - minVal || 1);
                      const y = 220 - norm * 200;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  const pointsStock = origRow
                    .map((val, colIdx) => {
                      const x = 50 + (colIdx / (map.cols - 1)) * 630;
                      const norm = (val - minVal) / (maxVal - minVal || 1);
                      const y = 220 - norm * 200;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

                  return (
                    <g key={rowIdx}>
                      <polyline
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                        points={pointsStock}
                      />
                      <polyline
                        fill="none"
                        stroke={colors[i]}
                        strokeWidth="2.2"
                        points={pointsTuned}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis RPM legend */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1.5 px-4 border-t border-slate-800">
              {map.xAxis.values.filter((_, idx) => idx % 2 === 0).map((rpm, idx) => (
                <span key={idx}>{rpm} RPM</span>
              ))}
            </div>
          </div>
        )}

        {/* 3D Orbit Camera Guide Overlay */}
        {viewMode === '3d' && (
          <div className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-800/80 rounded-lg px-2 py-1 text-[10px] text-slate-400 backdrop-blur-sm pointer-events-none flex items-center gap-2">
            <span>{isMizo ? 'Kutzungtang hnuk la a in her ang' : 'Drag to rotate'}</span>
            <span className="text-slate-600">·</span>
            <span>{isMizo ? 'Pinch-in zoom rawh' : 'Pinch to zoom'}</span>
          </div>
        )}

        {/* Color Isotherm Bar */}
        <div className="absolute top-2 right-2 bg-slate-950/85 border border-slate-800 rounded-lg p-1.5 text-[9px] text-slate-300 backdrop-blur-sm flex flex-col items-center gap-0.5">
          <span className="font-mono text-amber-400 font-bold">{maxVal}</span>
          <div className="w-2 h-16 sm:h-20 rounded-full bg-gradient-to-t from-blue-600 via-emerald-500 via-amber-400 to-rose-600 border border-slate-700" />
          <span className="font-mono text-blue-400 font-bold">{minVal}</span>
        </div>
      </div>
    </div>
  );
};
