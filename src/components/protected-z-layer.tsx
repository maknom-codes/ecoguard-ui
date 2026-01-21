import React from "react"
import { ProtectedZone } from "../services/z-service"
import { GeoJSON, Tooltip } from "react-leaflet"

interface IProtectedZoneProps {
    zones: ProtectedZone[]
}

export const ProtectedZoneLayer: React.FC<IProtectedZoneProps> = ({ zones }) => {
    return (
        <React.Fragment>
            {zones.map((zone) => (
                <GeoJSON 
                    key={zone.id} 
                    data={JSON.parse(zone.geoJson)}
                    style={{
                        color: '#059669',
                        weight: 2,
                        fillColor: '#10b981', 
                        fillOpacity: 0.2
                    }}
                >
                    <Tooltip sticky>{zone.name}</Tooltip>
                </GeoJSON>
            ))}
        </React.Fragment>
    )
} 