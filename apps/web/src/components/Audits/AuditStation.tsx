import React, { useState } from 'react';
import { Plant, AuditRun } from '../../types';
import { submitAudit } from '../../api/client';
import {
  ClipboardCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  Sliders,
  Calendar,
  User,
  History,
  FileCheck2,
  TrendingUp
} from 'lucide-react';

interface AuditStationProps {
  plant: Plant;
  audits: AuditRun[];
  onAuditSubmitted: (newAudit: AuditRun) => void;
}

export const AuditStation: React.FC<AuditStationProps> = ({
  plant,
  audits,
  onAuditSubmitted
}) => {
  const allZones = plant.departments.flatMap(d => d.zones);

  const [selectedZoneId, setSelectedZoneId] = useState(allZones[0]?.id || '');
  const [auditorName, setAuditorName] = useState('Maria Gomez (Lead 5S Auditor)');
  const [notes, setNotes] = useState('Comprehensive monthly 5S assessment conducted. Improvements verified.');

  // 5S Pillar Scores (0 to 100)
  const [sortScore, setSortScore] = useState(92);
  const [setInOrderScore, setSetInOrderScore] = useState(88);
  const [shineScore, setShineScore] = useState(96);
  const [standardizeScore, setStandardizeScore] = useState(94);
  const [sustainScore, setSustainScore] = useState(86);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const compositeScore = Math.round(
    ((sortScore + setInOrderScore + shineScore + standardizeScore + sustainScore) / 5) * 10
  ) / 10;

  const currentZone = allZones.find(z => z.id === selectedZoneId) || allZones[0];

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newAudit = await submitAudit({
        plant_id: plant.id,
        zone_id: selectedZoneId,
        zone_name: currentZone?.name || 'Shop Floor Zone',
        auditor_name: auditorName,
        sort_score: sortScore,
        set_in_order_score: setInOrderScore,
        shine_score: shineScore,
        standardize_score: standardizeScore,
        sustain_score: sustainScore,
        notes
      });
      onAuditSubmitted(newAudit);
      setSuccessMessage(`Audit run recorded successfully! Zone composite score updated to ${compositeScore}%.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (score >= 80) return 'text-indigo-600 bg-indigo-50 border-indigo-300';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-300';
    return 'text-rose-600 bg-rose-50 border-rose-300';
  };

  return (
    <div className="space-y-6">
      {/* Station Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">5S Digital Audit & Scoring Station</h2>
              <p className="text-xs text-slate-500">Live Rubric Assessment & Plant Zone Score Certification</p>
            </div>
          </div>
        </div>

        {/* Live Composite Gauge */}
        <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Calculated Score</div>
            <div className={`text-2xl font-black ${compositeScore >= 90 ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {compositeScore}%
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(compositeScore)}`}>
            {compositeScore >= 90 ? 'World-Class (Gold)' : compositeScore >= 80 ? 'Standardized (Silver)' : 'Action Required'}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Audit Console Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmitAudit} className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          {/* Target Zone & Auditor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Target Zone for Audit *</label>
              <select
                value={selectedZoneId}
                onChange={e => setSelectedZoneId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                {allZones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name} (Current: {z.current_score}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Lead Auditor Name *</label>
              <input
                type="text"
                required
                value={auditorName}
                onChange={e => setAuditorName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 5-Pillar Interactive Rubric Assessment */}
          <div className="space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <Sliders className="w-4 h-4 mr-1.5 text-indigo-600" />
              5S Pillar Evaluation Rubrics (0 - 100)
            </h3>

            {/* 1S Sort */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-indigo-900 text-xs">1S — Sort (Seiri)</span>
                  <p className="text-[11px] text-slate-500">Unneeded tools removed, Red-Tag area utilized, aisles 100% free of debris.</p>
                </div>
                <span className="font-mono font-black text-sm text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                  {sortScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sortScore}
                onChange={e => setSortScore(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* 2S Set in Order */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-900 text-xs">2S — Set in Order (Seiton)</span>
                  <p className="text-[11px] text-slate-500">Shadow boards installed, clear floor demarcations, everything has designated home.</p>
                </div>
                <span className="font-mono font-black text-sm text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                  {setInOrderScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={setInOrderScore}
                onChange={e => setSetInOrderScore(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* 3S Shine */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-900 text-xs">3S — Shine (Seiso)</span>
                  <p className="text-[11px] text-slate-500">Workstation degreased, zero coolant/oil leaks, cleaning checklist signed off.</p>
                </div>
                <span className="font-mono font-black text-sm text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                  {shineScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={shineScore}
                onChange={e => setShineScore(parseInt(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* 4S Standardize */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-cyan-900 text-xs">4S — Standardize (Seiketsu)</span>
                  <p className="text-[11px] text-slate-500">Color-coding uniform across cells, visual SOPs posted, labeling standardized.</p>
                </div>
                <span className="font-mono font-black text-sm text-cyan-700 bg-white px-2.5 py-1 rounded-lg border border-cyan-200">
                  {standardizeScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={standardizeScore}
                onChange={e => setStandardizeScore(parseInt(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>

            {/* 5S Sustain */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-900 text-xs">5S — Sustain (Shitsuke)</span>
                  <p className="text-[11px] text-slate-500">Self-audits completed on shift, operators actively participate in Kaizen improvement.</p>
                </div>
                <span className="font-mono font-black text-sm text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  {sustainScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sustainScore}
                onChange={e => setSustainScore(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Audit Notes */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Auditor Field Observations & Directives
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record specific observations, areas exceeding baseline, or immediate corrective action requirements..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting Audit..." : "Certify & Record 5S Audit Run"}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Zone Benchmarking Card & Quick History */}
        <div className="space-y-5">
          {/* Zone Scorecard Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Zone Scorecard Benchmark</span>
              <span className="text-xs font-mono font-bold text-indigo-600">{currentZone?.code}</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-800">{currentZone?.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{currentZone?.description}</div>
              <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                <span>Target Score: <strong className="text-slate-800">{currentZone?.target_score}%</strong></span>
                <span>Pre-Audit: <strong className="text-indigo-600">{currentZone?.current_score}%</strong></span>
              </div>
            </div>

            {/* Radar / Pillar Bar Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Current Audit Radar
              </div>
              {[
                { name: '1S Sort', val: sortScore, color: 'bg-indigo-500' },
                { name: '2S Set in Order', val: setInOrderScore, color: 'bg-blue-500' },
                { name: '3S Shine', val: shineScore, color: 'bg-amber-500' },
                { name: '4S Standardize', val: standardizeScore, color: 'bg-cyan-500' },
                { name: '5S Sustain', val: sustainScore, color: 'bg-emerald-500' }
              ].map(p => (
                <div key={p.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">{p.name}</span>
                    <span className="font-mono font-bold text-slate-800">{p.val}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} transition-all duration-300`} style={{ width: `${p.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Audit Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <History className="w-4 h-4 mr-1.5 text-slate-500" />
              Recent Audit Log ({audits.length})
            </h3>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
              {audits.map(a => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-800 truncate max-w-[140px]">{a.zone_name || 'Plant Zone'}</span>
                    <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                      {a.score_percentage}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{a.auditor_name || 'Auditor'}</span>
                    <span>{new Date(a.conducted_at).toLocaleDateString()}</span>
                  </div>
                  {a.notes && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic pt-1 border-t border-slate-100">
                      "{a.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
