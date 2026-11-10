import React, { useState } from 'react';
import { Project } from '../types/ecu';
import { SAMPLE_VEHICLES } from '../data/sampleVehicles';
import { parseUploadedEcuBinary } from '../utils/binaryEngine';
import { FolderPlus, FolderOpen, Upload, Car, X, Check, FileCheck, Shield, Sparkles } from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  canClose: boolean;
  savedProjects: Project[];
  activeProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  isMizo: boolean;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  canClose,
  savedProjects,
  activeProjectId,
  onSelectProject,
  onDeleteProject,
  isMizo,
}) => {
  const [tab, setTab] = useState<'new' | 'vault' | 'templates'>('new');

  // Form fields for new project
  const [projectName, setProjectName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('MZ-01-');
  const [odometerKm, setOdometerKm] = useState<number>(45000);
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const project = await parseUploadedEcuBinary(
        buffer,
        file.name,
        customerName || 'Customer',
        customerPhone,
        vehiclePlate || 'MZ-01-A-0001',
        'Apex Motor Performance Aizawl',
        'Samuel L.'
      );

      if (projectName) {
        project.name = projectName;
      }
      if (notes) {
        project.notes = notes;
      }
      project.odometerKm = odometerKm;

      onSelectProject(project);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectTemplate = (templateFunc: () => Project) => {
    const project = templateFunc();
    if (customerName) project.customerName = customerName;
    if (vehiclePlate && vehiclePlate !== 'MZ-01-') project.vehiclePlate = vehiclePlate;
    if (projectName) project.name = projectName;
    if (notes) project.notes = notes;
    project.odometerKm = odometerKm;

    onSelectProject(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-400" />
              {isMizo ? 'Project Hawnna & File Buai Lo Nan In-Lock Hran' : 'ECU Tuning Project Workspace Selector'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isMizo
                ? 'Flash file a buai loh nan project thar hawn phawt zel a ngai e. Original stock file chu locked a ni ang.'
                : 'Mandatory project isolation: All original stock files are locked as immutable backups.'}
            </p>
          </div>

          {canClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 bg-slate-900 border-b border-slate-800 text-xs">
          <button
            onClick={() => setTab('new')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'new'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            {isMizo ? 'Project Thar Siam (New Project)' : 'Create New Project'}
          </button>

          <button
            onClick={() => setTab('templates')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'templates'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            {isMizo ? 'India Lirthei Sample Flash' : 'Indian Vehicle Templates'}
          </button>

          <button
            onClick={() => setTab('vault')}
            className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'vault'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            {isMizo ? `Project Save Tawhte (${savedProjects.length})` : `Saved Projects (${savedProjects.length})`}
          </button>
        </div>

        {/* Tab 1: New Project Wizard */}
        {tab === 'new' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isMizo ? 'Customer Hming (Owner Name)' : 'Customer Name'} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lalrinawma Ralte"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isMizo ? 'Phone Number' : 'Contact Phone'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 94361 23456"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isMizo ? 'Lirthei Number (Plate No)' : 'Vehicle Registration Plate No'} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MZ-01-A-7788"
                  value={vehiclePlate}
                  onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-blue-400 font-mono font-bold focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isMizo ? 'Odometer (KM)' : 'Odometer Reading (KM)'}
                </label>
                <input
                  type="number"
                  value={odometerKm}
                  onChange={e => setOdometerKm(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {isMizo ? 'Project Hming (Title)' : 'Project Name'}
              </label>
              <input
                type="text"
                placeholder={isMizo ? 'e.g. Thar 2.2 Stage 1 - MZ-01-A-7788' : 'e.g. Thar 2.2 CRDe Stage 1 Calibration'}
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Drag and Drop Flash Upload */}
            <div className="pt-2">
              <label className="block text-slate-300 font-semibold mb-1.5">
                {isMizo
                  ? 'ECU Flash File (.bin, .hex, .rom) emaw EEPROM (.eep) Upload Rawh'
                  : 'Upload ECU Flash Binary (.bin, .hex, .rom) or EEPROM (.eep)'}
              </label>

              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl bg-slate-950/60 cursor-pointer transition-all group">
                <Upload className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-200 text-xs">
                  {isProcessing
                    ? isMizo
                      ? 'Flash file a chhiar mek...'
                      : 'Analyzing Flash Binary...'
                    : isMizo
                    ? 'Flash file thlang la emaw helai hmunah hian rawn vawm lut rawh'
                    : 'Click to browse or drop ECU binary dump here'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Supports Bosch, Marelli, Delphi, Continental, Denso, Keihin (512KB to 8MB)
                </span>
                <input
                  type="file"
                  accept=".bin,.hex,.rom,.ori,.eep"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
            </div>

            <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg text-blue-300 text-[11px] flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                {isMizo
                  ? 'File thun luh hi a chhung ah a in-lock hrang thlap ang a, Original Stock chu tihdanglam theih lohvin a awm hlen dawn a ni.'
                  : 'Safety Guarantee: Stock calibration is cryptographically fingerprinted and locked as read-only.'}
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Instant Templates for Indian Vehicles */}
        {tab === 'templates' && (
          <div className="p-6 overflow-y-auto space-y-3 text-xs">
            <p className="text-slate-400 mb-2">
              {isMizo
                ? 'Flash file i la nei lo a nih pawhin, India ram lirthei hman lar ber ber sample flash file te hi i thlang thei e:'
                : 'No hardware cable ready? Test immediately with authentic pre-loaded Indian vehicle calibrations:'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SAMPLE_VEHICLES.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.projectTemplate)}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl cursor-pointer transition-all hover:bg-slate-800/40 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                        {isMizo ? template.nameMizo : template.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                        {template.badge}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      {template.category === 'bike'
                        ? 'Motorcycle EFI · Single Cylinder · Spark Advance'
                        : template.category === 'mod_example'
                        ? 'Forensic Tamper Detection Demo · Overboost + DTC Wiped'
                        : 'Common Rail Turbo Diesel / Petrol · Full Map Stack'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-blue-400 font-medium">
                    <span>{isMizo ? 'Project hawnna' : 'Load Calibration Project'}</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Saved Projects Vault */}
        {tab === 'vault' && (
          <div className="p-6 overflow-y-auto space-y-3 text-xs">
            {savedProjects.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {isMizo ? 'Project save tawh a la awm lo.' : 'No saved projects in local vault yet.'}
              </div>
            ) : (
              savedProjects.map(proj => (
                <div
                  key={proj.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    proj.id === activeProjectId
                      ? 'bg-blue-950/30 border-blue-600 text-blue-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{proj.name}</span>
                      <span className="font-mono text-blue-400 font-semibold">{proj.vehiclePlate}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      {proj.customerName} · {proj.vehicle.make} {proj.vehicle.model} · {proj.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectProject(proj);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      {isMizo ? 'Hawn rawh' : 'Open'}
                    </button>

                    {savedProjects.length > 1 && (
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete project"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
