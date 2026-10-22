import React, { useState } from 'react';
import { Plant, RedTag } from '../../types';
import { createRedTag } from '../../api/client';
import { X, Tag, AlertTriangle } from 'lucide-react';

interface CreateRedTagModalProps {
  plant: Plant;
  onClose: () => void;
  onCreated: (newTag: RedTag) => void;
}

export const CreateRedTagModal: React.FC<CreateRedTagModalProps> = ({
  plant,
  onClose,
  onCreated
}) => {
  const allZones = plant.departments.flatMap(d => d.zones);

  const [zoneId, setZoneId] = useState(allZones[0]?.id || '');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Equipment/Tool');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800');
  const [loggedByName, setLoggedByName] = useState('Alex Chen (Floor Operator)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createRedTag({
        plant_id: plant.id,
        zone_id: zoneId,
        item_name: itemName,
        item_category: itemCategory,
        quantity,
        reason,
        photo_url: photoUrl,
        logged_by_name: loggedByName
      });
      onCreated(created);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-rose-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">Issue 5S Red Tag</h3>
              <p className="text-xs text-rose-700">1S (Seiri) Sort & Clutter Identification</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Item Name / Description *</label>
            <input
              type="text"
              required
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="e.g. Uncalibrated Vernier Calipers, Obsolete Pallet, Broken Drill Bits"
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Item Category</label>
              <select
                value={itemCategory}
                onChange={e => setItemCategory(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Equipment/Tool">Equipment / Hand Tool</option>
                <option value="Measuring Equipment">Measuring / Metrology Asset</option>
                <option value="Material Handling">Material Handling / Totes</option>
                <option value="Raw Material/WIP">Raw Material / Stagnant WIP</option>
                <option value="Pneumatics / Spare Parts">Pneumatics / Spare Parts</option>
                <option value="Trash / Scrap">Suspected Trash / Debris</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Location Zone *</label>
              <select
                value={zoneId}
                onChange={e => setZoneId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                {allZones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Tagged By</label>
              <input
                type="text"
                value={loggedByName}
                onChange={e => setLoggedByName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Reason for Red-Tagging (Why is it here?) *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Expired calibration certificate, not used in over 30 days, duplicate tooling, broken power cord..."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Photo Evidence URL</label>
            <input
              type="url"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-[11px]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !itemName.trim() || !reason.trim()}
              className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg shadow-sm"
            >
              {isSubmitting ? "Issuing..." : "Issue Red Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
