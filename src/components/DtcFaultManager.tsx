import React, { useState } from 'react';
import { StoredFaultCode } from '../types/ecu';
import { AlertCircle, Trash2, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

interface DtcFaultManagerProps {
  storedFaults: StoredFaultCode[];
  isMizo: boolean;
  onClearFaults: () => void;
  maskedCodes: string[];
  onToggleMaskCode: (code: string) => void;
}

export const DtcFaultManager: React.FC<DtcFaultManagerProps> = ({
  storedFaults,
  isMizo,
  onClearFaults,
  maskedCodes,
  onToggleMaskCode,
}) => {
  const [tab, setTab] = useState<'stored' | 'mask'>('stored');

  // Common DTC codes that tuners often mask when deleting hardware
  const commonDtcMasks = [
    { code: 'P0401', desc: 'EGR Flow Insufficient', descMizo: 'EGR valve meikhu tlang a tlem', tag: 'EGR' },
    { code: 'P0404', desc: 'EGR Circuit Range/Performance', descMizo: 'EGR valve circuit buai', tag: 'EGR' },
    { code: 'P2002', desc: 'DPF Efficiency Below Threshold', descMizo: 'DPF exhaust filter blockage/chhia', tag: 'DPF' },
    { code: 'P2452', desc: 'DPF Differential Pressure Sensor', descMizo: 'DPF differential pressure sensor buai', tag: 'DPF' },
    { code: 'P0420', desc: 'Catalytic Converter Efficiency Low', descMizo: 'Catalytic converter boruak tihthianghlimna a tlem', tag: 'CAT' },
    { code: 'P0135', desc: 'O2 Oxygen Sensor Heater Circuit', descMizo: 'O2 oxygen sensor meikhu tehna', tag: 'O2' },
    { code: 'P0299', desc: 'Turbocharger Underboost Condition', descMizo: 'Turbocharger boost pressure a hniam', tag: 'TURBO' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">
            {isMizo ? 'Flash / EEPROM Fault Code (DTC) Enna' : 'Flash / EEPROM DTC Diagnostic Manager'}
          </span>
        </div>

        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
          <button
            onClick={() => setTab('stored')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              tab === 'stored' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMizo ? `Fault Lo In-Save (${storedFaults.length})` : `Stored Faults (${storedFaults.length})`}
          </button>
          <button
            onClick={() => setTab('mask')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              tab === 'mask' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMizo ? 'DTC Mask / Block' : 'DTC Mask / Delete'}
          </button>
        </div>
      </div>

      {/* Tab 1: Stored Faults in Dump */}
      {tab === 'stored' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">
              {isMizo
                ? 'ECU flash / EEPROM memory partition aṭanga error code chhiar chhuah:'
                : 'Active trouble codes logged inside flash/EEPROM memory partition:'}
            </span>

            {storedFaults.length > 0 && (
              <button
                onClick={onClearFaults}
                className="px-3 py-1.5 bg-rose-900/40 hover:bg-rose-800/60 border border-rose-700/60 text-rose-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isMizo ? 'Fault Memory Tihfai (Clear DTCs)' : 'Clear Fault Memory (Write Zeros)'}
              </button>
            )}
          </div>

          {storedFaults.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                {isMizo ? 'DTC Fault Code In-Save Engmah A Awm Lo!' : 'No Stored Fault Codes Found in Binary Dump'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isMizo
                  ? 'Memory buffer chu a thianghlim e; ECU-ah error code lo in-chhin chhiah a awm lo.'
                  : 'The flash/EEPROM fault partition is clean. No active error codes in memory.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {storedFaults.map(fault => (
                <div
                  key={fault.code}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-amber-400 font-bold bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
                      {fault.code}
                    </span>
                    <div>
                      <p className="font-medium text-slate-200">
                        {isMizo ? fault.descriptionMizo : fault.description}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isMizo ? fault.description : fault.descriptionMizo}
                      </p>
                    </div>
                  </div>

                  {fault.freezeFrame && (
                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 self-start md:self-auto">
                      <span>{fault.freezeFrame.rpm} RPM</span>
                      <span>·</span>
                      <span>{fault.freezeFrame.speedKmH} km/h</span>
                      <span>·</span>
                      <span>{fault.freezeFrame.coolantTempC}°C</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: DTC Masking / Erasing */}
      {tab === 'mask' && (
        <div className="p-4 text-xs">
          <p className="text-slate-400 mb-3">
            {isMizo
              ? 'Hardware i phelh/block huna check engine light tieng lo tura error code ziah hnan (mask):'
              : 'Permanently disable check engine light detection for deleted emissions hardware:'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {commonDtcMasks.map(item => {
              const isMasked = maskedCodes.includes(item.code);
              return (
                <div
                  key={item.code}
                  onClick={() => onToggleMaskCode(item.code)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isMasked
                      ? 'bg-blue-950/30 border-blue-600 text-blue-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                      {item.code}
                    </span>
                    <div>
                      <span className="font-medium block text-slate-200">
                        {isMizo ? item.descMizo : item.desc}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Tag: {item.tag}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isMasked ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isMasked ? (isMizo ? 'MASKED (OFF)' : 'MASKED') : (isMizo ? 'ACTIVE' : 'ACTIVE')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
