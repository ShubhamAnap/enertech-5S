import React, { useState } from 'react';
import type { Plant, Zone, Activity, RedTag, UserPersona } from '../../types';
import {
  MapPin,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Layers,
  ChevronRight,
  Building2
} from 'lucide-react';
import { createZone, deleteZone } from '../../api/client';

interface PlantZoneMatrixProps {
  plant: Plant;
  activities: Activity[];
  redTags: RedTag[];
  activePersona: UserPersona;
  onSelectZone: (zone: Zone) => void;
  onAuditZone: (zone: Zone) => void;
  onZoneCreated?: () => void;
  onZoneDeleted?: (zoneId: string) => void;
}

export const PlantZoneMatrix: React.FC<PlantZoneMatrixProps> = ({
  plant,
  activities,
  redTags,
  activePersona,
  onSelectZone,
  onAuditZone,
  onZoneCreated,
  onZoneDeleted
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state for creating zone
  const [formData, setFormData] = useState({
    deptId: plant.departments[0]?.id || '',
    name: '',
    code: '',
    description: '',
    targetScore: 90
  });

  const handleOpenAdd = () => {
    setFormData({
      deptId: plant.departments[0]?.id || '',
      name: '',
      code: '',
      description: '',
      targetScore: 90
    });
    setIsAddModalOpen(true);
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.deptId) return;

    setSubmitting(true);
    try {
      await createZone({
        dept_id: formData.deptId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        target_score: Number(formData.targetScore),
        current_score: 85.0
      });
      setIsAddModalOpen(false);
      if (onZoneCreated) onZoneCreated();
    } catch (err) {
      console.error("Failed to create zone:", err);
      alert("Error creating zone. Please verify department and code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteZone = async () => {
    if (!zoneToDelete) return;
    setSubmitting(true);
    try {
      await deleteZone(zoneToDelete.id);
      if (onZoneDeleted) onZoneDeleted(zoneToDelete.id);
      setZoneToDelete(null);
    } catch (err) {
      console.error("Failed to delete zone:", err);
      alert("Failed to delete zone from server.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter zones by search query
  const q = searchQuery.toLowerCase();
  const allDepts = plant.departments.map(dept => {
    const matchingZones = dept.zones.filter(z => 
      z.name.toLowerCase().includes(q) || 
      z.code.toLowerCase().includes(q) ||
      (z.description && z.description.toLowerCase().includes(q)) ||
      dept.name.toLowerCase().includes(q)
    );
    return { ...dept, zones: matchingZones };
  }).filter(dept => dept.zones.length > 0 || q === '');

  const totalZonesCount = plant.departments.flatMap(d => d.zones).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-900 font-sans">
      {/* MaintainX Top Header Bar */}
      <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-900 leading-tight">Locations & Workstations</h1>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {totalZonesCount} Zones
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5">{plant.name} &bull; Workstation Hierarchy</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search workstation or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {(activePersona.role === 'management' || activePersona.canApproveKaizen) && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066FF] hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Zone</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {allDepts.map(dept => (
          <div key={dept.id} className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            {/* Department Section Header */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="font-mono text-xs font-semibold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                  {dept.code}
                </span>
                <h2 className="text-xs font-semibold text-slate-900">{dept.name}</h2>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {dept.zones.length} Workstations
              </span>
            </div>

            {/* Department Zones Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-5">Workstation Code</th>
                    <th className="py-2.5 px-5">Zone Name & Scope</th>
                    <th className="py-2.5 px-5">Assigned Leader</th>
                    <th className="py-2.5 px-5 text-center">Active Tasks</th>
                    <th className="py-2.5 px-5 text-center">Compliance</th>
                    <th className="py-2.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dept.zones.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400">
                        No workstations found in this department.
                      </td>
                    </tr>
                  ) : (
                    dept.zones.map(zone => {
                      const zoneActs = activities.filter(a => a.zone_id === zone.id);
                      const isHighCompliance = zone.current_score >= 90;

                      return (
                        <tr 
                          key={zone.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-3 px-5">
                            <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {zone.code}
                            </span>
                          </td>

                          <td className="py-3 px-5">
                            <div>
                              <div className="font-semibold text-slate-900">{zone.name}</div>
                              {zone.description && (
                                <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                                  {zone.description}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-5">
                            {zone.leader_name ? (
                              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                  {zone.leader_name.charAt(0)}
                                </div>
                                <span>{zone.leader_name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                            )}
                          </td>

                          <td className="py-3 px-5 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {zoneActs.length}
                            </span>
                          </td>

                          <td className="py-3 px-5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              isHighCompliance 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {zone.current_score}%
                            </span>
                          </td>

                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onSelectZone(zone)}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                title="Open Work Orders for this Zone"
                              >
                                <span>Tasks</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>

                              {(activePersona.role === 'management' || activePersona.canApproveKaizen) && (
                                <button
                                  onClick={() => setZoneToDelete(zone)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Delete Zone"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Add Zone Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="h-12 border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-900">Add New Workstation / Zone</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Department *</label>
                <select
                  required
                  value={formData.deptId}
                  onChange={(e) => setFormData({ ...formData, deptId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {plant.departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Workstation / Zone Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Haas VF-4 Milling Cell"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Zone Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. CNC-VF4"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Score (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formData.targetScore}
                    onChange={(e) => setFormData({ ...formData, targetScore: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description / Location Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Precision CNC lathe area with primary chip collection bin"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0066FF] hover:bg-blue-700 text-white rounded shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {zoneToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Delete Workstation Zone</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to delete <span className="font-semibold text-slate-800">{zoneToDelete.name}</span>?</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setZoneToDelete(null)}
                  disabled={submitting}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteZone}
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Delete Zone'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
