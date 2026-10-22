import React from 'react';
import { Layers, Sliders, Sparkles, CheckCircle2, Check } from 'lucide-react';

interface RadarScoreProps {
  categoryCounts?: Record<string, number>;
}

export const RadarScore: React.FC<RadarScoreProps> = () => {
  const pillars = [
    {
      id: 'sort_seiri',
      name: '1S Sort',
      japanese: 'Seiri',
      desc: 'Purge clutter & unneeded assets',
      score: 93.5,
      target: 95.0,
      color: 'bg-indigo-600',
      lightBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      icon: <Layers className="w-4 h-4 text-indigo-600" />
    },
    {
      id: 'set_in_order_seiton',
      name: '2S Set in Order',
      japanese: 'Seiton',
      desc: 'Shadow boards & visual labels',
      score: 89.2,
      target: 90.0,
      color: 'bg-blue-600',
      lightBg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Sliders className="w-4 h-4 text-blue-600" />
    },
    {
      id: 'shine_seiso',
      name: '3S Shine',
      japanese: 'Seiso',
      desc: 'Degrease & clean inspection',
      score: 96.8,
      target: 95.0,
      color: 'bg-amber-600',
      lightBg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <Sparkles className="w-4 h-4 text-amber-600" />
    },
    {
      id: 'standardize_seiketsu',
      name: '4S Standardize',
      japanese: 'Seiketsu',
      desc: 'Uniform SOPs & visual guides',
      score: 94.0,
      target: 90.0,
      color: 'bg-cyan-600',
      lightBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      icon: <CheckCircle2 className="w-4 h-4 text-cyan-600" />
    },
    {
      id: 'sustain_shitsuke',
      name: '5S Sustain',
      japanese: 'Shitsuke',
      desc: 'Shift discipline & daily culture',
      score: 88.0,
      target: 90.0,
      color: 'bg-emerald-600',
      lightBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <Check className="w-4 h-4 text-emerald-600" />
    }
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">5S Pillar Compliance Radar</h3>
          <p className="text-xs text-slate-500">Benchmark target vs certified score per pillar</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Plant-Wide Average: 92.3%
        </span>
      </div>

      <div className="space-y-3.5">
        {pillars.map(p => {
          const diff = (p.score - p.target).toFixed(1);
          const isAboveTarget = Number(diff) >= 0;

          return (
            <div key={p.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-md bg-slate-100">{p.icon}</div>
                  <div>
                    <span className="font-bold text-slate-800">{p.name}</span>
                    <span className="text-slate-400 font-mono text-[10px] ml-1">({p.japanese})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400 font-mono">Target: {p.target}%</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{p.score}%</span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isAboveTarget ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isAboveTarget ? `+${diff}%` : `${diff}%`}
                  </span>
                </div>
              </div>

              {/* Progress Bar with target marker */}
              <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${p.color} rounded-full transition-all duration-500`}
                  style={{ width: `${p.score}%` }}
                />
                {/* Target line */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-slate-900 shadow-sm z-10"
                  style={{ left: `${p.target}%` }}
                  title={`Target: ${p.target}%`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-slate-900 mr-1.5"></span>
          Black line denotes Target SLA
        </span>
        <span className="font-semibold text-indigo-600">3S Shine leads at 96.8%</span>
      </div>
    </div>
  );
};
