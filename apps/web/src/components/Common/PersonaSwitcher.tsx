import React, { useState } from 'react';
import type { UserPersona } from '../../types';
import { USER_PERSONAS } from '../../data/mockData';
import {
  ChevronDown,
  Shield,
  Check,
  UserCheck
} from 'lucide-react';

interface PersonaSwitcherProps {
  activePersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  activePersona,
  onSelectPersona
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'operator':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'supervisor':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'auditor':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'plant_manager':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="relative bg-slate-50 border-b border-slate-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Active Role Indicator */}
        <div className="flex items-center space-x-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Active Role (RBAC):
          </span>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-3 py-1 bg-white hover:bg-slate-100/80 rounded-xl border border-slate-300 text-slate-900 font-bold transition-all shadow-xs"
          >
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-200"
            />
            <span>{activePersona.name}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getRoleBadge(activePersona.role)}`}>
              {activePersona.role.toUpperCase()}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Context info */}
          <span className="hidden lg:inline text-slate-500 text-[11px] truncate max-w-md">
            &bull; {activePersona.roleTitle} {activePersona.assignedZoneName ? `(Assigned to ${activePersona.assignedZoneName})` : ''}
          </span>
        </div>

        {/* Permissions badge row */}
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="text-slate-400 font-medium">Access Scope:</span>
          {activePersona.role === 'operator' && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              Zone Scoped &bull; Create Work Orders &bull; Log Red Tags
            </span>
          )}
          {activePersona.role === 'supervisor' && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              Dept Overseer &bull; Approve Work Orders &bull; Red-Tag Disposition
            </span>
          )}
          {activePersona.role === 'auditor' && (
            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              Plant-Wide &bull; 5S Pillar Scoring Rubrics &bull; Certify Zones
            </span>
          )}
          {activePersona.role === 'plant_manager' && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              Executive Plant Matrix &bull; All Workstations &bull; Compliance Benchmarks
            </span>
          )}
        </div>
      </div>

      {/* Persona Selection Dropdown Modal */}
      {isOpen && (
        <div className="absolute left-4 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-96 text-xs animate-in fade-in duration-150">
          <div className="px-2 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Select System Role (RBAC)</span>
            <span>Switch Persona</span>
          </div>

          <div className="space-y-1.5">
            {USER_PERSONAS.map(p => {
              const isSelected = activePersona.id === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    onSelectPersona(p);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs truncate">{p.name}</strong>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${
                        isSelected ? 'bg-white/20 text-white border-white/30' : getRoleBadge(p.role)
                      }`}>
                        {p.role}
                      </span>
                    </div>
                    <div className={`text-[11px] truncate ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                      {p.roleTitle}
                    </div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                      {p.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
