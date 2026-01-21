import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';

interface MapAdjusterProps {
  initialPos: LatLng;
  onPositionChange: (newPos: LatLng) => void;
}

export const MapAdjuster = ({ initialPos, onPositionChange }: MapAdjusterProps) => {
  const [position, setPosition] = useState<LatLng>(initialPos);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onPositionChange(e.latlng);
      },
    });

    return <Marker position={position} draggable={true} />;
  };

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner border-2 border-gray-100">
      <MapContainer center={initialPos} zoom={15} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};