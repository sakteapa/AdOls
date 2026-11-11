import React, { useState, useMemo } from 'react';
import { Project, EcuMapDefinition } from '../types/ecu';
import { Binary, Search, Compass, Eye, Shield, CheckCircle2, ChevronRight, Hash, Database, Layers } from 'lucide-react';

interface DeepHexInspectorProps {
  project: Project;
  isMizo: boolean;
  onSelectMap?: (mapId: string) => void;
}

interface SectorInfo {
  name: string;
  nameMizo: string;
  startOffset: number;
  endOffset: number;
  sizeKb: number;
  purpose: string;
  purposeMizo: string;
  status: 'locked' | 'writable' | 'calibrated' | 'verified';
  badgeColor: string;
}

export const DeepHexInspector: React.FC<DeepHexInspectorProps> = ({
  project,
  isMizo,
  onSelectMap,
}) => {
  // Current view offset in hex dump (page-based virtual window)
  const [currentOffset, setCurrentOffset] = useState<number>(0x1c4000);
  const [jumpInput, setJumpInput] = useState<string>('0x1c4000');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedByteOffset, setSelectedByteOffset] = useState<number>(0x1c4200);
  const [subTab, setSubTab] = useState<'hex' | 'sectors' | 'diffs'>('hex');

  const rowsPerPage = 24; // 24 rows * 16 bytes = 384 bytes per view window
  const bytesPerRow = 16;
  const pageSize = rowsPerPage * bytesPerRow;

  // Flash Memory Partition / Sector Map
  const sectors: SectorInfo[] = useMemo(() => {
    return [
      {
        name: 'Sector 0: Bootloader Partition',
        nameMizo: 'Sector 0: ECU Bootloader Partition',
        startOffset: 0x000000,
        endOffset: 0x007fff,
        sizeKb: 32,
        purpose: 'Microcontroller hardware startup & recovery code.',
        purposeMizo: 'ECU processor nuntirna leh recovery code; khawih loh tur.',
        status: 'locked',
        badgeColor: 'rose',
      },
      {
        name: 'Sector 1: Calibration Header & Map Directory',
        nameMizo: 'Sector 1: Calibration Header & Map Index',
        startOffset: 0x008000,
        endOffset: 0x01ffff,
        sizeKb: 96,
        purpose: 'ASCII part numbers, Bosch HW/SW tags, and map index table.',
        purposeMizo: 'Hardware leh software part number, map zawn chhuahna index.',
        status: 'verified',
        badgeColor: 'blue',
      },
      {
        name: 'Sector 2: Performance Maps & Tables',
        nameMizo: 'Sector 2: Main Performance Maps & Matrices',
        startOffset: 0x020000,
        endOffset: 0x1bffff,
        sizeKb: 1664,
        purpose: '16x16 / 12x16 Fuel, Boost, Ignition, and Limiter arrays.',
        purposeMizo: 'Fuel, Boost, Spark advance leh Torque map awmna hmunpui.',
        status: 'calibrated',
        badgeColor: 'emerald',
      },
      {
        name: 'Sector 3: Dynamic Calibration Flash Zone',
        nameMizo: 'Sector 3: Active Stage Calibration Zone',
        startOffset: 0x1c0000,
        endOffset: 0x1effff,
        sizeKb: 192,
        purpose: 'Driver wish, turbo boost target, and common rail pressure blocks.',
        purposeMizo: 'Pedal response leh turbo boost target ziah danglam theihna.',
        status: 'writable',
        badgeColor: 'amber',
      },
      {
        name: 'Sector 4: NVRAM / Stored Fault Memory (Fehlerspeicher)',
        nameMizo: 'Sector 4: Fault Memory & Shadow Counter',
        startOffset: 0x1f0000,
        endOffset: 0x1fdfff,
        sizeKb: 56,
        purpose: 'Diagnostic Trouble Codes (DTC), flash write counters, freeze frame.',
        purposeMizo: 'DTC error codes leh vawi engzat nge flash tawh tih chhinchhiahna.',
        status: 'writable',
        badgeColor: 'rose',
      },
      {
        name: 'Sector 5: Checksum & Cryptographic Signature Block',
        nameMizo: 'Sector 5: Checksum & Security Footer',
        startOffset: 0x1fe000,
        endOffset: 0x1fffff,
        sizeKb: 8,
        purpose: '16-bit additive CRC checksum & RSA/Tricore signature.',
        purposeMizo: 'File integrity check-na leh mathematical checksum verification.',
        status: 'verified',
        badgeColor: 'violet',
      },
    ];
  }, []);

  // Synthetic deterministic byte generator for the hex window
  const getByteAt = (addr: number): number => {
    // Check if within any active map
    for (const map of project.maps) {
      const mapSize = map.rows * map.cols * 2;
      if (addr >= map.offset && addr < map.offset + mapSize) {
        const index = Math.floor((addr - map.offset) / 2);
        const r = Math.floor(index / map.cols);
        const c = index % map.cols;
        if (r < map.rows && c < map.cols) {
          const val = Math.round(map.data[r][c] * 10);
          return (addr % 2 === 0 ? val : val >> 8) & 0xff;
        }
      }
    }

    // Check for ASCII signature near header
    if (addr >= 0x008100 && addr < 0x008140) {
      const str = `${project.vehicle.hardwareNumber} ${project.vehicle.softwareNumber}`;
      const charIdx = addr - 0x008100;
      if (charIdx < str.length) return str.charCodeAt(charIdx);
    }

    // Checksum block at end
    if (addr >= 0x1fffc) {
      return (parseInt(project.checksumValue, 16) >> ((addr % 2) * 8)) & 0xff;
    }

    // Pseudo-random deterministic ROM pattern
    return (Math.sin(addr * 0.1) * 127 + 128) & 0xff;
  };

  const getStockByteAt = (addr: number): number => {
    for (const map of project.maps) {
      const mapSize = map.rows * map.cols * 2;
      if (addr >= map.offset && addr < map.offset + mapSize) {
        const index = Math.floor((addr - map.offset) / 2);
        const r = Math.floor(index / map.cols);
        const c = index % map.cols;
        if (r < map.rows && c < map.cols) {
          const val = Math.round((map.originalData[r]?.[c] ?? map.data[r][c]) * 10);
          return (addr % 2 === 0 ? val : val >> 8) & 0xff;
        }
      }
    }
    return getByteAt(addr);
  };

  // Compile list of modified bytes across maps
  const modifiedBytesList = useMemo(() => {
    const list: { offset: number; origByte: number; tunedByte: number; mapName: string }[] = [];
    project.maps.forEach(map => {
      let off = map.offset;
      map.data.forEach((row, r) => {
        row.forEach((currVal, c) => {
          const origVal = map.originalData[r]?.[c] ?? currVal;
          if (currVal !== origVal) {
            const intCurr = Math.round(currVal * 10) & 0xffff;
            const intOrig = Math.round(origVal * 10) & 0xffff;
            list.push({
              offset: off,
              origByte: intOrig & 0xff,
              tunedByte: intCurr & 0xff,
              mapName: map.name,
            });
            list.push({
              offset: off + 1,
              origByte: (intOrig >> 8) & 0xff,
              tunedByte: (intCurr >> 8) & 0xff,
              mapName: map.name,
            });
          }
          off += 2;
        });
      });
    });
    return list;
  }, [project.maps]);

  // Jump to offset handler
  const handleJump = () => {
    let clean = jumpInput.trim().toLowerCase();
    if (clean.startsWith('0x')) clean = clean.slice(2);
    const parsed = parseInt(clean, 16);
    if (!isNaN(parsed) && parsed >= 0) {
      setCurrentOffset(Math.floor(parsed / 16) * 16);
      setSelectedByteOffset(parsed);
    }
  };

  // Data Inspector calculations for the currently clicked byte
  const inspectedData = useMemo(() => {
    const b0 = getByteAt(selectedByteOffset);
    const b1 = getByteAt(selectedByteOffset + 1);
    const b2 = getByteAt(selectedByteOffset + 2);
    const b3 = getByteAt(selectedByteOffset + 3);

    const u8 = b0;
    const i8 = b0 > 127 ? b0 - 256 : b0;
    const u16le = b0 | (b1 << 8);
    const u16be = (b0 << 8) | b1;
    const i16le = u16le > 32767 ? u16le - 65536 : u16le;
    const u32le = (b0 | (b1 << 8) | (b2 << 16) | (b3 << 24)) >>> 0;
    const binaryStr = b0.toString(2).padStart(8, '0');
    const asciiChar = b0 >= 32 && b0 <= 126 ? String.fromCharCode(b0) : '·';

    // Check if byte is part of a map
    const ownerMap = project.maps.find(m => {
      const size = m.rows * m.cols * 2;
      return selectedByteOffset >= m.offset && selectedByteOffset < m.offset + size;
    });

    return {
      offset: selectedByteOffset,
      hexOffset: '0x' + selectedByteOffset.toString(16).toUpperCase().padStart(6, '0'),
      u8,
      i8,
      u16le,
      u16be,
      i16le,
      u32le,
      binaryStr,
      asciiChar,
      ownerMap,
    };
  }, [selectedByteOffset, project.maps]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col text-slate-100 select-none">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Binary className="w-5 h-5 text-blue-400" />
          <div>
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              {isMizo ? 'Flash File Chipchiar & Hex Sector Inspector' : 'Deep Flash Binary & Hex Sector Inspector'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ROM Size: {(project.fileSize / 1024).toFixed(0)} KB · {project.vehicle.ecuFamily}
            </span>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
          <button
            onClick={() => setSubTab('hex')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              subTab === 'hex' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMizo ? '16-Col Hex Dump' : 'Hex Dump'}
          </button>
          <button
            onClick={() => setSubTab('sectors')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              subTab === 'sectors' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMizo ? 'Sector Partitions' : 'Sector Map'}
          </button>
          <button
            onClick={() => setSubTab('diffs')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              subTab === 'diffs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMizo ? `Bytes Altered (${modifiedBytesList.length})` : `Diff Stream (${modifiedBytesList.length})`}
          </button>
        </div>
      </div>

      {/* Tab 1: 16-Column Hex & ASCII Dump View */}
      {subTab === 'hex' && (
        <div className="flex flex-col lg:flex-row">
          {/* Main Hex Grid */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Hex Navigation Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Jump to Offset:</span>
                <input
                  type="text"
                  value={jumpInput}
                  onChange={e => setJumpInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJump()}
                  className="w-28 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-blue-400 font-bold outline-none text-xs"
                />
                <button
                  onClick={handleJump}
                  className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-sans font-medium"
                >
                  Go
                </button>
              </div>

              {/* Map Fast Jump Shortcuts */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-slate-500 text-[10px]">Maps:</span>
                {project.maps.slice(0, 3).map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCurrentOffset(Math.floor(m.offset / 16) * 16);
                      setSelectedByteOffset(m.offset);
                      setJumpInput('0x' + m.offset.toString(16).toLowerCase());
                    }}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 whitespace-nowrap"
                  >
                    {m.name.split('(')[0].slice(0, 14)}
                  </button>
                ))}
              </div>
            </div>

            {/* 16-Column Byte Stream Table */}
            <div className="p-3 bg-slate-950 overflow-x-auto font-mono text-[11px] max-h-[460px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-slate-500 text-[10px] border-b border-slate-800/80">
                    <th className="text-left py-1 pr-3 w-20">OFFSET</th>
                    <th className="text-center px-1" colSpan={8}>00 01 02 03 04 05 06 07</th>
                    <th className="text-center px-1" colSpan={8}>08 09 0A 0B 0C 0D 0E 0F</th>
                    <th className="text-left pl-3">ASCII DECODE</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowsPerPage }).map((_, rowIdx) => {
                    const rowOffset = currentOffset + rowIdx * bytesPerRow;
                    const hexOffsetStr = '0x' + rowOffset.toString(16).toUpperCase().padStart(6, '0');

                    // Gather 16 bytes for this row
                    const rowBytes: { addr: number; val: number; isMod: boolean; isOwnerMap: boolean }[] = [];
                    for (let b = 0; b < bytesPerRow; b++) {
                      const addr = rowOffset + b;
                      const val = getByteAt(addr);
                      const stockVal = getStockByteAt(addr);
                      const isMod = val !== stockVal;
                      const isOwnerMap = project.maps.some(m => {
                        const size = m.rows * m.cols * 2;
                        return addr >= m.offset && addr < m.offset + size;
                      });
                      rowBytes.push({ addr, val, isMod, isOwnerMap });
                    }

                    // ASCII preview string
                    const asciiStr = rowBytes
                      .map(b => (b.val >= 32 && b.val <= 126 ? String.fromCharCode(b.val) : '.'))
                      .join('');

                    return (
                      <tr key={rowIdx} className="hover:bg-slate-900/50">
                        {/* Offset Address */}
                        <td className="text-slate-500 py-0.5 pr-3 select-none font-semibold">
                          {hexOffsetStr}
                        </td>

                        {/* First 8 Bytes */}
                        {rowBytes.slice(0, 8).map(b => (
                          <td
                            key={b.addr}
                            onClick={() => setSelectedByteOffset(b.addr)}
                            className={`px-1 py-0.5 text-center cursor-pointer transition-colors ${
                              selectedByteOffset === b.addr
                                ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-300'
                                : b.isMod
                                ? 'bg-amber-500/20 text-amber-300 font-bold'
                                : b.isOwnerMap
                                ? 'text-blue-300 hover:text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {b.val.toString(16).toUpperCase().padStart(2, '0')}
                          </td>
                        ))}

                        {/* Last 8 Bytes */}
                        {rowBytes.slice(8, 16).map(b => (
                          <td
                            key={b.addr}
                            onClick={() => setSelectedByteOffset(b.addr)}
                            className={`px-1 py-0.5 text-center cursor-pointer transition-colors ${
                              selectedByteOffset === b.addr
                                ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-300'
                                : b.isMod
                                ? 'bg-amber-500/20 text-amber-300 font-bold'
                                : b.isOwnerMap
                                ? 'text-blue-300 hover:text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {b.val.toString(16).toUpperCase().padStart(2, '0')}
                          </td>
                        ))}

                        {/* ASCII preview */}
                        <td className="text-slate-500 pl-3 py-0.5 select-none font-mono">
                          {asciiStr}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination / Stepper */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs font-mono">
              <button
                onClick={() => setCurrentOffset(prev => Math.max(0, prev - pageSize))}
                disabled={currentOffset === 0}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded text-slate-300"
              >
                ← Prev Block
              </button>

              <span className="text-slate-400 text-[11px]">
                Showing 0x{currentOffset.toString(16).toUpperCase()} — 0x
                {(currentOffset + pageSize).toString(16).toUpperCase()}
              </span>

              <button
                onClick={() => setCurrentOffset(prev => prev + pageSize)}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 rounded text-slate-300"
              >
                Next Block →
              </button>
            </div>
          </div>

          {/* Right: Data Type Inspector & Value Interpreter */}
          <div className="w-full lg:w-72 bg-slate-950 p-4 space-y-4 text-xs font-mono shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-sans font-semibold uppercase tracking-wider mb-1">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                <span>{isMizo ? 'Byte Data Inspector' : 'Data Inspector'}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="text-blue-400 font-bold">{inspectedData.hexOffset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Binary 8-Bit:</span>
                  <span className="text-slate-300">{inspectedData.binaryStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ASCII Char:</span>
                  <span className="text-amber-300 font-bold">'{inspectedData.asciiChar}'</span>
                </div>
              </div>
            </div>

            {/* Type decodings */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-sans font-semibold uppercase tracking-wider">
                DECODED NUMBER FORMATS
              </span>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">UInt8:</span>
                  <span className="text-slate-200">{inspectedData.u8}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Int8 (Signed):</span>
                  <span className="text-slate-200">{inspectedData.i8}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UInt16 (LE):</span>
                  <span className="text-emerald-400 font-bold">{inspectedData.u16le}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UInt16 (BE):</span>
                  <span className="text-slate-200">{inspectedData.u16be}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Int16 (Signed):</span>
                  <span className="text-slate-200">{inspectedData.i16le}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UInt32:</span>
                  <span className="text-slate-200">{inspectedData.u32le}</span>
                </div>
              </div>
            </div>

            {/* Map association info */}
            {inspectedData.ownerMap && (
              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg space-y-1">
                <span className="text-[10px] text-blue-400 font-sans font-bold uppercase">
                  Associated Calibration Map
                </span>
                <p className="text-xs font-bold text-slate-200 font-sans">
                  {inspectedData.ownerMap.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Offset: 0x{inspectedData.ownerMap.offset.toString(16).toUpperCase()} · Unit: {inspectedData.ownerMap.zUnit}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Sector Partitions Map */}
      {subTab === 'sectors' && (
        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-xs text-slate-400">
            {isMizo
              ? 'ECU flash memory partition hrang hrangte dinhmun, bootloader locked sector leh writable calibration zones:'
              : 'Complete structural breakdown of ECU flash memory layout, partition boundaries, and security protection flags:'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sectors.map(sector => (
              <div
                key={sector.name}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-100">
                      {isMizo ? sector.nameMizo : sector.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        sector.status === 'locked'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : sector.status === 'writable'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {sector.status}
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed">
                    {isMizo ? sector.purposeMizo : sector.purpose}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>
                    0x{sector.startOffset.toString(16).toUpperCase()} — 0x
                    {sector.endOffset.toString(16).toUpperCase()}
                  </span>
                  <span className="text-slate-300 font-semibold">{sector.sizeKb} KB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Binary Difference Stream (Altered Bytes) */}
      {subTab === 'diffs' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-slate-100">
                {isMizo ? 'Flash Bytes Khawih Danglam Tawhte (Diff Stream)' : 'Byte-Level Modification Difference Stream'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isMizo
                  ? 'Stock file leh Tuned file inan lohna byte tinte a hnuai-ah hian chiang takin a lang e:'
                  : 'Every single byte delta between Original Stock and Current Modified Flash buffer:'}
              </p>
            </div>

            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-bold">
              {modifiedBytesList.length} bytes altered
            </span>
          </div>

          {modifiedBytesList.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                {isMizo ? 'Flash File Hi Stock Nena Inang Chiah A La Ni' : 'Zero Differences — Binary Exactly Matches Stock'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isMizo
                  ? 'Table-ah cell i khawih danglam apiangin heta byte inthlakna hi a rawn lang nghal zung zung ang.'
                  : 'Modify any cell in the table or apply Stage 1 to stream byte-level diffs here.'}
              </p>
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto space-y-2">
              {modifiedBytesList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-bold">
                      0x{item.offset.toString(16).toUpperCase().padStart(6, '0')}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 font-sans">{item.mapName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 line-through">
                      0x{item.origByte.toString(16).toUpperCase().padStart(2, '0')}
                    </span>
                    <span className="text-slate-600">→</span>
                    <span className="text-amber-400 font-bold">
                      0x{item.tunedByte.toString(16).toUpperCase().padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentOffset(Math.floor(item.offset / 16) * 16);
                        setSelectedByteOffset(item.offset);
                        setSubTab('hex');
                      }}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 font-sans"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
