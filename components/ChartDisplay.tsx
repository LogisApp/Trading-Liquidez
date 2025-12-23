
import React, { useRef, useState, useEffect } from 'react';
import { AnalysisResult, ZoneType } from '../types';

interface ChartDisplayProps {
  image: string | null;
  analysis: AnalysisResult | null;
  loading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ image, analysis, loading, onUpload }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const getZoneStyle = (type: ZoneType) => {
    switch (type) {
      case ZoneType.MAJOR_STRUCTURE: return 'border-blue-500 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      case ZoneType.TRAP_INDUCTION: return 'border-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      case ZoneType.HIGH_PROB_POI: return 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
      case ZoneType.WICK_RETEST: return 'border-amber-500 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      default: return 'border-zinc-500 bg-zinc-500/10';
    }
  };

  return (
    <div className="flex-1 bg-[#0a0a0c] relative flex items-center justify-center overflow-auto p-4 md:p-8">
      {!image ? (
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Comienza el Rastreo</h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Sube una captura de tu gráfico de TradingView o MT4 para que la IA identifique las huellas institucionales.
              </p>
              <label className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/40">
                CARGAR CAPTURA
                <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
              <p className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-tight">Estructura</p>
              <p className="text-sm text-zinc-400">Detecta quiebres reales vs barridos.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
              <p className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-tight">Liquidez</p>
              <p className="text-sm text-zinc-400">Identifica piscinas de stop loss.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative inline-block mx-auto group" ref={containerRef}>
          <img 
            src={image} 
            alt="Chart" 
            className={`max-w-full h-auto rounded-lg shadow-2xl transition-all duration-500 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
          />
          
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="bg-black/60 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md animate-pulse">
                IDENTIFICANDO ZONAS...
              </p>
            </div>
          )}

          {/* Zones Overlay */}
          {!loading && analysis && analysis.zones.map((zone) => (
            <div
              key={zone.id}
              className={`absolute border-2 transition-all duration-300 cursor-help ${getZoneStyle(zone.type)} ${activeZone === zone.id ? 'z-20 scale-105' : 'z-10'}`}
              style={{
                left: `${zone.coordinates.x}%`,
                top: `${zone.coordinates.y}%`,
                width: `${zone.coordinates.width}%`,
                height: `${zone.coordinates.height}%`,
              }}
              onMouseEnter={() => setActiveZone(zone.id)}
              onMouseLeave={() => setActiveZone(null)}
            >
              {/* Tooltip on Hover */}
              <div className={`absolute bottom-full left-0 mb-2 w-48 bg-zinc-900 border border-zinc-700 p-2 rounded-lg text-xs shadow-xl transition-opacity duration-300 pointer-events-none ${activeZone === zone.id ? 'opacity-100' : 'opacity-0'}`}>
                <p className="font-bold text-emerald-400 mb-1">{zone.label}</p>
                <p className="text-zinc-300 leading-tight">{zone.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartDisplay;
