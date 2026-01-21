import React from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet par défaut qui ne s'affichent pas bien avec Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { IncidentLayers } from './incident-layer';
import { ProtectedZoneLayer } from './protected-z-layer';
import { IncidentFeatureCollection } from './type';


let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface IMapViewerProps {
    zones: any,
    geo: IncidentFeatureCollection
};

const MapViewer: React.FC<IMapViewerProps> = ({ zones, geo }) => {

    // 2. Gestion des clics sur la carte
    const MapEvents = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                // Déclenche un événement personnalisé pour informer le Dashboard
                const event = new CustomEvent('mapClick', { detail: { lat, lng } });
                window.dispatchEvent(event);
            },
        });
        return null;
    };
    
    return (
        <MapContainer 
            center={[4.05, 9.75]}
            zoom={12} 
            className="h-full w-full z-0"
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
            />
            <ProtectedZoneLayer zones={zones}/>
            <IncidentLayers geoJsonData={geo}/>
            <MapEvents />
        </MapContainer>
    );
};

export default MapViewer;
