import React, { useState } from 'react';
import type { UserPersona } from '../types';
import { USER_PERSONAS } from '../data/mockData';
import {
  ClipboardList,
  Layers,
  BarChart3,
  MapPin,
  Tag,
  Settings,
  ChevronsRight,
  ChevronDown,
  UserCheck,
  ChevronUp,
  Check
} from 'lucide-react';

export type NavTab = 'work_orders' | 'assets' | 'reporting' | 'redtags' | 'locations' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activePersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
  reviewCount: number;
  openRedTagCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  activePersona,
  onSelectPersona,
  reviewCount,
  openRedTagCount
}) => {
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Enertech Top Brand Row */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            {/* Enertech 'E' Shape Logo */}
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xs">
              <span>E</span>
            </div>
            <div className="flex flex-col cursor-pointer">
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">Enertech</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">5S</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Production Suite</span>
            </div>
          </div>

          <button
            type="button"
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Collapse Sidebar"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Menu Items */}
        <nav className="p-2 space-y-0.5 text-xs font-semibold">
          {/* Work Orders */}
          <button
            type="button"
            onClick={() => onTabChange('work_orders')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'work_orders'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <ClipboardList className={`w-4 h-4 ${currentTab === 'work_orders' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Work Orders</span>
            </div>
            {reviewCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {reviewCount}
              </span>
            )}
          </button>

          {/* Assets */}
          <button
            type="button"
            onClick={() => onTabChange('assets')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'assets'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className={`w-4 h-4 ${currentTab === 'assets' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Assets</span>
          </button>

          {/* Reporting */}
          <button
            type="button"
            onClick={() => onTabChange('reporting')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'reporting'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${currentTab === 'reporting' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Reporting</span>
          </button>

          {/* Red-Tag Quarantine */}
          <button
            type="button"
            onClick={() => onTabChange('redtags')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
              currentTab === 'redtags'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Tag className={`w-4 h-4 ${currentTab === 'redtags' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Red Tags</span>
            </div>
            {openRedTagCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                {openRedTagCount}
              </span>
            )}
          </button>

          {/* Locations */}
          <button
            type="button"
            onClick={() => onTabChange('locations')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'locations'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MapPin className={`w-4 h-4 ${currentTab === 'locations' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Locations</span>
          </button>

          {/* Team & Zonal Leaders (Management Settings) */}
          <button
            type="button"
            onClick={() => onTabChange('settings')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${currentTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Team & Leaders</span>
          </button>
        </nav>
      </div>

      {/* MaintainX Bottom User Card & RBAC Persona Switcher */}
      <div className="relative border-t border-slate-100 p-2">
        {/* Role Switcher Popover */}
        {isPersonaMenuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Switch Active RBAC Account
            </div>
            <div className="space-y-0.5 mt-1">
              {USER_PERSONAS.map((persona) => {
                const isSelected = persona.id === activePersona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      onSelectPersona(persona);
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="text-xs truncate">{persona.name}</div>
                        <div className="text-[10px] text-slate-400 truncate capitalize">
                          {persona.role === 'management' ? 'Plant Management' : persona.role.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          <button
            type="button"
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="flex items-center space-x-2.5 min-w-0 flex-1 text-left cursor-pointer"
            title="Click to switch role / user"
          >
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {activePersona.name}
              </span>
              <span className="text-[10px] text-slate-500 capitalize block truncate">
                {activePersona.role === 'management' ? 'Plant Management' : activePersona.role.replace('_', ' ')}
              </span>
            </div>
            {isPersonaMenuOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('settings')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              currentTab === 'settings' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Management Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
