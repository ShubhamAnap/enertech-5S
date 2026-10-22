import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  X, 
  Phone,
  Mail,
  UserCheck,
  Shield,
  Trash
} from 'lucide-react';
import { ZonalLeader, Plant, Zone } from '../../types';
import { 
  fetchZonalLeaders, 
  createZonalLeader, 
  updateZonalLeader, 
  deleteZonalLeader 
} from '../../api/client';

interface ZonalLeadersSettingsProps {
  plants: Plant[];
  currentPlantId?: string;
}

export const ZonalLeadersSettings: React.FC<ZonalLeadersSettingsProps> = ({ 
  plants, 
  currentPlantId 
}) => {
  const [leaders, setLeaders] = useState<ZonalLeader[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLeader, setEditingLeader] = useState<ZonalLeader | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'zonal_leader',
    plantId: currentPlantId || plants[0]?.id || '',
    zoneId: ''
  });

  // Extract all available zones across departments
  const allZones: { zone: Zone; plantName: string; deptName: string }[] = [];
  plants.forEach(p => {
    p.departments?.forEach(d => {
      d.zones?.forEach(z => {
        allZones.push({ zone: z, plantName: p.name, deptName: d.name });
      });
    });
  });

  const loadLeaders = async () => {
    setLoading(true);
    try {
      const data = await fetchZonalLeaders(currentPlantId);
      setLeaders(data);
    } catch (err) {
      console.error("Failed to load zonal leaders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaders();
  }, [currentPlantId]);

  const handleOpenAdd = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'zonal_leader',
      plantId: currentPlantId || plants[0]?.id || '',
      zoneId: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (leader: ZonalLeader) => {
    setEditingLeader(leader);
    setFormData({
      firstName: leader.first_name,
      lastName: leader.last_name,
      email: leader.email,
      phone: leader.phone_number || '',
      role: leader.role || 'zonal_leader',
      plantId: leader.plant_id,
      zoneId: leader.assigned_zone_id || ''
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) return;

    try {
      const targetPlantId = formData.plantId || currentPlantId || plants[0]?.id || '';
      await createZonalLeader({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone.trim(),
        role: formData.role,
        plant_id: targetPlantId,
        assigned_zone_id: formData.zoneId && formData.zoneId !== 'unassigned' ? formData.zoneId : null
      });
      setIsAddModalOpen(false);
      await loadLeaders();
    } catch (err) {
      console.error("Failed to create leader:", err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeader) return;

    try {
      await updateZonalLeader(editingLeader.id, {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone.trim(),
        role: formData.role,
        assigned_zone_id: formData.zoneId === 'unassigned' ? '' : formData.zoneId
      });
      setEditingLeader(null);
      await loadLeaders();
    } catch (err) {
      console.error("Failed to update leader:", err);
    }
  };

  const handleDelete = async (leader: ZonalLeader) => {
    if (confirm(`Are you sure you want to permanently delete leader ${leader.first_name} ${leader.last_name}? This will completely remove them from the system.`)) {
      try {
        await deleteZonalLeader(leader.id);
        setLeaders(prev => prev.filter(l => l.id !== leader.id));
        await loadLeaders();
      } catch (err) {
        console.error("Failed to delete leader:", err);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("Are you sure you want to delete ALL leaders to start fresh for Enertech? This cannot be undone.")) {
      try {
        for (const leader of leaders) {
          await deleteZonalLeader(leader.id);
        }
        setLeaders([]);
        await loadLeaders();
      } catch (err) {
        console.error("Failed to clear leaders:", err);
      }
    }
  };

  const filteredLeaders = leaders.filter(l => {
    const q = searchQuery.toLowerCase();
    const fullName = `${l.first_name} ${l.last_name}`.toLowerCase();
    const zone = (l.assigned_zone_name || '').toLowerCase();
    const email = l.email.toLowerCase();
    return fullName.includes(q) || zone.includes(q) || email.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden text-slate-900 font-sans">
      {/* Enertech Header Bar */}
      <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 leading-tight">Team & Zonal Leaders</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                {leaders.filter(l => l.is_active).length} Active Leaders
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5">Role assignments & workstation leadership registry</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leader, workstation, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {leaders.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Delete all mock leaders to start fresh"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0066FF] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Zonal Leader</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {leaders.length === 0 && !loading ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs border border-blue-100">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Team Leaders Registered</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                Add team or zonal leaders to assign responsibilities, execute 5S work orders, and conduct area audits.
              </p>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Zonal Leader</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Leader Name</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Assigned Workstation / Zone</th>
                    <th className="py-3 px-4 text-center">Active Tasks</th>
                    <th className="py-3 px-4 text-center">Completed</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Loading team leaders registry...
                      </td>
                    </tr>
                  ) : filteredLeaders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        No zonal leaders found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaders.map((leader) => (
                      <tr 
                        key={leader.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={leader.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${leader.first_name}+${leader.last_name}`}
                              alt={leader.first_name}
                              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">
                                {leader.first_name} {leader.last_name}
                              </div>
                              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                                {leader.role.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{leader.email}</span>
                            </div>
                            {leader.phone_number && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{leader.phone_number}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {leader.assigned_zone_name ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium">
                              <MapPin className="w-3.5 h-3.5 text-blue-500" />
                              <span>{leader.assigned_zone_name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded-md text-xs border border-amber-200">
                            <Clock className="w-3 h-3" />
                            {leader.active_tasks_count}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-md text-xs border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {leader.completed_tasks_count}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            leader.is_active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${leader.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {leader.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(leader)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="Edit Leader"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(leader)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Delete Leader Completely"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Leader Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="h-12 border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Add New Zonal Leader</h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First name"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@enertechups.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  >
                    <option value="zonal_leader">Zonal Leader</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="operator">Operator</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / Extension</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 / ext."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Workstation / Zone (Optional)</label>
                <select
                  value={formData.zoneId}
                  onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                >
                  <option value="">-- Unassigned (Assign Later) --</option>
                  {allZones.map(({ zone, deptName }) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({deptName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#0066FF] hover:bg-blue-700 text-white rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Add Leader
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Reassign Zone Modal */}
      {editingLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="h-12 border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50/70">
              <h2 className="text-sm font-bold text-slate-900">Edit Leader Details</h2>
              <button 
                onClick={() => setEditingLeader(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="zonal_leader">Zonal Leader</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="operator">Operator</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
                <label className="block text-xs font-bold text-blue-900 mb-1">Assigned Workstation / Zone</label>
                <select
                  value={formData.zoneId}
                  onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                >
                  <option value="unassigned">-- Unassigned (No Zone) --</option>
                  {allZones.map(({ zone, deptName }) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({deptName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLeader(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#0066FF] hover:bg-blue-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
