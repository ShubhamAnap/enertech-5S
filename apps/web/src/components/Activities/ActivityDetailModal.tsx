import React, { useState } from 'react';
import { Activity } from '../../types';
import { CategoryBadge, StatusBadge, PriorityBadge } from '../Common/StatusBadge';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import {
  X,
  Download,
  Calendar,
  User,
  ShieldCheck,
  Ruler,
  Clock,
  DollarSign,
  MessageSquare,
  History,
  FileText,
  CheckCircle,
  AlertTriangle,
  Send,
  Sparkles
} from 'lucide-react';
import {
  submitActivityForReview,
  reviewActivityDecision,
  addActivityComment,
  getActivityPdfDownloadUrl
} from '../../api/client';

interface ActivityDetailModalProps {
  activity: Activity;
  onClose: () => void;
  onUpdate: (updated: Activity) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Review modal states
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState<{
    corrective_action: string;
    outcome_description: string;
    after_photo_url: string;
    benefits_space_sqft: number;
    benefits_time_seconds: number;
    benefits_cost_savings: number;
    benefits_safety: boolean;
    benefits_summary: string;
  }>({
    corrective_action: activity.corrective_action || '',
    outcome_description: activity.outcome_description || '',
    after_photo_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800',
    benefits_space_sqft: activity.benefits_space_sqft || 10,
    benefits_time_seconds: activity.benefits_time_seconds || 30,
    benefits_cost_savings: activity.benefits_cost_savings || 1000,
    benefits_safety: Boolean(activity.benefits_safety),
    benefits_summary: activity.benefits_summary || ''
  });

  const beforePhoto = activity.evidence.find(e => e.media_type === 'before_photo');
  const afterPhoto = activity.evidence.find(e => e.media_type === 'after_photo');

  const handleApprove = async () => {
    try {
      const updated = await reviewActivityDecision(activity.id, {
        decision: 'approved',
        supervisor_note: 'Approved 5S verification. Standardized on workstation floor.'
      });
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      const updated = await reviewActivityDecision(activity.id, {
        decision: 'rejected',
        rejection_reason: rejectionReason
      });
      setShowRejectInput(false);
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitForReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await submitActivityForReview(activity.id, submitForm);
      setShowSubmitModal(false);
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const comment = await addActivityComment(activity.id, newComment);
      const updated = {
        ...activity,
        comments: [...activity.comments, comment]
      };
      onUpdate(updated);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold bg-slate-200/80 px-2 py-0.5 rounded text-slate-800">
              {activity.activity_number}
            </span>
            <CategoryBadge category={activity.category} />
            <PriorityBadge priority={activity.priority} />
            <StatusBadge status={activity.status} />
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={getActivityPdfDownloadUrl(activity.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
              title="Download ReportLab generated formal 5S record PDF"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Download PDF Report
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rejection Alert Banner if Rejected */}
          {activity.status === 'rejected' && activity.rejection_reason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Supervisor Rework Notice</h4>
                <p className="text-xs text-rose-700 mt-1">{activity.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* Title & Core Details Header */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {activity.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Assignee: <strong className="ml-1 text-slate-800">{activity.assignee_name || 'Unassigned'}</strong>
              </span>
              <span className="flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Supervisor: <strong className="ml-1 text-slate-800">{activity.supervisor_name || 'Dave Vance'}</strong>
              </span>
              {activity.due_date && (
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Target Date: <strong className="ml-1 text-slate-800">{new Date(activity.due_date).toLocaleDateString()}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Interactive Before & After Visual Evidence Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <BeforeAfterSlider
              beforeUrl={beforePhoto?.file_url}
              afterUrl={afterPhoto?.file_url}
            />
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Kaizen Record & ROI</span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                activeTab === 'comments'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussion ({activity.comments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Trail ({activity.history.length})</span>
            </button>
          </div>

          {/* Tab 1: Details & Measurable Benefits */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Problem & Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>
                    Observed Problem / Hazard
                  </h4>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {activity.problem_description}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    Corrective Action Implemented
                  </h4>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {activity.corrective_action || "Pending implementation by technician."}
                  </p>
                </div>
              </div>

              {activity.outcome_description && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                    Standardized Kaizen Outcome
                  </h4>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {activity.outcome_description}
                  </p>
                </div>
              )}

              {/* Measurable ROI Metrics Cards */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Verified Operational Impact & ROI
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                    <div className="flex items-center text-emerald-700 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                      Safety
                    </div>
                    <div className="mt-2 text-sm font-black text-emerald-900">
                      {activity.benefits_safety ? "Zero-Hazard Mitigated" : "Baseline"}
                    </div>
                    <span className="text-[10px] text-emerald-700 mt-0.5">Ergonomic verified</span>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex flex-col justify-between">
                    <div className="flex items-center text-sky-700 text-xs font-bold">
                      <Ruler className="w-4 h-4 mr-1 text-sky-600" />
                      Space Recovered
                    </div>
                    <div className="mt-2 text-sm font-black text-sky-900">
                      +{activity.benefits_space_sqft} sq.ft
                    </div>
                    <span className="text-[10px] text-sky-700 mt-0.5">Floor capacity freed</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
                    <div className="flex items-center text-amber-700 text-xs font-bold">
                      <Clock className="w-4 h-4 mr-1 text-amber-600" />
                      Cycle Time
                    </div>
                    <div className="mt-2 text-sm font-black text-amber-900">
                      -{activity.benefits_time_seconds}s
                    </div>
                    <span className="text-[10px] text-amber-700 mt-0.5">Saved per setup/shift</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                    <div className="flex items-center text-emerald-700 text-xs font-bold">
                      <DollarSign className="w-4 h-4 mr-1 text-emerald-600" />
                      Cost Avoidance
                    </div>
                    <div className="mt-2 text-sm font-black text-emerald-900">
                      ${activity.benefits_cost_savings.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-700 mt-0.5">Annualized estimated</span>
                  </div>
                </div>

                {activity.benefits_summary && (
                  <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    "{activity.benefits_summary}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Comments Thread */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activity.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No comments recorded on this 5S activity yet.
                  </p>
                ) : (
                  activity.comments.map(c => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                        <span>{c.author_name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Box */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add supervisor inspection note or shop-floor comment..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Audit Trail History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {activity.history.map((h, i) => (
                <div key={h.id || i} className="flex items-start space-x-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.actor_name || 'System'}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-1.5 text-slate-600">
                      {h.from_status && (
                        <>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px] uppercase font-bold">{h.from_status}</span>
                          <span>&rarr;</span>
                        </>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] uppercase font-bold">{h.to_status}</span>
                    </div>
                    {h.action_note && (
                      <p className="mt-1 text-slate-600 italic">{h.action_note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Current Stage: <strong className="text-slate-800 uppercase">{activity.status.replace('_', ' ')}</strong>
          </div>

          <div className="flex items-center space-x-3">
            {/* Operator: Submit for Review */}
            {['assigned', 'in_progress', 'rejected'].includes(activity.status) && (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit for Supervisor Sign-Off</span>
              </button>
            )}

            {/* Supervisor: Review Decision */}
            {activity.status === 'submitted_for_review' && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs transition-all flex items-center space-x-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  <span>Reject & Request Rework</span>
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Approve & Standardize</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nested Reject Reason Prompt */}
        {showRejectInput && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-5 max-w-md w-full border border-slate-300">
              <h3 className="text-sm font-bold text-slate-900 flex items-center text-rose-600">
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Specify 5S Rejection Reason
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Provide actionable feedback to the operator (e.g. Missing visual labels, calibration tag needed, shadow foam requires color-code).
              </p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Enter mandatory reason for rework..."
                rows={3}
                className="w-full mt-3 p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectionReason.trim()}
                  onClick={handleReject}
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Submit for Review Form Modal */}
        {showSubmitModal && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full border border-slate-300 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center text-indigo-700">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Submit Completed 5S Evidence
                </h3>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitForReview} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Corrective Action Implemented *
                  </label>
                  <textarea
                    required
                    value={submitForm.corrective_action}
                    onChange={e => setSubmitForm({ ...submitForm, corrective_action: e.target.value })}
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe how the problem was solved (e.g., shadow-foam cutouts installed, obsolete tools purged)..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Standardized Outcome Description
                  </label>
                  <input
                    type="text"
                    value={submitForm.outcome_description}
                    onChange={e => setSubmitForm({ ...submitForm, outcome_description: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 100% visible tool placement. Chip tray emptied every shift."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    After-Photo Evidence URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={submitForm.after_photo_url}
                    onChange={e => setSubmitForm({ ...submitForm, after_photo_url: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Default high-resolution industrial cleanroom photo provided for demonstration.
                  </span>
                </div>

                {/* Benefits Inputs */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Space Recovered (sq.ft)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={submitForm.benefits_space_sqft}
                      onChange={e => setSubmitForm({ ...submitForm, benefits_space_sqft: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cycle Time Saved (sec)</label>
                    <input
                      type="number"
                      value={submitForm.benefits_time_seconds}
                      onChange={e => setSubmitForm({ ...submitForm, benefits_time_seconds: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Annual Cost Avoidance ($)</label>
                    <input
                      type="number"
                      value={submitForm.benefits_cost_savings}
                      onChange={e => setSubmitForm({ ...submitForm, benefits_cost_savings: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={submitForm.benefits_safety}
                        onChange={e => setSubmitForm({ ...submitForm, benefits_safety: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Safety Hazard Eliminated</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                  >
                    Submit Kaizen for Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
