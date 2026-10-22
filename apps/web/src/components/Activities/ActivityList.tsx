import React, { useState } from 'react';
import { Activity, FiveSCategory, ActivityStatus, Plant } from '../../types';
import { ActivityCard } from './ActivityCard';
import { Search, Filter, LayoutGrid, Kanban, Plus, Sparkles, Layers } from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  plant: Plant;
  onSelectActivity: (activity: Activity) => void;
  onOpenCreateModal: () => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  plant,
  onSelectActivity,
  onOpenCreateModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');

  const allZones = plant.departments.flatMap(d => d.zones);

  const filteredActivities = activities.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.activity_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.problem_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    const matchesZone = selectedZone === 'all' || a.zone_id === selectedZone;
    return matchesSearch && matchesCategory && matchesStatus && matchesZone;
  });

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All 5S Pillars' },
    { id: 'sort_seiri', label: '1S Sort (Seiri)' },
    { id: 'set_in_order_seiton', label: '2S Set in Order (Seiton)' },
    { id: 'shine_seiso', label: '3S Shine (Seiso)' },
    { id: 'standardize_seiketsu', label: '4S Standardize (Seiketsu)' },
    { id: 'sustain_shitsuke', label: '5S Sustain (Shitsuke)' }
  ];

  const kanbanColumns: Array<{ id: string; title: string; statuses: ActivityStatus[]; color: string }> = [
    { id: 'assigned', title: 'Assigned / Backlog', statuses: ['draft', 'assigned'], color: 'border-blue-400 bg-blue-50/40 text-blue-800' },
    { id: 'in_progress', title: 'In Progress (Active Kaizen)', statuses: ['in_progress', 'rejected'], color: 'border-sky-400 bg-sky-50/40 text-sky-800' },
    { id: 'review', title: 'Needs Supervisor Review', statuses: ['submitted_for_review'], color: 'border-amber-400 bg-amber-50/50 text-amber-900' },
    { id: 'approved', title: 'Standardized & Completed', statuses: ['approved', 'completed'], color: 'border-emerald-400 bg-emerald-50/40 text-emerald-800' }
  ];

  return (
    <div className="space-y-5">
      {/* Search, Filters & Action Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search 5S activities, IDs, hazards..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                  viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Kanban</span>
              </button>
            </div>

            {/* Create Activity Button */}
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New 5S Activity</span>
            </button>
          </div>
        </div>

        {/* 5S Pillar Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {categories.map(c => (
            <button
              type="button"
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Secondary Zone & Status filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Zone Filter:</span>
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className="p-1 px-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700"
            >
              <option value="all">All Zones ({allZones.length})</option>
              {allZones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>

            <span className="text-slate-500 font-medium ml-2">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="p-1 px-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted_for_review">Needs Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="text-slate-400 text-[11px]">
            Showing <strong>{filteredActivities.length}</strong> of {activities.length} activities
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No 5S activities match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing filters or register a new 5S Kaizen activity to document workstation improvements.
              </p>
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Register Activity
              </button>
            </div>
          ) : (
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
        </>
      )}

      {/* Kanban Board View */}
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
    </div>
  );
};
