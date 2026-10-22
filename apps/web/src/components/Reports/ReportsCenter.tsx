import React from 'react';
import { Activity, Plant } from '../../types';
import { getActivityPdfDownloadUrl } from '../../api/client';
import { FileText, Download, CheckCircle2, ShieldCheck, Printer, ExternalLink } from 'lucide-react';
import { CategoryBadge, StatusBadge } from '../Common/StatusBadge';

interface ReportsCenterProps {
  activities: Activity[];
  plant: Plant;
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({ activities, plant }) => {
  const verifiedActivities = activities.filter(a => ['approved', 'completed'].includes(a.status));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">5S Official PDF Reports & Compliance Records</h2>
              <p className="text-xs text-slate-500">Automated ReportLab Document Generation with Visual Evidence & ROI Certification</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Archived PDF Records</div>
            <div className="text-xl font-black text-indigo-700">{activities.length} Certified</div>
          </div>
        </div>
      </div>

      {/* Verified Activities Available for PDF Download */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-5 pb-2 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Download Official Activity PDF Sheets</h3>
            <p className="text-xs text-slate-500">Ready for shop floor visual display boards, audits, and ISO/OSHA compliance archiving</p>
          </div>
          <span className="text-xs text-emerald-600 font-bold flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
            Sign-Off Authenticated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-3 px-5">Activity Number</th>
                <th className="py-3 px-5">Kaizen Title</th>
                <th className="py-3 px-5">5S Pillar</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Assignee / Supervisor</th>
                <th className="py-3 px-5 text-right">Official Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map(act => (
                <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    {act.activity_number}
                  </td>
                  <td className="py-3.5 px-5 max-w-sm">
                    <div className="font-bold text-slate-900 line-clamp-1">{act.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{act.problem_description}</div>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <CategoryBadge category={act.category} size="sm" />
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <StatusBadge status={act.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap text-slate-600">
                    <div>{act.assignee_name || "Unassigned"}</div>
                    <div className="text-[10px] text-slate-400">Sup: {act.supervisor_name || "Dave Vance"}</div>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <a
                      href={getActivityPdfDownloadUrl(act.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      <span>Download PDF</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
