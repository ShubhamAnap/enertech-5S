import React from 'react';
import { ZoneMetric } from '../../types';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface ZoneTableProps {
  zones: ZoneMetric[];
  onSelectZone?: (zoneId: string) => void;
  onAuditZone?: (zoneId: string) => void;
}

export const ZoneTable: React.FC<ZoneTableProps> = ({
  zones,
  onSelectZone,
  onAuditZone
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
      <div className="p-5 pb-2 flex items-center justify-between border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Plant Zone 5S Compliance Heatmap</h3>
          <p className="text-xs text-slate-500">Live scorecards and active Kaizen tasks per shop floor work cell</p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {zones.length} Monitored Zones
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-5">Work Cell / Zone</th>
              <th className="py-3 px-5">Department</th>
              <th className="py-3 px-5 text-center">Current Score</th>
              <th className="py-3 px-5 text-center">Active Kaizen</th>
              <th className="py-3 px-5">Compliance Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones.map(z => {
              const isExcellent = z.score >= 90;
              const isGood = z.score >= 80 && z.score < 90;

              return (
                <tr key={z.zone_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-5 font-bold text-slate-900">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        isExcellent ? 'bg-emerald-500' : isGood ? 'bg-indigo-500' : 'bg-rose-500'
                      }`} />
                      <span>{z.zone_name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-5 text-slate-600 whitespace-nowrap">
                    {z.dept_name}
                  </td>

                  <td className="py-3 px-5 text-center whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {z.score}%
                    </span>
                  </td>

                  <td className="py-3 px-5 text-center whitespace-nowrap">
                    <span className="font-semibold text-slate-700">
                      {z.active_tasks} tasks
                    </span>
                    {z.overdue_tasks > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                        {z.overdue_tasks} overdue
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                        isExcellent
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isGood
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isExcellent ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Excellent (Gold)
                        </>
                      ) : isGood ? (
                        <>
                          <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />
                          Compliant (Silver)
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3 h-3 mr-1 text-rose-600" />
                          Needs Attention
                        </>
                      )}
                    </span>
                  </td>

                  <td className="py-3 px-5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onAuditZone && onAuditZone(z.zone_id)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                    >
                      Run Audit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
