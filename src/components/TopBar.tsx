import React from 'react';
import { Project } from '../types/ecu';
import { Download, Printer, Shield, Globe, FolderKanban, Menu, Binary, Home } from 'lucide-react';

interface TopBarProps {
  project: Project;
  isMizo: boolean;
  onToggleLanguage: () => void;
  onOpenProjects: () => void;
  onOpenGateway: () => void;
  onOpenAudit: () => void;
  onOpenPdfReport: () => void;
  onOpenGuide: () => void;
  onExportBinary: () => void;
  activeNavTab: 'maps' | 'dtcs' | 'immo' | 'hex';
  onSelectNavTab: (tab: 'maps' | 'dtcs' | 'immo' | 'hex') => void;
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  project,
  isMizo,
  onToggleLanguage,
  onOpenProjects,
  onOpenGateway,
  onOpenAudit,
  onOpenPdfReport,
  onOpenGuide,
  onExportBinary,
  activeNavTab,
  onSelectNavTab,
  onToggleSidebar,
}) => {
  return (
    <header className="no-print flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 py-2 landscape:py-1.5 bg-slate-950 border-b border-slate-800 text-slate-100 select-none shrink-0">
      {/* Zone 1: Brand & Sidebar Drawer Toggle & Home Gateway */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
            title="Toggle Maps Directory"
          >
            <Menu className="w-4 h-4 text-blue-400" />
          </button>
        )}

        <button
          onClick={onOpenGateway}
          className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-slate-100 whitespace-nowrap hover:text-blue-400 transition-colors flex items-center gap-1.5 sm:gap-2"
          title={isMizo ? 'Project Gateway-ah let rawh' : 'Return to Project Launcher Gateway'}
        >
          <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-sm bg-blue-500 inline-block shadow-sm shadow-blue-500" />
          ApexECU
        </button>

        {/* Current Active Project & Plate Pill */}
        <button
          onClick={onOpenProjects}
          className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 sm:py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-mono transition-colors text-slate-300"
          title="Switch Project"
        >
          <FolderKanban className="w-3 h-3 text-blue-400" />
          <span className="font-bold text-amber-400 text-[11px] sm:text-xs">{project.vehiclePlate}</span>
        </button>
      </div>

      {/* Zone 2: Navigation Links (Compact in Landscape) */}
      <nav className="flex items-center gap-2 sm:gap-4 md:gap-5 text-xs font-medium text-slate-400 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={onOpenGateway}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-[11px] sm:text-xs flex items-center gap-1 text-slate-300"
          title={isMizo ? 'Project hawnna gateway' : 'Project Launchpad Gateway'}
        >
          <Home className="w-3.5 h-3.5 text-blue-400" />
          <span>{isMizo ? 'Launcher' : 'Home'}</span>
        </button>

        <button
          onClick={() => onSelectNavTab('maps')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-[11px] sm:text-xs ${
            activeNavTab === 'maps' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          {isMizo ? '3D Maps' : 'Maps'}
        </button>

        <button
          onClick={() => onSelectNavTab('hex')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-[11px] sm:text-xs flex items-center gap-1 ${
            activeNavTab === 'hex' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>{isMizo ? 'Flash Chipchiar' : 'Hex Sector'}</span>
        </button>

        <button
          onClick={() => onSelectNavTab('dtcs')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-[11px] sm:text-xs ${
            activeNavTab === 'dtcs' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          {isMizo ? 'DTC Faults' : 'DTCs'}
        </button>

        <button
          onClick={() => onSelectNavTab('immo')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-[11px] sm:text-xs ${
            activeNavTab === 'immo' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          {isMizo ? 'Immobilizer' : 'Immo'}
        </button>

        <button
          onClick={onOpenAudit}
          className="hidden xs:flex hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 items-center gap-1 text-[11px] sm:text-xs"
        >
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>Audit</span>
        </button>

        <button
          onClick={onOpenGuide}
          className="hidden md:flex hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 text-amber-300/80 text-[11px] sm:text-xs"
        >
          {isMizo ? 'Mizo Zirtirna' : 'Tuning Guide'}
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={onToggleLanguage}
          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] sm:text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1"
          title="Toggle Language"
        >
          <Globe className="w-3 h-3 text-blue-400" />
          <span>{isMizo ? 'MZ' : 'EN'}</span>
        </button>

        <button
          onClick={onOpenPdfReport}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          <Printer className="w-3 h-3" />
          <span className="hidden md:inline">{isMizo ? 'Report' : 'Report'}</span>
        </button>

        <button
          onClick={onExportBinary}
          className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-all whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5"
        >
          <Download className="w-3 h-3" />
          <span>{isMizo ? 'Export .BIN' : 'Export .BIN'}</span>
        </button>
      </div>
    </header>
  );
};
