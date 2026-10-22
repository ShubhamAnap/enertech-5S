import React, { useState } from 'react';
import type { Activity, Plant } from '../../types';
import {
  Calendar,
  Filter,
  Download,
  Building,
  TrendingUp,
  BarChart2,
  PieChart,
  ChevronDown,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface MaintainXReportingProps {
  activities: Activity[];
  plant: Plant;
}

export const MaintainXReporting: React.FC<MaintainXReportingProps> = ({
  activities,
  plant
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'recent' | 'export'>('summary');
  const [timeRange, setTimeRange] = useState('All Time');

  // Pure dynamic metrics calculated directly from real activities
  const totalCreated = activities.length;
  const totalCompleted = activities.filter(a => ['approved', 'completed'].includes(a.status)).length;
  const totalOpen = activities.filter(a => ['draft', 'assigned', 'in_progress'].includes(a.status)).length;
  const totalHold = activities.filter(a => ['submitted_for_review', 'rejected'].includes(a.status)).length;
  const completionRate = totalCreated > 0 ? ((totalCompleted / totalCreated) * 100).toFixed(1) : '0.0';

  // Repeatable vs Reactive 5S Tasks
  const repeatableCount = activities.filter(a => 
    ['standardize_seiketsu', 'sustain_shitsuke'].includes(a.category) || a.title.toLowerCase().includes('audit') || a.title.toLowerCase().includes('pm')
  ).length;
  const reactiveCount = Math.max(0, totalCreated - repeatableCount);
  const repeatableRate = totalCreated > 0 ? ((repeatableCount / totalCreated) * 100).toFixed(1) : '0.0';

  // Priority Breakdown
  const lowPriority = activities.filter(a => a.priority === 'low').length;
  const medPriority = activities.filter(a => a.priority === 'medium').length;
  const highPriority = activities.filter(a => a.priority === 'high').length;
  const criticalPriority = activities.filter(a => a.priority === 'critical').length;

  // Circumference for 160x160 SVG donut (r=55 => 2 * pi * 55 ~= 345.57)
  const C = 345.57;
  const statusOpenDash = totalCreated > 0 ? (totalOpen / totalCreated) * C : 0;
  const statusHoldDash = totalCreated > 0 ? (totalHold / totalCreated) * C : 0;
  const statusDoneDash = totalCreated > 0 ? (totalCompleted / totalCreated) * C : 0;

  const prioLowDash = totalCreated > 0 ? (lowPriority / totalCreated) * C : 0;
  const prioMedDash = totalCreated > 0 ? (medPriority / totalCreated) * C : 0;
  const prioHighDash = totalCreated > 0 ? (highPriority / totalCreated) * C : 0;
  const prioCritDash = totalCreated > 0 ? (criticalPriority / totalCreated) * C : 0;

  return (
    <div className="space-y-5">
      {/* 1. MaintainX Reporting Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reporting</h1>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-blue-600 cursor-pointer hover:bg-slate-100">
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>

          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Active Cycle</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>{plant?.name || 'Main Manufacturing Facility'}</span>
          </div>
        </div>
      </div>

      {/* 2. MaintainX Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs px-4 pt-2">
        <div className="flex border-b border-slate-100 space-x-8 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Reporting Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recent')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'recent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Recent Activity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-3 transition-all border-b-2 ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Export Data
          </button>
        </div>

        {/* 3. Filter Row */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center text-slate-500 font-semibold text-[11px] pr-1">
              <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Filter:
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
              Assigned to: All
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
              Location: Plant Wide
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
              Priority: All
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                "Number,Title,Category,Priority,Status,Assignee,Due Date\n" +
                activities.map(a => `"${a.activity_number}","${a.title}","${a.category}","${a.priority}","${a.status}","${a.assignee_name || ''}","${a.due_date || ''}"`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `5S_Report_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="text-blue-600 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* 4. Section Title */}
      <div className="px-1 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Work Orders Analytics</h2>
        <span className="text-xs text-slate-500 font-medium">Live Shop Floor 5S Data</span>
      </div>

      {/* 5. Four MaintainX Signature Analytics Cards (2x2 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CARD 1: Created VS. Completed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1">
              <span>Created VS. Completed</span>
            </h3>
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-2xl font-black text-slate-900">{totalCreated}</div>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Created
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900">{totalCompleted}</div>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Completed
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-emerald-600">{completionRate}%</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Completion Rate
              </div>
            </div>
          </div>

          {/* Clean Progress Comparison */}
          <div className="pt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Completed Work Orders</span>
                <span className="text-slate-900 font-bold">{totalCompleted} / {totalCreated}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Number(completionRate))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Open / In-Progress Work Orders</span>
                <span className="text-slate-900 font-bold">{totalOpen} / {totalCreated}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCreated > 0 ? (totalOpen / totalCreated) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Repeatable VS. Reactive */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1">
              <span>Repeatable VS. Reactive</span>
            </h3>
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-2xl font-black text-slate-900">{reactiveCount}</div>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Reactive
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900">{repeatableCount}</div>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Repeatable
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-blue-600">{repeatableRate}%</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Repeatable 5S Rate
              </div>
            </div>
          </div>

          {/* Clean Progress Comparison */}
          <div className="pt-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Repeatable 5S Procedures (Standardize / Sustain)</span>
                <span className="text-slate-900 font-bold">{repeatableCount}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Number(repeatableRate))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Reactive Kaizen (Sort / Set in Order / Shine)</span>
                <span className="text-slate-900 font-bold">{reactiveCount}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-400 rounded-full transition-all duration-500" 
                  style={{ width: `${totalCreated > 0 ? (reactiveCount / totalCreated) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Status Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1">
              <span>Status Distribution</span>
            </h3>
          </div>

          <div className="flex items-center space-x-6">
            <div>
              <div className="text-2xl font-black text-slate-900">{totalOpen}</div>
              <div className="text-xs text-blue-600 font-semibold mt-0.5">Open</div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900">{totalHold}</div>
              <div className="text-xs text-amber-600 font-semibold mt-0.5">On Hold / Review</div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900">{totalCompleted}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-0.5">Completed</div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="h-44 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-40 h-40">
              {totalCreated === 0 ? (
                <circle cx="80" cy="80" r="55" fill="transparent" stroke="#f1f5f9" strokeWidth="24" />
              ) : (
                <>
                  <circle
                    cx="80"
                    cy="80"
                    r="55"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="24"
                    strokeDasharray={`${statusOpenDash} ${C}`}
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="55"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="24"
                    strokeDasharray={`${statusHoldDash} ${C}`}
                    strokeDashoffset={`-${statusOpenDash}`}
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="55"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="24"
                    strokeDasharray={`${statusDoneDash} ${C}`}
                    strokeDashoffset={`-${statusOpenDash + statusHoldDash}`}
                  />
                </>
              )}
              <text x="80" y="85" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#0f172a">
                {totalCreated}
              </text>
              <text x="80" y="100" textAnchor="middle" fontSize="9" fill="#64748b">
                Total Tasks
              </text>
            </svg>
          </div>
        </div>

        {/* CARD 4: Priority Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1">
              <span>Priority Breakdown</span>
            </h3>
          </div>

          <div className="flex items-center space-x-5">
            <div>
              <div className="text-2xl font-black text-slate-900">{lowPriority}</div>
              <div className="text-xs text-blue-500 font-semibold mt-0.5">Low</div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900">{medPriority}</div>
              <div className="text-xs text-amber-500 font-semibold mt-0.5">Medium</div>
            </div>

            <div>
              <div className="text-2xl font-black text-rose-600">{highPriority + criticalPriority}</div>
              <div className="text-xs text-rose-600 font-semibold mt-0.5">High/Critical</div>
            </div>
          </div>

          {/* Priority Donut Chart */}
          <div className="h-44 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-40 h-40">
              {totalCreated === 0 ? (
                <circle cx="80" cy="80" r="55" fill="transparent" stroke="#f1f5f9" strokeWidth="24" />
              ) : (
                <>
                  <circle
                    cx="80"
                    cy="80"
                    r="55"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="24"
                    strokeDasharray={`${prioLowDash} ${C}`}
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="55"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="24"
                    strokeDasharray={`${prioMedDash} ${C}`}
                    strokeDashoffset={`-${prioLowDash}`}
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="55"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="24"
                    strokeDasharray={`${prioHighDash + prioCritDash} ${C}`}
                    strokeDashoffset={`-${prioLowDash + prioMedDash}`}
                  />
                </>
              )}
              <text x="80" y="85" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#0f172a">
                {totalCreated}
              </text>
              <text x="80" y="100" textAnchor="middle" fontSize="9" fill="#64748b">
                Priority Items
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
