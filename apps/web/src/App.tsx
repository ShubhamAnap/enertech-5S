import { useState, useEffect } from 'react';
import type { Plant, Zone, Activity, RedTag, AuditRun, DashboardStats, UserPersona } from './types';
import {
  fetchPlants,
  fetchPlantDashboard,
  fetchActivities,
  fetchRedTags,
  fetchAudits,
  checkBackendConnection
} from './api/client';
import { Sidebar, NavTab } from './components/Sidebar';
import { MaintainXWorkOrders } from './components/Activities/MaintainXWorkOrders';
import { MaintainXAssets } from './components/Assets/MaintainXAssets';
import { MaintainXReporting } from './components/Reports/MaintainXReporting';
import { PlantZoneMatrix } from './components/Zone/PlantZoneMatrix';
import { RedTagRegister } from './components/RedTags/RedTagRegister';
import { ActivityDetailModal } from './components/Activities/ActivityDetailModal';
import { CreateActivityModal } from './components/Activities/CreateActivityModal';
import { RedTagActionModal } from './components/RedTags/RedTagActionModal';
import { CreateRedTagModal } from './components/RedTags/CreateRedTagModal';
import { ZonalLeadersSettings } from './components/Settings/ZonalLeadersSettings';
import { INITIAL_PLANTS, INITIAL_DASHBOARD_STATS, USER_PERSONAS } from './data/mockData';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [plants, setPlants] = useState<Plant[]>(INITIAL_PLANTS);
  const [currentPlant, setCurrentPlant] = useState<Plant>(INITIAL_PLANTS[0]);
  const initialZone = INITIAL_PLANTS[0].departments[0].zones[1] || INITIAL_PLANTS[0].departments[0].zones[0];
  const [currentZone, setCurrentZone] = useState<Zone>(initialZone);

  // Active persona (defaults to Alex Chen)
  const [activePersona, setActivePersona] = useState<UserPersona>(USER_PERSONAS[0]);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(INITIAL_DASHBOARD_STATS);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [redTags, setRedTags] = useState<RedTag[]>([]);
  const [audits, setAudits] = useState<AuditRun[]>([]);

  // Default to MaintainX Work Orders view
  const [currentTab, setCurrentTab] = useState<NavTab>('work_orders');
  const [isLiveApi, setIsLiveApi] = useState(false);

  // Modals
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [showCreateRedTag, setShowCreateRedTag] = useState(false);
  const [selectedRedTagForAction, setSelectedRedTagForAction] = useState<RedTag | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initial Data Load
  useEffect(() => {
    async function init() {
      const connected = await checkBackendConnection();
      setIsLiveApi(connected);

      const plantList = await fetchPlants();
      if (plantList.length > 0) {
        setPlants(plantList);
        setCurrentPlant(plantList[0]);
        const defaultZone = plantList[0].departments[0]?.zones[1] || plantList[0].departments[0]?.zones[0];
        if (defaultZone) setCurrentZone(defaultZone);
        loadPlantData(plantList[0].id);
      }
    }
    init();
  }, []);

  const loadPlantData = async (plantId: string) => {
    try {
      const [stats, acts, tags, auds] = await Promise.all([
        fetchPlantDashboard(plantId),
        fetchActivities({ plant_id: plantId }),
        fetchRedTags({ plant_id: plantId }),
        fetchAudits(plantId)
      ]);
      setDashboardStats(stats);
      setActivities(acts);
      setRedTags(tags);
      setAudits(auds);
    } catch (err) {
      console.error("Error loading plant data", err);
    }
  };

  const handleZoneRefresh = async () => {
    try {
      const plantList = await fetchPlants();
      if (plantList.length > 0) {
        setPlants(plantList);
        const updatedPlant = plantList.find(p => p.id === currentPlant.id) || plantList[0];
        setCurrentPlant(updatedPlant);
        await loadPlantData(updatedPlant.id);
      }
    } catch (err) {
      console.error("Failed to refresh plants after zone change:", err);
    }
  };

  const handleUpdateActivity = (updated: Activity) => {
    setActivities(prev => prev.map(a => (a.id === updated.id ? updated : a)));
    setSelectedActivity(updated);
    showToast(`Work Order #${updated.activity_number.split('-')[1] || updated.activity_number} updated`);
  };

  const handleAddActivity = (newActivity: Activity) => {
    setActivities(prev => [newActivity, ...prev]);
    showToast(`Work Order #${newActivity.activity_number} created`);
  };

  const handleUpdateRedTag = (updated: RedTag) => {
    setRedTags(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    showToast(`Red-Tag ${updated.tag_number} updated`);
  };

  const handleAddRedTag = (newTag: RedTag) => {
    setRedTags(prev => [newTag, ...prev]);
    showToast(`Red-Tag ${newTag.tag_number} logged`);
  };

  const pendingReviewCount = activities.filter(a => a.status === 'submitted_for_review').length;
  const openRedTagCount = redTags.filter(t => !t.is_closed).length;

  return (
    <div className="h-screen w-screen flex bg-slate-100 overflow-hidden font-sans text-slate-800 antialiased">
      {/* 1. Left MaintainX Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        reviewCount={pendingReviewCount}
        openRedTagCount={openRedTagCount}
      />

      {/* 2. Main Work Area (Zero Header Clutter) */}
      <main className={`flex-1 overflow-y-auto ${currentTab === 'settings' ? 'p-0 bg-[#f8fafc]' : 'p-4 sm:p-5 bg-slate-100'}`}>
        <div className={currentTab === 'settings' ? 'h-full flex flex-col' : 'max-w-[1400px] mx-auto'}>
          {/* Work Orders Screen (Screenshots 1 & 6) */}
          {currentTab === 'work_orders' && (
            <MaintainXWorkOrders
              activities={activities}
              plant={currentPlant}
              currentZone={currentZone}
              activePersona={activePersona}
              onSelectActivity={act => setSelectedActivity(act)}
              onUpdateActivity={handleUpdateActivity}
              onOpenCreateModal={() => setShowCreateActivity(true)}
            />
          )}

          {/* Assets Screen (Screenshot 7) */}
          {currentTab === 'assets' && (
            <MaintainXAssets />
          )}

          {/* Reporting Screen (Screenshot 2) */}
          {currentTab === 'reporting' && (
            <MaintainXReporting
              activities={activities}
              plant={currentPlant}
            />
          )}

          {/* Red-Tag Screen */}
          {currentTab === 'redtags' && (
            <RedTagRegister
              redTags={redTags}
              plant={currentPlant}
              onUpdateRedTag={handleUpdateRedTag}
              onAddRedTag={handleAddRedTag}
            />
          )}

          {/* Locations / Zone Matrix Screen */}
          {currentTab === 'locations' && (
            <PlantZoneMatrix
              plant={currentPlant}
              activities={activities}
              redTags={redTags}
              activePersona={activePersona}
              onSelectZone={zone => {
                setCurrentZone(zone);
                setCurrentTab('work_orders');
              }}
              onAuditZone={() => setCurrentTab('work_orders')}
              onZoneCreated={handleZoneRefresh}
              onZoneDeleted={handleZoneRefresh}
            />
          )}

          {/* Management Settings: Zonal Leaders & RBAC */}
          {currentTab === 'settings' && (
            <ZonalLeadersSettings
              plants={plants}
              currentPlantId={currentPlant.id}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onUpdate={handleUpdateActivity}
        />
      )}

      {showCreateActivity && (
        <CreateActivityModal
          plant={currentPlant}
          onClose={() => setShowCreateActivity(false)}
          onCreated={handleAddActivity}
        />
      )}

      {showCreateRedTag && (
        <CreateRedTagModal
          plant={currentPlant}
          onClose={() => setShowCreateRedTag(false)}
          onCreated={handleAddRedTag}
        />
      )}

      {selectedRedTagForAction && (
        <RedTagActionModal
          redTag={selectedRedTagForAction}
          onClose={() => setSelectedRedTagForAction(null)}
          onUpdated={updated => {
            handleUpdateRedTag(updated);
            setSelectedRedTagForAction(null);
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
