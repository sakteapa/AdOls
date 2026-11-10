/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, TuneMetrics } from './types/ecu';
import { SAMPLE_VEHICLES } from './data/sampleVehicles';
import {
  applyStage1ToProject,
  revertProjectToStock,
  clearStoredFaultMemory,
  toggleImmobilizer,
  exportModifiedBinary,
} from './utils/binaryEngine';

import { TopBar } from './components/TopBar';
import { MapSidebar } from './components/MapSidebar';
import { Map3DVisualizer } from './components/Map3DVisualizer';
import { TableEditor } from './components/TableEditor';
import { ForensicBanner } from './components/ForensicBanner';
import { TuningControlPanel } from './components/TuningControlPanel';
import { DtcFaultManager } from './components/DtcFaultManager';
import { ImmobilizerPanel } from './components/ImmobilizerPanel';
import { AuditMatrixModal } from './components/AuditMatrixModal';
import { PrintableReportPdf } from './components/PrintableReportPdf';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { MizoGuideModal } from './components/MizoGuideModal';
import { Layers, ChevronRight } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'apex_ecu_projects_v1';

export default function App() {
  // Saved projects store
  const [savedProjects, setSavedProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    // Default initial project: Mahindra Thar 2.2 mHawk
    return [SAMPLE_VEHICLES[0].projectTemplate()];
  });

  const [activeProject, setActiveProject] = useState<Project>(() => {
    return savedProjects[0] || SAMPLE_VEHICLES[0].projectTemplate();
  });

  // Sidebar toggle state for mobile & mobile landscape
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Modal visibility states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Language state (Defaults to true for Mizo per user brief)
  const [isMizo, setIsMizo] = useState<boolean>(true);

  // Main active navigation view
  const [activeNavTab, setActiveNavTab] = useState<'maps' | 'dtcs' | 'immo'>('maps');

  // Currently selected map cell for micro-editing
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  // Sync saved projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedProjects));
    } catch (e) {
      console.error(e);
    }
  }, [savedProjects]);

  // Update active project helper
  const updateProject = (updated: Project) => {
    setActiveProject(updated);
    setSavedProjects(prev => {
      const existing = prev.find(p => p.id === updated.id);
      if (existing) {
        return prev.map(p => (p.id === updated.id ? updated : p));
      }
      return [updated, ...prev];
    });
  };

  // Currently active selected map
  const currentMap = activeProject.maps.find(m => m.id === activeProject.selectedMapId) || activeProject.maps[0];

  // Handlers
  const handleSelectMap = (mapId: string) => {
    updateProject({
      ...activeProject,
      selectedMapId: mapId,
    });
    setSelectedCell(null);
  };

  const handleUpdateMapData = (updatedData: number[][]) => {
    const updatedMaps = activeProject.maps.map(m => {
      if (m.id === currentMap.id) {
        return {
          ...m,
          data: updatedData,
        };
      }
      return m;
    });

    updateProject({
      ...activeProject,
      maps: updatedMaps,
      checksumValid: true,
      checksumValue: '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0'),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleApplyStage1 = () => {
    const tuned = applyStage1ToProject(activeProject);
    updateProject(tuned);
  };

  const handleRevertToStock = () => {
    const reverted = revertProjectToStock(activeProject);
    updateProject(reverted);
    setSelectedCell(null);
  };

  const handleUpdateMetrics = (updated: Partial<TuneMetrics>) => {
    updateProject({
      ...activeProject,
      tuneMetrics: {
        ...activeProject.tuneMetrics,
        ...updated,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleImmo = () => {
    const updated = toggleImmobilizer(activeProject);
    updateProject(updated);
  };

  const handleClearFaults = () => {
    const updated = clearStoredFaultMemory(activeProject);
    updateProject(updated);
  };

  const handleToggleMaskCode = (code: string) => {
    const current = activeProject.tuneMetrics.dtcMaskedCodes;
    const isMasked = current.includes(code);
    const updatedCodes = isMasked ? current.filter(c => c !== code) : [...current, code];

    handleUpdateMetrics({ dtcMaskedCodes: updatedCodes });
  };

  const handleExportBinary = () => {
    exportModifiedBinary(activeProject);
  };

  const handleDeleteProject = (id: string) => {
    setSavedProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject.id === id) {
      const remaining = savedProjects.filter(p => p.id !== id);
      if (remaining.length > 0) {
        setActiveProject(remaining[0]);
      } else {
        const fresh = SAMPLE_VEHICLES[0].projectTemplate();
        setActiveProject(fresh);
        setSavedProjects([fresh]);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar navigation */}
      <TopBar
        project={activeProject}
        isMizo={isMizo}
        onToggleLanguage={() => setIsMizo(!isMizo)}
        onOpenProjects={() => setIsProjectModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenPdfReport={() => setIsPdfModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onExportBinary={handleExportBinary}
        activeNavTab={activeNavTab}
        onSelectNavTab={tab => setActiveNavTab(tab)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: Map Sidebar Directory */}
        <MapSidebar
          maps={activeProject.maps}
          selectedMapId={activeProject.selectedMapId}
          onSelectMap={handleSelectMap}
          isMizo={isMizo}
          vehicle={activeProject.vehicle}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center & Right Content Viewport */}
        <main className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-5 landscape:p-2.5 space-y-4 landscape:space-y-3">
          {/* Mobile Landscape Quick Map Switcher Strip */}
          {activeNavTab === 'maps' && (
            <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>{isMizo ? 'Maps Zawng' : 'All Maps'}</span>
              </button>

              {activeProject.maps.map(m => {
                const isSelected = m.id === activeProject.selectedMapId;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMap(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isMizo ? m.nameMizo.split('(')[0] : m.name.split('(')[0]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Top Forensic Banner Alert */}
          <ForensicBanner
            report={activeProject.forensicReport}
            isMizo={isMizo}
            onFixRiskyTune={handleApplyStage1}
          />

          {/* Nav Tab View 1: 3D Maps & Tables */}
          {activeNavTab === 'maps' && (
            <div className="space-y-4 landscape:space-y-3">
              {/* Central 3D / 2D Map Visualizer */}
              {currentMap && (
                <Map3DVisualizer
                  map={currentMap}
                  isMizo={isMizo}
                  onCellSelect={(r, c) => setSelectedCell({ row: r, col: c })}
                  selectedCell={selectedCell}
                />
              )}

              {/* Table Matrix Editor */}
              {currentMap && (
                <TableEditor
                  map={currentMap}
                  isMizo={isMizo}
                  onUpdateMapData={handleUpdateMapData}
                  selectedCell={selectedCell}
                  onSelectCell={(r, c) => setSelectedCell({ row: r, col: c })}
                />
              )}

              {/* Tuning Control Panel (Stage 1, Rev limiter, Launch control, Pop & Bang) */}
              <TuningControlPanel
                project={activeProject}
                isMizo={isMizo}
                onApplyStage1={handleApplyStage1}
                onRevertToStock={handleRevertToStock}
                onUpdateMetrics={handleUpdateMetrics}
              />
            </div>
          )}

          {/* Nav Tab View 2: Stored Fault Codes (DTC) & EEPROM Diagnostics */}
          {activeNavTab === 'dtcs' && (
            <div className="space-y-4">
              <DtcFaultManager
                storedFaults={activeProject.storedFaults}
                isMizo={isMizo}
                onClearFaults={handleClearFaults}
                maskedCodes={activeProject.tuneMetrics.dtcMaskedCodes}
                onToggleMaskCode={handleToggleMaskCode}
              />

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                <span>
                  {isMizo
                    ? 'DTC i mask / clear hnuah 3D Maps-ah let lehin calibration i khawih zawm thei e.'
                    : 'After managing DTC error codes, switch back to 3D Maps to continue calibrating.'}
                </span>
                <button
                  onClick={() => setActiveNavTab('maps')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
                >
                  {isMizo ? '3D Maps-ah Let Rawh' : 'Return to 3D Maps'}
                </button>
              </div>
            </div>
          )}

          {/* Nav Tab View 3: Immobilizer Management */}
          {activeNavTab === 'immo' && (
            <div className="space-y-4">
              <ImmobilizerPanel
                immo={activeProject.immoStatus}
                isMizo={isMizo}
                onToggleImmo={handleToggleImmo}
                ecuFamily={activeProject.vehicle.ecuFamily}
              />

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                <span>
                  {isMizo
                    ? 'Immobilizer patch i apply hnuah .BIN export rawh le.'
                    : 'Once immobilizer state is configured, export your remapped binary.'}
                </span>
                <button
                  onClick={handleExportBinary}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
                >
                  {isMizo ? 'Export .BIN Remap' : 'Export .BIN'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {/* 1. Project Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        canClose={true}
        savedProjects={savedProjects}
        activeProjectId={activeProject.id}
        onSelectProject={project => {
          updateProject(project);
          setIsProjectModalOpen(false);
        }}
        onDeleteProject={handleDeleteProject}
        isMizo={isMizo}
      />

      {/* 2. Audit Matrix Modal */}
      <AuditMatrixModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditItems={activeProject.auditItems}
        isMizo={isMizo}
        vehicleName={`${activeProject.vehicle.make} ${activeProject.vehicle.model}`}
        ecuFamily={activeProject.vehicle.ecuFamily}
      />

      {/* 3. Printable Remap Report PDF Modal */}
      <PrintableReportPdf
        project={activeProject}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        isMizo={isMizo}
      />

      {/* 4. Mizo Tuning Guide Modal */}
      <MizoGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
