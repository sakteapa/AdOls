import React from 'react';
import { TuningHazard } from '../utils/tuningHeuristics';
import { AlertTriangle, ShieldAlert, Sparkles, Shield, Bot, CheckCircle2 } from 'lucide-react';

interface LiveHazardAlertProps {
  hazards: TuningHazard[];
  isMizo: boolean;
  onAutoSmooth: () => void;
  onClampSafe: (ceiling: number) => void;
  onOpenAiCopilot: () => void;
}

export const LiveHazardAlert: React.FC<LiveHazardAlertProps> = ({
  hazards,
  isMizo,
  onAutoSmooth,
  onClampSafe,
  onOpenAiCopilot,
}) => {
  if (hazards.length === 0) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">
            {isMizo ? 'Engine Himna & Gradient: A Felfai Ṭha E (Nominal)' : 'Calibration Limits & Topology: Nominal & Smooth'}
          </span>
        </div>
        <button
          onClick={onOpenAiCopilot}
          className="text-[11px] text-slate-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          <Bot className="w-3.5 h-3.5 text-blue-400" />
          <span>{isMizo ? 'AI Engineer Biakna' : 'AI Copilot'}</span>
        </button>
      </div>
    );
  }

  // Active top hazard
  const primaryHazard = hazards[0];
  const isCritical = primaryHazard.severity === 'critical';

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        isCritical
          ? 'bg-rose-950/35 border-rose-700/80 text-rose-200'
          : 'bg-amber-950/30 border-amber-700/70 text-amber-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Hazard details */}
        <div className="flex items-start gap-2.5">
          <div
            className={`p-1.5 rounded-lg border mt-0.5 shrink-0 ${
              isCritical
                ? 'bg-rose-900/60 border-rose-600 text-rose-300 animate-pulse'
                : 'bg-amber-900/50 border-amber-600 text-amber-300'
            }`}
          >
            {isCritical ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                {isCritical
                  ? isMizo
                    ? 'ENGINE HLAUHAWM DETECTED!'
                    : 'CRITICAL CALIBRATION HAZARD'
                  : isMizo
                  ? 'CALIBRATION WARNING'
                  : 'CALIBRATION WARNING'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({hazards.length} {hazards.length > 1 ? 'hazards' : 'hazard'})
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-100 mt-0.5">
              {isMizo ? primaryHazard.titleMizo : primaryHazard.title}
            </p>

            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              {isMizo ? primaryHazard.descriptionMizo : primaryHazard.description}
            </p>
          </div>
        </div>

        {/* Right: 1-Click Fix Buttons & AI Copilot */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
          {primaryHazard.suggestedAction === 'smooth' && (
            <button
              onClick={onAutoSmooth}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMizo ? '✨ Auto-Smooth Cell Spikes' : '✨ Auto-Smooth Spikes'}</span>
            </button>
          )}

          {primaryHazard.safeClampValue && (
            <button
              onClick={() => onClampSafe(primaryHazard.safeClampValue!)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>
                {isMizo
                  ? `🛡️ Clamp Safe (${primaryHazard.safeClampValue})`
                  : `🛡️ Clamp Safe (${primaryHazard.safeClampValue})`}
              </span>
            </button>
          )}

          <button
            onClick={onOpenAiCopilot}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>{isMizo ? 'AI Zawt Rawh' : 'Ask AI'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
