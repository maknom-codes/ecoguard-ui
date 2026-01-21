import { LatLng } from "leaflet";
import { useState } from "react";
import { MapAdjuster } from "./map-ajuster";



export const ReportSummary = ({ data, onConfirm }: { data: any, onConfirm: (pos: LatLng) => void }) => {
  const [finalPos, setFinalPos] = useState<LatLng>(data.initialGps);

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Résumé du signalement</h2>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{data.categoryIcon}</span>
          <span className="font-bold">{data.category}</span>
        </div>
        <p className="text-gray-600 italic">"{data.description}"</p>
        <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-opacity-20 uppercase" 
             style={{ backgroundColor: data.urgencyColor, color: data.urgencyColor }}>
          Urgence {data.urgency}
        </div>
      </div>

      {/* Zone de la carte */}
      <div className="flex-1 min-h-[300px] relative">
        <p className="absolute top-2 left-2 z-[1000] bg-white/90 px-2 py-1 rounded text-xs font-medium shadow-sm">
          📍 Ajustez le marqueur sur la carte
        </p>
        <MapAdjuster initialPos={finalPos} onPositionChange={setFinalPos} />
      </div>

      <button
        onClick={() => onConfirm(finalPos)}
        className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
      >
        Valider la position et envoyer
      </button>
    </div>
  );
};