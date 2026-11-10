import React, { useState } from 'react';
import { EcuMapDefinition } from '../types/ecu';
import { Percent, Plus, Minus, RotateCcw, Sliders, Sparkles } from 'lucide-react';

interface TableEditorProps {
  map: EcuMapDefinition;
  isMizo: boolean;
  onUpdateMapData: (updatedData: number[][]) => void;
  selectedCell: { row: number; col: number } | null;
  onSelectCell: (row: number, col: number) => void;
}

export const TableEditor: React.FC<TableEditorProps> = ({
  map,
  isMizo,
  onUpdateMapData,
  selectedCell,
  onSelectCell,
}) => {
  const [displayMode, setDisplayMode] = useState<'value' | 'diff' | 'percent'>('value');
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editInputValue, setEditInputValue] = useState<string>('');

  // Min and Max for color intensity
  let minVal = Infinity;
  let maxVal = -Infinity;
  map.data.forEach(row => {
    row.forEach(v => {
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    });
  });
  if (minVal === maxVal) {
    minVal -= 1;
    maxVal += 1;
  }

  // Cell background heatmap
  const getCellBg = (val: number, isModified: boolean, isSelected: boolean): string => {
    if (isSelected) return 'bg-blue-600/40 text-white font-bold ring-2 ring-blue-400';
    if (isModified) return 'bg-amber-500/20 text-amber-300 font-semibold border-amber-500/50';

    const t = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal || 1)));
    if (t > 0.8) return 'bg-rose-950/40 text-rose-300';
    if (t > 0.5) return 'bg-amber-950/30 text-amber-200';
    if (t > 0.25) return 'bg-emerald-950/30 text-emerald-300';
    return 'bg-slate-900/40 text-slate-400';
  };

  // Batch math handlers
  const applyBatchMath = (factor: number) => {
    const newData = map.data.map((row, r) =>
      row.map((val, c) => {
        if (selectedCell && (selectedCell.row !== r || selectedCell.col !== c)) {
          return val; // If a single cell is selected, modify only that cell
        }
        return Math.round(val * factor * 10) / 10;
      })
    );
    onUpdateMapData(newData);
  };

  const applyAddMath = (delta: number) => {
    const newData = map.data.map((row, r) =>
      row.map((val, c) => {
        if (selectedCell && (selectedCell.row !== r || selectedCell.col !== c)) {
          return val;
        }
        return Math.round((val + delta) * 10) / 10;
      })
    );
    onUpdateMapData(newData);
  };

  const resetSelectionToStock = () => {
    const newData = map.data.map((row, r) =>
      row.map((val, c) => {
        if (selectedCell && (selectedCell.row !== r || selectedCell.col !== c)) {
          return val;
        }
        return map.originalData[r]?.[c] ?? val;
      })
    );
    onUpdateMapData(newData);
  };

  const handleCellClick = (r: number, c: number) => {
    onSelectCell(r, c);
  };

  const handleCellDoubleClick = (r: number, c: number) => {
    setEditingCell({ row: r, col: c });
    setEditInputValue(map.data[r][c].toString());
  };

  const handleSaveCellInput = () => {
    if (!editingCell) return;
    const num = parseFloat(editInputValue);
    if (!isNaN(num)) {
      const newData = map.data.map((row, r) =>
        row.map((val, c) => {
          if (r === editingCell.row && c === editingCell.col) {
            return Math.round(num * 10) / 10;
          }
          return val;
        })
      );
      onUpdateMapData(newData);
    }
    setEditingCell(null);
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl select-none">
      {/* Table Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">
            {isMizo ? 'Map Table Editor' : 'Matrix Calibration Table'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            [{map.xAxis.name} × {map.yAxis.name}]
          </span>
        </div>

        {/* Batch Math & Micro-Edit Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => applyBatchMath(1.05)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 font-mono transition-colors"
            title="+5% increase"
          >
            +5%
          </button>
          <button
            onClick={() => applyBatchMath(1.1)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-md border border-slate-700 font-mono transition-colors"
            title="+10% increase"
          >
            +10%
          </button>
          <button
            onClick={() => applyBatchMath(0.95)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 font-mono transition-colors"
            title="-5% decrease"
          >
            -5%
          </button>
          <button
            onClick={() => applyAddMath(map.factor * 5 || 10)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 font-mono transition-colors"
            title="Step add"
          >
            +{map.factor * 5 || 10}
          </button>

          <button
            onClick={resetSelectionToStock}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-md border border-slate-700 transition-colors flex items-center gap-1"
            title={isMizo ? 'Stock-ah let leh rawh' : 'Reset to Stock'}
          >
            <RotateCcw className="w-3 h-3" />
            Stock
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Display Mode: Absolute vs Diff vs Percent */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setDisplayMode('value')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                displayMode === 'value' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Values
            </button>
            <button
              onClick={() => setDisplayMode('diff')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                displayMode === 'diff' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Diff Δ
            </button>
            <button
              onClick={() => setDisplayMode('percent')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                displayMode === 'percent' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              % Gain
            </button>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto max-h-[380px] p-2 bg-slate-950 font-mono text-[11px]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {/* Corner header */}
              <th className="sticky top-0 left-0 z-20 bg-slate-900 border border-slate-800 p-1.5 text-slate-400 font-normal text-left min-w-[70px]">
                {map.yAxis.unit} \ RPM
              </th>
              {/* Column RPM headers */}
              {map.xAxis.values.map((rpm, c) => (
                <th
                  key={c}
                  className="sticky top-0 z-10 bg-slate-900 border border-slate-800 p-1.5 text-blue-400 font-semibold text-center min-w-[54px]"
                >
                  {rpm}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {map.data.map((row, r) => {
              const yVal = map.yAxis.values[r] ?? r;
              return (
                <tr key={r}>
                  {/* Row Load header */}
                  <th className="sticky left-0 z-10 bg-slate-900 border border-slate-800 p-1.5 text-emerald-400 font-medium text-left">
                    {yVal} {map.yAxis.unit}
                  </th>

                  {/* Matrix Cells */}
                  {row.map((val, c) => {
                    const origVal = map.originalData[r]?.[c] ?? val;
                    const diff = Math.round((val - origVal) * 10) / 10;
                    const percentGain = origVal !== 0 ? Math.round(((val - origVal) / origVal) * 100) : 0;
                    const isMod = diff !== 0;
                    const isSel = selectedCell?.row === r && selectedCell?.col === c;
                    const isEditing = editingCell?.row === r && editingCell?.col === c;

                    return (
                      <td
                        key={c}
                        onClick={() => handleCellClick(r, c)}
                        onDoubleClick={() => handleCellDoubleClick(r, c)}
                        className={`border border-slate-800/80 p-1 text-center cursor-pointer transition-all ${getCellBg(
                          val,
                          isMod,
                          isSel
                        )}`}
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            autoFocus
                            value={editInputValue}
                            onChange={e => setEditInputValue(e.target.value)}
                            onBlur={handleSaveCellInput}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveCellInput();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className="w-12 text-center bg-slate-950 text-white font-bold outline-none border border-blue-500 rounded py-0.5 text-xs"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center leading-tight">
                            <span>
                              {displayMode === 'value' && val}
                              {displayMode === 'diff' && (isMod ? (diff > 0 ? `+${diff}` : `${diff}`) : '—')}
                              {displayMode === 'percent' && (isMod ? (percentGain > 0 ? `+${percentGain}%` : `${percentGain}%`) : '—')}
                            </span>
                            {displayMode === 'value' && isMod && (
                              <span className="text-[9px] text-amber-400 font-normal">
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          {isMizo
            ? 'Cell i hmeh khan a in-select ang a, double click-in a zat i chhu lut thei e'
            : 'Click to select cell; double-click to type exact value; select and use +5% to batch tune'}
        </span>
        <span className="text-slate-400 font-mono">
          Unit: {map.zUnit}
        </span>
      </div>
    </div>
  );
};
