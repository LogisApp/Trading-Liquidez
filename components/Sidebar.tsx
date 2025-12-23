
import React, { useState, useMemo } from 'react';
import { AnalysisResult, ZoneType } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  analysis: AnalysisResult | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, analysis, onUpload }) => {
  const [activeTooltip, setActiveTooltip] = useState<'sl' | 'tp' | null>(null);
  
  // Lot Calculator State
  const [calcData, setCalcData] = useState({
    balance: 1000,
    riskPercent: 1,
    entry: 0,
    stopLoss: 0
  });

  const getZoneColor = (type: ZoneType) => {
    switch (type) {
      case ZoneType.MAJOR_STRUCTURE: return 'border-blue-500 text-blue-400';
      case ZoneType.TRAP_INDUCTION: return 'border-red-500 text-red-400';
      case ZoneType.HIGH_PROB_POI: return 'border-emerald-500 text-emerald-400';
      case ZoneType.WICK_RETEST: return 'border-amber-500 text-amber-400';
      default: return 'border-zinc-500 text-zinc-400';
    }
  };

  const lotCalculation = useMemo(() => {
    const { balance, riskPercent, entry, stopLoss } = calcData;
    if (!balance || !riskPercent || !entry || !stopLoss || entry === stopLoss) {
      return { lots: 0, riskAmount: 0 };
    }
    
    const riskAmount = balance * (riskPercent / 100);
    const distance = Math.abs(entry - stopLoss);
    
    const units = riskAmount / distance;
    const lots = units / 100000; // Standard Lot
    
    return { 
      lots: lots.toFixed(2), 
      riskAmount: riskAmount.toFixed(2) 
    };
  }, [calcData]);

  return (
    <aside className={`${isOpen ? 'w-80' : 'w-0 overflow-hidden'} transition-all duration-300 border-r border-zinc-800 bg-[#0e0e10] flex flex-col h-full z-20 shrink-0 lg:relative absolute left-0`}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth">
          {/* Lot Calculator Section */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 space-y-4">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Calculadora de Lote</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">Balance ($)</label>
                <input 
                  type="number" 
                  value={calcData.balance}
                  onChange={(e) => setCalcData({...calcData, balance: parseFloat(e.target.value) || 0})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">Riesgo (%)</label>
                <input 
                  type="number" 
                  value={calcData.riskPercent}
                  onChange={(e) => setCalcData({...calcData, riskPercent: parseFloat(e.target.value) || 0})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">Entrada</label>
                <input 
                  type="number" 
                  placeholder="Precio"
                  onChange={(e) => setCalcData({...calcData, entry: parseFloat(e.target.value) || 0})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">Stop Loss</label>
                <input 
                  type="number" 
                  placeholder="Precio"
                  onChange={(e) => setCalcData({...calcData, stopLoss: parseFloat(e.target.value) || 0})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-1.5 text-xs focus:ring-1 focus:ring-red-500/50 outline-none"
                />
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Riesgo</p>
                <p className="text-sm font-bold text-red-400">${lotCalculation.riskAmount}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Lote Sugerido</p>
                <p className="text-lg font-black text-emerald-400 leading-none">{lotCalculation.lots}</p>
              </div>
            </div>
          </div>

          {analysis ? (
            <>
              {/* Trading Plan Section */}
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Plan de Trading</label>
                <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/20 p-4 space-y-4">
                  <div className="relative">
                    <button 
                      onMouseEnter={() => setActiveTooltip('sl')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors w-full text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                      STOP LOSS RATIONALE
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-50 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    {activeTooltip === 'sl' && analysis.slRationale && (
                      <div className="absolute z-30 left-0 top-full mt-2 w-full bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs text-zinc-300 shadow-2xl animate-in zoom-in-95 duration-200">
                        {analysis.slRationale}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onMouseEnter={() => setActiveTooltip('tp')}
                      onMouseLeave={() => setActiveTooltip(null)}
                      className="flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors w-full text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      TAKE PROFIT RATIONALE
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-50 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    {activeTooltip === 'tp' && analysis.tpRationale && (
                      <div className="absolute z-30 left-0 top-full mt-2 w-full bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-xs text-zinc-300 shadow-2xl animate-in zoom-in-95 duration-200">
                        {analysis.tpRationale}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Resumen Estructural</label>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-sm leading-relaxed text-zinc-300">
                  {analysis.summary}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Zonas Detectadas ({analysis.zones.length})</label>
                <div className="space-y-3">
                  {analysis.zones.map((zone) => (
                    <div 
                      key={zone.id} 
                      className={`p-3 border-l-4 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors cursor-help group ${getZoneColor(zone.type)}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-[10px] uppercase tracking-wider">{zone.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          zone.probability === 'High' ? 'bg-emerald-500/10 text-emerald-400' : 
                          zone.probability === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {zone.probability}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-tight line-clamp-2 group-hover:line-clamp-none transition-all">
                        {zone.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm text-zinc-500">Sube una captura para ver el análisis.</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-zinc-800">
           <div className="flex items-center gap-3 text-zinc-500">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs shadow-[0_0_10px_rgba(16,185,129,0.2)]">AI</div>
              <div>
                <p className="text-xs font-bold text-zinc-300">MODO DISCIPLINADO</p>
                <p className="text-[10px]">Gemini 3 Pro Engine</p>
              </div>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
