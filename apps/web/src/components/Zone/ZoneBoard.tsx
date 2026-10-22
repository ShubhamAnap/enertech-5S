import React from 'react';
import type { Zone, Activity, RedTag, AuditRun, UserPersona } from '../../types';
import { ActivityCard } from '../Activities/ActivityCard';
import { DispositionBadge } from '../Common/StatusBadge';
import {
  Layers,
  Tag,
  ClipboardCheck,
  Plus,
  ShieldCheck,
  AlertTriangle,
  User,
  CheckCircle2,
  Sliders,
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ZoneBoardProps {
  zone: Zone;
  deptName?: string;
  activities: Activity[];
  redTags: RedTag[];
  latestAudit?: AuditRun;
  activePersona: UserPersona;
  onSelectActivity: (activity: Activity) => void;
  onOpenCreateActivity: () => void;
  onOpenCreateRedTag: () => void;
  onOpenAuditStation: () => void;
  onOpenRedTagAction?: (tag: RedTag) => void;
}

export const ZoneBoard: React.FC<ZoneBoardProps> = ({
  zone,
  deptName = "Manufacturing Operations",
  activities,
  redTags,
  latestAudit,
  activePersona,
  onSelectActivity,
  onOpenCreateActivity,
  onOpenCreateRedTag,
  onOpenAuditStation,
  onOpenRedTagAction
}) => {
  const zoneActivities = activities.filter(a => a.zone_id === zone.id);
  const zoneRedTags = redTags.filter(t => t.zone_id === zone.id);
  const openZoneRedTags = zoneRedTags.filter(t => !t.is_closed);

  const pendingReviewCount = zoneActivities.filter(a => a.status === 'submitted_for_review').length;
  const inProgressCount = zoneActivities.filter(a => a.status === 'in_progress' || a.status === 'assigned').length;
  const completedCount = zoneActivities.filter(a => a.status === 'approved' || a.status === 'completed').length;

  const isAssignedToThisZone = activePersona.assignedZoneId === zone.id;

  // Use latest audit scores if available, or realistic zone defaults
  const sortScore = latestAudit?.sort_score ?? 92.0;
  const setInOrderScore = latestAudit?.set_in_order_score ?? 85.0;
  const shineScore = latestAudit?.shine_score ?? 96.0;
  const standardizeScore = latestAudit?.standardize_score ?? 88.0;
  const sustainScore = latestAudit?.sustain_score ?? 80.0;

  const pillars = [
    { label: '1S Sort', desc: 'Clear unneeded', score: sortScore, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: '2S Set In Order', desc: 'Visual home', score: setInOrderScore, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: '3S Shine', desc: 'Clean & inspect', score: shineScore, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: '4S Standardize', desc: 'Visual SOPs', score: standardizeScore, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { label: '5S Sustain', desc: 'Daily discipline', score: sustainScore, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Zone Top Command Header (Matching High-Fidelity UI Mockup) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 text-white space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {zone.code}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {deptName}
              </span>
              {isAssignedToThisZone && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Your Assigned Zone
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Zone {zone.code}: {zone.name}
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {zone.description || "Lean Manufacturing Gemba Board • Daily Standard Work, Clutter Elimination & Audit Compliance"}
            </p>
          </div>

          {/* Right: 5S Health Score & Gold/Silver Certified Badge */}
          <div className="flex items-center space-x-5 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shrink-0 backdrop-blur-sm">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                5S Health Score
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className={`text-3xl font-black ${
                  zone.current_score >= 90 ? 'text-emerald-400' : 'text-blue-400'
                }`}>
                  {zone.current_score}%
                </span>
                <span className="text-xs text-slate-400 font-medium">/ {zone.target_score}% target</span>
              </div>
              <div className="text-[10px] font-bold text-slate-300 flex items-center justify-end space-x-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{zone.current_score >= 90 ? 'Gold Certified' : zone.current_score >= 80 ? 'Silver Standard' : 'Kaizen Required'}</span>
              </div>
            </div>

            <div className="pl-5 border-l border-slate-700 text-xs space-y-1.5">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Zone Owner (Operator)</span>
                <strong className="text-white flex items-center font-bold">
                  <User className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  {zone.owner_name || "Alex Chen"}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Area Supervisor</span>
                <span className="text-slate-300 font-medium">
                  {zone.supervisor_name || "Dave Vance"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5S Horizontal Pillar Meters (Clean, High-Tech Visuals) */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {pillars.map(p => (
            <div key={p.label} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">{p.label}</span>
                <span className="font-mono font-black text-white">{p.score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    p.score >= 90 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-blue-500 shadow-sm shadow-blue-500/50'
                  }`}
                  style={{ width: `${p.score}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Action Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCreateActivity}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Report 5S Clutter (Before Photo)</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateRedTag}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Tag className="w-4 h-4" />
              <span>Place Red Tag</span>
            </button>

            {activePersona.canExecuteAudit && (
              <button
                type="button"
                onClick={onOpenAuditStation}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <ClipboardCheck className="w-4 h-4 text-blue-400" />
                <span>Audit This Zone</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span>Tasks: <strong className="text-white">{zoneActivities.length}</strong></span>
            <span>&bull;</span>
            <span className={pendingReviewCount > 0 ? 'text-amber-400 font-bold' : ''}>
              Review: <strong>{pendingReviewCount}</strong>
            </span>
            <span>&bull;</span>
            <span className={openZoneRedTags.length > 0 ? 'text-rose-400 font-bold' : ''}>
              Red Tags: <strong>{openZoneRedTags.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Zone Kaizen Tasks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-indigo-600" />
              Zone Kaizen Stream ({zoneActivities.length})
            </h2>
            <p className="text-xs text-slate-500">Before & After visual evidence for this specific workstation</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              {pendingReviewCount} Pending Review
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              {completedCount} Standardized
            </span>
          </div>
        </div>

        {zoneActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">Zone is 100% Clutter-Free!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active 5S issues logged in {zone.name}. Keep maintaining clean surfaces and shadow boards.
            </p>
            <button
              type="button"
              onClick={onOpenCreateActivity}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Report New Observation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zoneActivities.map(act => (
              <ActivityCard
                key={act.id}
                activity={act}
                onClick={() => onSelectActivity(act)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Zone Red-Tag Quarantine Corner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Zone Red-Tag Quarantine Corner ({openZoneRedTags.length} Open)
              </h3>
              <p className="text-xs text-slate-500">Unneeded tooling or defective items quarantined in this work cell</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCreateRedTag}
            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all"
          >
            + Place Red Tag
          </button>
        </div>

        {zoneRedTags.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            No red tags active in this zone. All tooling and inventory are verified.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {zoneRedTags.map(tag => (
              <div key={tag.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-md">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-rose-700">{tag.tag_number}</span>
                    <strong className="text-slate-900">{tag.item_name}</strong>
                    <span className="text-slate-400 font-mono text-[11px]">(Qty: {tag.quantity})</span>
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-1">{tag.reason}</p>
                  <div className="text-[10px] text-slate-400">
                    Tagged by: {tag.logged_by_name} &bull; {tag.aging_days} days in quarantine
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <DispositionBadge disposition={tag.disposition} isClosed={tag.is_closed} />
                  {activePersona.canDisposeRedTag && !tag.is_closed && (
                    <button
                      type="button"
                      onClick={() => onOpenRedTagAction && onOpenRedTagAction(tag)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      Set Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
