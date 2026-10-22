import React from 'react';
import { FiveSCategory, ActivityStatus, PriorityLevel, RedTagDisposition } from '../../types';
import { AlertCircle, Clock, CheckCircle2, XCircle, ShieldAlert, Sparkles, Sliders, Layers, Check } from 'lucide-react';

interface CategoryBadgeProps {
  category: FiveSCategory;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const configs: Record<FiveSCategory, { label: string; japanese: string; color: string; icon: React.ReactNode }> = {
    sort_seiri: {
      label: '1S Sort',
      japanese: 'Seiri',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <Layers className="w-3.5 h-3.5 mr-1" />
    },
    set_in_order_seiton: {
      label: '2S Set in Order',
      japanese: 'Seiton',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Sliders className="w-3.5 h-3.5 mr-1" />
    },
    shine_seiso: {
      label: '3S Shine',
      japanese: 'Seiso',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Sparkles className="w-3.5 h-3.5 mr-1" />
    },
    standardize_seiketsu: {
      label: '4S Standardize',
      japanese: 'Seiketsu',
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
    },
    sustain_shitsuke: {
      label: '5S Sustain',
      japanese: 'Shitsuke',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <Check className="w-3.5 h-3.5 mr-1" />
    }
  };

  const conf = configs[category] || configs.sort_seiri;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${conf.color} ${sizeClasses}`}>
      {conf.icon}
      <span>{conf.label}</span>
      <span className="opacity-60 ml-1 font-mono text-[10px]">({conf.japanese})</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: ActivityStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<ActivityStatus, { label: string; color: string; icon: React.ReactNode; pulse?: boolean }> = {
    draft: {
      label: 'Draft',
      color: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: <Clock className="w-3 h-3 mr-1" />
    },
    assigned: {
      label: 'Assigned',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Clock className="w-3 h-3 mr-1" />
    },
    in_progress: {
      label: 'In Progress',
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: <Sliders className="w-3 h-3 mr-1" />
    },
    submitted_for_review: {
      label: 'Needs Review',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: <AlertCircle className="w-3 h-3 mr-1" />,
      pulse: true
    },
    approved: {
      label: 'Approved',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-rose-50 text-rose-700 border-rose-300',
      icon: <XCircle className="w-3 h-3 mr-1" />
    },
    completed: {
      label: 'Standardized',
      color: 'bg-teal-50 text-teal-800 border-teal-300',
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />
    }
  };

  const conf = configs[status] || configs.draft;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-sm ${conf.color} ${sizeClasses} ${
        conf.pulse ? 'ring-2 ring-amber-400/30 ring-offset-1 animate-pulse' : ''
      }`}
    >
      {conf.icon}
      {conf.label}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: PriorityLevel;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const configs: Record<PriorityLevel, { label: string; color: string; icon?: React.ReactNode }> = {
    low: { label: 'Low', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    medium: { label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    high: { label: 'High', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
    critical: { label: 'Critical', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: <ShieldAlert className="w-3 h-3 mr-1 text-rose-600" /> }
  };

  const conf = configs[priority] || configs.medium;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded border ${conf.color}`}>
      {conf.icon}
      {conf.label}
    </span>
  );
};

interface DispositionBadgeProps {
  disposition: RedTagDisposition;
  isClosed: boolean;
}

export const DispositionBadge: React.FC<DispositionBadgeProps> = ({ disposition, isClosed }) => {
  if (isClosed) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
        Resolved ({disposition.replace('_', ' ')})
      </span>
    );
  }

  const configs: Record<RedTagDisposition, { label: string; color: string }> = {
    pending: { label: 'Pending Evaluation', color: 'bg-rose-100 text-rose-900 border-rose-300' },
    relocate: { label: 'To Relocate', color: 'bg-sky-100 text-sky-900 border-sky-300' },
    scrap: { label: 'To Scrap', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    return_to_vendor: { label: 'Return to Vendor', color: 'bg-purple-100 text-purple-900 border-purple-300' },
    hold_for_evaluation: { label: 'On Hold (Quarantine)', color: 'bg-orange-100 text-orange-900 border-orange-300' }
  };

  const conf = configs[disposition] || configs.pending;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${conf.color}`}>
      {conf.label}
    </span>
  );
};
