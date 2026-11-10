import React from 'react';
import { EcuMapDefinition, VehicleIdentity } from '../types/ecu';
import { Fuel, Gauge, Flame, Wrench, ChevronRight, X } from 'lucide-react';

interface MapSidebarProps {
  maps: EcuMapDefinition[];
  selectedMapId: string;
  onSelectMap: (id: string) => void;
  isMizo: boolean;
  vehicle: VehicleIdentity;
  isOpen: boolean;
  onClose: () => void;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  maps,
  selectedMapId,
  onSelectMap,
  isMizo,
  vehicle,
  isOpen,
  onClose,
}) => {
  const categories: { key: EcuMapDefinition['category']; label: string; labelMizo: string; icon: React.ReactNode }[] = [
    { key: 'fuel', label: 'Fuel & Delivery', labelMizo: 'Petrol / Diesel & Injection', icon: <Fuel className="w-3.5 h-3.5" /> },
    { key: 'boost', label: 'Turbo & Air', labelMizo: 'Turbocharger & Boost Pressure', icon: <Wrench className="w-3.5 h-3.5" /> },
    { key: 'ignition', label: 'Ignition Timing', labelMizo: 'Ignition Timing & Spark', icon: <Flame className="w-3.5 h-3.5" /> },
    { key: 'limits', label: 'Limiters & RPM', labelMizo: 'Limiters & RPM Ceiling', icon: <Gauge className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      {/* Mobile & Mobile-Landscape Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-60 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Vehicle Identity Card */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between">
          <div className="truncate flex-1 mr-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">
                {vehicle.fuelType} · {vehicle.ecuFamily}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{vehicle.year}</span>
            </div>

            <h3 className="font-bold text-xs text-slate-100 truncate">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {vehicle.engine} ({vehicle.displacement})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 md:hidden rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detected Maps Directory */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
          {categories.map(cat => {
            const categoryMaps = maps.filter(m => m.category === cat.key);
            if (categoryMaps.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="text-slate-500">{cat.icon}</span>
                  <span>{isMizo ? cat.labelMizo : cat.label}</span>
                </div>

                <div className="space-y-0.5">
                  {categoryMaps.map(map => {
                    const isSelected = map.id === selectedMapId;
                    let hasChanges = false;
                    map.data.forEach((row, r) => {
                      row.forEach((val, c) => {
                        if (val !== map.originalData[r]?.[c]) hasChanges = true;
                      });
                    });

                    return (
                      <button
                        key={map.id}
                        onClick={() => {
                          onSelectMap(map.id);
                          if (window.innerWidth < 768) onClose();
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="block truncate text-[11px] sm:text-xs">
                            {isMizo ? map.nameMizo : map.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono block ${
                              isSelected ? 'text-blue-200' : 'text-slate-500'
                            }`}
                          >
                            {map.rows}×{map.cols} · {map.zUnit}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {hasChanges && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-amber-300' : 'bg-amber-400 shadow-sm shadow-amber-400'
                              }`}
                              title="Modified"
                            />
                          )}
                          <ChevronRight
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'text-white' : 'text-slate-600'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Summary Bar */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 flex items-center justify-between font-mono">
          <span>{maps.length} Maps</span>
          <span className="text-emerald-400">100% Synced</span>
        </div>
      </aside>
    </>
  );
};
