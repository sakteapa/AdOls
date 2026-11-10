import React from 'react';
import { Project } from '../types/ecu';
import { Printer, X, Download, ShieldCheck, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

interface PrintableReportPdfProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  isMizo: boolean;
}

export const PrintableReportPdf: React.FC<PrintableReportPdfProps> = ({
  project,
  isOpen,
  onClose,
  isMizo,
}) => {
  if (!isOpen) return null;

  const { vehicle, tuneMetrics, forensicReport } = project;
  const hpDelta = tuneMetrics.tunedHp - tuneMetrics.stockHp;
  const tqDelta = tuneMetrics.tunedTorqueNm - tuneMetrics.stockTorqueNm;
  const boostDeltaMbar = Math.round((tuneMetrics.tunedBoostBar - tuneMetrics.stockBoostBar) * 1000);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Container - Styled for screen preview & perfect for A4 print */}
      <div className="relative w-full max-w-4xl my-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Floating Top Controls (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm text-slate-100">
              {isMizo ? 'Remap Calibration Report PDF' : 'ECU Remap Calibration Certificate & Report'}
            </span>
            <span className="text-slate-500 text-xs">· A4 Print Ready</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-lg"
            >
              <Printer className="w-4 h-4" />
              {isMizo ? 'Print / PDF-a Save Rawh' : 'Print / Save as PDF'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="p-8 sm:p-10 bg-white text-slate-900 font-sans print-page">
          {/* Certificate Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  APEX MOTOR PERFORMANCE
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest font-mono">
                ENGINE CALIBRATION & REMAPPING LABORATORY
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Aizawl, Mizoram · India · Certified ECU Tuning Facility
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-mono text-[11px] font-bold px-3 py-1 rounded">
                CERTIFICATE ID: {project.id.toUpperCase().slice(0, 14)}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Date: {project.date}
              </p>
            </div>
          </div>

          {/* Section 1: Customer & Vehicle Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                CUSTOMER & VEHICLE
              </span>
              <p className="font-bold text-sm text-slate-900">{project.customerName}</p>
              <p className="text-slate-600">Contact: {project.customerPhone || 'N/A'}</p>
              <p className="font-mono font-semibold text-blue-700 mt-1">
                Plate No: {project.vehiclePlate}
              </p>
              <p className="text-slate-600">Odometer: {project.odometerKm.toLocaleString()} KM</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                ECU HARDWARE & CALIBRATION DUMP
              </span>
              <p className="font-bold text-slate-900">
                {vehicle.make} {vehicle.model} ({vehicle.variant})
              </p>
              <p className="text-slate-600">Engine: {vehicle.engine} ({vehicle.displacement})</p>
              <p className="font-mono text-slate-700 mt-1">ECU: {vehicle.ecuFamily}</p>
              <p className="font-mono text-slate-500 text-[11px]">
                HW: {vehicle.hardwareNumber} · SW: {vehicle.softwareNumber}
              </p>
            </div>
          </div>

          {/* Section 2: Forensic Status on Arrival */}
          <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 mb-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900">Initial Forensic Condition:</span>
              <span className="text-slate-700">
                {forensicReport.isFactoryStock
                  ? 'Vehicle arrived with 100% Factory Stock (OEM) calibration.'
                  : 'Vehicle arrived with prior aftermarket tune modifications.'}
              </span>
            </div>
            <span className="font-mono text-slate-600 text-[11px]">
              Checksum: {project.checksumValue} (Validated)
            </span>
          </div>

          {/* Section 3: Comprehensive Side-by-Side Before vs After Comparison */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <span>BEFORE (STOCK) VS AFTER (REMAP) CALIBRATION AUDIT</span>
            </h3>

            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[11px]">
                  <th className="p-2.5 text-left rounded-l">CALIBRATION PARAMETER</th>
                  <th className="p-2.5 text-center">BEFORE (ORIGINAL STOCK)</th>
                  <th className="p-2.5 text-center">AFTER (TUNED STAGE 1)</th>
                  <th className="p-2.5 text-right rounded-r">ESTIMATED DELTA / GAIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-900">Engine Peak Power</td>
                  <td className="p-2.5 text-center font-mono text-slate-600">{tuneMetrics.stockHp} BHP</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">{tuneMetrics.tunedHp} BHP</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                    +{hpDelta} BHP (+{Math.round((hpDelta / (tuneMetrics.stockHp || 1)) * 100)}%)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-900">Engine Peak Torque</td>
                  <td className="p-2.5 text-center font-mono text-slate-600">{tuneMetrics.stockTorqueNm} Nm</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">{tuneMetrics.tunedTorqueNm} Nm</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                    +{tqDelta} Nm (+{Math.round((tqDelta / (tuneMetrics.stockTorqueNm || 1)) * 100)}%)
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-900">Turbo Boost Pressure Target</td>
                  <td className="p-2.5 text-center font-mono text-slate-600">
                    {tuneMetrics.stockBoostBar > 0 ? `${tuneMetrics.stockBoostBar} Bar` : 'N/A (Atmo)'}
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                    {tuneMetrics.tunedBoostBar > 0 ? `${tuneMetrics.tunedBoostBar} Bar` : 'N/A (Atmo)'}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-blue-600">
                    {tuneMetrics.stockBoostBar > 0 ? `+${boostDeltaMbar} mbar (+12%)` : '—'}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-900">Common Rail Delivery Pressure</td>
                  <td className="p-2.5 text-center font-mono text-slate-600">
                    {tuneMetrics.stockRailBar > 0 ? `${tuneMetrics.stockRailBar} Bar` : 'Port Injected'}
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                    {tuneMetrics.tunedRailBar > 0 ? `${tuneMetrics.tunedRailBar} Bar` : 'Port Injected'}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-blue-600">
                    {tuneMetrics.stockRailBar > 0 ? `+${tuneMetrics.tunedRailBar - tuneMetrics.stockRailBar} Bar (+4%)` : '—'}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-900">Engine Speed (Rev Limiter)</td>
                  <td className="p-2.5 text-center font-mono text-slate-600">{tuneMetrics.stockRevLimitRpm} RPM</td>
                  <td className="p-2.5 text-center font-mono font-bold text-slate-900">{tuneMetrics.tunedRevLimitRpm} RPM</td>
                  <td className="p-2.5 text-right font-mono font-bold text-blue-600">
                    +{tuneMetrics.tunedRevLimitRpm - tuneMetrics.stockRevLimitRpm} RPM
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-900">2-Step Launch Control</td>
                  <td className="p-2.5 text-center font-mono text-slate-500">FACTORY OFF</td>
                  <td className="p-2.5 text-center font-mono font-semibold text-slate-900">
                    {tuneMetrics.launchControlEnabled ? `ENABLED (${tuneMetrics.launchControlRpm} RPM)` : 'DISABLED'}
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-700">
                    {tuneMetrics.launchControlEnabled ? 'Stationary Rev Cut' : 'Standard'}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-900">Exhaust Pop & Bang Overrun</td>
                  <td className="p-2.5 text-center font-mono text-slate-500">OFF (0 ms)</td>
                  <td className="p-2.5 text-center font-mono font-semibold text-slate-900">
                    {tuneMetrics.popBangEnabled ? `ENABLED (${tuneMetrics.popBangDelayMs} ms)` : 'OFF'}
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-700">
                    {tuneMetrics.popBangEnabled ? 'Decel Fuel Cut Delay' : 'Factory Quiet'}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-900">EGR & DPF Emissions Config</td>
                  <td className="p-2.5 text-center font-mono text-slate-600">Active (OEM Closed-loop)</td>
                  <td className="p-2.5 text-center font-mono font-semibold text-slate-900">
                    {tuneMetrics.egrDisabled ? 'EGR OFF' : 'EGR OEM'} · {tuneMetrics.dpfDisabled ? 'DPF OFF' : 'DPF OEM'}
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-700">
                    {tuneMetrics.egrDisabled || tuneMetrics.dpfDisabled ? 'Hardware Bypassed' : 'Intact'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Altered Maps Verification Table */}
          <div className="mb-6">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2">
              MODIFIED CALIBRATION TABLES
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {project.maps.map(map => {
                let changedCells = 0;
                map.data.forEach((row, r) => {
                  row.forEach((v, c) => {
                    if (v !== map.originalData[r]?.[c]) changedCells++;
                  });
                });
                return (
                  <div key={map.id} className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between">
                    <span className="text-slate-800 font-sans font-medium">{map.name}</span>
                    <span className={changedCells > 0 ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                      {changedCells > 0 ? `${changedCells} cells tuned` : 'OEM Unchanged'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Handover Signatures & Disclaimer */}
          <div className="pt-6 border-t-2 border-slate-900 text-xs text-slate-700">
            <p className="text-[10px] text-slate-500 leading-relaxed mb-6">
              DISCLAIMER & TERMS: All performance calibrations and emissions modifications are performed strictly in compliance with automotive workshop guidelines. Modified flash files are checksum-verified before vehicle flashing. Customer acknowledges handover of calibrated vehicle.
            </p>

            <div className="grid grid-cols-2 gap-12 pt-4">
              <div>
                <div className="border-b border-slate-400 pb-8 text-center text-slate-400 font-mono text-[10px]">
                  [ Tuner Signature & Official Seal ]
                </div>
                <p className="text-center font-bold text-slate-900 mt-1">{project.tunerName}</p>
                <p className="text-center text-[10px] text-slate-500">Chief ECU Calibration Engineer</p>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-8 text-center text-slate-400 font-mono text-[10px]">
                  [ Customer Acknowledgment Signature ]
                </div>
                <p className="text-center font-bold text-slate-900 mt-1">{project.customerName}</p>
                <p className="text-center text-[10px] text-slate-500">Vehicle Owner / Driver</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
