import React, { useState } from 'react';
import type { Activity, ActivityStatus, Plant, Zone, UserPersona, ReportSubmissionPayload } from '../../types';
import { SubmitReportModal } from './SubmitReportModal';
import { submitActivityReport, reviewActivityReport } from '../../api/client';
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  Check,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Lock,
  Pause,
  RefreshCw,
  MessageSquare,
  Edit3,
  Share2,
  Calendar,
  User,
  MapPin,
  Tag,
  ShieldCheck,
  Ruler,
  DollarSign,
  Image as ImageIcon,
  SlidersHorizontal,
  ArrowUpDown,
  Columns,
  LayoutGrid,
  Kanban,
  FileText,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import { ActivityCard } from './ActivityCard';

interface MaintainXWorkOrdersProps {
  activities: Activity[];
  plant: Plant;
  currentZone: Zone;
  activePersona: UserPersona;
  onSelectActivity: (activity: Activity) => void;
  onUpdateActivity: (activity: Activity) => void;
  onOpenCreateModal: () => void;
}

export const MaintainXWorkOrders: React.FC<MaintainXWorkOrdersProps> = ({
  activities,
  plant,
  currentZone,
  activePersona,
  onSelectActivity,
  onUpdateActivity,
  onOpenCreateModal
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    activities[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'kanban'>('split');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'comments'>('details');

  const allZones = plant.departments.flatMap(d => d.zones);

  // Filter activities
  const filteredActivities = activities.filter(a => {
    const isDone = ['approved', 'completed'].includes(a.status);
    if (activeTab === 'todo' && isDone) return false;
    if (activeTab === 'done' && !isDone) return false;

    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.activity_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.problem_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.assignee_name && a.assignee_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesZone = selectedZoneFilter === 'all' || a.zone_id === selectedZoneFilter;
    const matchesPriority = selectedPriorityFilter === 'all' || a.priority === selectedPriorityFilter;

    return matchesSearch && matchesZone && matchesPriority;
  });

  const selectedActivity =
    activities.find(a => a.id === selectedActivityId) || filteredActivities[0] || activities[0];

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleStatusChange = (newStatus: ActivityStatus) => {
    if (!selectedActivity) return;
    const updated: Activity = {
      ...selectedActivity,
      status: newStatus
    };
    onUpdateActivity(updated);
  };

  const handleReportSubmit = async (payload: ReportSubmissionPayload) => {
    try {
      const updated = await submitActivityReport(payload);
      onUpdateActivity(updated);
    } catch (err) {
      console.error("Failed to submit report:", err);
    }
  };

  const handleApprove = async () => {
    if (!selectedActivity) return;
    setActionLoading(true);
    try {
      const updated = await reviewActivityReport(selectedActivity.id, { decision: 'approve' });
      onUpdateActivity(updated);
    } catch (err) {
      console.error("Failed to approve report:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedActivity || !rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const updated = await reviewActivityReport(selectedActivity.id, { 
        decision: 'reject', 
        rejection_reason: rejectionReason 
      });
      onUpdateActivity(updated);
      setIsRejectModalOpen(false);
      setRejectionReason('');
    } catch (err) {
      console.error("Failed to request changes:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1.5" />;
      case 'medium':
        return <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1.5" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-400 inline-block mr-1.5" />;
    }
  };

  const kanbanColumns: Array<{ id: string; title: string; statuses: ActivityStatus[]; color: string }> = [
    { id: 'open', title: 'Open / Backlog', statuses: ['draft', 'assigned'], color: 'border-blue-400 bg-blue-50/50 text-blue-800' },
    { id: 'in_progress', title: 'In Progress (Active 5S)', statuses: ['in_progress', 'rejected'], color: 'border-sky-400 bg-sky-50/50 text-sky-800' },
    { id: 'review', title: 'Needs Review', statuses: ['submitted_for_review'], color: 'border-amber-400 bg-amber-50/60 text-amber-900' },
    { id: 'done', title: 'Done / Standardized', statuses: ['approved', 'completed'], color: 'border-emerald-400 bg-emerald-50/50 text-emerald-800' }
  ];

  return (
    <div className="space-y-4">
      {/* Top MaintainX-Style Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Work Orders</h1>

          {/* View Mode Switcher (Split View, Grid, Kanban) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="MaintainX Split View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban Board"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
        </div>

        {/* Right Search & + New Work Order Button */}
        <div className="flex items-center space-x-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Work Orders..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Work Order</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (MaintainX Style Pills) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center text-slate-500 font-semibold text-[11px] pr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Filter:
          </span>

          {/* Assigned To Filter */}
          <div className="flex items-center px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium cursor-pointer">
            <User className="w-3 h-3 mr-1 text-slate-400" />
            <span>Assigned to: All</span>
            <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
          </div>

          {/* Zone / Location Filter */}
          <div className="flex items-center px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
            <select
              value={selectedZoneFilter}
              onChange={e => setSelectedZoneFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Location: All Zones</option>
              {allZones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <select
              value={selectedPriorityFilter}
              onChange={e => setSelectedPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Priority: All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 text-[11px]">
          Showing <strong>{filteredActivities.length}</strong> work orders
        </div>
      </div>

      {/* VIEW MODE 1: MaintainX Split View (Master-Detail Pane) */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANE: Work Orders List (4.5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[750px] overflow-hidden">
            {/* Tabs: To Do vs Done */}
            <div className="flex border-b border-slate-200 bg-slate-50/60 px-2 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('todo')}
                className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'todo'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                To Do ({activities.filter(a => !['approved', 'completed'].includes(a.status)).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('done')}
                className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'done'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Done ({activities.filter(a => ['approved', 'completed'].includes(a.status)).length})
              </button>
            </div>

            {/* Sort row */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <span className="flex items-center text-blue-600 font-semibold cursor-pointer">
                Sort by: Due Date Latest First
                <ChevronDown className="w-3 h-3 ml-1" />
              </span>
              <span className="text-slate-400 hover:text-slate-600 cursor-pointer">
                Mark all as Read
              </span>
            </div>

            {/* List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredActivities.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No work orders found in this category.
                </div>
              ) : (
                filteredActivities.map(act => {
                  const isSelected = selectedActivity?.id === act.id;
                  const beforePhoto = act.evidence.find(e => e.media_type === 'before_photo');
                  const afterPhoto = act.evidence.find(e => e.media_type === 'after_photo');
                  const thumbnail = afterPhoto?.file_url || beforePhoto?.file_url;

                  return (
                    <div
                      key={act.id}
                      onClick={() => setSelectedActivityId(act.id)}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Circular / Rounded Equipment Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt="Equipment"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      {/* Middle: Title, Requester, Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block mr-1.5" />
                            {act.title}
                          </h4>
                          <span className="font-mono text-[10px] text-slate-400 shrink-0">
                            #{act.activity_number.split('-')[1] || act.activity_number}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          Requested by {act.assignee_name || 'John Smith'}
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                          {/* Status Pill */}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              act.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : act.status === 'submitted_for_review'
                                ? 'bg-amber-100 text-amber-800'
                                : ['approved', 'completed'].includes(act.status)
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {act.status.replace('_', ' ')}
                          </span>

                          {/* Priority Pill */}
                          <span className="inline-flex items-center text-[10px] text-slate-600 font-medium">
                            {getPriorityDot(act.priority)}
                            <span className="capitalize">{act.priority}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANE: Selected Work Order Detail (MaintainX Style, 7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[750px] overflow-hidden">
            {selectedActivity ? (
              <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
                {/* 1. Header Bar: Title & MaintainX Action Buttons */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                      {selectedActivity.title}
                    </h2>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveDetailTab(activeDetailTab === 'comments' ? 'details' : 'comments')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                          activeDetailTab === 'comments'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Comments</span>
                        {selectedActivity.comments && selectedActivity.comments.length > 0 && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {selectedActivity.comments.length}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectActivity(selectedActivity)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                        title="Copy Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-600">
                      {selectedActivity.activity_number}
                    </span>
                    <span>&bull;</span>
                    <span className="capitalize">{selectedActivity.category.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* 2. MaintainX Signature Status Selector (4 Big Buttons) */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status (Click to update)
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Open Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('assigned')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        selectedActivity.status === 'assigned' || selectedActivity.status === 'draft'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-bold">Open</span>
                    </button>

                    {/* On Hold / Review Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('submitted_for_review')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        selectedActivity.status === 'submitted_for_review'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Pause className="w-4 h-4" />
                      <span className="text-xs font-bold">On Hold</span>
                    </button>

                    {/* In Progress Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('in_progress')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        selectedActivity.status === 'in_progress'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-xs font-bold">In Progress</span>
                    </button>

                    {/* Done Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange('approved')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        selectedActivity.status === 'approved' || selectedActivity.status === 'completed'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-bold">Done</span>
                    </button>
                  </div>
                </div>

                {/* RBAC Action Card: Management Review vs Zonal Leader Completion Submission */}
                {selectedActivity.status === 'submitted_for_review' && (
                  <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          5S Completion Report Ready for Management Review
                        </h4>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        Zonal Leader: {selectedActivity.assignee_name || 'Alex Chen'}
                      </span>
                    </div>

                    {selectedActivity.corrective_action && (
                      <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-amber-200/80">
                        <strong className="block text-[11px] text-slate-500 font-semibold mb-0.5">Submitted Corrective Action:</strong>
                        {selectedActivity.corrective_action}
                      </div>
                    )}

                    {/* Management Decision Buttons */}
                    {(activePersona.role === 'management' || activePersona.canApproveKaizen) ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={actionLoading}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Standardize</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRejectModalOpen(true)}
                          disabled={actionLoading}
                          className="py-2 px-4 border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          Request Changes
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-800 italic">
                        Report submitted by you. Awaiting review and standardization by Plant Management.
                      </div>
                    )}
                  </div>
                )}

                {/* Zonal Leader Submit Button for Open or In-Progress Tasks */}
                {(selectedActivity.status === 'in_progress' || selectedActivity.status === 'assigned' || selectedActivity.status === 'draft') && (
                  <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Submit 5S Completion Report
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#0066FF] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Report</span>
                    </button>
                  </div>
                )}

                {/* Rejected / Rework Requested Notice */}
                {selectedActivity.status === 'rejected' && (
                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <h4 className="text-xs font-bold text-rose-900">Rework Requested by Management</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsReportModalOpen(true)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Resubmit Report
                      </button>
                    </div>
                    {selectedActivity.rejection_reason && (
                      <p className="text-xs text-rose-800 bg-white p-2.5 rounded border border-rose-200">
                        {selectedActivity.rejection_reason}
                      </p>
                    )}
                  </div>
                )}

                {/* Approved & Standardized Banner */}
                {(selectedActivity.status === 'approved' || selectedActivity.status === 'completed') && (
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Approved & Standardized across Workstation</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded">
                      5S Compliant
                    </span>
                  </div>
                )}

                {/* 3. MaintainX Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                      Due Date
                    </span>
                    <strong className="text-slate-800 font-bold block mt-0.5">
                      {selectedActivity.due_date 
                        ? new Date(selectedActivity.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
                        : 'No due date set'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                      Priority
                    </span>
                    <strong className="text-slate-800 font-bold flex items-center mt-0.5 capitalize">
                      {getPriorityDot(selectedActivity.priority)}
                      {selectedActivity.priority}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                      Work Order ID
                    </span>
                    <span className="font-mono font-bold text-slate-800 block mt-0.5">
                      #{selectedActivity.activity_number.split('-')[1] || selectedActivity.activity_number}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                      Assigned To
                    </span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {selectedActivity.assignee_name ? selectedActivity.assignee_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <strong className="text-slate-800 font-bold truncate text-[11px]">
                        {selectedActivity.assignee_name || 'Unassigned'}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                      Location
                    </span>
                    <div className="flex items-center space-x-1 mt-0.5 text-slate-800 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">
                        {selectedActivity.location_name || currentZone?.name || plant?.name || 'Production Floor'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                      Asset / Workstation
                    </span>
                    <span className="text-slate-900 font-bold block mt-0.5 truncate text-[11px]" title={selectedActivity.asset_name || "General Workstation"}>
                      {selectedActivity.asset_name || "General Workstation"}
                    </span>
                  </div>
                </div>

                {/* 4. Description */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Description & Kaizen Scope
                  </h3>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedActivity.problem_description}
                    </p>
                  </div>
                </div>

                {/* 5. Visual Evidence */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Photographic Evidence
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {selectedActivity.evidence ? selectedActivity.evidence.length : 0} file(s)
                    </span>
                  </div>

                  {selectedActivity.evidence && selectedActivity.evidence.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedActivity.evidence.map((ev, idx) => (
                        <div key={ev.id || idx} className="space-y-1">
                          <div className="h-28 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden relative group">
                            <img
                              src={ev.file_url}
                              alt={ev.file_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                            />
                            {ev.media_type && (
                              <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white ${
                                ev.media_type === 'after_photo' ? 'bg-emerald-600' : 'bg-blue-600'
                              }`}>
                                {ev.media_type === 'after_photo' ? 'AFTER' : 'BEFORE'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium truncate block capitalize">
                            {ev.file_name.replace(/_/g, ' ').replace(/\.jpg|\.png/g, '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                      <span>No photos attached yet.</span>
                      {selectedActivity.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => setIsReportModalOpen(true)}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach Evidence</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 6. Measured Operational ROI */}
                {(selectedActivity.benefits_space_sqft > 0 ||
                  selectedActivity.benefits_time_seconds > 0 ||
                  selectedActivity.benefits_cost_savings > 0 ||
                  selectedActivity.benefits_safety) && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Verified Kaizen Benefits & ROI
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {selectedActivity.benefits_safety && (
                        <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Safety</span>
                          <span className="text-xs font-black text-emerald-700">Zero-Hazard</span>
                        </div>
                      )}
                      {selectedActivity.benefits_space_sqft > 0 && (
                        <div className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/60">
                          <span className="text-[10px] font-bold text-sky-800 uppercase block">Floor Space</span>
                          <span className="text-xs font-black text-sky-700">+{selectedActivity.benefits_space_sqft} sq.ft</span>
                        </div>
                      )}
                      {selectedActivity.benefits_time_seconds > 0 && (
                        <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block">Cycle Time</span>
                          <span className="text-xs font-black text-amber-700">-{selectedActivity.benefits_time_seconds}s / shift</span>
                        </div>
                      )}
                      {selectedActivity.benefits_cost_savings > 0 && (
                        <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Cost Avoidance</span>
                          <span className="text-xs font-black text-emerald-700">${selectedActivity.benefits_cost_savings.toLocaleString()}/yr</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
                Select a work order from the list to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Cards Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map(act => (
            <ActivityCard
              key={act.id}
              activity={act}
              onClick={() => onSelectActivity(act)}
            />
          ))}
        </div>
      )}

      {/* VIEW MODE 3: Kanban Columns */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map(col => {
            const colActs = filteredActivities.filter(a => col.statuses.includes(a.status));
            return (
              <div key={col.id} className="bg-slate-100/70 rounded-2xl border border-slate-200 p-3 flex flex-col space-y-3 min-h-[500px]">
                <div className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-between ${col.color}`}>
                  <span>{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-white/80 text-slate-800 flex items-center justify-center text-[10px]">
                    {colActs.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colActs.map(act => (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      onClick={() => onSelectActivity(act)}
                    />
                  ))}
                  {colActs.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                      No items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zonal Leader Submit Completion Report Modal */}
      {selectedActivity && (
        <SubmitReportModal
          activity={selectedActivity}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleReportSubmit}
        />
      )}

      {/* Management Request Rework / Changes Modal */}
      {isRejectModalOpen && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="h-12 border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-900">Request 5S Re-work / Changes</h3>
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Specify what changes or corrections the Zonal Leader needs to perform before this activity can be standardized:
              </p>

              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please organize cutting tool inserts into labeled bins and wipe down the chip chute behind the spindle."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Sending...' : 'Send Rework Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
