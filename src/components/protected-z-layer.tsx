import React from "react"
import { GeoJSON } from "react-leaflet"
import { ZoneFeatureCollection } from "./type"

interface IProtectedZoneProps {
    zones: ZoneFeatureCollection
}

export const ProtectedZoneLayer: React.FC<IProtectedZoneProps> = ({ zones }) => {
    return (
        <React.Fragment>
                <GeoJSON 
                    key={zones.features.length} 
                    data={zones}
                    style={{
                        color: '#059669',
                        weight: 2,
                        fillColor: '#10b981', 
                        fillOpacity: 0.2
                    }}
                    onEachFeature={(feature, layer) => {
                        layer.bindTooltip(` <Tooltip sticky>${feature.properties.name}</Tooltip>`)
                    }}
                />
        </React.Fragment>
    )
} 