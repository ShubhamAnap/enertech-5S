import {
  Plant,
  Zone,
  ZoneCreatePayload,
  ZoneUpdatePayload,
  Activity,
  RedTag,
  AuditRun,
  DashboardStats,
  EvidenceMedia,
  ActivityComment,
  ZonalLeader,
  ZonalLeaderCreatePayload,
  ZonalLeaderUpdatePayload,
  ReportSubmissionPayload,
  ReportReviewPayload
} from '../types';
import {
  INITIAL_PLANTS,
  INITIAL_DASHBOARD_STATS
} from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Clean in-memory state (populated from live API)
let localActivities: Activity[] = [];
let localRedTags: RedTag[] = [];
let localAudits: AuditRun[] = [];
let isLiveApiConnected = false;

export async function checkBackendConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`http://localhost:8000/health`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    isLiveApiConnected = res.ok;
    return res.ok;
  } catch {
    isLiveApiConnected = false;
    return false;
  }
}

export function getIsLiveApi(): boolean {
  return isLiveApiConnected;
}

// Plants & Dashboard
export async function fetchPlants(): Promise<Plant[]> {
  try {
    const res = await fetch(`${BASE_URL}/plants`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      isLiveApiConnected = true;
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend unavailable, using localized plant registry", err);
  }
  return INITIAL_PLANTS;
}

// Zones Management (Add, Edit, Delete Zones)
export async function fetchZones(deptId?: string): Promise<Zone[]> {
  try {
    const url = new URL(`${BASE_URL}/plants/zones`);
    if (deptId) url.searchParams.append('dept_id', deptId);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      isLiveApiConnected = true;
      return await res.json();
    }
  } catch (err) {
    console.warn("Using localized zones", err);
  }
  return [];
}

export async function createZone(payload: ZoneCreatePayload): Promise<Zone> {
  const res = await fetch(`${BASE_URL}/plants/zones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(3000)
  });
  if (res.ok) {
    isLiveApiConnected = true;
    return await res.json();
  }
  throw new Error("Failed to create zone on server");
}

export async function updateZone(zoneId: string, payload: ZoneUpdatePayload): Promise<Zone> {
  const res = await fetch(`${BASE_URL}/plants/zones/${zoneId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(3000)
  });
  if (res.ok) {
    isLiveApiConnected = true;
    return await res.json();
  }
  throw new Error("Failed to update zone on server");
}

export async function deleteZone(zoneId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/plants/zones/${zoneId}`, {
    method: 'DELETE',
    signal: AbortSignal.timeout(3000)
  });
  if (!res.ok) {
    throw new Error("Failed to delete zone on server");
  }
  isLiveApiConnected = true;
}

export async function fetchPlantDashboard(plantId: string): Promise<DashboardStats> {
  try {
    const res = await fetch(`${BASE_URL}/plants/${plantId}/dashboard`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      isLiveApiConnected = true;
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend unavailable, using cached dashboard metrics", err);
  }

  // Generate dynamic dashboard metrics from local state
  const acts = localActivities.filter(a => a.plant_id === plantId);
  const openCount = acts.filter(a => ['draft', 'assigned'].includes(a.status)).length;
  const inProgCount = acts.filter(a => a.status === 'in_progress').length;
  const subCount = acts.filter(a => a.status === 'submitted_for_review').length;
  const appCount = acts.filter(a => ['approved', 'completed'].includes(a.status)).length;
  const activeRedTags = localRedTags.filter(r => r.plant_id === plantId && !r.is_closed);

  return {
    ...INITIAL_DASHBOARD_STATS,
    plant_id: plantId,
    total_activities: acts.length,
    open_activities: openCount,
    in_progress_activities: inProgCount,
    submitted_activities: subCount,
    approved_activities: appCount,
    red_tag_count: activeRedTags.length
  };
}

// 5S Activities
export async function fetchActivities(filters?: {
  plant_id?: string;
  zone_id?: string;
  status?: string;
  category?: string;
  priority?: string;
}): Promise<Activity[]> {
  try {
    const query = new URLSearchParams();
    if (filters?.plant_id) query.append('plant_id', filters.plant_id);
    if (filters?.zone_id) query.append('zone_id', filters.zone_id);
    if (filters?.status) query.append('status', filters.status);
    if (filters?.category) query.append('category', filters.category);
    if (filters?.priority) query.append('priority', filters.priority);

    const res = await fetch(`${BASE_URL}/activities?${query.toString()}`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      isLiveApiConnected = true;
      const data = await res.json();
      localActivities = data;
      return data;
    }
  } catch (err) {
    console.warn("Using localized activities repository", err);
  }

  let result = [...localActivities];
  if (filters?.plant_id) result = result.filter(a => a.plant_id === filters.plant_id);
  if (filters?.zone_id) result = result.filter(a => a.zone_id === filters.zone_id);
  if (filters?.status) result = result.filter(a => a.status === filters.status);
  if (filters?.category) result = result.filter(a => a.category === filters.category);
  if (filters?.priority) result = result.filter(a => a.priority === filters.priority);

  return result;
}

export async function createActivity(payload: Partial<Activity> & { initial_before_photo_url?: string }): Promise<Activity> {
  try {
    const res = await fetch(`${BASE_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const created = await res.json();
      localActivities.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Backend unavailable, registering activity locally", err);
  }

  const newId = `act-${Date.now()}`;
  const seq = Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  const newEvidence: EvidenceMedia[] = [];
  if (payload.initial_before_photo_url) {
    newEvidence.push({
      id: `ev-${Date.now()}`,
      activity_id: newId,
      media_type: 'before_photo',
      file_name: 'initial_before_evidence.jpg',
      file_url: payload.initial_before_photo_url,
      created_at: now
    });
  }

  const created: Activity = {
    id: newId,
    activity_number: `5S-2026-${seq}`,
    plant_id: payload.plant_id || 'plant-austin-04',
    zone_id: payload.zone_id || 'zone-cnc-b',
    category: payload.category || 'sort_seiri',
    title: payload.title || 'Untitled 5S Opportunity',
    problem_description: payload.problem_description || '',
    corrective_action: payload.corrective_action || null,
    outcome_description: payload.outcome_description || null,
    priority: payload.priority || 'medium',
    status: payload.assigned_to ? 'assigned' : 'draft',
    assigned_to: payload.assigned_to || null,
    assignee_name: payload.assignee_name || (payload.assigned_to ? 'Alex Chen' : null),
    supervisor_id: payload.supervisor_id || 'user-sup',
    supervisor_name: 'Dave Vance',
    due_date: payload.due_date || new Date(Date.now() + 86400000 * 3).toISOString(),
    submitted_at: null,
    reviewed_at: null,
    rejection_reason: null,
    benefits_safety: payload.benefits_safety || false,
    benefits_space_sqft: payload.benefits_space_sqft || 0,
    benefits_time_seconds: payload.benefits_time_seconds || 0,
    benefits_cost_savings: payload.benefits_cost_savings || 0,
    benefits_summary: payload.benefits_summary || null,
    created_at: now,
    evidence: newEvidence,
    history: [
      {
        id: `h-${Date.now()}`,
        activity_id: newId,
        actor_name: 'Management Web Portal',
        from_status: null,
        to_status: payload.assigned_to ? 'assigned' : 'draft',
        action_note: '5S Activity created and registered in system.',
        created_at: now
      }
    ],
    comments: []
  };

  localActivities.unshift(created);
  return created;
}

export async function submitActivityForReview(
  activityId: string,
  payload: {
    corrective_action: string;
    outcome_description?: string;
    after_photo_url?: string;
    benefits_space_sqft?: number;
    benefits_time_seconds?: number;
    benefits_cost_savings?: number;
    benefits_safety?: boolean;
    benefits_summary?: string;
  }
): Promise<Activity> {
  try {
    const res = await fetch(`${BASE_URL}/activities/${activityId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const updated = await res.json();
      const idx = localActivities.findIndex(a => a.id === activityId);
      if (idx !== -1) localActivities[idx] = updated;
      return updated;
    }
  } catch (err) {
    console.warn("Backend unavailable, submitting for review locally", err);
  }

  const idx = localActivities.findIndex(a => a.id === activityId);
  if (idx === -1) throw new Error("Activity not found");

  const act = { ...localActivities[idx] };
  const now = new Date().toISOString();

  act.status = 'submitted_for_review';
  act.corrective_action = payload.corrective_action;
  if (payload.outcome_description) act.outcome_description = payload.outcome_description;
  if (payload.benefits_space_sqft !== undefined) act.benefits_space_sqft = payload.benefits_space_sqft;
  if (payload.benefits_time_seconds !== undefined) act.benefits_time_seconds = payload.benefits_time_seconds;
  if (payload.benefits_cost_savings !== undefined) act.benefits_cost_savings = payload.benefits_cost_savings;
  if (payload.benefits_safety !== undefined) act.benefits_safety = payload.benefits_safety;
  if (payload.benefits_summary) act.benefits_summary = payload.benefits_summary;
  act.submitted_at = now;

  if (payload.after_photo_url) {
    act.evidence = [
      ...act.evidence,
      {
        id: `ev-${Date.now()}`,
        activity_id: activityId,
        media_type: 'after_photo',
        file_name: 'after_evidence_completed.jpg',
        file_url: payload.after_photo_url,
        created_at: now
      }
    ];
  }

  act.history.unshift({
    id: `h-${Date.now()}`,
    activity_id: activityId,
    actor_name: act.assignee_name || 'Operator',
    from_status: 'in_progress',
    to_status: 'submitted_for_review',
    action_note: 'Submitted corrective action & after-evidence for supervisory sign-off.',
    created_at: now
  });

  localActivities[idx] = act;
  return act;
}

export async function reviewActivityDecision(
  activityId: string,
  payload: {
    decision: 'approved' | 'rejected';
    rejection_reason?: string;
    supervisor_note?: string;
  }
): Promise<Activity> {
  try {
    const res = await fetch(`${BASE_URL}/activities/${activityId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const updated = await res.json();
      const idx = localActivities.findIndex(a => a.id === activityId);
      if (idx !== -1) localActivities[idx] = updated;
      return updated;
    }
  } catch (err) {
    console.warn("Backend unavailable, applying supervisory decision locally", err);
  }

  const idx = localActivities.findIndex(a => a.id === activityId);
  if (idx === -1) throw new Error("Activity not found");

  const act = { ...localActivities[idx] };
  const now = new Date().toISOString();

  act.reviewed_at = now;
  if (payload.decision === 'approved') {
    act.status = 'approved';
    act.rejection_reason = null;
    act.history.unshift({
      id: `h-${Date.now()}`,
      activity_id: activityId,
      actor_name: act.supervisor_name || 'Dave Vance (Supervisor)',
      from_status: 'submitted_for_review',
      to_status: 'approved',
      action_note: payload.supervisor_note || 'Approved 5S verification. Standardized in production.',
      created_at: now
    });
  } else {
    act.status = 'rejected';
    act.rejection_reason = payload.rejection_reason || 'Rework required on visual labeling standards.';
    act.history.unshift({
      id: `h-${Date.now()}`,
      activity_id: activityId,
      actor_name: act.supervisor_name || 'Dave Vance (Supervisor)',
      from_status: 'submitted_for_review',
      to_status: 'rejected',
      action_note: `Rejected: ${payload.rejection_reason || ''}`,
      created_at: now
    });
  }

  localActivities[idx] = act;
  return act;
}

export async function addActivityComment(
  activityId: string,
  comment: string,
  authorName = 'Supervisor / Plant Auditor'
): Promise<ActivityComment> {
  try {
    const res = await fetch(`${BASE_URL}/activities/${activityId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment, author_name: authorName }),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Adding comment locally", err);
  }

  const newComment: ActivityComment = {
    id: `c-${Date.now()}`,
    activity_id: activityId,
    author_name: authorName,
    comment,
    created_at: new Date().toISOString()
  };

  const act = localActivities.find(a => a.id === activityId);
  if (act) {
    act.comments = [...act.comments, newComment];
  }
  return newComment;
}

// Red-Tag Management
export async function fetchRedTags(filters?: { plant_id?: string; zone_id?: string; is_closed?: boolean }): Promise<RedTag[]> {
  try {
    const query = new URLSearchParams();
    if (filters?.plant_id) query.append('plant_id', filters.plant_id);
    if (filters?.zone_id) query.append('zone_id', filters.zone_id);
    if (filters?.is_closed !== undefined) query.append('is_closed', String(filters.is_closed));

    const res = await fetch(`${BASE_URL}/redtags?${query.toString()}`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      isLiveApiConnected = true;
      const data = await res.json();
      localRedTags = data;
      return data;
    }
  } catch (err) {
    console.warn("Using localized red-tag registry", err);
  }

  let result = [...localRedTags];
  if (filters?.plant_id) result = result.filter(r => r.plant_id === filters.plant_id);
  if (filters?.zone_id) result = result.filter(r => r.zone_id === filters.zone_id);
  if (filters?.is_closed !== undefined) result = result.filter(r => r.is_closed === filters.is_closed);
  return result;
}

export async function createRedTag(payload: {
  plant_id: string;
  zone_id: string;
  item_name: string;
  item_category: string;
  quantity: number;
  reason: string;
  photo_url?: string;
  logged_by_name?: string;
}): Promise<RedTag> {
  try {
    const res = await fetch(`${BASE_URL}/redtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const created = await res.json();
      localRedTags.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Registering red tag locally", err);
  }

  const seq = Math.floor(100 + Math.random() * 900);
  const created: RedTag = {
    id: `rt-${Date.now()}`,
    tag_number: `RT-2026-${seq}`,
    plant_id: payload.plant_id,
    zone_id: payload.zone_id,
    logged_by_name: payload.logged_by_name || 'Floor Operator',
    item_name: payload.item_name,
    item_category: payload.item_category,
    quantity: payload.quantity,
    reason: payload.reason,
    photo_url: payload.photo_url,
    disposition: 'pending',
    is_closed: false,
    created_at: new Date().toISOString(),
    aging_days: 0
  };

  localRedTags.unshift(created);
  return created;
}

export async function updateRedTagDisposition(
  tagId: string,
  payload: {
    disposition: 'relocate' | 'scrap' | 'return_to_vendor' | 'hold_for_evaluation';
    disposition_notes: string;
    is_closed: boolean;
  }
): Promise<RedTag> {
  try {
    const res = await fetch(`${BASE_URL}/redtags/${tagId}/disposition`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      const updated = await res.json();
      const idx = localRedTags.findIndex(r => r.id === tagId);
      if (idx !== -1) localRedTags[idx] = updated;
      return updated;
    }
  } catch (err) {
    console.warn("Updating red tag disposition locally", err);
  }

  const idx = localRedTags.findIndex(r => r.id === tagId);
  if (idx === -1) throw new Error("Red tag not found");

  const tag = { ...localRedTags[idx] };
  tag.disposition = payload.disposition;
  tag.disposition_notes = payload.disposition_notes;
  tag.is_closed = payload.is_closed;
  if (payload.is_closed) tag.closed_at = new Date().toISOString();

  localRedTags[idx] = tag;
  return tag;
}

// 5S Audits & Scoring
export async function fetchAudits(plantId?: string, zoneId?: string): Promise<AuditRun[]> {
  try {
    const query = new URLSearchParams();
    if (plantId) query.append('plant_id', plantId);
    if (zoneId) query.append('zone_id', zoneId);

    const res = await fetch(`${BASE_URL}/audits?${query.toString()}`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      isLiveApiConnected = true;
      const data = await res.json();
      localAudits = data;
      return data;
    }
  } catch (err) {
    console.warn("Using localized audits repository", err);
  }

  let result = [...localAudits];
  if (plantId) result = result.filter(a => a.plant_id === plantId);
  if (zoneId) result = result.filter(a => a.zone_id === zoneId);
  return result;
}

export async function submitAudit(payload: {
  plant_id: string;
  zone_id: string;
  zone_name: string;
  auditor_name: string;
  sort_score: number;
  set_in_order_score: number;
  shine_score: number;
  standardize_score: number;
  sustain_score: number;
  notes?: string;
}): Promise<AuditRun> {
  try {
    const res = await fetch(`${BASE_URL}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const created = await res.json();
      localAudits.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Submitting audit locally", err);
  }

  const scores = [
    payload.sort_score,
    payload.set_in_order_score,
    payload.shine_score,
    payload.standardize_score,
    payload.sustain_score
  ];
  const percentage = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

  const newAudit: AuditRun = {
    id: `audit-${Date.now()}`,
    plant_id: payload.plant_id,
    zone_id: payload.zone_id,
    zone_name: payload.zone_name,
    auditor_name: payload.auditor_name,
    score_percentage: percentage,
    sort_score: payload.sort_score,
    set_in_order_score: payload.set_in_order_score,
    shine_score: payload.shine_score,
    standardize_score: payload.standardize_score,
    sustain_score: payload.sustain_score,
    total_score: scores.reduce((a, b) => a + b, 0),
    max_score: 500,
    notes: payload.notes,
    status: 'completed',
    conducted_at: new Date().toISOString()
  };

  localAudits.unshift(newAudit);
  return newAudit;
}

// PDF Export Link
export function getActivityPdfDownloadUrl(activityId: string): string {
  return `${BASE_URL}/reports/activity/${activityId}/pdf`;
}

// Local mock state for zonal leaders
// Local state for zonal leaders (starts empty for clean Enertech production)
let localZonalLeaders: ZonalLeader[] = [];

// Management: Zonal Leaders Management
export async function fetchZonalLeaders(plantId?: string): Promise<ZonalLeader[]> {
  try {
    const url = new URL(`${BASE_URL}/management/zonal-leaders`);
    if (plantId) url.searchParams.append('plant_id', plantId);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      localZonalLeaders = data;
      return data;
    }
  } catch (err) {
    console.warn("Using localized zonal leaders repository", err);
  }
  return localZonalLeaders;
}

export async function createZonalLeader(payload: ZonalLeaderCreatePayload): Promise<ZonalLeader> {
  try {
    const res = await fetch(`${BASE_URL}/management/zonal-leaders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const created = await res.json();
      localZonalLeaders.unshift(created);
      return created;
    }
  } catch (err) {
    console.warn("Saving zonal leader locally", err);
  }

  const newLeader: ZonalLeader = {
    id: `zl-${Date.now()}`,
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone_number: payload.phone_number || '',
    role: payload.role || 'zonal_leader',
    plant_id: payload.plant_id,
    assigned_zone_id: payload.assigned_zone_id || null,
    assigned_zone_name: payload.assigned_zone_id ? 'Zone ' + payload.assigned_zone_id.slice(0, 6) : null,
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${payload.first_name}+${payload.last_name}`,
    is_active: true,
    active_tasks_count: 0,
    completed_tasks_count: 0,
    created_at: new Date().toISOString()
  };
  localZonalLeaders.unshift(newLeader);
  return newLeader;
}

export async function updateZonalLeader(id: string, payload: ZonalLeaderUpdatePayload): Promise<ZonalLeader> {
  try {
    const res = await fetch(`${BASE_URL}/management/zonal-leaders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const updated = await res.json();
      const idx = localZonalLeaders.findIndex(z => z.id === id);
      if (idx !== -1) localZonalLeaders[idx] = updated;
      return updated;
    }
  } catch (err) {
    console.warn("Updating zonal leader locally", err);
  }

  const idx = localZonalLeaders.findIndex(z => z.id === id);
  if (idx !== -1) {
    localZonalLeaders[idx] = {
      ...localZonalLeaders[idx],
      ...payload,
      assigned_zone_name: payload.assigned_zone_id ? 'Zone ' + payload.assigned_zone_id.slice(0, 6) : (payload.assigned_zone_id === null ? null : localZonalLeaders[idx].assigned_zone_name)
    };
    return localZonalLeaders[idx];
  }
  throw new Error("Zonal leader not found");
}

export async function deleteZonalLeader(id: string): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/management/zonal-leaders/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      localZonalLeaders = localZonalLeaders.filter(z => z.id !== id);
      return;
    }
  } catch (err) {
    console.warn("Deleting zonal leader locally", err);
  }
  localZonalLeaders = localZonalLeaders.filter(z => z.id !== id);
}

// Zonal Leader: Submit Completion Report
export async function submitActivityReport(payload: ReportSubmissionPayload): Promise<Activity> {
  try {
    const res = await fetch(`${BASE_URL}/activities/${payload.activity_id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const updated = await res.json();
      const idx = localActivities.findIndex(a => a.id === payload.activity_id);
      if (idx !== -1) localActivities[idx] = updated;
      return updated;
    }
  } catch (err) {
    console.warn("Submitting activity report locally", err);
  }

  const act = localActivities.find(a => a.id === payload.activity_id);
  if (act) {
    act.status = 'submitted_for_review';
    act.corrective_action = payload.corrective_action;
    if (payload.outcome_description) act.outcome_description = payload.outcome_description;
    if (payload.title) act.title = payload.title;
    act.benefits_safety = payload.benefits_safety ?? act.benefits_safety;
    act.benefits_space_sqft = payload.benefits_space_sqft ?? act.benefits_space_sqft;
    act.benefits_time_seconds = payload.benefits_time_seconds ?? act.benefits_time_seconds;
    act.benefits_cost_savings = payload.benefits_cost_savings ?? act.benefits_cost_savings;
    act.benefits_summary = payload.benefits_summary ?? act.benefits_summary;
    act.submitted_at = new Date().toISOString();

    if (payload.after_photo_url) {
      act.evidence = act.evidence.filter(e => e.media_type !== 'after_photo');
      act.evidence.push({
        id: `ev-${Date.now()}`,
        activity_id: act.id,
        media_type: 'after_photo',
        file_name: 'completion_evidence.jpg',
        file_url: payload.after_photo_url,
        created_at: new Date().toISOString()
      });
    }

    act.history.unshift({
      id: `h-${Date.now()}`,
      activity_id: act.id,
      from_status: act.status,
      to_status: 'submitted_for_review',
      action_note: 'Official completion report submitted with After Photo for Management Review',
      created_at: new Date().toISOString()
    });

    return act;
  }
  throw new Error("Activity not found");
}

// Management: Approve / Request Changes
export async function reviewActivityReport(activityId: string, payload: ReportReviewPayload): Promise<Activity> {
  try {
    const res = await fetch(`${BASE_URL}/activities/${activityId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const updated = await res.json();
      const idx = localActivities.findIndex(a => a.id === activityId);
      if (idx !== -1) localActivities[idx] = updated;
      return updated;
    }
  } catch (err) {
    console.warn("Reviewing activity report locally", err);
  }

  const act = localActivities.find(a => a.id === activityId);
  if (act) {
    const newStatus = payload.decision === 'approve' ? 'approved' : 'rejected';
    act.status = newStatus;
    act.reviewed_at = new Date().toISOString();
    if (payload.rejection_reason) act.rejection_reason = payload.rejection_reason;

    act.history.unshift({
      id: `h-${Date.now()}`,
      activity_id: act.id,
      from_status: 'submitted_for_review',
      to_status: newStatus,
      action_note: payload.decision === 'approve' 
        ? 'Report approved by Management and standardized across zone' 
        : `Changes requested: ${payload.rejection_reason}`,
      created_at: new Date().toISOString()
    });

    return act;
  }
  throw new Error("Activity not found");
}
