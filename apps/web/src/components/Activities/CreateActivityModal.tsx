import React, { useState } from 'react';
import { Plant, FiveSCategory, PriorityLevel, Activity } from '../../types';
import { createActivity } from '../../api/client';
import { X, Plus, AlertCircle, Shield, Ruler, Clock, DollarSign, Upload } from 'lucide-react';

interface CreateActivityModalProps {
  plant: Plant;
  onClose: () => void;
  onCreated: (newActivity: Activity) => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  plant,
  onClose,
  onCreated
}) => {
  const allZones = plant.departments.flatMap(d => d.zones);

  const [category, setCategory] = useState<FiveSCategory>('sort_seiri');
  const [zoneId, setZoneId] = useState(allZones[0]?.id || '');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [title, setTitle] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('');
  const [assignedTo, setAssignedTo] = useState(allZones[0]?.leader_id || 'user-op1');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [benefitsSafety, setBenefitsSafety] = useState(false);
  const [benefitsSpace, setBenefitsSpace] = useState(0);
  const [benefitsTime, setBenefitsTime] = useState(0);
  const [benefitsCost, setBenefitsCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When zone changes, update assigned leader if zone has one
  const handleZoneChange = (newZoneId: string) => {
    setZoneId(newZoneId);
    const matchedZone = allZones.find(z => z.id === newZoneId);
    if (matchedZone?.leader_id) {
      setAssignedTo(matchedZone.leader_id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problemDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedZone = allZones.find(z => z.id === zoneId);
      const assigneeName = selectedZone?.leader_name || 'Assigned Zonal Leader';

      const created = await createActivity({
        plant_id: plant.id,
        zone_id: zoneId,
        category,
        title,
        problem_description: problemDescription,
        priority,
        assigned_to: assignedTo,
        assignee_name: assigneeName,
        due_date: new Date(dueDate).toISOString(),
        initial_before_photo_url: beforePhotoUrl.trim() || undefined,
        benefits_safety: benefitsSafety,
        benefits_space_sqft: benefitsSpace,
        benefits_time_seconds: benefitsTime,
        benefits_cost_savings: benefitsCost,
        benefits_summary: 'Targeted Kaizen improvements to workstation layout.'
      });
      onCreated(created);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: Array<{ id: FiveSCategory; label: string }> = [
    { id: 'sort_seiri', label: '1S Sort' },
    { id: 'set_in_order_seiton', label: '2S Set in Order' },
    { id: 'shine_seiso', label: '3S Shine' },
    { id: 'standardize_seiketsu', label: '4S Standardize' },
    { id: 'sustain_shitsuke', label: '5S Sustain' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <h2 className="text-base font-bold text-slate-900">Create Work Order</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 5S Pillar Selector */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              5S Pillar Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {categories.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`py-2 px-2.5 rounded-lg text-center font-bold text-xs border transition-all cursor-pointer ${
                    category === c.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Work Order Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Work order title"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Target Zone / Workstation *
              </label>
              <select
                value={zoneId}
                onChange={e => handleZoneChange(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white"
              >
                {allZones.length === 0 ? (
                  <option value="">-- General Plant Workstation --</option>
                ) : (
                  allZones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code}) {z.leader_name ? `• ${z.leader_name}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Problem Statement */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Description & Scope *
            </label>
            <textarea
              required
              rows={3}
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              placeholder="Work order description"
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* Before Photo URL */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Before Photo URL (Optional)
            </label>
            <input
              type="url"
              value={beforePhotoUrl}
              onChange={e => setBeforePhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical (Safety Hazard)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white"
              />
            </div>
          </div>

          {/* Expected ROI & Benefits Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Expected Operational Benefits
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Space Recov. (sq.ft)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={benefitsSpace}
                  onChange={e => setBenefitsSpace(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Time Saved (sec)
                </label>
                <input
                  type="number"
                  value={benefitsTime}
                  onChange={e => setBenefitsTime(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Cost Savings ($)
                </label>
                <input
                  type="number"
                  value={benefitsCost}
                  onChange={e => setBenefitsCost(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs"
                />
              </div>
              <div className="flex items-center pt-4">
                <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={benefitsSafety}
                    onChange={e => setBenefitsSafety(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Safety Hazard</span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-[#0066FF] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Creating..." : "Create Work Order"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
