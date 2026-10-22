import React from 'react';
import type { Plant, Zone, UserPersona } from '../types';
import {
  Tag,
  Plus,
  Wifi,
  WifiOff,
  MapPin,
  Lock,
  ChevronDown,
  Bell
} from 'lucide-react';

interface NavbarProps {
  plants: Plant[];
  currentPlant: Plant;
  currentZone: Zone;
  activePersona: UserPersona;
  onSelectPlant: (plant: Plant) => void;
  onSelectZone: (zone: Zone) => void;
  onViewAllZones: () => void;
  isLiveApi: boolean;
  onOpenCreateActivity: () => void;
  onOpenCreateRedTag: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  plants,
  currentPlant,
  currentZone,
  activePersona,
  onSelectPlant,
  onSelectZone,
  onViewAllZones,
  isLiveApi,
  onOpenCreateActivity,
  onOpenCreateRedTag
}) => {
  const allZones = currentPlant.departments.flatMap(d => d.zones);

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: MaintainX Breadcrumb & Plant Context */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-slate-500">{currentPlant.name}</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              {currentZone.code} — {currentZone.name}
            </span>
          </div>
        </div>

        {/* Center: Zone Selector (RBAC aware) */}
        <div className="flex items-center space-x-2">
          {activePersona.role === 'operator' ? (
            /* Operator is locked to their assigned zone */
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-500 font-medium">Assigned Zone:</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">
                {currentZone.name}
              </span>
            </div>
          ) : (
            /* Supervisor / Auditor / Manager can switch zones or view plant matrix */
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
              <div className="flex items-center space-x-1 px-2 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-semibold">Zone:</span>
              </div>

              <select
                value={currentZone.id}
                onChange={e => {
                  const z = allZones.find(item => item.id === e.target.value);
                  if (z) onSelectZone(z);
                }}
                className="bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {allZones.map(z => (
                  <option key={z.id} value={z.id}>
                    [{z.code}] {z.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onViewAllZones}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-white rounded-lg transition-colors whitespace-nowrap"
                title="View All Zones Matrix"
              >
                All Zones &rarr;
              </button>
            </div>
          )}

          {/* Backend Status indicator */}
          <div
            className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
              isLiveApi
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isLiveApi ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>FastAPI Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Right: MaintainX Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          <button
            type="button"
            onClick={onOpenCreateRedTag}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Place Red Tag</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateActivity}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Work Order</span>
          </button>
        </div>
      </div>
    </header>
  );
};
