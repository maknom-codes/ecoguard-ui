import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';

import { IncidentFeatureCollection } from './type';



interface IIncidentZoneProps {
  geoJsonData: IncidentFeatureCollection
}

export const IncidentLayers = ({ geoJsonData }: IIncidentZoneProps) => {

  if (!geoJsonData) return null;
  // Fonction de style (votre logique de couleurs)
  const getStyle = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return { color: '#EF4444', fillColor: '#EF4444' };
      case 'MEDIUM':     return { color: '#F97316', fillColor: '#F97316' };
      default:         return { color: '#10B981', fillColor: '#10B981' };
    }
  };
  return (
    <GeoJSON 
      key={geoJsonData.features.length}
      data={geoJsonData}
      pointToLayer={(feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 8,
          weight: 2,
          fillOpacity: 0.7,
          ...getStyle(feature.properties.urgency)
        });
      }}
      onEachFeature={(feature, layer) => {
        layer.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${feature.properties.category}</h3>
            <p>${feature.properties.description}</p>
          </div>
        `);
      }}
    />
  );
};
