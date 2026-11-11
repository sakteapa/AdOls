import React, { useState } from 'react';
import { Project } from '../types/ecu';
import { SAMPLE_VEHICLES } from '../data/sampleVehicles';
import { parseUploadedEcuBinary } from '../utils/binaryEngine';
import {
  FolderPlus,
  FolderOpen,
  Edit3,
  Upload,
  Car,
  Clock,
  Shield,
  ArrowRight,
  Globe,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  Zap,
} from 'lucide-react';

interface ProjectGatewayProps {
  savedProjects: Project[];
  activeProject: Project;
  onSelectProjectAndOpenWorkspace: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  isMizo: boolean;
  onToggleLanguage: () => void;
  onOpenGuide: () => void;
}

export const ProjectGateway: React.FC<ProjectGatewayProps> = ({
  savedProjects,
  activeProject,
  onSelectProjectAndOpenWorkspace,
  onDeleteProject,
  isMizo,
  onToggleLanguage,
  onOpenGuide,
}) => {
  // Gateway view mode: 'cards' | 'new_project_form' | 'templates_picker' | 'recent_list'
  const [gatewayMode, setGatewayMode] = useState<'cards' | 'new_form' | 'templates' | 'recent'>('cards');

  // Form states for New Project
  const [projectName, setProjectName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('MZ-01-');
  const [odometerKm, setOdometerKm] = useState<number>(42000);
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recentSearch, setRecentSearch] = useState<string>('');

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

      if (projectName) project.name = projectName;
      if (notes) project.notes = notes;
      project.odometerKm = odometerKm;

      onSelectProjectAndOpenWorkspace(project);
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

    onSelectProjectAndOpenWorkspace(project);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[340px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-40 right-10 w-[400px] h-[250px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Gateway Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/30">
            A
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              ApexECU Studio
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                v2.4 Pro
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              India Automotive ECU Flash Remapper & Calibration Laboratory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLanguage}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{isMizo ? 'MIZO' : 'ENGLISH'}</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-amber-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isMizo ? 'Mizo Zirtirna' : 'Tuning Guide'}</span>
          </button>
        </div>
      </header>

      {/* Main Hero & 3 Gateway Action Cards */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {gatewayMode === 'cards' && (
          <div className="w-full space-y-8 animate-in fade-in duration-200">
            {/* Hero Message */}
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold font-mono uppercase tracking-widest text-blue-400">
                {isMizo ? 'ECU PROJECT SELECTION' : 'ECU WORKSPACE LAUNCHPAD'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isMizo
                  ? 'Khawi aṭangin nge hna kan tan ang?'
                  : 'How would you like to start?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {isMizo
                  ? 'File buai leh lirthei dang file nena inpawlh loh nan Project thar siam la, edit mek kalpui la, emaw recent projects aṭangin thlang rawh.'
                  : 'Select an option below to open a new calibration project, continue editing the active file, or resume from recent projects.'}
              </p>
            </div>

            {/* 3 Core Selection Gateways */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: OPEN NEW PROJECT */}
              <div
                onClick={() => setGatewayMode('new_form')}
                className="group p-6 bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/80 rounded-2xl shadow-xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FolderPlus className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                      {isMizo ? '1. Project Thar Siam' : '1. Open New Project'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {isMizo
                        ? 'Customer & lirthei number ziak lut la, flash file (.bin/.hex/.eep) upload la, stock file chu locked a ni nghal ang.'
                        : 'Create a new project workspace with customer details, plate number, and binary dump upload with immutable stock lock.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>{isMizo ? 'Project thar hawnna' : 'Create Project'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: EDIT ACTIVE PROJECT */}
              <div
                onClick={() => onSelectProjectAndOpenWorkspace(activeProject)}
                className="group p-6 bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/80 rounded-2xl shadow-xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Edit3 className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                        {isMizo ? '2. Project Kal Mek Khawih' : '2. Edit Active Project'}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                        ACTIVE
                      </span>
                    </div>

                    <div className="mt-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Plate:</span>
                        <span className="font-bold text-amber-400">{activeProject.vehiclePlate}</span>
                      </div>
                      <div className="flex justify-between truncate">
                        <span className="text-slate-400">Vehicle:</span>
                        <span className="text-slate-200 truncate">{activeProject.vehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Owner:</span>
                        <span className="text-slate-300">{activeProject.customerName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
                  <span>{isMizo ? 'Workspace-ah lut rawh' : 'Open Workspace'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: RECENT PROJECTS */}
              <div
                onClick={() => setGatewayMode('recent')}
                className="group p-6 bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/80 rounded-2xl shadow-xl transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Clock className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {isMizo ? '3. Recent Projects' : '3. Recent Projects'}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {savedProjects.length} saved
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {isMizo
                        ? 'Project save tawhte en la, customer hming emaw plate number hmanga zawn chhuah a, vawikhat hmeha khawih chhunzawmna.'
                        : 'Resume previous vehicle tuning sessions stored securely in your local vault with plate and customer history.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>{isMizo ? 'Recent en rawh' : 'Browse Recents'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Quick Test Indian Vehicle Templates Strip */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-400" />
                  {isMizo ? 'India Ram Lirthei Flash Templates (Quick Test):' : 'Instant Pre-loaded Indian Vehicle Flash Dumps:'}
                </span>
                <button
                  onClick={() => setGatewayMode('templates')}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {isMizo ? 'Zawng zawng en rawh →' : 'View all templates →'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                {SAMPLE_VEHICLES.slice(0, 4).map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.projectTemplate)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors truncate"
                  >
                    <span className="text-slate-200 font-bold block truncate">
                      {isMizo ? tpl.nameMizo.split('(')[0] : tpl.name.split('(')[0]}
                    </span>
                    <span className="text-[10px] text-blue-400 truncate block mt-0.5">
                      {tpl.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: Create New Project Form */}
        {gatewayMode === 'new_form' && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <FolderPlus className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {isMizo ? 'Project Thar Hawnna (New Project Setup)' : 'Create New Tuning Project'}
                </h3>
              </div>
              <button
                onClick={() => setGatewayMode('cards')}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
                  {isMizo ? 'Phone Number' : 'Phone Number'}
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
                  {isMizo ? 'Lirthei Number (Plate No)' : 'Registration Plate No'} *
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
              <label className="block text-slate-300 font-semibold text-xs mb-1">
                {isMizo ? 'Project Hming / Notes' : 'Project Title / Notes'}
              </label>
              <input
                type="text"
                placeholder={isMizo ? 'e.g. Thar 2.2 Stage 1 - MZ-01-A-7788' : 'e.g. Stage 1 Hill Climb Calibration'}
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Flash File Upload Dropzone */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold text-xs">
                {isMizo
                  ? 'ECU Flash Binary (.bin, .hex, .rom) emaw EEPROM (.eep) Upload Rawh'
                  : 'Upload ECU Flash Binary (.bin, .hex, .rom) or EEPROM (.eep)'}
              </label>

              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl bg-slate-950 cursor-pointer transition-all group">
                <Upload className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-200 text-xs">
                  {isProcessing
                    ? isMizo
                      ? 'Flash file a chhiar mek...'
                      : 'Analyzing Flash Binary...'
                    : isMizo
                    ? 'Flash file thlang la emaw helai hmunah hian rawn vawm lut rawh'
                    : 'Click to select or drop ECU flash binary here'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Supports Bosch EDC15/16/17, Marelli 6F3, Delphi, Denso, Keihin (512KB to 8MB)
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

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setGatewayMode('cards')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                ← {isMizo ? 'Let leh rawh' : 'Back to Gateway'}
              </button>

              <button
                onClick={() => handleSelectTemplate(SAMPLE_VEHICLES[0].projectTemplate)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
              >
                {isMizo ? 'Sample File Nena Hawnna' : 'Start with Sample File'}
              </button>
            </div>
          </div>
        )}

        {/* View Mode 3: Recent Projects List */}
        {gatewayMode === 'recent' && (
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isMizo ? 'Recent Projects Vault' : 'Recent Calibration Projects'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {savedProjects.length} {isMizo ? 'project save a awm' : 'saved projects in local storage'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setGatewayMode('cards')}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter for recents */}
            <input
              type="text"
              placeholder={isMizo ? 'Zawnna (Plate no, customer hming, car model)...' : 'Filter by plate, customer, or model...'}
              value={recentSearch}
              onChange={e => setRecentSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
            />

            {/* List */}
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
              {savedProjects
                .filter(
                  p =>
                    p.name.toLowerCase().includes(recentSearch.toLowerCase()) ||
                    p.customerName.toLowerCase().includes(recentSearch.toLowerCase()) ||
                    p.vehiclePlate.toLowerCase().includes(recentSearch.toLowerCase()) ||
                    p.vehicle.model.toLowerCase().includes(recentSearch.toLowerCase())
                )
                .map(proj => (
                  <div
                    key={proj.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{proj.name}</span>
                        <span className="font-mono text-amber-400 font-semibold">{proj.vehiclePlate}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {proj.customerName} · {proj.vehicle.make} {proj.vehicle.model} ({proj.vehicle.ecuFamily}) · {proj.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onSelectProjectAndOpenWorkspace(proj)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs shadow transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isMizo ? 'Khawih Rawh' : 'Edit / Open'}</span>
                      </button>

                      {savedProjects.length > 1 && (
                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => setGatewayMode('cards')}
                className="text-slate-400 hover:text-slate-200"
              >
                ← {isMizo ? 'Gateway-ah let leh rawh' : 'Back to Gateway'}
              </button>

              <button
                onClick={() => setGatewayMode('new_form')}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{isMizo ? '+ Project Thar Siam' : '+ Create New Project'}</span>
              </button>
            </div>
          </div>
        )}

        {/* View Mode 4: Templates Picker */}
        {gatewayMode === 'templates' && (
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Car className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {isMizo ? 'India Ram Lirthei Flash Templates' : 'Indian Vehicle Calibration Templates'}
                </h3>
              </div>
              <button
                onClick={() => setGatewayMode('cards')}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
              {SAMPLE_VEHICLES.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.projectTemplate)}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl cursor-pointer transition-all hover:bg-slate-800/40 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-100">
                        {isMizo ? tpl.nameMizo : tpl.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {tpl.category === 'bike'
                        ? 'Motorcycle EFI Single · Spark Advance · Rev Limit'
                        : tpl.category === 'mod_example'
                        ? 'Forensic Tampered Demo · Overboost + DTC Wiped'
                        : 'Common Rail Diesel / Turbo Petrol · Full Stack'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-blue-400 font-semibold">
                    <span>{isMizo ? 'Project hawnna' : 'Load Template'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => setGatewayMode('cards')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ← {isMizo ? 'Gateway-ah let leh rawh' : 'Back to Gateway'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Gateway Footer */}
      <footer className="relative z-10 py-4 px-6 border-t border-slate-800/60 text-center text-xs text-slate-500 font-mono">
        ApexECU Studio · Built for Professional Automotive Calibration in Mizoram & India
      </footer>
    </div>
  );
};
