import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Check } from 'lucide-react';
import { LocationSelector } from './location-selector';
import { IncidentForm } from './type';

type Level = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const SignalementModal = ({ onClose, onSubmit }: any) => {

    const [step, setStep] = useState<'FORM' | 'CONFIRM'>('FORM');
    const [formData, setFormData] = useState<IncidentForm>({
        category: 'FLORE',
        urgency: 'MEDIUM',
        description: 'maawawet',
        latlng: { lat: 4.05, lng: 9.72 }, 
        latitude: null,
        longitude: null
    });

    useEffect(() => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
        (position) => {
            setFormData(prev => ({
            ...prev,
            latlng: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
            }));
        },
        (error) => console.error("GPS non disponible", error),
        { enableHighAccuracy: true, timeout: 10000 }
        );
    }
    }, []);


    if (step === 'FORM') {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-xl max-w-md w-full animate-in slide-in-from-bottom">
        <div className='d-flex justify-content-between'>
            <h2 className="text-2xl font-black text-emerald-900 mb-4">Nouveau Signalement</h2>
            <button className="rounded-2xl font-black text-lg shadow-lg shadow-emerald-200" onClick={() => onClose()}>
                X
            </button>
        </div>
        <label className="block text-sm font-bold text-slate-500 mb-2">CATÉGORIE</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
            {['FAUNE', 'FLORE', 'POLLUTION', 'INCENDIE'].map(cat => (
            <button 
                key={cat}
                onClick={() => setFormData({...formData, category: cat})}
                className={`p-3 rounded-xl border-2 font-bold transition-all ${formData.category === cat ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}
            >
                {cat}
            </button>
            ))}
        </div>

        <label className="block text-sm font-bold text-slate-500 mb-2">URGENCE</label>
        <div className="flex gap-2 mb-6">
            {[
            {val: 'LOW' as Level, color: 'bg-blue-500'},
            {val: 'MEDIUM' as Level, color: 'bg-amber-500'},
            {val: 'HIGH' as Level, color: 'bg-orange-500'},
            {val: 'CRITICAL' as Level, color: 'bg-red-600'}
            ].map(u => (
            <button
                key={u.val}
                onClick={() => setFormData({...formData, urgency: u.val})}
                className={`flex-1 h-12 rounded-xl border-4 transition-all ${u.color} ${formData.urgency === u.val ? 'border-white ring-2 ring-slate-300 scale-110' : 'border-transparent opacity-60'}`}
            />
            ))}
        </div>

        <button 
            onClick={() => setStep('CONFIRM')}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200"
        >
            SUIVANT
        </button>
        </div>
    );
    }

    return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full border border-emerald-50">
        <div className="p-4 bg-emerald-50 flex justify-between items-center">
        <h2 className="font-bold text-emerald-900">Vérifier & Placer</h2>
        <button onClick={() => setStep('FORM')} className="text-emerald-600 font-bold text-sm">Modifier infos</button>
        </div>

        <div className="h-64 w-full relative">
        <MapContainer center={formData.latlng} zoom={15} style={{height: '100%', width: '100%'}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationSelector
                position={formData.latlng} 
                setPosition={(pos: any) => setFormData({...formData, latlng: pos})} 
            />
        </MapContainer>
        <div className="absolute top-2 right-2 z-[1000] bg-white/80 p-2 rounded-lg text-[10px] font-bold shadow-sm">
            Touchez la carte pour déplacer le point
        </div>
        </div>

        <div className="p-6">
        <div className="flex gap-4 mb-6">
            <div className="flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</span>
            <p className="font-bold text-slate-700">{formData.category}</p>
            </div>
            <div className="flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgence</span>
            <p className={`font-bold ${formData.urgency === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>{formData.urgency}</p>
            </div>
        </div>

        <div className="flex gap-3">
            <button 
                onClick={() => onSubmit(formData)}
                className="flex-grow bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
            >
            <Check size={20} /> CONFIRMER L'ENVOI
            </button>
        </div>
        </div>
    </div>
  );
};
