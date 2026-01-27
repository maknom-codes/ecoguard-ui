import React, { useState, useEffect } from 'react';
import { 
  TreePine, 
  Wifi, 
  WifiOff, 
  Map as MapIcon, 
  Plus, 
  User, 
  Navigation,
  Layers,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import MapViewer from '../components/mapviewer';
import SyncBadge from '../components/sync-badge';
import { useSync } from '../hooks/use-sync';
import { SyncStatus } from '../db/sync.type';
import { gql } from '@apollo/client';
import { useSubscription } from '@apollo/client/react';
import { IZone, zoneService } from '../services/z-service';
import { IncidentFeatureCollection, IncidentForm, ZoneFeatureCollection } from '../components/type';
import { syncService } from '../services/sync-service';
import { SignalementModal } from '../components/set-incident';
import toast from 'react-hot-toast';
import { useNetworkStatus } from '../hooks/use-network';


const SYNC_SUBSCRIPTION = gql`
  subscription OnSyncCompleted {
    syncCompleted {
      type
      timestamp
      data {
        type
        geometry {
            type
            coordinates 
        }
        properties {
            id
            category
            description
            urgency
            reportDate
            userId,
            zoneId
        }
      }
    }
  }
`;


const Dashboard: React.FC = () => {
  document.title = "Ecoguard";
  const [openModal, setOpenModal] = useState<boolean>(false);
  const onLine = useNetworkStatus();
  // const [pendingSync, setPendingSync] = useState(3); 
  const [showProfile, setShowProfile] = useState(false);
  const { data, loading, error } = useSubscription<{ syncCompleted: any}>(SYNC_SUBSCRIPTION);
  if (loading) console.log("Connexion WebSocket en cours...");
  if (error) console.error("Erreur WebSocket détectée :", error);
  if (data) console.log("Message reçu du serveur !", data);  
  // const [refreshData, setRefreshData] = useState<boolean>(false);
  const [zones, setZones] = useState<IZone>({ 
    success: false, 
    protectedZones: {} as ZoneFeatureCollection, 
    incidentZones: {} as IncidentFeatureCollection 
  });
  // const onRefreshData = () => setRefreshData(!refreshData);
  const openSignalForm = () => setOpenModal(!openModal);
  const { status, pendingItems, sync, lastSync } = useSync();

  const init = async () => {
      if (data?.syncCompleted?.type === 'incident') {
          const incident = data.syncCompleted.data;
          toast.custom(`Nouvel incident : ${incident.properties.category} signalé par ${incident.properties.userId}`);
          setZones(prev => ({
            ...prev,
            incidentZones: { 
              ...prev.incidentZones,
              features: [
                ...prev.incidentZones.features,
                incident
              ]
            }
          }));
      }else {
        const response = zoneService.getAllZones();
        response.then((zs) => {
          if (zs.incidentZones.type) {
            setZones(
              {
                success: true,
                incidentZones: zs.incidentZones,
                protectedZones: zs.protectedZones
              }
            )
            toast.success("Data loaded successfully!");
          }
        }).catch(() => toast.error("Error: Failed to load data"));
      }      
  };


  useEffect(() => {
      init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);



  const handleSubmit = async (formData: IncidentForm) => {
      const incidentData = {
          category: formData.category,
          description: formData.description,
          urgency: formData.urgency,
          latitude: formData.latlng.lat,
          longitude: formData.latlng.lng,
          reportDate: new Date().toISOString()
      };
      try {
          if (navigator.onLine) {
              zoneService.createIncident(incidentData)
                  .then((createIncident) => {
                      toast.success("Signalement envoyé en direct!");
                    })
          } else {
              await syncService.saveForSync(incidentData); 
              await syncService.triggerSync();
              toast.custom("Hors-ligne : Signalement mis en attente");
          }
          openSignalForm();
      } catch (error) {
          await syncService.saveForSync(incidentData);
          await syncService.triggerSync();
          toast.custom("Enregistré localement (problème réseau)");
      }
  };
  

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-100 flex flex-col">
      
      {/* 1. HEADER (Fixe) */}
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-b border-emerald-100 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
            <TreePine size={20} />
          </div>
          <h1 className="font-bold text-emerald-900 text-lg tracking-tight">EcoGuard</h1>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                {pendingItems > 0 && (
                  <button 
                    onClick={() => sync()}
                    disabled={status === SyncStatus.SYNCING || !onLine}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all
                      ${status === SyncStatus.SYNCING 
                        ? 'bg-blue-100 text-blue-700 animate-pulse' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                  >
                    <RefreshCw size={14} className={status === SyncStatus.SYNCING ? 'animate-spin' : ''} />
                    <span>{status === SyncStatus.SYNCING ? 'Envoi...' : `${pendingItems} en attente`}</span>
                  </button>
                )}
            
            <SyncBadge />
          </div>
          {/* État Connexion */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${ onLine ? 'text-emerald-600' : 'text-red-500'}`}>
            { onLine ? <Wifi size={18} /> : <WifiOff size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
              { onLine ? 'Online' : 'Offline'}
            </span>
          </div>

          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-100 transition-colors"
          >
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow relative z-0">
        {zones.success && <MapViewer zones={zones.protectedZones} geo={zones.incidentZones}/>}
        
        {status === SyncStatus.ERROR && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
            <AlertCircle size={16} />
            Erreur de synchronisation. Réessai automatique...
          </div>
        )}
        {/* Contrôles de carte flottants (Droit) */}
        <div className="absolute right-4 top-24 z-[500] flex flex-col gap-2">
          <button className="bg-white p-3 rounded-xl shadow-lg text-slate-700 hover:bg-emerald-50 transition-all border border-slate-100">
            <Navigation size={22} />
          </button>
          <button className="bg-white p-3 rounded-xl shadow-lg text-slate-700 hover:bg-emerald-50 transition-all border border-slate-100">
            <Layers size={22} />
          </button>
        </div>
      </main>
      <div className="absolute bottom-8 left-0 right-0 z-[500] flex justify-center px-6 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button className="bg-white text-emerald-800 px-6 py-4 rounded-2xl shadow-2xl border border-emerald-100 font-bold flex items-center gap-2 transition-transform active:scale-95">
            <MapIcon size={20} />
            <span className="hidden sm:inline">Mes Rapports</span>
          </button>

          <button onClick={() => openSignalForm()} className="bg-emerald-600 text-white p-5 rounded-3xl shadow-2xl shadow-emerald-900/40 flex items-center gap-3 transition-all hover:bg-emerald-700 active:scale-90 group">
            <div className="bg-white/20 p-1 rounded-lg">
              <Plus size={28} strokeWidth={3} />
            </div>
            <span className="text-lg font-black pr-2">SIGNALER</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] flex flex-col gap-1">
        <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
           GPS: Précision 4m • SRID: 4326
        </div>
        {lastSync && (
          <div className="bg-emerald-900/80 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded">
            Dernière synchro: {lastSync.toLocaleTimeString()}
          </div>
        )}
      </div>
      {openModal && (
      <div className="absolute inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg animate-in fade-in slide-in-from-bottom-10 duration-300">
              <SignalementModal onClose={openSignalForm} onSubmit={handleSubmit} />
          </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;
