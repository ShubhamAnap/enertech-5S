import React, { useState } from 'react';
import type { RedTag } from '../../types';
import { updateRedTagDisposition } from '../../api/client';
import { X, Tag } from 'lucide-react';

interface RedTagActionModalProps {
  redTag: RedTag;
  onClose: () => void;
  onUpdated: (updated: RedTag) => void;
}

type ValidDisposition = 'relocate' | 'scrap' | 'return_to_vendor' | 'hold_for_evaluation';

export const RedTagActionModal: React.FC<RedTagActionModalProps> = ({
  redTag,
  onClose,
  onUpdated
}) => {
  const initialDisp: ValidDisposition =
    redTag.disposition === 'pending' ? 'relocate' : (redTag.disposition as ValidDisposition);

  const [disposition, setDisposition] = useState<ValidDisposition>(initialDisp);
  const [dispositionNotes, setDispositionNotes] = useState(redTag.disposition_notes || '');
  const [isClosed, setIsClosed] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispositionNotes.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await updateRedTagDisposition(redTag.id, {
        disposition,
        disposition_notes: dispositionNotes,
        is_closed: isClosed
      });
      onUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dispositions: Array<{ id: ValidDisposition; label: string; desc: string }> = [
    { id: 'relocate', label: 'Relocate to Central Storage', desc: 'Item is useful elsewhere in the plant' },
    { id: 'scrap', label: 'Scrap & Recycle', desc: 'Item is broken, damaged, or beyond repair' },
    { id: 'return_to_vendor', label: 'Return to Vendor / Supplier', desc: 'Defective shipment or leased asset' },
    { id: 'hold_for_evaluation', label: 'Hold in Quarantine Area', desc: 'Awaiting engineering or management decision' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-rose-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                Red-Tag Disposition Decision: {redTag.tag_number}
              </h3>
              <p className="text-xs text-rose-700">Purge clutter from 5S workstation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Summary of Item */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span>{redTag.item_name}</span>
              <span className="font-mono text-slate-500">Qty: {redTag.quantity}</span>
            </div>
            <p className="text-slate-600 text-[11px]">{redTag.reason}</p>
            <div className="flex items-center text-[10px] text-slate-400 pt-1">
              <span>Tagged by: {redTag.logged_by_name || 'Floor Operator'}</span>
              <span className="mx-2">&bull;</span>
              <span className="font-bold text-rose-600">{redTag.aging_days} days in quarantine</span>
            </div>
          </div>

          {/* Disposition Selector */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Select Final Disposition Action *
            </label>
            <div className="space-y-2">
              {dispositions.map(d => (
                <label
                  key={d.id}
                  className={`flex items-start p-2.5 rounded-xl border cursor-pointer transition-all ${
                    disposition === d.id
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="disposition"
                    checked={disposition === d.id}
                    onChange={() => setDisposition(d.id)}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-2.5">
                    <div className="font-bold text-slate-900">{d.label}</div>
                    <div className="text-[11px] text-slate-500">{d.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Disposition Notes */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Disposition Notes & Approvals *
            </label>
            <textarea
              required
              rows={3}
              value={dispositionNotes}
              onChange={e => setDispositionNotes(e.target.value)}
              placeholder="e.g. Scrapped in dumpster #3 with plant safety supervisor sign-off. Workstation cleared."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Close status */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isClosed}
                onChange={e => setIsClosed(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Mark Red-Tag as Resolved & Closed</span>
            </label>
            <p className="text-[11px] text-slate-500 mt-1 pl-6">
              Removes item from active Red-Tag quarantine holding area and updates plant clutter metrics.
            </p>
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
              disabled={isSubmitting || !dispositionNotes.trim()}
              className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg shadow-sm"
            >
              {isSubmitting ? "Updating..." : "Execute Disposition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
