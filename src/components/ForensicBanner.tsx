import React, { useState } from 'react';
import { ForensicReport } from '../types/ecu';
import { ShieldCheck, AlertTriangle, ShieldAlert, ChevronDown, ChevronUp, History, Info } from 'lucide-react';

interface ForensicBannerProps {
  report: ForensicReport;
  isMizo: boolean;
  onFixRiskyTune?: () => void;
}

export const ForensicBanner: React.FC<ForensicBannerProps> = ({
  report,
  isMizo,
  onFixRiskyTune,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const isStock = report.status === 'stock';
  const isHighRisk = report.riskLevel === 'high';

  return (
    <div
      className={`border rounded-xl p-3.5 transition-all ${
        isStock
          ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
          : isHighRisk
          ? 'bg-rose-950/30 border-rose-800/80 text-rose-300'
          : 'bg-amber-950/25 border-amber-800/60 text-amber-300'
      }`}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Forensic Status Icon & Title */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg border ${
              isStock
                ? 'bg-emerald-900/40 border-emerald-700/60 text-emerald-400'
                : isHighRisk
                ? 'bg-rose-900/50 border-rose-700 text-rose-400 animate-pulse'
                : 'bg-amber-900/40 border-amber-700/60 text-amber-400'
            }`}
          >
            {isStock ? (
              <ShieldCheck className="w-5 h-5" />
            ) : isHighRisk ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-mono font-bold">
                {isMizo ? 'TUNE FORENSIC AUDIT' : 'TUNE FORENSIC AUDIT'}
              </span>
              <span className="text-slate-600">·</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  isStock
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : isHighRisk
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isStock
                  ? isMizo
                    ? '100% FACTORY STOCK (KHAWIH LOH)'
                    : '100% FACTORY STOCK (OEM)'
                  : isMizo
                  ? 'KHAWIH DANGLAM TAWH (ALREADY TUNED)'
                  : 'ALREADY MODIFIED / TUNED'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-0.5">
              {isStock
                ? isMizo
                  ? 'He flash file hi factory stock a ni a, tu man an la khawih danglam lo. Checksum leh calibration a thianghlim.'
                  : 'File matches clean OEM calibration. Safe baseline for custom Stage 1 remapping.'
                : isMizo
                ? `Tuner dangin an lo khawih tawh e: ${report.detectedModsMizo.slice(0, 2).join('; ')}.`
                : `Previous modifications detected: ${report.detectedMods.slice(0, 2).join('; ')}.`}
            </p>
          </div>
        </div>

        {/* Right: Expand details button & Actions */}
        <div className="flex items-center gap-2">
          {!isStock && onFixRiskyTune && (
            <button
              onClick={onFixRiskyTune}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              {isMizo ? 'Stage 1 Him Tawk Turin Siamrem' : 'Re-calibrate Safe Stage 1'}
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-slate-300 transition-colors flex items-center gap-1"
          >
            <span>{isExpanded ? (isMizo ? 'Thup rawh' : 'Hide') : (isMizo ? 'Chipchiar' : 'Details')}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Forensic Findings Breakdown */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
            <div>
              <span className="font-semibold text-slate-200 block mb-1">
                {isMizo ? 'Hriat Chhuah Hrang Hrangte (Detected Alterations):' : 'Forensic Alteration Points:'}
              </span>
              <ul className="space-y-1 list-disc list-inside text-slate-400">
                {(isMizo ? report.detectedModsMizo : report.detectedMods).map((mod, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {mod}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">{isMizo ? 'Flash Write Count:' : 'ECU Flash Counter:'}</span>
                <span className="font-mono text-slate-200">{report.flashWriteCount} times flashed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isMizo ? 'Risk Level:' : 'Tuning Risk Level:'}</span>
                <span
                  className={`font-semibold uppercase ${
                    report.riskLevel === 'safe'
                      ? 'text-emerald-400'
                      : report.riskLevel === 'high'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {report.riskLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isMizo ? 'OEM Checksum Match:' : 'Factory Signature:'}</span>
                <span className="font-mono text-slate-200">{isStock ? 'MATCHED (Clean)' : 'PATCHED (Modified)'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
