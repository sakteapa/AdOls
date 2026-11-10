import React from 'react';
import { FeatureAuditItem } from '../types/ecu';
import { X, ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuditMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditItems: FeatureAuditItem[];
  isMizo: boolean;
  vehicleName: string;
  ecuFamily: string;
}

export const AuditMatrixModal: React.FC<AuditMatrixModalProps> = ({
  isOpen,
  onClose,
  auditItems,
  isMizo,
  vehicleName,
  ecuFamily,
}) => {
  if (!isOpen) return null;

  const supported = auditItems.filter(item => item.status === 'supported');
  const protectedItems = auditItems.filter(item => item.status === 'protected' || item.status === 'incompatible');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold text-slate-100">
                {isMizo
                  ? 'Flash File Audit: Khawih Theih Leh Khawih Theih Loh Matrix'
                  : 'Flash File Compatibility & Protection Audit Matrix'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {vehicleName} · {ecuFamily}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Section 1: Khawih Theih A Support Te (Green) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-slate-200 uppercase tracking-wide">
                {isMizo ? 'KHAWIH DANG LAM THEIH A SUPPORT TE (SUPPORTED)' : 'EDITABLE & SUPPORTED MAPS (GREEN)'}
              </h3>
              <span className="text-slate-500 font-mono">({supported.length} items)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {supported.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-950/80 border border-emerald-900/40 rounded-xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-300">
                      {isMizo ? item.nameMizo : item.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      SUPPORTED
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {isMizo ? item.descriptionMizo : item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Khawih Theih Loh / Venhim Tlat Te (Red / Amber) */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="font-bold text-slate-200 uppercase tracking-wide">
                {isMizo ? 'KHAWIH THEIH LOH / VENHIM TLAT TE (PROTECTED & LOCKED)' : 'LOCKED & PROTECTED ZONES (RED / AMBER)'}
              </h3>
              <span className="text-slate-500 font-mono">({protectedItems.length} items)</span>
            </div>

            <div className="space-y-3">
              {protectedItems.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950/80 border border-rose-900/40 rounded-xl flex items-start gap-3"
                >
                  <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-300">
                        {isMizo ? item.nameMizo : item.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800/60">
                        {item.status === 'incompatible' ? 'INCOMPATIBLE' : 'WRITE-LOCKED'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {isMizo ? item.descriptionMizo : item.description}
                    </p>
                    {item.safetyReason && (
                      <p className="text-amber-400/90 text-[10px] font-mono mt-1">
                        Safety Rationale: {item.safetyReason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            {isMizo ? 'Khar rawh' : 'Close Audit'}
          </button>
        </div>
      </div>
    </div>
  );
};
