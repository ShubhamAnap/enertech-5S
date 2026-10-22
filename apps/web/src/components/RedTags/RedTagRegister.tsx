import React, { useState } from 'react';
import { RedTag, Plant } from '../../types';
import { DispositionBadge } from '../Common/StatusBadge';
import { RedTagActionModal } from './RedTagActionModal';
import { CreateRedTagModal } from './CreateRedTagModal';
import {
  Tag,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Layers
} from 'lucide-react';

interface RedTagRegisterProps {
  redTags: RedTag[];
  plant: Plant;
  onUpdateRedTag: (updated: RedTag) => void;
  onAddRedTag: (created: RedTag) => void;
}

export const RedTagRegister: React.FC<RedTagRegisterProps> = ({
  redTags,
  plant,
  onUpdateRedTag,
  onAddRedTag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('open');
  const [activeActionTag, setActiveActionTag] = useState<RedTag | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTags = redTags.filter(t => {
    const matchesSearch =
      t.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'open'
        ? !t.is_closed
        : t.is_closed;
    return matchesSearch && matchesStatus;
  });

  const openTags = redTags.filter(t => !t.is_closed);
  const totalAging = openTags.reduce((acc, t) => acc + (t.aging_days || 0), 0);
  const avgAging = openTags.length > 0 ? (totalAging / openTags.length).toFixed(1) : 0;
  const criticalAgingCount = openTags.filter(t => t.aging_days >= 14).length;

  return (
    <div className="space-y-6">
      {/* Red Tag Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{openTags.length}</div>
            <div className="text-xs text-slate-500 font-medium">Open in Quarantine</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            Number(avgAging) > 10 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{avgAging} days</div>
            <div className="text-xs text-slate-500 font-medium">Average Quarantine Age</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            criticalAgingCount > 0 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{criticalAgingCount}</div>
            <div className="text-xs text-slate-500 font-medium">Critical Aging (&ge;14 Days)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{redTags.filter(t => t.is_closed).length}</div>
            <div className="text-xs text-slate-500 font-medium">Resolved / Cleared</div>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search Red-Tag items, reasons, numbers..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus('open')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'open' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Open Quarantine ({openTags.length})
            </button>
            <button
              onClick={() => setFilterStatus('closed')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'closed' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Resolved ({redTags.filter(t => t.is_closed).length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              All ({redTags.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Red Tag</span>
          </button>
        </div>
      </div>

      {/* Red Tags Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Tag #</th>
                <th className="py-3.5 px-4">Item & Reason</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Qty</th>
                <th className="py-3.5 px-4">Quarantine Age</th>
                <th className="py-3.5 px-4">Disposition Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No Red-Tag items found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTags.map(tag => {
                  const isCriticalAge = !tag.is_closed && tag.aging_days >= 14;
                  return (
                    <tr key={tag.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-700 whitespace-nowrap">
                        {tag.tag_number}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{tag.item_name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{tag.reason}</div>
                        {tag.photo_url && (
                          <a
                            href={tag.photo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-[10px] text-indigo-600 hover:underline mt-1"
                          >
                            <span>Inspect Photo</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {tag.item_category}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {tag.quantity}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            tag.is_closed
                              ? 'bg-slate-100 text-slate-600'
                              : isCriticalAge
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 ring-2 ring-rose-400/20 animate-pulse'
                              : tag.aging_days >= 7
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {tag.aging_days} days
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <DispositionBadge disposition={tag.disposition} isClosed={tag.is_closed} />
                        {tag.disposition_notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5 italic">
                            {tag.disposition_notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setActiveActionTag(tag)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                        >
                          {tag.is_closed ? "Review Action" : "Set Disposition"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Decision Modal */}
      {activeActionTag && (
        <RedTagActionModal
          redTag={activeActionTag}
          onClose={() => setActiveActionTag(null)}
          onUpdated={updated => {
            onUpdateRedTag(updated);
            setActiveActionTag(null);
          }}
        />
      )}

      {/* Create Red Tag Modal */}
      {showCreateModal && (
        <CreateRedTagModal
          plant={plant}
          onClose={() => setShowCreateModal(false)}
          onCreated={created => {
            onAddRedTag(created);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};
