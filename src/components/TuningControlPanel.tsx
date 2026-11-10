import React from 'react';
import { Project, TuneMetrics } from '../types/ecu';
import { Zap, Flame, Shield, Gauge, Sliders, RotateCcw, Check, Power, AlertCircle } from 'lucide-react';

interface TuningControlPanelProps {
  project: Project;
  isMizo: boolean;
  onApplyStage1: () => void;
  onRevertToStock: () => void;
  onUpdateMetrics: (updated: Partial<TuneMetrics>) => void;
}

export const TuningControlPanel: React.FC<TuningControlPanelProps> = ({
  project,
  isMizo,
  onApplyStage1,
  onRevertToStock,
  onUpdateMetrics,
}) => {
  const { tuneMetrics } = project;
  const isTuned = tuneMetrics.tunedHp > tuneMetrics.stockHp;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-4 space-y-4">
      {/* Stage 1 Quick Tune Banner */}
      <div className="p-3.5 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-700/60 rounded-xl flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-blue-400" />
            {isMizo ? 'Stage 1 Performance Calibrate' : 'Stage 1 Fast Calibrator'}
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            {isMizo
              ? 'Engine tichhe lo tawk vel turin Boost (+140mbar), Torque (+18%), leh Timing a tiṭha.'
              : 'Safely scales Driver Wish, Boost (+140mbar), Rail Pressure (+4%), and Timing.'}
          </p>
        </div>

        <button
          onClick={onApplyStage1}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          {isTuned ? (isMizo ? 'Re-Apply Stage 1' : 'Re-Apply') : (isMizo ? 'Apply Stage 1' : 'Apply Stage 1')}
        </button>
      </div>

      {/* Real-time Estimated Gains Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center">
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Power (BHP)</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-xs text-slate-400 font-mono">{tuneMetrics.stockHp}</span>
            <span className="text-slate-600">→</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{tuneMetrics.tunedHp}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold font-mono">
            +{tuneMetrics.tunedHp - tuneMetrics.stockHp} HP
          </span>
        </div>

        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Torque (Nm)</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-xs text-slate-400 font-mono">{tuneMetrics.stockTorqueNm}</span>
            <span className="text-slate-600">→</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{tuneMetrics.tunedTorqueNm}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold font-mono">
            +{tuneMetrics.tunedTorqueNm - tuneMetrics.stockTorqueNm} Nm
          </span>
        </div>

        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Peak Boost</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-xs text-slate-400 font-mono">{tuneMetrics.stockBoostBar}</span>
            <span className="text-slate-600">→</span>
            <span className="text-sm font-bold font-mono text-amber-400">{tuneMetrics.tunedBoostBar}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-semibold font-mono">
            {tuneMetrics.stockBoostBar > 0
              ? `+${Math.round((tuneMetrics.tunedBoostBar - tuneMetrics.stockBoostBar) * 1000)} mbar`
              : 'N/A (Atmospheric)'}
          </span>
        </div>

        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Rev Limit</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-xs text-slate-400 font-mono">{tuneMetrics.stockRevLimitRpm}</span>
            <span className="text-slate-600">→</span>
            <span className="text-sm font-bold font-mono text-blue-400">{tuneMetrics.tunedRevLimitRpm}</span>
          </div>
          <span className="text-[10px] text-blue-400 font-semibold font-mono">
            +{tuneMetrics.tunedRevLimitRpm - tuneMetrics.stockRevLimitRpm} RPM
          </span>
        </div>
      </div>

      {/* Sliders & Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
        {/* RPM Rev Limiter & Launch Control */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              {isMizo ? 'Rev Limiter & Cut' : 'RPM Rev Limiter Ceiling'}
            </span>
            <span className="font-mono text-blue-400 font-bold">{tuneMetrics.tunedRevLimitRpm} RPM</span>
          </div>

          <input
            type="range"
            min={tuneMetrics.stockRevLimitRpm}
            max={tuneMetrics.stockRevLimitRpm + 1200}
            step={50}
            value={tuneMetrics.tunedRevLimitRpm}
            onChange={e => onUpdateMetrics({ tunedRevLimitRpm: parseInt(e.target.value) })}
            className="w-full accent-blue-500 cursor-pointer"
          />

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-200 block">
                {isMizo ? 'Stationary Launch Control' : '2-Step Launch Control'}
              </span>
              <span className="text-[10px] text-slate-500">
                {isMizo ? 'Car din laia rev limit kharna' : 'Stationary clutch-in rev cut'}
              </span>
            </div>

            <button
              onClick={() => onUpdateMetrics({ launchControlEnabled: !tuneMetrics.launchControlEnabled })}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                tuneMetrics.launchControlEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tuneMetrics.launchControlEnabled ? (isMizo ? 'ON (Active)' : 'ENABLED') : (isMizo ? 'OFF' : 'OFF')}
            </button>
          </div>
        </div>

        {/* Pop & Bang / Burble & Emissions */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {isMizo ? 'Pop & Bang (Burble)' : 'Pop & Bang Overrun'}
            </span>
            <button
              onClick={() => onUpdateMetrics({ popBangEnabled: !tuneMetrics.popBangEnabled, popBangDelayMs: !tuneMetrics.popBangEnabled ? 250 : 0 })}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                tuneMetrics.popBangEnabled
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tuneMetrics.popBangEnabled ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {tuneMetrics.popBangEnabled && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{isMizo ? 'Deceleration Delay:' : 'Overrun Duration:'}</span>
                <span className="font-mono text-amber-300 font-bold">{tuneMetrics.popBangDelayMs} ms</span>
              </div>
              <input
                type="range"
                min={100}
                max={500}
                step={50}
                value={tuneMetrics.popBangDelayMs}
                onChange={e => onUpdateMetrics({ popBangDelayMs: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          )}

          {/* EGR & DPF Delete Matrix */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400 font-mono">EGR Off:</span>
            <button
              onClick={() => onUpdateMetrics({ egrDisabled: !tuneMetrics.egrDisabled })}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                tuneMetrics.egrDisabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tuneMetrics.egrDisabled ? 'DISABLED' : 'OEM'}
            </button>

            <span className="text-[11px] text-slate-400 font-mono">DPF Off:</span>
            <button
              onClick={() => onUpdateMetrics({ dpfDisabled: !tuneMetrics.dpfDisabled })}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                tuneMetrics.dpfDisabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tuneMetrics.dpfDisabled ? 'DISABLED' : 'OEM'}
            </button>
          </div>
        </div>
      </div>

      {/* Checksum Status & Reset action */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-[11px] text-slate-300">
            Checksum: <strong className="text-emerald-400">{project.checksumValue}</strong> (Auto-recalculated)
          </span>
        </div>

        <button
          onClick={onRevertToStock}
          className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
        >
          <RotateCcw className="w-3 h-3" />
          {isMizo ? 'Original Stock-ah let leh rawh' : 'Revert All to Factory Stock'}
        </button>
      </div>
    </div>
  );
};
