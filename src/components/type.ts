
export interface SyncMessage {
  type: 'TRIGGER_SYNC' | 'SYNC_COMPLETE' | 'SYNC_ERROR';
  payload?: any;
}

export interface OfflineData<T = any> {
  id?: number;
  data: T;
  status: 'pending'| 'synced';
  createdAt: Date;
  updatedAt: Date;
  retryCount?: number;
  lastRetry?: Date;
}

export interface SyncConfig {
  apiUrl: string;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  syncInterval: number;
};

export interface IncidentForm {
  category: string; 
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  latlng: { lat: number, lng: number}
  latitude: number | null;
  longitude: number | null;
  image?: File | null; 
};

export interface IncidentProperties {
    id: number;
    zoneId: number;
    userId: number;
    category: string;
    description: string;
    urgency: string;
    reportDate: string;
};

export interface IncidentGeometry {
  type: 'Point';
  coordinates: [number, number]; 
};

export interface IncidentFeature {
  type: 'Feature';
  geometry: IncidentGeometry;
  properties: IncidentProperties;
};

export interface IncidentFeatureCollection {
  type: 'FeatureCollection';
  features: IncidentFeature[];
};

