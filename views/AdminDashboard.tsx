import React, { useState, useEffect } from 'react';
import { 
  Settings, RefreshCw, Send, Play, CheckCircle, Clock, 
  Users, DollarSign, TrendingUp, ShieldAlert, Activity, FileText,
  Plus, Trash2, ToggleLeft, ToggleRight, Lock, Menu, X, Tag, CreditCard, LayoutGrid, Info, Calendar, Save, Download, Printer,
  ChevronDown, Power, Layout, Edit3, ImageIcon, Globe, MessageCircle, BarChart3, Shield, Zap, Wallet, Search, Filter,
  Gift, Percent, UserPlus, Eye, Coins, Landmark, Mail, Phone, ChevronRight, UserCog, Share2, Copy, Calculator, Link, TrendingDown,
  ArrowRight, Palette, ExternalLink, Layers, Ticket, Landmark as Bank, ListFilter, SlidersHorizontal
} from 'lucide-react';
import { Transaction, User, TransactionStatus, SystemConfig, CostGroup, AdminLevel, CurrencyConfig, PaymentMethodConfig, Coupon, ScheduleConfig, ServiceItem, BudgetTheme, ReferenceItem, SocialLink, CostItem } from '../types';
import { MockBackend } from '../services/mockBackend';

// --- HELPERS ---
const SectionHeader = ({ title, description }: { title: string, description: string }) => {
   return (
      <div className="mb-8">
         <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
         <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <Info size={14} className="text-brand-500" /> {description}
         </p>
      </div>
   );
};

// --- SIMULATOR SIDEBAR (DARK THEME RESTORED) ---
const InternalSimulator = ({ config }: { config: SystemConfig }) => {
   const [simAmount, setSimAmount] = useState(100);
   const [couponCode, setCouponCode] = useState('');
   const [currency, setCurrency] = useState('VES');
   const [result, setResult] = useState<any>(null);

   useEffect(() => {
      setResult(MockBackend.calculateQuote(simAmount, currency, undefined, couponCode));
   }, [simAmount, couponCode, currency, config]);

   if (!result) return null;

   const isVES = currency === 'VES';

   return (
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700 h-fit sticky top-6">
         <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14}/> Simulador Financiero
            </h4>
            <span className="bg-slate-800 text-[10px] px-2 py-1 rounded text-slate-400 font-mono">INTERNAL-VIEW</span>
         </div>
         
         <div className="space-y-4 mb-6">
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Monto Cliente (USD)</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                    <input type="number" value={simAmount} onChange={(e) => setSimAmount(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-6 pr-3 py-2 text-white font-mono text-sm focus:ring-1 focus:ring-brand-500 outline-none transition-all" />
                </div>
            </div>
            <div className="flex gap-3">
               <div className="flex-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Divisa</label>
                   <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-brand-500 outline-none">
                       {config.logistics.currencies.filter(c => c.enabled).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                   </select>
               </div>
               <div className="flex-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Cupón</label>
                   <input value={couponCode} placeholder="CODE" onChange={(e) => setCouponCode(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm uppercase placeholder:text-slate-600 focus:ring-1 focus:ring-brand-500 outline-none" />
               </div>
            </div>
         </div>

         <div className="space-y-3 text-xs font-mono">
             <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="flex justify-between text-slate-400 mb-1">
                   <span>Monto Bruto</span>
                   <span>${(simAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-400 mb-2">
                   <span>- PayPal Fee ({(config.paypalExternalFee.pct)}% + {config.paypalExternalFee.fixed})</span>
                   <span>${(result.ppFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-white border-t border-slate-600 pt-2">
                   <span>Monto Neto PayPal</span>
                   <span className="text-blue-300">${(result.netPaypal || 0).toFixed(2)}</span>
                </div>
             </div>

             <div className="relative pl-4 border-l-2 border-slate-700 ml-1 py-1 space-y-1">
                {/* Deducciones Gravables (Cliente) */}
                <div className="flex justify-between text-slate-500">
                   <span>- Deducciones (Pasarela)</span>
                   <span className="text-red-400">-${(result.opsDeductions || 0).toFixed(2)}</span>
                </div>

                {/* Costos Absorbidos (Admin) - NUEVO FIX VISUAL */}
                {result.adminAbsorbedCosts > 0 && (
                    <div className="flex justify-between text-yellow-500/80">
                        <span>- Costos Absorbidos (Admin)</span>
                        <span className="text-yellow-500">-${(result.adminAbsorbedCosts || 0).toFixed(2)}</span>
                    </div>
                )}
                
                 <div className="flex justify-between font-bold text-emerald-400 py-1 border-y border-dashed border-slate-700 my-1 bg-slate-800/30 px-1 rounded">
                   <span>Recepción Neta Interna</span>
                   <span>${(result.netInternalReceipt || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                   <span>- Margen de Servicio</span>
                   <span className="text-orange-400">-${(result.serviceFee || 0).toFixed(2)}</span>
                </div>
             </div>

             <div className="bg-brand-900/40 p-4 rounded-xl border border-brand-500/30 mt-4 backdrop-blur-sm">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">Cliente Recibe</span>
                 </div>
                 
                 {isVES ? (
                    <div className="space-y-2">
                        <div className="flex justify-between items-end border-b border-brand-500/30 pb-2 mb-2">
                            <span className="text-3xl font-bold text-white tracking-tight">{(result.finalAmount || 0).toFixed(2)} <span className="text-lg font-normal text-brand-200">VES</span></span>
                            <span className="text-[10px] text-brand-300 mb-1 font-bold">Tasa: {(result.rate || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-brand-100">
                            <span>Cantidad Neta USD:</span>
                            <span className="font-bold text-white">${(result.baseForExchange || 0).toFixed(2)}</span>
                        </div>
                        {result.bcvEquivalent > 0 && (
                            <div className="flex justify-between text-xs text-blue-200">
                                <span>Equivalente $ BCV:</span>
                                <span className="font-bold text-white">${result.bcvEquivalent.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                 ) : (
                    <div className="flex justify-between items-end">
                        <span className="text-2xl font-bold text-white tracking-tight">{(result.finalAmount || 0).toFixed(2)} <span className="text-sm font-normal text-brand-200">{currency}</span></span>
                        <span className="text-[10px] text-brand-300 mb-1">Tasa: {(result.rate || 0).toFixed(2)}</span>
                    </div>
                 )}
                 
                 {result.appliedCoupon && (
                    <div className="mt-2 text-green-400 text-[10px] flex items-center gap-1">
                        <Tag size={10}/> Cupón {result.appliedCoupon.code} aplicado
                    </div>
                )}
             </div>

             <div className="text-center pt-2">
                 <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${ (result.internalStats?.netProfitUSD || 0) >= 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    Rentabilidad Neta: ${(result.internalStats?.netProfitUSD || 0).toFixed(2)}
                 </span>
                 {isVES && (
                     <p className="text-[9px] text-slate-500 mt-2">
                         * Ajustada al costo de reposición (Tasa: {result.marketReferenceRate?.toFixed(2) || 'N/A'})
                     </p>
                 )}
             </div>
         </div>
      </div>
   );
};

// --- LOGISTICS SUB-COMPONENTS ---

// 1. GATEWAYS & PAYMENT METHODS
const LogisticsGateways = ({ config, onUpdate }: { config: SystemConfig, onUpdate: (c: Partial<SystemConfig>) => void }) => {
   const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
   const updateCurrencies = (newCurrencies: CurrencyConfig[]) => onUpdate({ logistics: { ...config.logistics, currencies: newCurrencies } });
   
   return (
      <div className="space-y-4 animate-fadeIn">
         <div className="flex justify-between items-end mb-4">
             <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Divisas y Pasarelas</h3>
                <p className="text-xs text-slate-500">Configuración de tasas de cambio y bancos por moneda.</p>
             </div>
             <button 
                onClick={() => {
                   const newCurr: CurrencyConfig = {
                      code: 'NEW', name: 'Nueva Divisa', enabled: false,
                      rateMode: 'MANUAL', manualRate: 1.00,
                      secondaryRate: 1.00,
                      dynamicSetting: { references: [], profitRule: { mode: 'PCT_ONLY', pct: 5, fixed: 0 }, amountRanges: [] },
                      methods: []
                   };
                   updateCurrencies([...config.logistics.currencies, newCurr]);
                   setExpandedIndex(config.logistics.currencies.length); 
                }}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
             >
                <Plus size={16}/> Agregar Divisa
             </button>
         </div>

         {config.logistics.currencies.map((curr, idx) => {
            const isManual = curr.rateMode === 'MANUAL';
            const isExpanded = expandedIndex === idx;
            const isVES = curr.code === 'VES';
            
            return (
               <div key={idx} className={`bg-white rounded-xl border overflow-hidden transition-all duration-300 ${isExpanded ? 'border-brand-300 ring-4 ring-brand-50' : 'border-slate-200'}`}>
                  <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedIndex(isExpanded ? null : idx)}>
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm ${curr.enabled ? 'bg-brand-600' : 'bg-slate-300'}`}>
                            <Coins size={20} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-slate-800">{curr.code}</span>
                              {!curr.enabled && <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase font-bold">Inactivo</span>}
                           </div>
                           <span className="text-xs text-slate-500">{curr.name}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tasa Actual</span>
                            <span className="font-mono font-bold text-slate-700">{MockBackend.getClientRate(curr.code).toFixed(2)}</span>
                        </div>
                        <ChevronDown size={20} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                     </div>
                  </div>
                  
                  {isExpanded && (
                     <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-6 animate-fadeIn">
                        {/* MODO DE TASA & TASA DE VENTA */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Modo de Tasa</label>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button onClick={() => { const nc = [...config.logistics.currencies]; nc[idx].rateMode = 'MANUAL'; updateCurrencies(nc); }} className={`flex-1 py-1.5 text-xs font-bold rounded transition ${curr.rateMode === 'MANUAL' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Manual</button>
                                    <button onClick={() => { const nc = [...config.logistics.currencies]; nc[idx].rateMode = 'DYNAMIC'; updateCurrencies(nc); }} className={`flex-1 py-1.5 text-xs font-bold rounded transition ${curr.rateMode === 'DYNAMIC' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Dinámica</button>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">{curr.rateMode === 'MANUAL' ? 'Tasa de Venta (Fija)' : 'Margen de Rentabilidad'}</label>
                                {curr.rateMode === 'MANUAL' ? (
                                    <input type="number" step="0.01" value={curr.manualRate} onChange={e => { const nc = [...config.logistics.currencies]; nc[idx].manualRate = Number(e.target.value); updateCurrencies(nc); }} className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-lg focus:ring-1 focus:ring-brand-500 outline-none" />
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                            <button 
                                                onClick={() => { 
                                                    const nc = [...config.logistics.currencies]; 
                                                    nc[idx].dynamicSetting.profitRule.mode = 'PCT_ONLY'; 
                                                    updateCurrencies(nc); 
                                                }} 
                                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${curr.dynamicSetting.profitRule.mode === 'PCT_ONLY' ? 'bg-white shadow text-brand-600' : 'text-slate-400'}`}
                                            >
                                                Porcentaje (%)
                                            </button>
                                            <button 
                                                onClick={() => { 
                                                    const nc = [...config.logistics.currencies]; 
                                                    nc[idx].dynamicSetting.profitRule.mode = 'FIXED_ONLY'; 
                                                    updateCurrencies(nc); 
                                                }} 
                                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${curr.dynamicSetting.profitRule.mode === 'FIXED_ONLY' ? 'bg-white shadow text-brand-600' : 'text-slate-400'}`}
                                            >
                                                Monto Fijo ($)
                                            </button>
                                        </div>
                                        
                                        <div className="flex gap-2 items-center">
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                value={curr.dynamicSetting.profitRule.mode === 'PCT_ONLY' ? curr.dynamicSetting.profitRule.pct : curr.dynamicSetting.profitRule.fixed} 
                                                onChange={e => { 
                                                    const nc = [...config.logistics.currencies]; 
                                                    const val = Number(e.target.value);
                                                    if (nc[idx].dynamicSetting.profitRule.mode === 'PCT_ONLY') {
                                                        nc[idx].dynamicSetting.profitRule.pct = val;
                                                    } else {
                                                        nc[idx].dynamicSetting.profitRule.fixed = val;
                                                    }
                                                    updateCurrencies(nc); 
                                                }} 
                                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-lg outline-none" 
                                            />
                                            <span className="p-2 font-bold text-slate-400 text-sm w-8 text-center bg-slate-100 rounded">
                                                {curr.dynamicSetting.profitRule.mode === 'PCT_ONLY' ? '%' : '$'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* UNIFIED REFERENTIAL HUB */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                                    <Bank size={14} className="text-blue-500"/> {isVES ? 'Centro de Control de Referencias' : 'Fuentes del Mercado'}
                                </h4>
                                {isVES && <span className="text-[9px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold border border-blue-100 uppercase tracking-widest">Métrica de Transparencia</span>}
                            </div>

                            <div className={isVES ? "grid lg:grid-cols-3 gap-6" : "block"}>
                                {/* MAIN BCV INPUT - ONLY FOR VES */}
                                {isVES && (
                                    <div className="lg:col-span-1 space-y-4">
                                        <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                                            <label className="text-[10px] font-bold text-blue-600 uppercase block mb-2">Tasa Referencial BCV</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={curr.secondaryRate} 
                                                    onChange={e => { const nc = [...config.logistics.currencies]; nc[idx].secondaryRate = Number(e.target.value); updateCurrencies(nc); }} 
                                                    className="w-full p-3 bg-white border border-blue-200 rounded-lg font-mono font-bold text-xl text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                                                />
                                                <span className="absolute right-4 top-4 text-[10px] font-bold text-blue-300 uppercase">VES/$</span>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Impacto en Cliente</p>
                                            <p className="text-xs text-slate-600 leading-relaxed italic">
                                                "Usted recibe un equivalente de <span className="font-bold text-blue-600"> ${(100 * (curr.manualRate / (curr.secondaryRate || 1))).toFixed(2)} BCV </span> por cada $100 netos"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* DYNAMIC REFERENCES (CENTRALIZED) */}
                                <div className={`${isVES ? 'lg:col-span-2' : 'w-full'} bg-slate-50/50 rounded-xl p-4 border border-slate-100`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><ListFilter size={12}/> Fuentes activas para {curr.code}</label>
                                        {curr.rateMode === 'DYNAMIC' && <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">MODO DINÁMICO ACTIVO</span>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {curr.dynamicSetting.references.map((ref, rIdx) => (
                                            <div key={ref.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${ref.isActive ? 'bg-white border-brand-300 shadow-sm ring-2 ring-brand-50' : 'bg-slate-100/50 border-slate-200 opacity-80'}`}>
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={`p-1.5 rounded ${ref.isActive ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                        <TrendingUp size={12}/>
                                                    </div>
                                                    <input 
                                                        value={ref.label} 
                                                        onChange={e => { const nc = [...config.logistics.currencies]; nc[idx].dynamicSetting.references[rIdx].label = e.target.value; updateCurrencies(nc); }} 
                                                        className="bg-transparent text-xs font-bold text-slate-700 border-none p-0 focus:ring-0" 
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="number" 
                                                        step="0.01" 
                                                        value={ref.value} 
                                                        onChange={e => { const nc = [...config.logistics.currencies]; nc[idx].dynamicSetting.references[rIdx].value = Number(e.target.value); updateCurrencies(nc); }} 
                                                        className="w-20 p-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded text-right focus:ring-1 focus:ring-brand-500 outline-none" 
                                                    />
                                                    <button 
                                                        onClick={() => { 
                                                            const nc = [...config.logistics.currencies]; 
                                                            nc[idx].dynamicSetting.references = nc[idx].dynamicSetting.references.map((r, i) => ({...r, isActive: i === rIdx})); 
                                                            updateCurrencies(nc); 
                                                        }} 
                                                        className={`p-1.5 rounded-lg transition-colors ${ref.isActive ? 'bg-brand-100 text-brand-600' : 'bg-white text-slate-300 hover:text-slate-500'}`}
                                                        title="Establecer como fuente principal"
                                                    >
                                                        <CheckCircle size={16}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => { const nc = [...config.logistics.currencies]; nc[idx].dynamicSetting.references = nc[idx].dynamicSetting.references.filter((_, i) => i !== rIdx); updateCurrencies(nc); }}
                                                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => { const nc = [...config.logistics.currencies]; nc[idx].dynamicSetting.references.push({ id: `r-${Date.now()}`, label: 'Nueva Fuente', value: 0, isActive: false }); updateCurrencies(nc); }} 
                                            className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all uppercase tracking-widest"
                                        >
                                            + Agregar Fuente de Mercado
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* NEW MODULE: DYNAMIC PARAMETERS BY AMOUNT */}
                        {curr.rateMode === 'DYNAMIC' && curr.dynamicSetting.profitRule.mode === 'PCT_ONLY' && (
                             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
                                 <div className="flex justify-between items-center mb-4">
                                     <div>
                                         <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2"><SlidersHorizontal size={14}/> Parámetros dinámicos según montos</h4>
                                         <p className="text-[10px] text-slate-500 mt-1">Configure ajustes de tasa automáticos según el volumen de la operación.</p>
                                     </div>
                                     <button 
                                        onClick={() => { 
                                            const nc = [...config.logistics.currencies]; 
                                            if(!nc[idx].dynamicSetting.amountRanges) nc[idx].dynamicSetting.amountRanges = [];
                                            nc[idx].dynamicSetting.amountRanges?.push({ id: `ar-${Date.now()}`, minAmount: 100, maxAmount: 0, adjustmentPct: 0.5, enabled: true }); 
                                            updateCurrencies(nc); 
                                        }} 
                                        className="text-[10px] font-bold text-brand-600 hover:underline bg-brand-50 px-2 py-1 rounded"
                                     >
                                         + Agregar Rango
                                     </button>
                                 </div>

                                 <div className="space-y-2">
                                     <div className="grid grid-cols-12 gap-2 mb-2 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                         <div className="col-span-3">Mínimo ($)</div>
                                         <div className="col-span-3">Máximo ($)</div>
                                         <div className="col-span-3">Mejora (%)</div>
                                         <div className="col-span-3 text-right">Acciones</div>
                                     </div>
                                     {(curr.dynamicSetting.amountRanges || []).map((range, rgIdx) => (
                                         <div key={range.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border ${range.enabled ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 opacity-60 border-transparent'}`}>
                                             <div className="col-span-3">
                                                 <input 
                                                     type="number" 
                                                     value={range.minAmount} 
                                                     onChange={e => { const nc = [...config.logistics.currencies]; if(nc[idx].dynamicSetting.amountRanges) nc[idx].dynamicSetting.amountRanges![rgIdx].minAmount = Number(e.target.value); updateCurrencies(nc); }}
                                                     className="w-full p-1 text-xs border border-slate-200 rounded font-bold text-slate-700"
                                                 />
                                             </div>
                                             <div className="col-span-3">
                                                 <input 
                                                     type="number" 
                                                     value={range.maxAmount} 
                                                     placeholder="∞"
                                                     onChange={e => { const nc = [...config.logistics.currencies]; if(nc[idx].dynamicSetting.amountRanges) nc[idx].dynamicSetting.amountRanges![rgIdx].maxAmount = Number(e.target.value); updateCurrencies(nc); }}
                                                     className="w-full p-1 text-xs border border-slate-200 rounded font-bold text-slate-700 placeholder:text-slate-400"
                                                 />
                                             </div>
                                             <div className="col-span-3 flex items-center gap-1">
                                                 <span className="text-green-600 font-bold text-xs">+</span>
                                                 <input 
                                                     type="number" 
                                                     step="0.1"
                                                     value={range.adjustmentPct} 
                                                     onChange={e => { const nc = [...config.logistics.currencies]; if(nc[idx].dynamicSetting.amountRanges) nc[idx].dynamicSetting.amountRanges![rgIdx].adjustmentPct = Number(e.target.value); updateCurrencies(nc); }}
                                                     className="w-full p-1 text-xs border border-slate-200 rounded font-bold text-green-700"
                                                 />
                                                 <span className="text-[10px] text-slate-400">%</span>
                                             </div>
                                             <div className="col-span-3 flex justify-end gap-2">
                                                 <button 
                                                     onClick={() => { const nc = [...config.logistics.currencies]; if(nc[idx].dynamicSetting.amountRanges) nc[idx].dynamicSetting.amountRanges![rgIdx].enabled = !range.enabled; updateCurrencies(nc); }}
                                                     className={`p-1 rounded transition-colors ${range.enabled ? 'text-green-600 hover:bg-green-100' : 'text-slate-400 hover:bg-slate-200'}`}
                                                 >
                                                     <Power size={14}/>
                                                 </button>
                                                 <button 
                                                     onClick={() => { const nc = [...config.logistics.currencies]; if(nc[idx].dynamicSetting.amountRanges) nc[idx].dynamicSetting.amountRanges = nc[idx].dynamicSetting.amountRanges!.filter((_, i) => i !== rgIdx); updateCurrencies(nc); }}
                                                     className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                                 >
                                                     <Trash2 size={14}/>
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                     {(curr.dynamicSetting.amountRanges || []).length === 0 && (
                                         <div className="text-center py-4 text-xs text-slate-400 italic bg-slate-50 rounded border border-dashed border-slate-200">
                                             No hay rangos configurados. La tasa será plana.
                                         </div>
                                     )}
                                 </div>
                             </div>
                        )}

                        {/* MÉTODOS DE PAGO */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2"><CreditCard size={14}/> Bancos y Pasarelas ({curr.code})</h4>
                                <button onClick={() => { const nc = [...config.logistics.currencies]; nc[idx].methods.push({ id: `m-${Date.now()}`, name: 'Nuevo Banco', enabled: true, commission: { pct: 0, fixed: 0, enabled: false } }); updateCurrencies(nc); }} className="text-[10px] font-bold text-brand-600 hover:underline">+ Agregar</button>
                            </div>
                            <div className="space-y-2">
                                {curr.methods.map((method, mIdx) => (
                                    <div key={method.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-400">
                                                <Bank size={14}/>
                                            </div>
                                            <input value={method.name} onChange={e => { const nc = [...config.logistics.currencies]; nc[idx].methods[mIdx].name = e.target.value; updateCurrencies(nc); }} className="bg-transparent text-sm font-bold text-slate-700 focus:ring-0 border-none p-0 w-2/3" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => { const nc = [...config.logistics.currencies]; nc[idx].methods[mIdx].enabled = !method.enabled; updateCurrencies(nc); }} className={`px-2 py-1 rounded text-[10px] font-black tracking-tighter transition-all ${method.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>{method.enabled ? 'ACTIVO' : 'PAUSADO'}</button>
                                            <button onClick={() => { const nc = [...config.logistics.currencies]; nc[idx].methods = nc[idx].methods.filter((_, i) => i !== mIdx); updateCurrencies(nc); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* PREVENT DELETE FOR VES */}
                        {!isVES && (
                            <div className="flex justify-end pt-4">
                                <button onClick={() => { const nc = config.logistics.currencies.filter((_, i) => i !== idx); updateCurrencies(nc); setExpandedIndex(null); }} className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"><Trash2 size={14}/> Eliminar Divisa Completa</button>
                            </div>
                        )}
                     </div>
                  )}
               </div>
            );
         })}
      </div>
   );
};

// 2. INTERNAL COSTS & PROFIT
const LogisticsInternalCosts = ({ config, onUpdate }: { config: SystemConfig, onUpdate: (c: Partial<SystemConfig>) => void }) => {
   const updateCosts = (newCosts: CostGroup[]) => onUpdate({ logistics: { ...config.logistics, costs: newCosts } });

   return (
      <div className="space-y-6 animate-fadeIn">
         <div className="flex justify-between items-end">
             <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Tarifas y Costos Internos</h3>
                <p className="text-xs text-slate-500">Define los gastos operativos que afectan la rentabilidad neta.</p>
             </div>
             <button onClick={() => updateCosts([...config.logistics.costs, { id: `g-${Date.now()}`, label: 'Nuevo Grupo de Costos', items: [] }])} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800"><Plus size={16}/> Nuevo Grupo</button>
         </div>

         {config.logistics.costs.map((group, gIdx) => (
             <div key={group.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                    <input value={group.label} onChange={e => { const nc = [...config.logistics.costs]; nc[gIdx].label = e.target.value; updateCosts(nc); }} className="bg-transparent font-bold text-sm text-slate-700 focus:ring-0 border-none p-0 w-2/3" />
                    {/* FIXED: USE GROUP.ID INSTEAD OF INDEX FOR DELETION */}
                    <button type="button" onClick={() => { if(confirm('¿Eliminar grupo completo?')) updateCosts(config.logistics.costs.filter(g => g.id !== group.id)); }} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
                <div className="p-5 space-y-4">
                    {group.items.map((item, iIdx) => (
                        <div key={item.id} className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                           <div className="flex-1 min-w-[150px]">
                               <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Concepto</label>
                               <input value={item.label} onChange={e => { const nc = [...config.logistics.costs]; nc[gIdx].items[iIdx].label = e.target.value; updateCosts(nc); }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs" />
                           </div>
                           <div className="w-24">
                               <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Clasificación</label>
                               <select value={item.category} onChange={e => { const nc = [...config.logistics.costs]; nc[gIdx].items[iIdx].category = e.target.value as any; updateCosts(nc); }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold">
                                   <option value="DEDUCTIVE">Deductivo</option>
                                   <option value="ADDITIVE">Aditivo</option>
                               </select>
                           </div>
                           <div className="w-24">
                               <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Valor</label>
                               <input type="number" step="0.01" value={item.value} onChange={e => { const nc = [...config.logistics.costs]; nc[gIdx].items[iIdx].value = Number(e.target.value); updateCosts(nc); }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono" />
                           </div>
                           <div className="w-16">
                               <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tipo</label>
                               <select value={item.type} onChange={e => { const nc = [...config.logistics.costs]; nc[gIdx].items[iIdx].type = e.target.value as any; updateCosts(nc); }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold">
                                   <option value="PCT">%</option>
                                   <option value="FIXED">$</option>
                               </select>
                           </div>
                           {/* TOGGLE FOR CLIENT CHARGEABLE - ONLY FOR DEDUCTIVE */}
                           {item.category === 'DEDUCTIVE' && (
                               <div className="flex flex-col items-center justify-center w-24">
                                   <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 text-center">Gravable</label>
                                   <button 
                                      onClick={() => { const nc = [...config.logistics.costs]; nc[gIdx].items[iIdx].isClientChargeable = !(item.isClientChargeable !== false); updateCosts(nc); }}
                                      className={`px-2 py-1 text-[9px] font-bold rounded border transition-colors ${item.isClientChargeable !== false ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}
                                      title={item.isClientChargeable !== false ? 'El cliente paga este costo (Reduce su monto)' : 'La empresa absorbe este costo (Reduce rentabilidad)'}
                                   >
                                       {item.isClientChargeable !== false ? 'SI (Cliente)' : 'NO (Admin)'}
                                   </button>
                               </div>
                           )}
                           <div className="flex items-center gap-2 pt-4">
                               <button onClick={() => { const nc = [...config.logistics.costs]; nc[gIdx].items[iIdx].enabled = !item.enabled; updateCosts(nc); }} className={`p-1 rounded ${item.enabled ? 'text-green-600 bg-green-50' : 'text-slate-300 bg-slate-100'}`}><Power size={14}/></button>
                               <button onClick={() => { const nc = [...config.logistics.costs]; nc[gIdx].items = nc[gIdx].items.filter((_, i) => i !== iIdx); updateCosts(nc); }} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                           </div>
                        </div>
                    ))}
                    <button onClick={() => { const nc = [...config.logistics.costs]; nc[gIdx].items.push({ id: `i-${Date.now()}`, label: 'Nuevo Gasto', type: 'PCT', category: 'DEDUCTIVE', value: 0, enabled: true, isClientChargeable: true }); updateCosts(nc); }} className="w-full border-2 border-dashed border-slate-200 rounded-lg py-3 text-xs font-bold text-slate-400 hover:border-brand-200 hover:text-brand-600 transition-colors">+ Agregar Item de Costo</button>
                </div>
             </div>
         ))}
      </div>
   );
};

// 3. COUPONS MANAGEMENT
const LogisticsCoupons = ({ config, onUpdate }: { config: SystemConfig, onUpdate: (c: Partial<SystemConfig>) => void }) => {
   const updateCoupons = (newCoupons: Coupon[]) => onUpdate({ logistics: { ...config.logistics, coupons: newCoupons } });

   return (
      <div className="space-y-6 animate-fadeIn">
         <div className="flex justify-between items-end">
             <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Gestión de Cupones</h3>
                <p className="text-xs text-slate-500">Administra códigos promocionales y beneficios para clientes.</p>
             </div>
             <button onClick={() => updateCoupons([...config.logistics.coupons, { id: `cp-${Date.now()}`, code: 'NUEVO', category: 'CLIENT', type: 'GLOBAL_PROMO', active: true, clientDiscount: { type: 'FIXED', value: 1 } }])} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800"><Plus size={16}/> Crear Cupón</button>
         </div>

         <div className="grid md:grid-cols-2 gap-4">
             {config.logistics.coupons.map((coupon, idx) => (
                 <div key={coupon.id} className={`bg-white p-5 rounded-xl border shadow-sm flex items-start gap-4 relative overflow-hidden transition-all ${coupon.active ? 'border-green-200 bg-green-50/10' : 'border-slate-200 opacity-60'}`}>
                    <div className={`p-3 rounded-lg ${coupon.active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Ticket size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <input value={coupon.code} onChange={e => { const nc = [...config.logistics.coupons]; nc[idx].code = e.target.value.toUpperCase(); updateCoupons(nc); }} className="bg-transparent font-black text-lg tracking-widest text-slate-800 border-none p-0 w-2/3 focus:ring-0 uppercase" />
                            <div className="flex gap-2">
                                <button onClick={() => { const nc = [...config.logistics.coupons]; nc[idx].active = !coupon.active; updateCoupons(nc); }} className={`p-1.5 rounded-lg border transition-colors ${coupon.active ? 'bg-green-500 text-white border-green-600' : 'bg-slate-200 text-slate-600 border-slate-300'}`}><Power size={14}/></button>
                                <button onClick={() => { if(confirm('¿Eliminar cupón?')) updateCoupons(config.logistics.coupons.filter((_, i) => i !== idx)); }} className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Beneficio (Cliente recibe +)</label>
                                <div className="flex gap-2">
                                    <input type="number" value={coupon.clientDiscount.value} onChange={e => { const nc = [...config.logistics.coupons]; nc[idx].clientDiscount.value = Number(e.target.value); updateCoupons(nc); }} className="w-16 p-1 text-xs border border-slate-200 rounded font-bold" />
                                    <select value={coupon.clientDiscount.type} onChange={e => { const nc = [...config.logistics.coupons]; nc[idx].clientDiscount.type = e.target.value as any; updateCoupons(nc); }} className="flex-1 p-1 text-[10px] border border-slate-200 rounded font-bold">
                                        <option value="FIXED">Dólares Fijos ($)</option>
                                        <option value="PCT">Porcentaje (%)</option>
                                    </select>
                                </div>
                            </div>
                            <input value={coupon.description || ''} placeholder="Descripción del beneficio..." onChange={e => { const nc = [...config.logistics.coupons]; nc[idx].description = e.target.value; updateCoupons(nc); }} className="w-full text-[10px] p-2 bg-white border border-slate-100 rounded italic text-slate-500" />
                        </div>
                    </div>
                 </div>
             ))}
         </div>
      </div>
   );
};

export const AdminDashboard: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [currentTab, setCurrentTab] = useState('OVERVIEW');
  const [logisticsSubTab, setLogisticsSubTab] = useState('GATEWAYS');
  const [config, setConfig] = useState<SystemConfig>(MockBackend.getConfig());
  const [transactions, setTransactions] = useState<Transaction[]>(MockBackend.getTransactions());
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
      const i = setInterval(() => {
          setTransactions(MockBackend.getTransactions());
      }, 5000);
      return () => clearInterval(i);
  }, []);

  const handleUpdateConfig = (partial: Partial<SystemConfig>) => {
      const updated = MockBackend.updateConfig(partial);
      setConfig(updated);
  };

  const navItems = [
      { id: 'OVERVIEW', label: 'Panel Principal', icon: LayoutGrid },
      { id: 'TRANSACTIONS', label: 'Operaciones', icon: FileText },
      { id: 'LOGISTICS', label: 'Logística y Tasas', icon: Calculator },
      { id: 'CUSTOMERS', label: 'Clientes', icon: Users },
      { id: 'MESSAGES', label: 'Mensajes', icon: MessageCircle },
      { id: 'DESIGN', label: 'Diseño y Redes', icon: Palette },
  ];

  return (
      <div className="min-h-screen bg-slate-100 flex">
          <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-10 shadow-2xl`}>
               <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                   {isSidebarOpen && <span className="font-bold text-lg tracking-tight">tudinero<span className="text-brand-500">mueve</span></span>}
                   <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Menu size={20}/></button>
               </div>
               
               <div className="flex-1 py-6 space-y-1 px-2">
                   {navItems.map(item => (
                       <button 
                           key={item.id}
                           onClick={() => setCurrentTab(item.id)}
                           className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${currentTab === item.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                       >
                           <item.icon size={20} className={currentTab === item.id ? 'text-white' : ''}/>
                           {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                       </button>
                   ))}
               </div>
               
               <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-brand-500 font-bold border border-slate-700">
                           {currentUser.fullName[0]}
                       </div>
                       {isSidebarOpen && (
                           <div className="overflow-hidden">
                               <p className="text-sm font-bold truncate">{currentUser.fullName}</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentUser.role}</p>
                           </div>
                       )}
                   </div>
               </div>
          </aside>

          <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
               {currentTab === 'OVERVIEW' && (
                   <div className="space-y-6 animate-fadeIn">
                       <header className="flex justify-between items-center mb-8">
                           <div>
                               <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Panel Principal</h1>
                               <p className="text-slate-500 text-sm">Resumen global de actividad financiera.</p>
                           </div>
                           <button onClick={() => setTransactions(MockBackend.getTransactions())} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-brand-600 transition-colors shadow-sm"><RefreshCw size={18}/></button>
                       </header>
                       
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                           <StatCard icon={Activity} label="Operaciones Hoy" value={transactions.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length.toString()} color="blue" />
                           <StatCard icon={Clock} label="En Verificación" value={transactions.filter(t => t.status === 'VERIFYING').length.toString()} color="orange" />
                           <StatCard icon={DollarSign} label="Volumen Total" value={`$${transactions.reduce((acc, t) => acc + t.amountIn, 0).toLocaleString()}`} color="green" />
                           <StatCard icon={Users} label="Clientes Activos" value={MockBackend.getUsers().filter(u => u.role === 'CLIENT').length.toString()} color="purple" />
                       </div>

                       {/* RECENT ACTIVITY PREVIEW */}
                       <div className="grid lg:grid-cols-2 gap-6 mt-12">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-brand-600"/> Últimas Operaciones</h3>
                                <div className="space-y-3">
                                    {transactions.slice(0, 5).map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setCurrentTab('TRANSACTIONS')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-400">#{tx.id.slice(-4)}</div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{tx.clientName}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold">{tx.status}</p>
                                                </div>
                                            </div>
                                            <span className="font-mono font-bold text-brand-600 text-sm">${tx.amountIn}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <TrendingUp size={48} className="text-brand-100 mb-4"/>
                                <h3 className="font-bold text-slate-800">Análisis de Mercado</h3>
                                <p className="text-xs text-slate-400 max-w-xs mt-2">El volumen de transacciones ha aumentado un 12% respecto a la semana anterior.</p>
                                <button onClick={() => setCurrentTab('LOGISTICS')} className="mt-6 text-brand-600 font-bold text-sm hover:underline flex items-center gap-1">Gestionar Tasas <ArrowRight size={14}/></button>
                            </div>
                       </div>
                   </div>
               )}

               {currentTab === 'LOGISTICS' && (
                   <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                       <div className="lg:col-span-2 space-y-6">
                           <SectionHeader title="Logística Financiera" description="Administra la infraestructura de tasas, costos y promociones." />
                           
                           {/* LOGISTICS SUB-NAVIGATION */}
                           <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm mb-6 w-full overflow-x-auto">
                               <button 
                                   onClick={() => setLogisticsSubTab('GATEWAYS')}
                                   className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${logisticsSubTab === 'GATEWAYS' ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-slate-500 hover:bg-slate-50'}`}
                               >
                                   <Coins size={16}/> Tasas y Pasarelas
                               </button>
                               <button 
                                   onClick={() => setLogisticsSubTab('COSTS')}
                                   className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${logisticsSubTab === 'COSTS' ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-slate-500 hover:bg-slate-50'}`}
                               >
                                   <Layers size={16}/> Costos Internos
                               </button>
                               <button 
                                   onClick={() => setLogisticsSubTab('COUPONS')}
                                   className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${logisticsSubTab === 'COUPONS' ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-slate-500 hover:bg-slate-50'}`}
                               >
                                   <Ticket size={16}/> Cupones
                               </button>
                           </div>

                           <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200/50 min-h-[500px]">
                               {logisticsSubTab === 'GATEWAYS' && <LogisticsGateways config={config} onUpdate={handleUpdateConfig} />}
                               {logisticsSubTab === 'COSTS' && <LogisticsInternalCosts config={config} onUpdate={handleUpdateConfig} />}
                               {logisticsSubTab === 'COUPONS' && <LogisticsCoupons config={config} onUpdate={handleUpdateConfig} />}
                           </div>
                       </div>
                       <div className="lg:col-span-1">
                           <InternalSimulator config={config} />
                           
                           <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                               <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                   <ShieldAlert size={14} className="text-orange-500"/> Recomendaciones
                               </h4>
                               <ul className="space-y-3">
                                   <li className="text-[10px] text-slate-500 border-l-2 border-orange-200 pl-3 py-1">Mantenga el spread operativo por encima del 5% para garantizar rentabilidad tras comisiones de PayPal.</li>
                                   <li className="text-[10px] text-slate-500 border-l-2 border-brand-200 pl-3 py-1">Verifique la tasa P2P cada 4 horas para asegurar competitividad en el mercado VES.</li>
                               </ul>
                           </div>
                       </div>
                   </div>
               )}

               {currentTab === 'TRANSACTIONS' && (
                   <div className="space-y-6 animate-fadeIn">
                       <SectionHeader title="Control de Operaciones" description="Seguimiento detallado de ingresos, egresos y verificaciones." />
                       <TransactionsTable transactions={transactions} onUpdate={() => setTransactions(MockBackend.getTransactions())} />
                   </div>
               )}
               
               {currentTab === 'MESSAGES' && (
                   <div className="space-y-6 animate-fadeIn">
                       <SectionHeader title="Centro de Mensajería" description="Gestión de leads y consultas de clientes directos." />
                       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                           <table className="w-full text-sm text-left">
                               <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                   <tr>
                                       <th className="px-6 py-4">Fecha</th>
                                       <th className="px-6 py-4">Información de Contacto</th>
                                       <th className="px-6 py-4">Asunto</th>
                                       <th className="px-6 py-4">Vista Previa</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                   {MockBackend.getMessages().map(msg => (
                                       <tr key={msg.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                           <td className="px-6 py-5 text-slate-500 text-xs font-medium">{new Date(msg.date).toLocaleDateString()}</td>
                                           <td className="px-6 py-5">
                                               <p className="font-bold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">{msg.fullName}</p>
                                               <p className="text-[10px] text-slate-400 font-mono mt-0.5">{msg.email}</p>
                                           </td>
                                           <td className="px-6 py-5">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold border border-slate-200">{msg.subject}</span>
                                           </td>
                                           <td className="px-6 py-5 text-slate-500 text-xs italic max-w-xs truncate">{msg.message}</td>
                                       </tr>
                                   ))}
                                   {MockBackend.getMessages().length === 0 && (
                                       <tr><td colSpan={4} className="text-center py-20 text-slate-400 italic">No se han recibido mensajes de contacto.</td></tr>
                                   )}
                               </tbody>
                           </table>
                       </div>
                   </div>
               )}

               {currentTab === 'DESIGN' && (
                  <div className="space-y-6 animate-fadeIn max-w-5xl">
                     <SectionHeader title="Gestión de Marca y Canales" description="Personalización del sitio web y redes sociales oficiales." />
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                                <Share2 size={20} className="text-brand-600"/> Enlaces de Redes Sociales
                            </h3>
                            <div className="space-y-4">
                                {(config.design.socialLinks || []).map((link, idx) => (
                                    <div key={link.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 group hover:border-brand-200 transition-all">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <select 
                                                    value={link.platform} 
                                                    onChange={(e) => {
                                                        const links = [...config.design.socialLinks];
                                                        links[idx].platform = e.target.value as any;
                                                        handleUpdateConfig({ design: { ...config.design, socialLinks: links } });
                                                    }}
                                                    className="bg-white text-[10px] font-bold uppercase p-1 rounded border border-slate-200 focus:ring-0"
                                                >
                                                    <option value="WHATSAPP">WhatsApp</option>
                                                    <option value="INSTAGRAM">Instagram</option>
                                                    <option value="TWITTER">X / Twitter</option>
                                                    <option value="FACEBOOK">Facebook</option>
                                                    <option value="EMAIL">Email</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { const l = [...config.design.socialLinks]; l[idx].enabled = !link.enabled; handleUpdateConfig({ design: { ...config.design, socialLinks: l } }); }} className={`p-1.5 rounded-lg transition-colors ${link.enabled ? 'text-green-600 bg-green-100' : 'text-slate-400 bg-slate-100'}`}><Power size={14}/></button>
                                                <button onClick={() => { handleUpdateConfig({ design: { ...config.design, socialLinks: config.design.socialLinks.filter((_, i) => i !== idx) } }); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input value={link.label} onChange={e => { const l = [...config.design.socialLinks]; l[idx].label = e.target.value; handleUpdateConfig({ design: { ...config.design, socialLinks: l } }); }} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" placeholder="Etiqueta" />
                                            <input value={link.url} onChange={e => { const l = [...config.design.socialLinks]; l[idx].url = e.target.value; handleUpdateConfig({ design: { ...config.design, socialLinks: l } }); }} className="text-xs p-2 bg-white border border-slate-200 rounded-lg" placeholder="URL / Link" />
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => handleUpdateConfig({ design: { ...config.design, socialLinks: [...(config.design.socialLinks || []), { id: `s-${Date.now()}`, platform: 'WHATSAPP', label: 'Nuevo Enlace', url: '', enabled: true }] } })}
                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:border-brand-600 hover:text-brand-600 transition-all"
                                >
                                    + Agregar Nuevo Canal
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-center items-center text-center shadow-xl shadow-slate-200">
                            <Palette size={48} className="text-brand-500 mb-4 opacity-50"/>
                            <h3 className="text-xl font-bold mb-2">Identidad Corporativa</h3>
                            <p className="text-sm text-slate-400 mb-6 max-w-xs">Configura los elementos visuales que definen la marca en el landing page.</p>
                            <div className="w-full space-y-4">
                                <div className="text-left">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Título Hero</label>
                                    <input value={config.design.heroTitle} onChange={e => handleUpdateConfig({ design: { ...config.design, heroTitle: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs focus:ring-1 focus:ring-brand-500 outline-none" />
                                </div>
                                <div className="text-left">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Descripción Hero</label>
                                    <textarea value={config.design.heroSubtitle} onChange={e => handleUpdateConfig({ design: { ...config.design, heroSubtitle: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs focus:ring-1 focus:ring-brand-500 outline-none h-20" />
                                </div>
                            </div>
                        </div>
                     </div>
                  </div>
               )}

               {currentTab === 'CUSTOMERS' && (
                   <div className="animate-fadeIn text-center py-40">
                       <Users size={64} className="mx-auto mb-6 text-slate-200"/>
                       <h2 className="text-xl font-bold text-slate-400">Base de Datos de Clientes</h2>
                       <p className="text-slate-400 max-w-md mx-auto mt-2">Próximamente: Historial de perfiles, sistema de KYC y gestión de billeteras externas de clientes.</p>
                   </div>
               )}
          </main>
      </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => {
    const colorClasses: any = {
        blue: 'bg-blue-600 text-white shadow-blue-100',
        orange: 'bg-orange-500 text-white shadow-orange-100',
        green: 'bg-green-600 text-white shadow-green-100',
        purple: 'bg-purple-600 text-white shadow-purple-100'
    };
    return (
        <div className={`p-6 rounded-3xl shadow-xl transition-transform hover:-translate-y-1 ${colorClasses[color] || 'bg-white'}`}>
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} />
            </div>
            <p className="opacity-80 text-[10px] font-bold uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black mt-1">{value}</p>
        </div>
    );
};

const TransactionsTable = ({ transactions, onUpdate }: { transactions: Transaction[], onUpdate: () => void }) => {
    const handleStatus = (id: string, status: TransactionStatus, reason?: string) => {
        MockBackend.updateTransactionStatus(id, status, status === 'PROCESSING' ? 15 : undefined, reason);
        onUpdate();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Ref / Fecha</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Operación</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Flujo de Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-5">
                                    <span className="font-mono font-bold text-slate-800 block text-sm group-hover:text-brand-600 transition-colors">#{tx.id.slice(-6)}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="font-bold text-slate-700">{tx.clientName}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Verificación Pendiente</p>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700">${tx.amountIn}</span>
                                        <ArrowRight size={12} className="text-slate-300"/>
                                        <span className="font-black text-brand-600 text-lg">{tx.amountOut.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono">Tasa: {tx.rateApplied}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-500' : tx.status === 'VERIFYING' ? 'bg-purple-500 animate-pulse' : 'bg-yellow-400'}`}></div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                                            tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {tx.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right space-x-2">
                                    {tx.status === 'PENDING' && (
                                        <button onClick={() => handleStatus(tx.id, 'INVOICE_SENT')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-lg shadow-slate-100 flex-inline items-center gap-2"><Send size={12}/> Emitir Factura</button>
                                    )}
                                    {tx.status === 'VERIFYING' && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleStatus(tx.id, 'PROCESSING')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-100">Confirmar Pago</button>
                                            <button onClick={() => { const r = prompt('Razón de rechazo:'); if(r) handleStatus(tx.id, 'INVOICE_SENT', r); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">Rechazar</button>
                                        </div>
                                    )}
                                    {tx.status === 'PROCESSING' && (
                                        <button onClick={() => handleStatus(tx.id, 'COMPLETED')} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 flex-inline items-center gap-2"><CheckCircle size={12}/> Marcar Finalizada</button>
                                    )}
                                    {tx.status === 'COMPLETED' && (
                                        <button className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"><FileText size={16}/></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};