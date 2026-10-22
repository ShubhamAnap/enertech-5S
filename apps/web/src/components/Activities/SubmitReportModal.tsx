import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Maximize2, 
  DollarSign, 
  ShieldAlert,
  Image as ImageIcon
} from 'lucide-react';
import { Activity, ReportSubmissionPayload } from '../../types';

interface SubmitReportModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ReportSubmissionPayload) => Promise<void>;
}

export const SubmitReportModal: React.FC<SubmitReportModalProps> = ({
  activity,
  isOpen,
  onClose,
  onSubmit
}) => {
  const beforePhoto = activity.evidence?.find(e => e.media_type === 'before_photo')?.file_url;
  const existingAfterPhoto = activity.evidence?.find(e => e.media_type === 'after_photo')?.file_url || '';

  const [afterPhotoUrl, setAfterPhotoUrl] = useState(existingAfterPhoto);
  const [correctiveAction, setCorrectiveAction] = useState(activity.corrective_action || '');
  const [outcomeDescription, setOutcomeDescription] = useState(activity.outcome_description || '');
  const [safetyBenefit, setSafetyBenefit] = useState(Boolean(activity.benefits_safety));
  const [spaceSaved, setSpaceSaved] = useState(activity.benefits_space_sqft || 0);
  const [timeSaved, setTimeSaved] = useState(activity.benefits_time_seconds || 0);
  const [costSavings, setCostSavings] = useState(activity.benefits_cost_savings || 0);
  const [benefitsSummary, setBenefitsSummary] = useState(activity.benefits_summary || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctiveAction.trim() || !afterPhotoUrl.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        activity_id: activity.id,
        corrective_action: correctiveAction,
        outcome_description: outcomeDescription,
        after_photo_url: afterPhotoUrl,
        benefits_safety: safetyBenefit,
        benefits_space_sqft: Number(spaceSaved),
        benefits_time_seconds: Number(timeSaved),
        benefits_cost_savings: Number(costSavings),
        benefits_summary: benefitsSummary
      });
      onClose();
    } catch (err) {
      console.error("Failed to submit completion report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {activity.activity_number || 'WO-5S'}
            </span>
            <h2 className="text-sm font-semibold text-slate-900">Submit 5S Completion Report</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Before vs After Side-by-Side Comparison */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Visual Verification (Before vs. After)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <div className="relative h-36 bg-slate-100 flex items-center justify-center">
                  {beforePhoto ? (
                    <>
                      <img 
                        src={beforePhoto} 
                        alt="Before Condition" 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded tracking-wider uppercase shadow-xs">
                        Before
                      </span>
                    </>
                  ) : (
                    <div className="text-center p-4 text-xs text-slate-400">
                      No initial before photo
                    </div>
                  )}
                </div>
                <div className="p-2.5 text-[11px] text-slate-600 bg-white border-t border-slate-100 line-clamp-2">
                  {activity.problem_description || "Original condition"}
                </div>
              </div>

              {/* After Photo */}
              <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50/20">
                <div className="relative h-36 bg-slate-100 flex items-center justify-center">
                  {afterPhotoUrl ? (
                    <>
                      <img 
                        src={afterPhotoUrl} 
                        alt="After Condition" 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded tracking-wider uppercase shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> After
                      </span>
                    </>
                  ) : (
                    <div className="text-center p-4 text-xs text-slate-400">
                      Paste After Photo URL below
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-white border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <input
                      type="url"
                      required
                      value={afterPhotoUrl}
                      onChange={(e) => setAfterPhotoUrl(e.target.value)}
                      placeholder="Paste After-photo Image URL..."
                      className="w-full text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Corrective Actions Taken */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Corrective Actions Taken *
            </label>
            <textarea
              required
              rows={3}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Describe exact actions taken (e.g. sorted tools, degreased equipment, installed shadow foam, labeled storage)..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Standardized Outcome Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Standardized State & Sustainment Routine
            </label>
            <input
              type="text"
              value={outcomeDescription}
              onChange={(e) => setOutcomeDescription(e.target.value)}
              placeholder="e.g. Daily shift 5S checklist posted on workstation"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Measurable Operational ROI & Benefits */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Operational Benefits & ROI
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={safetyBenefit}
                  onChange={(e) => setSafetyBenefit(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                Safety Hazard Eliminated
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Floor Space (sq.ft)</label>
                <div className="flex items-center px-2.5 py-1.5 bg-white border border-slate-200 rounded-md">
                  <Maximize2 className="w-3 h-3 text-slate-400 mr-1.5" />
                  <input
                    type="number"
                    step="0.5"
                    value={spaceSaved}
                    onChange={(e) => setSpaceSaved(Number(e.target.value))}
                    className="w-full text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Time Saved (sec/cycle)</label>
                <div className="flex items-center px-2.5 py-1.5 bg-white border border-slate-200 rounded-md">
                  <Clock className="w-3 h-3 text-slate-400 mr-1.5" />
                  <input
                    type="number"
                    value={timeSaved}
                    onChange={(e) => setTimeSaved(Number(e.target.value))}
                    className="w-full text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Cost Savings ($/yr)</label>
                <div className="flex items-center px-2.5 py-1.5 bg-white border border-slate-200 rounded-md">
                  <DollarSign className="w-3 h-3 text-slate-400 mr-1.5" />
                  <input
                    type="number"
                    value={costSavings}
                    onChange={(e) => setCostSavings(Number(e.target.value))}
                    className="w-full text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !correctiveAction.trim() || !afterPhotoUrl.trim()}
              className="px-5 py-2 text-xs font-bold bg-[#0066FF] hover:bg-blue-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit to Management'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
