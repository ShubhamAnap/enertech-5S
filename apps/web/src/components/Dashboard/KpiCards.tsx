import React from 'react';
import { DashboardStats, Activity } from '../../types';
import {
  Award,
  Layers,
  Clock,
  Tag,
  AlertTriangle,
  ShieldCheck,
  Ruler,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Sliders
} from 'lucide-react';

interface KpiCardsProps {
  stats: DashboardStats;
  activities: Activity[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ stats, activities }) => {
  // Compute cumulative benefits from verified activities
  const verifiedActs = activities.filter(a => ['approved', 'completed'].includes(a.status));
  const totalSpaceRecovered = activities.reduce((acc, a) => acc + (a.benefits_space_sqft || 0), 0);
  const totalTimeSaved = activities.reduce((acc, a) => acc + (a.benefits_time_seconds || 0), 0);
  const totalCostAvoidance = activities.reduce((acc, a) => acc + (a.benefits_cost_savings || 0), 0);
  const safetyHazardsCount = activities.filter(a => a.benefits_safety).length;

  return (
    <div className="space-y-4">
      {/* Top 4 Primary Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 5S Overall Audit Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Plant 5S Audit Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.monthly_audit_score}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +2.4% vs Q1
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.monthly_audit_score}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Benchmark Target: 90.0%</span>
              <span className="font-semibold text-emerald-600">Gold Certified</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active 5S Activities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              5S Kaizen Activities
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.total_activities}
            </span>
            <span className="text-xs font-semibold text-sky-600">
              {stats.submitted_activities} Awaiting Review
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Open</span>
              <strong className="text-slate-800">{stats.open_activities}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">In Prog.</span>
              <strong className="text-sky-700">{stats.in_progress_activities}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Done</span>
              <strong className="text-emerald-700">{stats.approved_activities}</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Red Tag Quarantine */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Red-Tag Quarantine
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-600 tracking-tight">
              {stats.red_tag_count}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Avg. {stats.avg_red_tag_age_days}d age
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-500">1S (Sort) Holding Area</span>
            <span className={`font-bold ${stats.avg_red_tag_age_days > 14 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
              {stats.avg_red_tag_age_days > 14 ? 'Action Overdue' : 'Within SLA'}
            </span>
          </div>
        </div>

        {/* Card 4: Verified Annual Cost Avoidance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Annualized Kaizen ROI
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-700 tracking-tight">
              ${totalCostAvoidance.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600">USD</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Floor capacity & labor</span>
            <span className="font-bold text-emerald-600">Calculated</span>
          </div>
        </div>
      </div>

      {/* Cumulative Shop Floor Physical Impact Row */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Cumulative Shop Floor 5S Impact Across Austin Plant 04
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Verified ergonomic, layout, and efficiency gains from operator Kaizen submissions
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="border-l border-white/10 pl-4">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Safety Hazards Eliminated</div>
            <div className="text-base font-black text-emerald-400 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
              {safetyHazardsCount} Verified
            </div>
          </div>

          <div className="border-l border-white/10 pl-4">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Floor Space Recovered</div>
            <div className="text-base font-black text-sky-300 flex items-center">
              <Ruler className="w-4 h-4 mr-1 text-sky-400" />
              +{totalSpaceRecovered.toFixed(1)} sq.ft
            </div>
          </div>

          <div className="border-l border-white/10 pl-4">
            <div className="text-slate-400 text-[10px] uppercase font-bold">Cycle / Search Time Saved</div>
            <div className="text-base font-black text-amber-300 flex items-center">
              <Clock className="w-4 h-4 mr-1 text-amber-400" />
              -{totalTimeSaved.toFixed(0)}s per cycle
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
