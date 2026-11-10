import React from 'react';
import { X, BookOpen, Wrench, Shield, Zap, Flame, KeyRound, AlertTriangle } from 'lucide-react';

interface MizoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MizoGuideModal: React.FC<MizoGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                ECU Remapping & Chip Tuning Zirtirna (Mizo Ṭawngin)
              </h2>
              <p className="text-xs text-slate-400">
                Lirthei ECU khawih laia hriat tur pawimawh leh technical terms hrilhfiahna
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Item 1: ECU Remap chu eng nge? */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              1. ECU Remap / Chip Tuning Chu Eng Nge?
            </h3>
            <p>
              Lirthei thar factory aṭanga a lo chhuahin manufacturer te hian khawvel hmun hrang hranga boruak, thau chhia/ṭha, leh tuihnang tling khawpin software an set hniam ṭhin a. <strong>Remap</strong> kan tih chu ECU (Engine Control Unit) chhunga calibration table (Boost, Fuel, Ignition timing) te lo thlak danglam a, engine thahrui (BHP & Torque) leh pickup tiṭha tura software khawih hi a ni.
            </p>
          </div>

          {/* Item 2: Turbo Boost */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-blue-400 flex items-center gap-2 text-sm">
              <Wrench className="w-4 h-4" />
              2. Turbo Boost Target & Limiter (mbar)
            </h3>
            <p>
              Turbocharged engine (Diesel Turbo emaw Petrol Turbo)-ah boruak hmeh khawm san zawng a ni. Boost a san poh leh cylinder chhungah boruak a tam a, thahrui a tam phah. Mahse, <strong>safe limit</strong> pelh khawpa boost tihsan chu turbocharger (Garrett/BorgWarner) tana a hlauhawm avangin Stage 1-ah chuan +140mbar to +180mbar bak tihsan loh a him ber.
            </p>
          </div>

          {/* Item 3: Ignition Timing */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4" />
              3. Ignition Timing Advance (BTDC)
            </h3>
            <p>
              Bike leh petrol car-ah spark plug-in mei a chhem hun tur a ni. Piston-in a chhip a thlen hma (Before Top Dead Center)-a mei chhem hian thahrui a tam a, throttle response a ti chak. Mahse timing advance lutuk chuan engine a <em>knocking</em> (ri chik chik) thei a, high octane petrol hman a ngai.
            </p>
          </div>

          {/* Item 4: Checksum awmzia */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-indigo-400 flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              4. Checksum Pawimawhna
            </h3>
            <p>
              Flash file byte tinte chhut chhuahna mathematical formula a ni. File i khawih danglam hian a checksum number pawh a danglam nghal a; software hian automatic-in a recalculate loh chuan car computer chuan "file a chhia" tiin engine a tinuang duh lo vang (ECU a brick thei). ApexECU hian export rualin checksum a tifel thlap zel.
            </p>
          </div>

          {/* Item 5: Immobilizer */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-rose-400 flex items-center gap-2 text-sm">
              <KeyRound className="w-4 h-4" />
              5. Immobilizer (Immo Off) Hman Hun
            </h3>
            <p>
              Car/Bike chabi-ah RFID transponder chip a awm a, ECU nena an in-sync chauhvin car a nung ṭhin. ECU chhia thlaka car dang ECU bun luhin emaw, chabi bova sensor sync theih loh hunah <strong>Immo Off</strong> hmang hian security bypass a ni a, chabi pangngai pawhin engine a nung thei ta a ni.
            </p>
          </div>

          {/* Item 6: EGR & DPF Delete */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              6. EGR & DPF Delete Chu Eng Nge?
            </h3>
            <p>
              Diesel lirthei-ah meikhu luh nawnna (EGR) leh exhaust soot filter (DPF) te hi kum tlemte hnuah vut vanga tawtin engine limp mode-ah a luttir ṭhin a. Remap hmanga software aṭanga switch off hian intake chhung a thianghlim a, car a zang phah em em bawk.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Ka Hrethiam E (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
