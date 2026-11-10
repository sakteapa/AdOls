import React from 'react';
import { ImmoStatus } from '../types/ecu';
import { KeyRound, ShieldCheck, Lock, Unlock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ImmobilizerPanelProps {
  immo: ImmoStatus;
  isMizo: boolean;
  onToggleImmo: () => void;
  ecuFamily: string;
}

export const ImmobilizerPanel: React.FC<ImmobilizerPanelProps> = ({
  immo,
  isMizo,
  onToggleImmo,
  ecuFamily,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">
            {isMizo ? 'Immobilizer (Chabi Sync & Immo Off)' : 'Immobilizer Management & Immo Off'}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
            immo.supported
              ? immo.active
                ? 'bg-blue-950/60 text-blue-300 border border-blue-700/60'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
              : 'bg-amber-950/60 text-amber-300 border border-amber-700/60'
          }`}
        >
          {immo.supported ? (
            immo.active ? (
              <>
                <Lock className="w-3 h-3" />
                {isMizo ? 'IMMO ACTIVE (LOCKED)' : 'IMMO ACTIVE (FACTORY)'}
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3" />
                {isMizo ? 'IMMO OFF (BYPASSED)' : 'IMMO OFF (BYPASSED)'}
              </>
            )
          ) : (
            <>
              <Lock className="w-3 h-3" />
              {isMizo ? 'OTP / CRYPTO LOCKED' : 'OTP / CRYPTO LOCKED'}
            </>
          )}
        </span>
      </div>

      {/* Description & Technical state */}
      <div className="space-y-3 text-xs">
        <p className="text-slate-300 leading-relaxed">
          {isMizo ? immo.ecuNotesMizo : immo.ecuNotes}
        </p>

        {immo.supported ? (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">
                  {isMizo ? 'Immobilizer Bypass Switch' : 'Immobilizer Bypass (Immo Off)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isMizo
                    ? 'Chabi transponder chip tello pawha engine a nun theih nan'
                    : 'Permits engine start without transponder key validation'}
                </span>
              </div>

              <button
                onClick={onToggleImmo}
                className={`px-4 py-2 rounded-lg font-semibold text-xs shadow transition-colors flex items-center gap-1.5 ${
                  immo.active
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {immo.active ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    {isMizo ? 'Immobilizer Off (Bypass)' : 'Apply Immo Off Patch'}
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    {isMizo ? 'Factory Immo Tih Nun Leh' : 'Restore Factory Immo'}
                  </>
                )}
              </button>
            </div>

            <div className="p-2 bg-amber-950/30 border border-amber-800/40 rounded text-[11px] text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                {isMizo
                  ? 'Fimkhurna: Immobilizer i off chuan lirthei hi chabi chip tello pawhin a nung thei dawn a ni. Engine swap emaw rally/racing atan chauh hman tur a ni e.'
                  : 'Safety Note: Disabling the immobilizer allows the vehicle to start without RFID transponder sync. Recommended for engine swaps, track cars, or lost transponder recovery.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-2.5 text-slate-400 text-[11px]">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              {isMizo
                ? `ECU model (${ecuFamily}) hian hardware crypto protection a hman avangin flash calibration file mai hmangin Immo bypass a theih loh a ni. Bench BDM tool hmangin Tricore OTP reading a ngai.`
                : `Hardware crypto OTP protection is active on ${ecuFamily}. Immo bypass requires direct BDM / bench bootpin tool password extraction.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
