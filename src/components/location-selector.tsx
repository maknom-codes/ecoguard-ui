import { useMapEvents, Marker, Popup } from "react-leaflet";

export const LocationSelector = ({ position, setPosition }: any) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng); 
      map.flyTo(e.latlng, map.getZoom()); 
    },
  });
  return position ? <Marker 
                        position={position}
                        children={<Popup>Incident position (Move if necessary)</Popup>} 
                    /> : null;
};