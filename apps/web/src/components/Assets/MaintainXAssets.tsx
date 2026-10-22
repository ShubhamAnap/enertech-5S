import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Wrench,
  Cpu,
  Filter,
  X,
  Check,
  Power
} from 'lucide-react';

export interface SubAsset {
  id: string;
  name: string;
  thumbnail?: string;
  status: 'online' | 'offline' | 'maintenance';
}

export interface Asset {
  id: string;
  name: string;
  thumbnail?: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  subAssetsCount: number;
  subAssets: SubAsset[];
  manufacturer?: string;
  year?: number;
  partNumber?: string;
  lastUpdated: string;
  uptimeHours: number;
  unplannedDowntimeHours: number;
  plannedDowntimeHours: number;
  openWorkOrdersCount: number;
}

const STORAGE_KEY = 'enertech_assets_registry_v1';

export const MaintainXAssets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'work_orders'>('details');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);

  // Form states
  const [assetForm, setAssetForm] = useState({
    name: '',
    location: '',
    manufacturer: '',
    partNumber: '',
    year: new Date().getFullYear(),
    status: 'online' as 'online' | 'offline' | 'maintenance',
    thumbnail: ''
  });

  const [subAssetName, setSubAssetName] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    } catch (e) {
      console.error("Failed to save assets to storage:", e);
    }
  }, [assets]);

  const filteredAssets = assets.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.partNumber && a.partNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || filteredAssets[0] || assets[0];

  const handleOpenAdd = () => {
    setAssetForm({
      name: '',
      location: '',
      manufacturer: 'Enertech Systems',
      partNumber: '',
      year: new Date().getFullYear(),
      status: 'online',
      thumbnail: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name.trim()) return;

    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: assetForm.name.trim(),
      location: assetForm.location.trim() || 'General Facility',
      manufacturer: assetForm.manufacturer.trim() || 'Enertech',
      partNumber: assetForm.partNumber.trim() || `ET-${Math.floor(100000 + Math.random() * 900000)}`,
      year: Number(assetForm.year) || new Date().getFullYear(),
      status: assetForm.status,
      thumbnail: assetForm.thumbnail.trim() || undefined,
      subAssetsCount: 0,
      subAssets: [],
      lastUpdated: 'Just now',
      uptimeHours: 0,
      unplannedDowntimeHours: 0,
      plannedDowntimeHours: 0,
      openWorkOrdersCount: 0
    };

    setAssets(prev => [newAsset, ...prev]);
    setSelectedAssetId(newAsset.id);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name,
      location: asset.location,
      manufacturer: asset.manufacturer || '',
      partNumber: asset.partNumber || '',
      year: asset.year || new Date().getFullYear(),
      status: asset.status,
      thumbnail: asset.thumbnail || ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !assetForm.name.trim()) return;

    setAssets(prev =>
      prev.map(a =>
        a.id === editingAsset.id
          ? {
              ...a,
              name: assetForm.name.trim(),
              location: assetForm.location.trim(),
              manufacturer: assetForm.manufacturer.trim(),
              partNumber: assetForm.partNumber.trim(),
              year: Number(assetForm.year) || a.year,
              status: assetForm.status,
              thumbnail: assetForm.thumbnail.trim() || undefined,
              lastUpdated: 'Updated just now'
            }
          : a
      )
    );
    setEditingAsset(null);
  };

  const handleDeleteAsset = (assetId: string, assetName: string) => {
    if (confirm(`Are you sure you want to permanently delete equipment "${assetName}"?`)) {
      setAssets(prev => prev.filter(a => a.id !== assetId));
      if (selectedAssetId === assetId) {
        setSelectedAssetId('');
      }
    }
  };

  const handleToggleStatus = (newStatus: 'online' | 'offline' | 'maintenance') => {
    if (!selectedAsset) return;
    setAssets(prev =>
      prev.map(a => (a.id === selectedAsset.id ? { ...a, status: newStatus, lastUpdated: 'Updated just now' } : a))
    );
  };

  const handleAddSubAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !subAssetName.trim()) return;

    const newSub: SubAsset = {
      id: `sub-${Date.now()}`,
      name: subAssetName.trim(),
      status: 'online'
    };

    setAssets(prev =>
      prev.map(a => {
        if (a.id === selectedAsset.id) {
          const updatedSubs = [...(a.subAssets || []), newSub];
          return {
            ...a,
            subAssets: updatedSubs,
            subAssetsCount: updatedSubs.length
          };
        }
        return a;
      })
    );

    setSubAssetName('');
    setIsAddSubModalOpen(false);
  };

  return (
    <div className="space-y-3 font-sans text-slate-900">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assets & Machinery</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              {assets.length} Registered
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search assets or parts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'all' ? 'online' : statusFilter === 'online' ? 'offline' : 'all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1.5 cursor-pointer transition-colors ${
              statusFilter !== 'all' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Status: {statusFilter.toUpperCase()}</span>
          </button>

          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600">
            Enertech Manufacturing Unit
          </span>
        </div>

        <div className="text-xs text-slate-500">
          Showing {filteredAssets.length} of {assets.length} assets
        </div>
      </div>

      {/* 3. Empty State or Split View */}
      {assets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Cpu className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">No Assets Registered</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Start tracking Enertech plant machinery, production lines, test chambers, and workstations to maintain 5S standards and monitor operational reliability.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Asset</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
          {/* Left Column: Asset Master List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700">
                {filteredAssets.length} Equipment Units
              </span>
              <span className="text-[11px] text-slate-400">Select to inspect</span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[620px]">
              {filteredAssets.map(asset => {
                const isSelected = selectedAsset && selectedAsset.id === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-blue-600 pl-2.5'
                        : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Hardware Icon Badge instead of broken images */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {asset.thumbnail ? (
                        <img
                          src={asset.thumbnail}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Cpu className="w-5 h-5 text-blue-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {asset.name}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            asset.status === 'online'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : asset.status === 'maintenance'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              asset.status === 'online'
                                ? 'bg-emerald-500'
                                : asset.status === 'maintenance'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center text-[11px] text-slate-500 gap-1.5 mb-1.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{asset.location}</span>
                      </div>

                      <div className="text-[11px] font-medium text-blue-600 hover:underline">
                        {asset.subAssets?.length || 0} Sub-Components &gt;
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Asset Detail View (7 cols) */}
          {selectedAsset && (
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
              {/* Detail Header */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-white">
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedAsset.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>Part #{selectedAsset.partNumber || 'N/A'}</span>
                    <span>•</span>
                    <span>{selectedAsset.manufacturer || 'Enertech'}</span>
                    {selectedAsset.year && (
                      <>
                        <span>•</span>
                        <span>Year {selectedAsset.year}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(selectedAsset)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Asset"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(selectedAsset.id, selectedAsset.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="flex border-b border-slate-200 px-4 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'details'
                      ? 'border-blue-600 text-blue-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Equipment Detail
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('work_orders')}
                  className={`py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'work_orders'
                      ? 'border-blue-600 text-blue-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Work Orders ({selectedAsset.openWorkOrdersCount})
                </button>
              </div>

              {/* Detail Content */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {activeTab === 'details' ? (
                  <>
                    {/* Status & Reliability Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Status & Operational State</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus('online')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-colors ${
                              selectedAsset.status === 'online'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Online
                          </button>
                          <button
                            onClick={() => handleToggleStatus('maintenance')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-colors ${
                              selectedAsset.status === 'maintenance'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Maintenance
                          </button>
                          <button
                            onClick={() => handleToggleStatus('offline')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-colors ${
                              selectedAsset.status === 'offline'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Offline
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Last activity: {selectedAsset.lastUpdated}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Plant Location
                      </label>
                      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{selectedAsset.location}</span>
                      </div>
                    </div>

                    {/* Sub Assets / Components */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Sub-Components ({selectedAsset.subAssets?.length || 0})
                        </label>
                        <button
                          onClick={() => setIsAddSubModalOpen(true)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Sub-Component</span>
                        </button>
                      </div>

                      {selectedAsset.subAssets && selectedAsset.subAssets.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedAsset.subAssets.map(sub => (
                            <div
                              key={sub.id}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="font-semibold text-slate-800">{sub.name}</span>
                              </div>
                              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                {sub.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                          No sub-components added.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No open 5S work orders currently tied to this machinery unit.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="h-12 border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Register New Equipment</h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset / Machine Name *</label>
                <input
                  type="text"
                  required
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  placeholder="e.g. SMT Reflow Oven Unit 2"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workstation / Plant Location *</label>
                <input
                  type="text"
                  required
                  value={assetForm.location}
                  onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                  placeholder="e.g. Production Floor • Line A"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={assetForm.manufacturer}
                    onChange={(e) => setAssetForm({ ...assetForm, manufacturer: e.target.value })}
                    placeholder="Enertech"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Part / Model Number</label>
                  <input
                    type="text"
                    value={assetForm.partNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, partNumber: e.target.value })}
                    placeholder="e.g. ET-4029"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Status</label>
                <select
                  value={assetForm.status}
                  onChange={(e) => setAssetForm({ ...assetForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="online">Online (Active)</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#0066FF] hover:bg-blue-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="h-12 border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50/70">
              <h2 className="text-sm font-bold text-slate-900">Edit Asset</h2>
              <button 
                onClick={() => setEditingAsset(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workstation / Location</label>
                <input
                  type="text"
                  required
                  value={assetForm.location}
                  onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={assetForm.manufacturer}
                    onChange={(e) => setAssetForm({ ...assetForm, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Part / Model #</label>
                  <input
                    type="text"
                    value={assetForm.partNumber}
                    onChange={(e) => setAssetForm({ ...assetForm, partNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
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

      {/* Add Sub-component Modal */}
      {isAddSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="h-12 border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50/70">
              <h2 className="text-sm font-bold text-slate-900">Add Sub-Component</h2>
              <button 
                onClick={() => setIsAddSubModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubAsset} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Component / Module Name *</label>
                <input
                  type="text"
                  required
                  value={subAssetName}
                  onChange={(e) => setSubAssetName(e.target.value)}
                  placeholder="e.g. Drive Motor Assembly"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-[#0066FF] hover:bg-blue-700 text-white rounded-lg shadow-xs"
                >
                  Add Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
