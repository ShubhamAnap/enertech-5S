import React from 'react';
import { Activity } from '../../types';
import { CategoryBadge, StatusBadge, PriorityBadge } from '../Common/StatusBadge';
import { Calendar, User, ShieldCheck, Ruler, Clock, DollarSign, Image as ImageIcon, ArrowRight } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const beforePhoto = activity.evidence.find(e => e.media_type === 'before_photo');
  const afterPhoto = activity.evidence.find(e => e.media_type === 'after_photo');

  const isOverdue = activity.due_date && new Date(activity.due_date) < new Date() && !['approved', 'completed'].includes(activity.status);
  const formattedDueDate = activity.due_date ? new Date(activity.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-slate-200 hover:border-indigo-400 p-4 transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="font-mono text-xs font-bold text-slate-800 tracking-tight">
              {activity.activity_number}
            </span>
            <PriorityBadge priority={activity.priority} />
          </div>
          <StatusBadge status={activity.status} size="sm" />
        </div>

        {/* Category & Title */}
        <div className="mb-2">
          <CategoryBadge category={activity.category} size="sm" />
          <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {activity.title}
          </h3>
        </div>

        {/* Problem Description Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
          {activity.problem_description}
        </p>

        {/* Photo Evidence Preview */}
        <div className="flex items-center space-x-2 mb-3">
          {beforePhoto ? (
            <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-rose-200 bg-slate-100 shrink-0">
              <img src={beforePhoto.file_url} alt="Before" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-rose-600/90 text-white text-[9px] font-bold text-center leading-3">
                BEFORE
              </span>
            </div>
          ) : (
            <div className="w-16 h-12 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
          )}

          {afterPhoto ? (
            <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-emerald-200 bg-slate-100 shrink-0">
              <img src={afterPhoto.file_url} alt="After" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-bold text-center leading-3">
                AFTER
              </span>
            </div>
          ) : (
            <div className="w-16 h-12 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 shrink-0 bg-slate-50 text-[9px]">
              <span>Pending</span>
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-center text-xs text-slate-500 pl-1">
            <span className="font-medium text-slate-700 truncate">
              {afterPhoto ? "Verified 5S Pair" : "Before photo filed"}
            </span>
            <span className="text-[11px] text-slate-400">
              {activity.evidence.length} evidence asset(s)
            </span>
          </div>
        </div>
      </div>

      {/* Measurable ROI Badges & Footer */}
      <div className="pt-2 border-t border-slate-100">
        {/* ROI Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {activity.benefits_safety && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200" title="Safety hazard eliminated">
              <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
              Zero-Hazard
            </span>
          )}
          {activity.benefits_space_sqft > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold border border-sky-200" title="Floor space recovered">
              <Ruler className="w-3 h-3 mr-0.5 text-sky-600" />
              +{activity.benefits_space_sqft} sq.ft
            </span>
          )}
          {activity.benefits_time_seconds > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200" title="Cycle time saved per shift">
              <Clock className="w-3 h-3 mr-0.5 text-amber-600" />
              -{activity.benefits_time_seconds}s cycle
            </span>
          )}
          {activity.benefits_cost_savings > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200" title="Annual cost avoidance">
              <DollarSign className="w-3 h-3 mr-0.5 text-emerald-600" />
              ${activity.benefits_cost_savings.toLocaleString()}
            </span>
          )}
        </div>

        {/* Assignee & Due Date Row */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 truncate max-w-[150px]">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
              {activity.assignee_name ? activity.assignee_name.charAt(0) : <User className="w-3 h-3" />}
            </div>
            <span className="truncate font-medium text-slate-700 text-[11px]">
              {activity.assignee_name || "Unassigned"}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {formattedDueDate && (
              <span className={`inline-flex items-center text-[11px] font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                <Calendar className="w-3 h-3 mr-1" />
                {formattedDueDate}
              </span>
            )}
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};
