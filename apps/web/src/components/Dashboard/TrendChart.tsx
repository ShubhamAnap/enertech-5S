import React from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

interface TrendChartProps {
  trendData: Array<{ month: string; completion_rate: number; score: number }>;
}

export const TrendChart: React.FC<TrendChartProps> = ({ trendData }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Monthly 5S Kaizen Trend</h3>
          <p className="text-xs text-slate-500">6-Month Audit Score & Task Completion Trajectory</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center text-indigo-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-1.5"></span>
            Audit Score %
          </span>
          <span className="flex items-center text-emerald-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Task Completion %
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="pt-2">
        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 border-b border-slate-200 pb-2">
          {trendData.map((d, i) => {
            const auditHeight = Math.max(10, ((d.score - 70) / 30) * 100);
            const completionHeight = Math.max(10, ((d.completion_rate - 70) / 30) * 100);

            return (
              <div key={d.month} className="flex flex-col items-center h-full justify-end group">
                <div className="flex items-end space-x-1.5 w-full justify-center h-full">
                  {/* Audit Score Bar */}
                  <div
                    className="w-3 sm:w-5 bg-indigo-600 rounded-t-md hover:bg-indigo-700 transition-all duration-300 relative group"
                    style={{ height: `${auditHeight}%` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none whitespace-nowrap">
                      Audit: {d.score}%
                    </div>
                  </div>

                  {/* Completion Rate Bar */}
                  <div
                    className="w-3 sm:w-5 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all duration-300 relative group"
                    style={{ height: `${completionHeight}%` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none whitespace-nowrap">
                      Done: {d.completion_rate}%
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-slate-700 mt-2">
                  {d.month}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
          <span>Baseline (70%)</span>
          <span className="text-emerald-600 font-semibold flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Sustained Positive Kaizen Momentum
          </span>
          <span>100% Target</span>
        </div>
      </div>
    </div>
  );
};
