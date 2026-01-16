
import React, { useState, useEffect } from 'react';
import { 
  Settings, RefreshCw, Send, Play, CheckCircle, Clock, 
  Users, DollarSign, TrendingUp, ShieldAlert, Activity, FileText,
  Plus, Trash2, ToggleLeft, ToggleRight, Lock, Menu, X, Tag, CreditCard, LayoutGrid, Info, Calendar, Save, Download, Printer,
  ChevronDown, Power, Layout, Edit3, ImageIcon, Globe, MessageCircle, BarChart3, Shield, Zap, Wallet, Search, Filter,
  Gift, Percent, UserPlus, Eye, Coins, Landmark, Mail, Phone, ChevronRight, UserCog, Share2, Copy, Calculator, Link, TrendingDown,
  ArrowRight, ArrowLeft, Palette, ExternalLink, Layers, Ticket, Landmark as Bank, ListFilter, SlidersHorizontal, Settings2, Box, ArrowLeftRight,
  MessageSquare, MoreHorizontal, AlertCircle, Bell, LogOut, ChevronUp, Briefcase, HelpCircle, Check, ShieldCheck, ChevronLeft, LayoutDashboard,
  Smartphone, Bitcoin
} from 'lucide-react';
import { Transaction, User, TransactionStatus, SystemConfig, CostGroup, AdminLevel, CurrencyConfig, PaymentMethodConfig, Coupon, ScheduleConfig, ServiceItem, BudgetTheme, ReferenceItem, SocialLink, CostItem, GatewayProfile, OperationProfile, AmountRangeRule, ContactMessage, AuditLog } from '../types';
import { MockBackend } from '../services/mockBackend';

// --- UI ATOMS & COMPONENTS ---

interface BadgeProps {
    children?: React.ReactNode;
    color?: "slate"|"brand"|"green"|"red"|"blue"|"orange"|"purple";
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, color = "slate", className="" }) => {
    const colors = {
        slate: "bg-slate-100 text-slate-600 border-slate-200",
        brand: "bg-brand-50 text-brand-700 border-brand-100",
        green: "bg-emerald-50 text-emerald-700 border-emerald-100",
        red: "bg-rose-50 text-rose-700 border-rose-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        orange: "bg-orange-50 text-orange-700 border-orange-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${colors[color]} ${className}`}>{children}</span>
};

interface CardProps { children?: React.ReactNode; className?: string; noPadding?: boolean; title?: string; subtitle?: string; action?: React.ReactNode }
const Card: React.FC<CardProps> = ({ children, className = "", noPadding = false, title, subtitle, action }) => (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col ${className}`}>
        {(title || action) && (
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                    {title && <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">{title}</h3>}
                    {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
        )}
        <div className={noPadding ? "flex-1" : "p-5 flex-1"}>{children}</div>
    </div>
);

// --- SIMULATOR WIDGET (DARK MODE / ADVANCED) ---

const SimulatorWidget = ({ config, activeGatewaySlug, activeMode }: { config: SystemConfig, activeGatewaySlug: string, activeMode: 'BUY' | 'SELL' }) => {
   const [simAmount, setSimAmount] = useState(100);
   const [couponCode, setCouponCode] = useState('');
   const [currency, setCurrency] = useState('VES');
   const [result, setResult] = useState<any>(null);

   const activeGateway = config.logistics.gatewayProfiles.find(g => g.slug === activeGatewaySlug);
   const activeProfile = MockBackend.getActiveProfile(activeGatewaySlug, activeMode);

   useEffect(() => {
      setResult(MockBackend.calculateQuote(simAmount, currency, undefined, couponCode, activeGatewaySlug, activeMode));
   }, [simAmount, couponCode, currency, config, activeGatewaySlug, activeMode]);

   if (!result || !activeProfile || !activeGateway) return <Card className="h-full items-center justify-center text-slate-400 text-xs"><span>Iniciando motor financiero...</span></Card>;

   const isVES = currency === 'VES';
   const profit = result.internalStats?.netProfitUSD || 0;

   // Dynamic Labels
   const gatewayLabel = activeGatewaySlug;
   const modeLabel = activeMode === 'SELL' ? 'Venta (In)' : 'Recarga (Out)';

   return (
      <div className="sticky top-6 space-y-4 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1 pb-4 custom-scrollbar">
        {/* DARK CARD - SIMULATOR */}
        <div className="bg-[#0f172a] text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 shrink-0">
            {/* Header */}
            <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-brand-400"/>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Simulador: {gatewayLabel}</span>
                </div>
                <Badge color="brand" className="bg-slate-800 text-brand-400 border-slate-700">{modeLabel}</Badge>
            </div>

            <div className="p-5 space-y-5">
                {/* Inputs */}
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Monto ({gatewayLabel})</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 font-bold">$</span>
                        <input 
                            type="number" 
                            value={simAmount} 
                            onChange={(e) => setSimAmount(Number(e.target.value))} 
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-sm font-mono font-bold text-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Divisa Destino</label>
                        <select 
                            value={currency} 
                            onChange={e => setCurrency(e.target.value)} 
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-1.5 text-xs font-bold text-white outline-none focus:border-brand-500"
                        >
                            {activeProfile.currencies.filter(c => c.enabled).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Cupón</label>
                        <input 
                            value={couponCode} 
                            onChange={(e) => setCouponCode(e.target.value)} 
                            placeholder="CODE"
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-1.5 text-xs uppercase text-white outline-none focus:border-brand-500 placeholder:text-slate-600" 
                        />
                     </div>
                </div>

                {/* Breakdown Table */}
                <div className="border-t border-slate-800 pt-3 space-y-1.5">
                     <div className="flex justify-between text-xs text-slate-400">
                         <span>Monto Bruto ({gatewayLabel})</span>
                         <span className="font-mono text-white">${simAmount.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-xs text-slate-400">
                         <span>- Comisión {gatewayLabel}</span>
                         <span className="font-mono text-red-400 font-bold">${result.externalGatewayFee.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold text-white pt-1 border-t border-slate-800/50">
                         <span>Neto {gatewayLabel}</span>
                         <span className="font-mono">${result.netGateway.toFixed(2)}</span>
                     </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 space-y-1.5 border border-slate-800">
                     <div className="flex justify-between text-[10px] text-slate-400">
                         <span>- Deducciones Operativas</span>
                         <span className="font-mono text-red-400">-${(result.opsDeductions - result.externalGatewayFee).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-[11px] font-bold text-emerald-400">
                         <span>Base de Intercambio</span>
                         <span className="font-mono">${result.baseForExchange.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-[10px] text-slate-400">
                         <span>Margen Servicio (Est.)</span>
                         <span className="font-mono text-amber-500">~${profit.toFixed(2)}</span>
                     </div>
                </div>

                {/* Final Result */}
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500 rounded-full blur-2xl opacity-10"></div>
                    
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Cliente Recibe</p>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-extrabold text-white tracking-tight">{result.finalAmount.toFixed(2)}</span>
                        <span className="text-sm font-bold text-slate-500">{isVES ? 'VES' : currency}</span>
                    </div>
                    <div className="flex justify-end items-center gap-2">
                        <span className="text-[10px] text-slate-400">Tasa:</span>
                        <span className="text-sm font-mono font-bold text-brand-400">{result.rate.toFixed(2)}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                        <div>
                            <span className="block opacity-60">Neto a Procesar:</span>
                            <span className="text-white font-mono font-bold">${result.netInternalReceipt.toFixed(2)}</span>
                        </div>
                         <div className="text-right">
                            <span className="block opacity-60">Equivalente $ BCV:</span>
                            <span className="text-white font-mono font-bold">${result.bcvEquivalent.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Profit Badge */}
                <div className={`flex items-center justify-center p-2 rounded-lg text-xs font-bold border ${profit >= 0 ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400' : 'bg-red-950/30 border-red-900 text-red-400'}`}>
                    Rentabilidad Neta: ${profit.toFixed(2)}
                </div>
                <p className="text-[9px] text-center text-slate-500">* Simulador operativo. Valores aproximados.</p>
            </div>
        </div>

        {/* RECOMMENDATIONS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 shrink-0">
            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase mb-3">
                <ShieldCheck size={14} className="text-orange-500"/> Recomendaciones
            </h4>
            <ul className="space-y-2">
                <li className="text-[11px] text-slate-500 leading-relaxed border-l-2 border-orange-200 pl-2">
                    Verifique si la comisión de {gatewayLabel} ha cambiado recientemente.
                </li>
                <li className="text-[11px] text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-2">
                    La tasa {activeMode === 'SELL' ? 'Venta' : 'Compra'} debe cubrir costos de reposición.
                </li>
            </ul>
        </div>
      </div>
   );
};

// --- LOGISTICS ENGINE (THE CORE) ---

const LogisticsEngine = ({ config, onUpdateConfig }: { config: SystemConfig, onUpdateConfig: (c: SystemConfig) => void }) => {
    const [activeGatewaySlug, setActiveGatewaySlug] = useState('PAYPAL');
    const [activeMode, setActiveMode] = useState<'BUY'|'SELL'>('SELL');
    const [activeTab, setActiveTab] = useState<'RATES'|'COSTS'|'COUPONS'>('RATES');
    const [isAddingGateway, setIsAddingGateway] = useState(false);
    const [newGatewayName, setNewGatewayName] = useState('');

    // Deep update helper for the Active Profile (Bottom Section)
    const updateActiveProfile = (updatedProfile: OperationProfile) => {
        const newGateways = config.logistics.gatewayProfiles.map(g => {
            if (g.slug !== activeGatewaySlug) return g;
            return {
                ...g,
                sellProfiles: activeMode === 'SELL' ? g.sellProfiles.map(p => p.id === updatedProfile.id ? updatedProfile : p) : g.sellProfiles,
                buyProfiles: activeMode === 'BUY' ? g.buyProfiles.map(p => p.id === updatedProfile.id ? updatedProfile : p) : g.buyProfiles,
            };
        });
        onUpdateConfig({ ...config, logistics: { ...config.logistics, gatewayProfiles: newGateways } });
    };

    // Helper to Add New Gateway
    const handleAddGateway = () => {
        if(!newGatewayName.trim()) return;
        
        // Generate defaults for the new gateway
        const slug = newGatewayName.toUpperCase().replace(/\s+/g, '_');
        
        const defaultCurrency = {
            code: 'VES', name: 'Bolívares', enabled: true, rateMode: 'MANUAL' as const, manualRate: 1, dynamicSetting: { references: [], profitRule: { mode: 'PCT_ONLY' as const, pct: 5, fixed: 0 }, amountRanges: [] }, methods: []
        };
        const defaultProfile = {
            id: `prof-${Date.now()}`, name: 'Perfil Estándar', active: true,
            currencies: [defaultCurrency],
            costs: [],
            coupons: []
        };

        const newGateway: GatewayProfile = {
            id: `gw-${Date.now()}`,
            slug,
            label: newGatewayName,
            iconName: 'CreditCard',
            enabled: true,
            sellProfiles: [{...defaultProfile, id: `prof-sell-${Date.now()}`}],
            buyProfiles: [{...defaultProfile, id: `prof-buy-${Date.now()}`}]
        };

        onUpdateConfig({ 
            ...config, 
            logistics: { 
                ...config.logistics, 
                gatewayProfiles: [...config.logistics.gatewayProfiles, newGateway] 
            } 
        });
        
        setActiveGatewaySlug(slug);
        setIsAddingGateway(false);
        setNewGatewayName('');
    };

    // Helper to delete gateway
    const handleDeleteGateway = (slug: string) => {
        if(confirm("¿Estás seguro? Esto eliminará toda la configuración de tasas y costos asociada a esta pasarela.")) {
            const newGateways = config.logistics.gatewayProfiles.filter(g => g.slug !== slug);
            onUpdateConfig({ ...config, logistics: { ...config.logistics, gatewayProfiles: newGateways } });
            if(activeGatewaySlug === slug && newGateways.length > 0) setActiveGatewaySlug(newGateways[0].slug);
        }
    };

    // Helper to toggle gateway status
    const handleToggleGateway = (slug: string) => {
        const newGateways = config.logistics.gatewayProfiles.map(g => g.slug === slug ? {...g, enabled: !g.enabled} : g);
        onUpdateConfig({ ...config, logistics: { ...config.logistics, gatewayProfiles: newGateways } });
    };

    const activeProfile = MockBackend.getActiveProfile(activeGatewaySlug, activeMode);

    // Icon helper
    const getGatewayIcon = (slug: string) => {
        if(slug.includes('PAYPAL')) return <Wallet size={20}/>;
        if(slug.includes('USDT') || slug.includes('CRYPTO')) return <Bitcoin size={20}/>;
        if(slug.includes('ZINLI')) return <Zap size={20}/>;
        if(slug.includes('WALLY')) return <Smartphone size={20}/>;
        return <CreditCard size={20}/>;
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* 1. HEADER & INTRO */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">Logística Financiera</h1>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Info size={14}/> Gestione pasarelas, tasas y comisiones desde un solo lugar.
                </p>
            </div>

            {/* 2. GLOBAL GATEWAY MANAGER (NEW MODULE) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <Globe size={18} className="text-brand-600"/> Gestión de Pasarelas Globales
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Seleccione la pasarela y la modalidad para configurar sus parámetros.</p>
                    </div>
                    
                    {/* MODE TOGGLE */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveMode('SELL')} 
                            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeMode === 'SELL' ? 'bg-white shadow text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ArrowRight size={14} className="rotate-45"/> Venta (Cliente Vende)
                        </button>
                        <button 
                            onClick={() => setActiveMode('BUY')} 
                            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeMode === 'BUY' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ArrowLeft size={14} className="rotate-45"/> Compra (Cliente Recarga)
                        </button>
                    </div>
                </div>

                {/* GATEWAY LIST SCROLL */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {config.logistics.gatewayProfiles.map(gw => (
                        <div 
                            key={gw.id}
                            onClick={() => setActiveGatewaySlug(gw.slug)}
                            className={`group relative flex-shrink-0 w-48 p-4 rounded-xl border-2 cursor-pointer transition-all ${activeGatewaySlug === gw.slug ? 'border-brand-500 bg-brand-50/30 ring-2 ring-brand-100' : 'border-slate-100 bg-slate-50 hover:border-brand-200'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg ${activeGatewaySlug === gw.slug ? 'bg-brand-100 text-brand-600' : 'bg-white text-slate-400'}`}>
                                    {getGatewayIcon(gw.slug)}
                                </div>
                                {activeGatewaySlug === gw.slug && (
                                    <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></div>
                                )}
                            </div>
                            <h3 className={`font-bold text-sm mb-1 ${activeGatewaySlug === gw.slug ? 'text-slate-800' : 'text-slate-500'}`}>{gw.label}</h3>
                            <div className="flex items-center gap-1 mb-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${gw.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {gw.enabled ? 'ACTIVO' : 'INACTIVO'}
                                </span>
                            </div>

                            {/* HOVER ACTIONS */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleToggleGateway(gw.slug); }}
                                    className="p-1.5 bg-white shadow-sm rounded-full text-slate-400 hover:text-brand-600 border border-slate-100"
                                    title={gw.enabled ? 'Deshabilitar' : 'Habilitar'}
                                >
                                    <Power size={12}/>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteGateway(gw.slug); }}
                                    className="p-1.5 bg-white shadow-sm rounded-full text-slate-400 hover:text-red-500 border border-slate-100"
                                    title="Eliminar"
                                >
                                    <Trash2 size={12}/>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* ADD NEW CARD */}
                    {isAddingGateway ? (
                        <div className="flex-shrink-0 w-48 p-4 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 flex flex-col justify-center gap-2">
                            <input 
                                autoFocus
                                className="w-full text-xs font-bold p-2 rounded border border-brand-200 outline-none focus:border-brand-500"
                                placeholder="Nombre (ej. Zinli)"
                                value={newGatewayName}
                                onChange={(e) => setNewGatewayName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddGateway()}
                            />
                            <div className="flex gap-2">
                                <button onClick={handleAddGateway} className="flex-1 bg-brand-600 text-white text-[10px] py-1.5 rounded font-bold hover:bg-brand-700">Crear</button>
                                <button onClick={() => setIsAddingGateway(false)} className="px-2 text-slate-400 hover:text-red-500"><X size={14}/></button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAddingGateway(true)}
                            className="flex-shrink-0 w-48 p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-400 hover:text-brand-600 hover:bg-white transition-all group"
                        >
                            <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                <Plus size={20}/>
                            </div>
                            <span className="text-xs font-bold">Nueva Pasarela</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 3. TAB NAV (CONTEXTUAL TO SELECTED GATEWAY) */}
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto">
                 <button 
                    onClick={() => setActiveTab('RATES')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'RATES' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                    <Calculator size={16}/> Tasas y Pasarelas
                 </button>
                 <button 
                    onClick={() => setActiveTab('COSTS')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'COSTS' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                    <Layers size={16}/> Costos Internos
                 </button>
                 <button 
                    onClick={() => setActiveTab('COUPONS')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'COUPONS' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                    <Ticket size={16}/> Cupones
                 </button>
            </div>

            {/* 4. MAIN WORKSPACE */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
                
                {/* LEFT: CONFIGURATION PANEL (8/12) */}
                <div className="xl:col-span-8 flex flex-col gap-5 min-w-0">
                    
                    {/* Active Module Content */}
                    <div className="flex-1">
                        {activeProfile ? (
                            <div className="animate-fadeIn space-y-6">
                                
                                {activeTab === 'RATES' && (
                                    <>
                                        <div className="flex justify-between items-end mb-1">
                                            <div>
                                                <h2 className="text-base font-bold text-slate-800">Divisas y Pasarelas</h2>
                                                <p className="text-[11px] text-slate-500">
                                                    Configuración para <strong className="text-brand-600">{activeGatewaySlug}</strong> en modo <strong className="text-brand-600">{activeMode === 'SELL' ? 'Venta' : 'Compra'}</strong>.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newCurr: CurrencyConfig = {
                                                        code: 'NUEVA', name: 'Nueva Moneda', enabled: false, rateMode: 'MANUAL', manualRate: 1, secondaryRate: 1, dynamicSetting: { references: [], profitRule: { mode: 'PCT_ONLY', pct: 5, fixed: 0 }, amountRanges: [] }, methods: []
                                                    };
                                                    updateActiveProfile({ ...activeProfile, currencies: [...activeProfile.currencies, newCurr] });
                                                }}
                                                className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm"
                                            >
                                                <Plus size={12}/> Agregar Divisa
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {activeProfile.currencies.map((curr, idx) => (
                                                <CurrencyEditor 
                                                    key={idx} 
                                                    currency={curr} 
                                                    onUpdate={(c) => {
                                                        const nc = [...activeProfile.currencies]; nc[idx] = c;
                                                        updateActiveProfile({...activeProfile, currencies: nc});
                                                    }}
                                                    gatewaySlug={activeGatewaySlug}
                                                    mode={activeMode}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                                {activeTab === 'COSTS' && (
                                    <CostsEditor profile={activeProfile} onUpdate={updateActiveProfile} />
                                )}
                                {activeTab === 'COUPONS' && (
                                    <CouponsEditor profile={activeProfile} onUpdate={updateActiveProfile} />
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <AlertCircle size={32} className="mb-2"/>
                                <p className="font-bold">No hay perfil configurado.</p>
                                <p className="text-xs mt-1">Selecciona una pasarela válida o contacta soporte.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: SIMULATOR (4/12) */}
                <div className="xl:col-span-4 min-w-0">
                    <SimulatorWidget config={config} activeGatewaySlug={activeGatewaySlug} activeMode={activeMode} />
                </div>
            </div>
        </div>
    );
};

// --- COMPLEX SUB-EDITORS ---

interface CurrencyEditorProps {
    currency: CurrencyConfig;
    onUpdate: (c: CurrencyConfig) => void;
    gatewaySlug: string;
    mode: string;
}

const CurrencyEditor: React.FC<CurrencyEditorProps> = ({ currency, onUpdate, gatewaySlug, mode }) => {
    const rate = MockBackend.getClientRate(currency.code, gatewaySlug, mode as any);
    const [isExpanded, setIsExpanded] = useState(true);
    const isDynamic = currency.rateMode === 'DYNAMIC';

    // Helper for exclusive profit rule mode with Switch Style
    const setProfitMode = (newMode: 'PCT_ONLY' | 'FIXED_ONLY') => {
        onUpdate({
            ...currency, 
            dynamicSetting: {
                ...currency.dynamicSetting, 
                profitRule: { ...currency.dynamicSetting.profitRule, mode: newMode }
            }
        });
    };

    // Calculate dynamic impact for BCV
    const bcvImpact = currency.secondaryRate ? ((100 * rate) / currency.secondaryRate).toFixed(2) : '0.00';

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {/* 1. Header Card - MODIFICADO: Más grisáceo */}
            <div className="p-4 cursor-pointer bg-slate-50 transition-colors border-b border-slate-200" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm ${currency.code === 'VES' ? 'bg-brand-600' : 'bg-slate-800'}`}>
                            {currency.code === 'USDT' ? <Zap size={20}/> : currency.code === 'VES' ? <RefreshCw size={20}/> : <Coins size={20}/>}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 leading-tight">{currency.code}</h3>
                            <p className="text-xs text-slate-500 font-medium">{currency.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tasa Actual</p>
                         <div className="flex items-center justify-end gap-2">
                             <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{rate.toFixed(2)}</span>
                             <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                         </div>
                    </div>
                </div>
            </div>

            {/* 2. Expanded Content */}
            {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-white animate-fadeIn">
                    
                    {/* TOP CONTROLS: MODE & MARGIN */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {/* Mode */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Modo de Tasa</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button onClick={() => onUpdate({...currency, rateMode: 'MANUAL'})} className={`flex-1 text-[10px] font-bold py-2 rounded-md transition-all ${currency.rateMode === 'MANUAL' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Manual</button>
                                <button onClick={() => onUpdate({...currency, rateMode: 'DYNAMIC'})} className={`flex-1 text-[10px] font-bold py-2 rounded-md transition-all ${currency.rateMode === 'DYNAMIC' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Dinámica</button>
                            </div>
                        </div>

                        {/* Margin - MODIFICADO: Switch Real Style & Single Selection */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Margen de Rentabilidad</label>
                            
                            {/* Switch Control */}
                            <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
                                <button 
                                    onClick={() => setProfitMode('PCT_ONLY')} 
                                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${currency.dynamicSetting.profitRule.mode === 'PCT_ONLY' ? 'bg-brand-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Dinámico (%)
                                </button>
                                <button 
                                    onClick={() => setProfitMode('FIXED_ONLY')} 
                                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${currency.dynamicSetting.profitRule.mode === 'FIXED_ONLY' ? 'bg-brand-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Fijo ($)
                                </button>
                            </div>

                            {/* Active Input Display */}
                            <div>
                                {currency.dynamicSetting.profitRule.mode === 'PCT_ONLY' ? (
                                    <div className="relative animate-fadeIn">
                                        <input
                                            type="number"
                                            className="w-full pl-2 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-500 transition-colors text-right focus:bg-white"
                                            value={currency.dynamicSetting.profitRule.pct}
                                            onChange={e => {
                                                const val = Number(e.target.value);
                                                onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, profitRule: {...currency.dynamicSetting.profitRule, pct: val}}});
                                            }}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                                    </div>
                                ) : (
                                    <div className="relative animate-fadeIn">
                                        <input
                                            type="number"
                                            className="w-full pl-2 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-brand-500 transition-colors text-right focus:bg-white"
                                            value={currency.dynamicSetting.profitRule.fixed}
                                            onChange={e => {
                                                const val = Number(e.target.value);
                                                onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, profitRule: {...currency.dynamicSetting.profitRule, fixed: val}}});
                                            }}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION: REFERENCE CONTROL CENTER - MODIFICADO: Transparencia Removed & Impact Fixed */}
                    <div className="mb-6">
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="flex items-center gap-2 text-[11px] font-bold text-brand-800 uppercase tracking-wide">
                                 <Landmark size={12} className="text-brand-600"/> Centro de Control de Referencias
                             </h4>
                             {/* Badge Eliminated as requested */}
                         </div>

                         <div className="grid md:grid-cols-12 gap-4">
                             {/* VISUAL INDICATORS - SOLO PARA VES */}
                             {currency.code === 'VES' && (
                                <div className="md:col-span-4 space-y-3 animate-fadeIn">
                                     <div className="bg-white border border-blue-100 p-4 rounded-xl shadow-sm">
                                         <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Tasa Referencial BCV</p>
                                         <div className="flex justify-between items-end">
                                             <input
                                                type="number"
                                                value={currency.secondaryRate}
                                                onChange={(e) => onUpdate({...currency, secondaryRate: Number(e.target.value)})}
                                                className="text-2xl font-extrabold text-blue-900 bg-transparent border-b border-blue-200 w-full outline-none focus:border-blue-500"
                                             />
                                             <span className="text-[10px] font-bold text-blue-300 mb-1 shrink-0 ml-2">VES/$</span>
                                         </div>
                                     </div>
                                     <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                         <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Impacto en Cliente</p>
                                         <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                             "Usted recibe un equivalente de <strong className="text-brand-600">${bcvImpact} BCV</strong> por cada $100 netos"
                                         </p>
                                     </div>
                                </div>
                             )}

                             {/* ACTIVE SOURCES LIST - Expandido si no es VES */}
                             <div className={`${currency.code === 'VES' ? 'md:col-span-8' : 'md:col-span-12'} bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-all duration-300`}>
                                 <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-2">
                                     <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                         <ListFilter size={12}/> Tasa de giro logístico
                                     </span>
                                     <Badge color={isDynamic ? 'blue' : 'slate'}>
                                         {isDynamic ? 'Dinámico' : 'Manual'}
                                     </Badge>
                                 </div>
                                 
                                 <div className="space-y-2">
                                     {currency.dynamicSetting.references.map((ref, i) => (
                                         <div key={ref.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg hover:border-brand-200 transition-colors">
                                             <div className="flex items-center gap-3">
                                                 <div className={`p-1.5 rounded-md ${ref.isActive ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                     <TrendingUp size={14}/>
                                                 </div>
                                                 <span className="text-xs font-bold text-slate-700">{ref.label}</span>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={ref.value} 
                                                        onChange={(e) => {
                                                            const newRefs = [...currency.dynamicSetting.references];
                                                            newRefs[i].value = Number(e.target.value);
                                                            onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, references: newRefs}});
                                                        }}
                                                        className="w-24 text-right font-mono font-bold text-xs bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-brand-500 pr-8"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">{currency.code}</span>
                                                 </div>
                                                 <button 
                                                    onClick={() => {
                                                        const newRefs = currency.dynamicSetting.references.map((r, idx) => ({
                                                            ...r,
                                                            isActive: idx === i // Only current one is active
                                                        }));
                                                        onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, references: newRefs}});
                                                    }}
                                                    className={`p-1 rounded-full transition-colors ${ref.isActive ? 'text-brand-600 bg-brand-50 hover:bg-brand-100' : 'text-slate-300 hover:text-slate-500'}`}
                                                 >
                                                     <CheckCircle size={14} className={ref.isActive ? "fill-current" : ""}/>
                                                 </button>
                                                 <button 
                                                    onClick={() => {
                                                        const newRefs = currency.dynamicSetting.references.filter((_, idx) => idx !== i);
                                                        onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, references: newRefs}});
                                                    }}
                                                    className="text-slate-300 hover:text-red-400"
                                                 >
                                                    <Trash2 size={14}/>
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                                 {/* MODIFICADO: Botón Agregar Fuente Funcional */}
                                 <button 
                                    onClick={() => {
                                        const newRef = { id: `ref-${Date.now()}`, label: 'Nueva Fuente', value: 0, isActive: false };
                                        onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, references: [...currency.dynamicSetting.references, newRef]}});
                                    }}
                                    className="mt-3 w-full py-1.5 border border-dashed border-slate-200 text-slate-400 font-bold text-[10px] rounded-lg hover:text-brand-600 hover:border-brand-300 transition"
                                 >
                                    + AGREGAR FUENTE
                                 </button>
                             </div>
                         </div>
                    </div>

                    {/* SECTION: DYNAMIC RANGES */}
                    <div className={`mb-6 ${isDynamic ? '' : 'opacity-50 pointer-events-none grayscale'}`}>
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                 <SlidersHorizontal size={12}/> Parámetros dinámicos según montos
                             </h4>
                             {/* MODIFICADO: Botón Agregar Rango Funcional */}
                             <button
                                onClick={() => {
                                    const newRanges = [...(currency.dynamicSetting.amountRanges || [])];
                                    newRanges.push({ id: `rng-${Date.now()}`, minAmount: 0, maxAmount: 100, adjustmentPct: 0, enabled: true });
                                    onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, amountRanges: newRanges}});
                                }}
                                className="text-[10px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                             >
                                <Plus size={12}/> Agregar Rango
                             </button>
                         </div>
                         {(!currency.dynamicSetting.amountRanges || currency.dynamicSetting.amountRanges.length === 0) ? (
                             <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                                 <p className="text-slate-400 text-[10px] italic">No hay rangos configurados. La tasa será plana.</p>
                             </div>
                         ) : (
                             <div className="space-y-3">
                                {currency.dynamicSetting.amountRanges.map((rng, rIdx) => (
                                    <div key={rng.id} className="flex items-center bg-white border border-slate-200 p-3 rounded-xl shadow-sm gap-3">
                                        {/* Min Input */}
                                        <div className="flex flex-col">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">$</span>
                                                <input 
                                                    type="number" 
                                                    className="w-20 pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center outline-none focus:border-brand-500 focus:bg-white transition-all" 
                                                    value={rng.minAmount} 
                                                    onChange={e => {
                                                        const nr = [...currency.dynamicSetting.amountRanges!]; nr[rIdx].minAmount = Number(e.target.value);
                                                        onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, amountRanges: nr}});
                                                    }} 
                                                />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 text-center mt-1 uppercase tracking-wide">Mínimo</span>
                                        </div>

                                        <div className="h-px w-3 bg-slate-300 mb-4"></div>

                                        {/* Max Input */}
                                        <div className="flex flex-col">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">$</span>
                                                <input 
                                                    type="number" 
                                                    className="w-20 pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center outline-none focus:border-brand-500 focus:bg-white transition-all" 
                                                    value={rng.maxAmount} 
                                                    onChange={e => {
                                                        const nr = [...currency.dynamicSetting.amountRanges!]; nr[rIdx].maxAmount = Number(e.target.value);
                                                        onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, amountRanges: nr}});
                                                    }} 
                                                />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 text-center mt-1 uppercase tracking-wide">Máximo</span>
                                        </div>

                                        {/* Dashed Line */}
                                        <div className="flex-1 border-b border-dashed border-slate-200 mx-2 mb-4 relative">
                                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[8px] font-bold text-slate-300 uppercase">Rango $</span>
                                        </div>

                                        {/* Adjustment Input */}
                                        <div className="flex flex-col">
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    className="w-20 pl-2 pr-6 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-brand-600 text-center outline-none focus:border-brand-500 focus:bg-white transition-all" 
                                                    value={rng.adjustmentPct} 
                                                    onChange={e => {
                                                        const nr = [...currency.dynamicSetting.amountRanges!]; nr[rIdx].adjustmentPct = Number(e.target.value);
                                                        onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, amountRanges: nr}});
                                                    }}
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">%</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 text-center mt-1 uppercase tracking-wide">Ajuste</span>
                                        </div>

                                        {/* MODIFICADO: Delete Button Funcional */}
                                        <button 
                                            onClick={() => {
                                                 const nr = currency.dynamicSetting.amountRanges!.filter((_, idx) => idx !== rIdx);
                                                 onUpdate({...currency, dynamicSetting: {...currency.dynamicSetting, amountRanges: nr}});
                                            }} 
                                            className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 mb-4 transition-colors"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                ))}
                             </div>
                         )}
                    </div>

                    {/* SECTION: PAYMENT METHODS */}
                    <div>
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                 <CreditCard size={12}/> Bancos y Pasarelas
                             </h4>
                             {/* MODIFICADO: Botón Agregar Método Funcional */}
                             <button 
                                onClick={() => {
                                    const newMethod = { id: `m-${Date.now()}`, name: 'Nuevo Método', enabled: true, commission: { pct: 0, fixed: 0, enabled: false } };
                                    onUpdate({...currency, methods: [...(currency.methods || []), newMethod]});
                                }}
                                className="text-[10px] font-bold text-brand-600 hover:underline"
                             >
                                + Agregar
                             </button>
                         </div>
                         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                             {/* MODIFICADO: Mapeo real de métodos */}
                             {(currency.methods || []).length === 0 ? (
                                 <div className="p-4 text-center text-xs text-slate-400 italic">No hay métodos de pago configurados.</div>
                             ) : (
                                currency.methods.map((method, idx) => (
                                    <div key={method.id} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md"><Bank size={14}/></div>
                                            <input 
                                                value={method.name}
                                                onChange={(e) => {
                                                    const nm = [...currency.methods]; nm[idx].name = e.target.value;
                                                    onUpdate({...currency, methods: nm});
                                                }}
                                                className="text-xs font-bold text-slate-700 bg-transparent outline-none focus:border-b border-brand-500"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    const nm = [...currency.methods]; nm[idx].enabled = !method.enabled;
                                                    onUpdate({...currency, methods: nm});
                                                }}
                                            >
                                                <Badge color={method.enabled ? 'green' : 'slate'}>{method.enabled ? 'ACTIVO' : 'INACTIVO'}</Badge>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const nm = currency.methods.filter((_, i) => i !== idx);
                                                    onUpdate({...currency, methods: nm});
                                                }}
                                                className="text-slate-300 hover:text-red-400"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                ))
                             )}
                         </div>
                    </div>

                </div>
            )}
        </div>
    );
};

const CostsEditor = ({ profile, onUpdate }: { profile: OperationProfile, onUpdate: (p: OperationProfile) => void }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-base font-bold text-slate-800">Tarifas y Costos Internos</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Define los gastos operativos que afectan la rentabilidad neta.</p>
                </div>
                <button 
                    onClick={() => onUpdate({...profile, costs: [...profile.costs, { id: `g-${Date.now()}`, label: 'Nuevo Grupo', items: [] }]})}
                    className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm"
                >
                    <Plus size={12}/> Nuevo Grupo
                </button>
            </div>

            {/* Groups List */}
            {profile.costs.map((group, gIdx) => (
                <div key={group.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Group Header */}
                    <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <input 
                            value={group.label}
                            onChange={(e) => {
                                const nc = [...profile.costs]; nc[gIdx].label = e.target.value; onUpdate({...profile, costs: nc});
                            }}
                            className="font-bold text-xs text-slate-800 bg-transparent focus:border-b-2 border-brand-500 outline-none w-1/2 placeholder:text-slate-400"
                            placeholder="Nombre del Grupo"
                        />
                        <button 
                            onClick={() => { const nc = profile.costs.filter((_, i) => i !== gIdx); onUpdate({...profile, costs: nc}); }} 
                            className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={14}/>
                        </button>
                    </div>

                    {/* Items Table Header */}
                    <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 grid grid-cols-12 gap-4">
                        <div className="col-span-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Concepto</div>
                        <div className="col-span-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clasificación</div>
                        <div className="col-span-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Valor</div>
                        <div className="col-span-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tipo</div>
                        <div className="col-span-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Gravable</div>
                        <div className="col-span-1 text-right text-[9px] font-bold text-slate-400 uppercase tracking-wider"></div>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-slate-50">
                        {group.items.map((item, iIdx) => (
                            <div key={item.id} className="px-5 py-2.5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors group">
                                {/* Concepto */}
                                <div className="col-span-4">
                                    <input 
                                        value={item.label} 
                                        onChange={(e) => { const nc = [...profile.costs]; nc[gIdx].items[iIdx].label = e.target.value; onUpdate({...profile, costs: nc}); }} 
                                        className="w-full text-xs font-medium text-slate-700 bg-transparent outline-none border border-transparent focus:border-slate-300 rounded p-1 transition-all placeholder:text-slate-300"
                                        placeholder="Descripción del costo"
                                    />
                                </div>

                                {/* Clasificación */}
                                <div className="col-span-2">
                                    <select 
                                        value={item.category} 
                                        onChange={(e) => { const nc = [...profile.costs]; nc[gIdx].items[iIdx].category = e.target.value as any; onUpdate({...profile, costs: nc}); }} 
                                        className="w-full text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded p-1 outline-none focus:border-brand-500"
                                    >
                                        <option value="DEDUCTIVE">Deductivo (-)</option>
                                        <option value="ADDITIVE">Aditivo (+)</option>
                                    </select>
                                </div>

                                {/* Valor */}
                                <div className="col-span-2">
                                    <input 
                                        type="number" 
                                        value={item.value} 
                                        onChange={(e) => { const nc = [...profile.costs]; nc[gIdx].items[iIdx].value = Number(e.target.value); onUpdate({...profile, costs: nc}); }}
                                        className="w-full text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 rounded p-1 outline-none focus:border-brand-500 text-right pr-2"
                                    />
                                </div>

                                {/* Tipo */}
                                <div className="col-span-1">
                                     <button 
                                        onClick={() => { const nc = [...profile.costs]; nc[gIdx].items[iIdx].type = item.type === 'PCT' ? 'FIXED' : 'PCT'; onUpdate({...profile, costs: nc}); }} 
                                        className="w-full text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded p-1 hover:border-brand-300 hover:text-brand-600 transition-colors"
                                    >
                                        {item.type === 'PCT' ? '%' : '$'}
                                    </button>
                                </div>

                                {/* Gravable */}
                                <div className="col-span-2">
                                    <button 
                                        onClick={() => { const nc = [...profile.costs]; nc[gIdx].items[iIdx].isClientChargeable = !item.isClientChargeable; onUpdate({...profile, costs: nc}); }}
                                        className={`w-full text-[9px] font-bold px-1.5 py-1 rounded border transition-all ${
                                            item.isClientChargeable 
                                            ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' 
                                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                                        }`}
                                    >
                                        {item.isClientChargeable ? 'SI (Cliente)' : 'NO (Admin)'}
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex justify-end items-center gap-2">
                                    <button 
                                        onClick={() => { const nc = [...profile.costs]; nc[gIdx].items[iIdx].enabled = !item.enabled; onUpdate({...profile, costs: nc}); }} 
                                        className={`${item.enabled ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-slate-400'}`}
                                        title={item.enabled ? 'Deshabilitar' : 'Habilitar'}
                                    >
                                        <Power size={14}/>
                                    </button>
                                    <button 
                                        onClick={() => { const nc = [...profile.costs]; nc[gIdx].items.splice(iIdx, 1); onUpdate({...profile, costs: nc}); }}
                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Item Button */}
                    <div className="p-2 bg-slate-50/50 border-t border-slate-100">
                        <button 
                            onClick={() => { const nc = [...profile.costs]; nc[gIdx].items.push({ id: `c-${Date.now()}`, label: 'Nuevo Gasto', type: 'PCT', category: 'DEDUCTIVE', value: 0, enabled: true, isClientChargeable: true }); onUpdate({...profile, costs: nc}); }} 
                            className="w-full py-1.5 border border-dashed border-slate-200 rounded-lg text-slate-400 font-bold text-[10px] hover:border-brand-300 hover:text-brand-600 hover:bg-white transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={12}/> Agregar Item de Costo
                        </button>
                    </div>
                </div>
            ))}

            {profile.costs.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-400 text-xs mb-3">No hay grupos de costos definidos.</p>
                    <button 
                        onClick={() => onUpdate({...profile, costs: [{ id: `g-${Date.now()}`, label: 'Gastos Generales', items: [] }]})}
                        className="bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-brand-100 transition"
                    >
                        Crear Primer Grupo
                    </button>
                </div>
            )}
        </div>
    );
};

const CouponsEditor = ({ profile, onUpdate }: { profile: OperationProfile, onUpdate: (p: OperationProfile) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profile.coupons.map((c, idx) => (
            <div key={c.id} className={`p-5 rounded-xl border relative overflow-hidden transition-all ${c.active ? 'bg-white border-brand-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-75'}`}>
                <div className="absolute top-0 right-0 p-3">
                    <button onClick={() => {const nc = [...profile.coupons]; nc[idx].active = !c.active; onUpdate({...profile, coupons: nc})}} className={c.active ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-slate-500'}><Power size={16}/></button>
                </div>
                
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Código</label>
                <input 
                    value={c.code} 
                    onChange={(e) => { const nc = [...profile.coupons]; nc[idx].code = e.target.value.toUpperCase(); onUpdate({...profile, coupons: nc}); }} 
                    className="font-black text-lg text-slate-800 bg-transparent outline-none w-full mb-3" 
                />

                <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2">
                    <Ticket size={14} className="text-brand-500"/>
                    <div className="flex-1 flex gap-1 items-center">
                        <span className="text-xs font-bold text-slate-500">Descuento:</span>
                        <input type="number" value={c.clientDiscount.value} onChange={(e) => { const nc = [...profile.coupons]; nc[idx].clientDiscount.value = Number(e.target.value); onUpdate({...profile, coupons: nc}); }} className="w-16 font-bold bg-transparent outline-none text-right text-sm"/>
                        <button onClick={() => { const nc = [...profile.coupons]; nc[idx].clientDiscount.type = c.clientDiscount.type === 'PCT' ? 'FIXED' : 'PCT'; onUpdate({...profile, coupons: nc}); }} className="text-[9px] bg-white border px-1 rounded font-bold">{c.clientDiscount.type === 'PCT' ? '%' : '$'}</button>
                    </div>
                </div>
                <button onClick={() => { const nc = profile.coupons.filter((_, i) => i !== idx); onUpdate({...profile, coupons: nc}); }} className="mt-4 text-[10px] text-red-400 hover:text-red-600 font-bold flex items-center gap-1"><Trash2 size={12}/> Eliminar Cupón</button>
            </div>
        ))}
         <button 
            onClick={() => { const newC: Coupon = { id: `cp-${Date.now()}`, code: 'NUEVO', category: 'CLIENT', type: 'GLOBAL_PROMO', active: true, clientDiscount: { type: 'FIXED', value: 0 } }; onUpdate({...profile, coupons: [...profile.coupons, newC]}); }}
            className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 text-slate-400 font-bold hover:border-brand-300 hover:text-brand-600 transition-colors gap-2 text-xs"
        >
            <Plus size={18}/> Crear Cupón
        </button>
    </div>
);


// --- MAIN DASHBOARD LAYOUT ---

export const AdminDashboard: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [activeModule, setActiveModule] = useState('LOGISTICS');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [config, setConfig] = useState<SystemConfig>(MockBackend.getConfig());
  
  useEffect(() => {
     const i = setInterval(() => setConfig(MockBackend.getConfig()), 3000);
     return () => clearInterval(i);
  }, []);

  const handleUpdateConfig = (newConf: SystemConfig) => {
      MockBackend.updateConfig(newConf);
      setConfig(newConf);
  };

  const NavItem = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => { setActiveModule(id); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium mb-1 group ${activeModule === id ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
        title={isSidebarCollapsed ? label : ''}
      >
          <Icon size={isSidebarCollapsed ? 20 : 18} className={`transition-colors shrink-0 ${activeModule === id ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
          {!isSidebarCollapsed && <span>{label}</span>}
      </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
        {/* SIDEBAR */}
        <aside className={`fixed md:sticky top-0 left-0 h-screen bg-[#0f172a] z-50 transition-all duration-300 ease-in-out flex flex-col border-r border-slate-800 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="p-4 flex flex-col h-full">
                <div className={`flex items-center gap-2 mb-10 text-white px-2 mt-2 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    {isSidebarCollapsed ? (
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg text-xs">
                            TM
                        </div>
                    ) : (
                        <span className="font-bold text-xl tracking-tight whitespace-nowrap">tudinero<span className="text-brand-500">mueve</span></span>
                    )}
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    <NavItem id="OVERVIEW" label="Panel Principal" icon={LayoutGrid} />
                    <NavItem id="OPERATIONS" label="Operaciones" icon={FileText} />
                    <NavItem id="LOGISTICS" label="Logística y Tasas" icon={Calculator} />
                    <NavItem id="CLIENTS" label="Clientes" icon={Users} />
                    <NavItem id="MESSAGES" label="Mensajes" icon={MessageSquare} />
                    <NavItem id="CMS" label="Diseño y Redes" icon={Palette} />
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800 space-y-4">
                    {/* Toggle Button */}
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        {isSidebarCollapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
                    </button>

                    {/* User Profile */}
                    <div className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 rounded bg-brand-900 text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-800 shrink-0">
                            {currentUser.fullName[0]}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{currentUser.role}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300">
             {/* TOP BAR */}
             <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 shrink-0 z-40">
                 <div className="flex items-center gap-4">
                     <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-500 bg-slate-50 rounded-lg"><Menu size={20}/></button>
                     <h2 className="text-base font-bold text-slate-800 hidden md:block">
                        {activeModule === 'LOGISTICS' ? 'Logística Financiera' : 
                         activeModule === 'OVERVIEW' ? 'Panel de Control' : 
                         activeModule === 'OPERATIONS' ? 'Operaciones' :
                         activeModule === 'CLIENTS' ? 'Directorio de Clientes' :
                         activeModule}
                     </h2>
                 </div>
                 <div className="flex items-center gap-4">
                     <div className="relative hidden md:block">
                         <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                         <input className="pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm border-none focus:ring-2 focus:ring-brand-500 w-64 transition-all" placeholder="Buscar..."/>
                     </div>
                     <button className="p-2 text-slate-400 hover:text-brand-600 relative bg-slate-50 rounded-lg hover:bg-brand-50 transition-colors">
                         <Bell size={20}/>
                         <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                     </button>
                 </div>
             </header>
             
             {/* CONTENT SCROLLABLE AREA */}
             <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
                 <div className="max-w-7xl mx-auto h-full flex flex-col">
                    {activeModule === 'LOGISTICS' && <LogisticsEngine config={config} onUpdateConfig={handleUpdateConfig} />}
                    {activeModule === 'OVERVIEW' && <OverviewView />}
                    {activeModule === 'OPERATIONS' && <OperationsView />}
                    {activeModule === 'CLIENTS' && <ClientsView />}
                    {activeModule === 'MESSAGES' && <MessagesView />}
                    {activeModule === 'CMS' && <CMSView config={config} onUpdate={handleUpdateConfig} />}
                 </div>
             </div>
        </main>
    </div>
  );
};

// --- VIEWS ---

const OverviewView = () => (
    <div className="space-y-6 animate-fadeIn">
        <div className="grid md:grid-cols-4 gap-4">
            {[
                { label: 'Volumen Hoy', val: '$12,450', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Operaciones', val: '45', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Clientes Nuevos', val: '12', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Profit Est.', val: '$840', icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
            ].map((stat, i) => (
                <Card key={i} className="border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">{stat.val}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={20}/>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
            <Card title="Actividad Reciente" className="md:col-span-2">
                 <div className="h-64 bg-slate-50 rounded border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
                     [Gráfico de Actividad Financiera]
                 </div>
            </Card>
            <Card title="Estado del Sistema">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 font-medium">Base de Datos</span>
                        <Badge color="green">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 font-medium">Pasarela PayPal</span>
                        <Badge color="green">Estable</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 font-medium">API Bancaria</span>
                        <Badge color="orange">Latencia Alta</Badge>
                    </div>
                </div>
            </Card>
        </div>
    </div>
);

const OperationsView = () => {
    const [txs, setTxs] = useState<Transaction[]>(MockBackend.getTransactions());
    const [filter, setFilter] = useState<'ALL' | 'PENDING'>('ALL');
    
    useEffect(() => { const i = setInterval(() => setTxs(MockBackend.getTransactions()), 3000); return () => clearInterval(i); }, []);

    const filteredTxs = filter === 'ALL' ? txs : txs.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING' || t.status === 'VERIFYING');

    return (
        <Card title="Control de Operaciones" noPadding 
            action={
                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                    <button onClick={() => setFilter('ALL')} className={`px-3 py-1 text-xs font-bold rounded ${filter === 'ALL' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Todas</button>
                    <button onClick={() => setFilter('PENDING')} className={`px-3 py-1 text-xs font-bold rounded ${filter === 'PENDING' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Pendientes</button>
                </div>
            }
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Referencia</th>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Entrada</th>
                            <th className="px-6 py-3">Salida</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTxs.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3 font-mono font-bold text-slate-700">#{t.id.slice(-6)}</td>
                                <td className="px-6 py-3">
                                    <p className="font-bold text-slate-900">{t.clientName}</p>
                                    <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">{t.type}</td>
                                <td className="px-6 py-3 font-mono text-slate-600">${t.amountIn}</td>
                                <td className="px-6 py-3 font-mono font-bold text-brand-600">{t.amountOut.toFixed(2)}</td>
                                <td className="px-6 py-3">
                                    <Badge color={t.status === 'COMPLETED' ? 'green' : t.status === 'PENDING' ? 'orange' : 'blue'}>
                                        {t.status.replace('_', ' ')}
                                    </Badge>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button className="text-slate-400 hover:text-brand-600 p-1"><MoreHorizontal size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const ClientsView = () => {
    const users = MockBackend.getUsers().filter(u => u.role === 'CLIENT');
    return (
        <Card title="Directorio de Clientes" noPadding>
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3">Usuario</th>
                        <th className="px-6 py-3">Contacto</th>
                        <th className="px-6 py-3">País</th>
                        <th className="px-6 py-3 text-right">Perfil</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">{u.fullName[0]}</div>
                                    <div>
                                        <p className="font-bold text-slate-900">{u.fullName}</p>
                                        <p className="text-xs text-slate-400">{u.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-3 text-slate-600">{u.phone}</td>
                            <td className="px-6 py-3 text-slate-600">{u.country || 'N/A'}</td>
                            <td className="px-6 py-3 text-right">
                                <button className="text-xs font-bold text-brand-600 border border-brand-200 px-3 py-1 rounded hover:bg-brand-50">Ver</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};

const MessagesView = () => {
    const msgs = MockBackend.getMessages();
    return (
        <div className="grid gap-4">
            {msgs.length === 0 ? <Card className="p-8 text-center text-slate-400">Buzón vacío.</Card> : msgs.map(m => (
                <Card key={m.id} className="cursor-pointer hover:border-brand-300 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-800">{m.subject}</h4>
                        <span className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{m.message}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-50 pt-2">
                        <UserPlus size={12}/> {m.fullName} <span className="mx-1">•</span> {m.email}
                    </div>
                </Card>
            ))}
        </div>
    );
};

const CMSView = ({ config, onUpdate }: { config: SystemConfig, onUpdate: (c: SystemConfig) => void }) => (
    <div className="grid md:grid-cols-2 gap-6">
        <Card title="Hero & Portada">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Título Principal</label>
                    <input className="w-full p-2 border border-slate-200 rounded text-sm" value={config.design.heroTitle} onChange={(e) => onUpdate({...config, design: {...config.design, heroTitle: e.target.value}})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Subtítulo</label>
                    <textarea className="w-full p-2 border border-slate-200 rounded text-sm" rows={3} value={config.design.heroSubtitle} onChange={(e) => onUpdate({...config, design: {...config.design, heroSubtitle: e.target.value}})} />
                </div>
            </div>
        </Card>
        <Card title="Contacto y Avisos">
             <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Aviso Superior (Notices)</label>
                    <input className="w-full p-2 border border-slate-200 rounded text-sm" value={config.notices} onChange={(e) => onUpdate({...config, notices: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">WhatsApp (Número)</label>
                    <input className="w-full p-2 border border-slate-200 rounded text-sm" value={config.design.whatsappNumber} onChange={(e) => onUpdate({...config, design: {...config.design, whatsappNumber: e.target.value}})} />
                </div>
             </div>
        </Card>
    </div>
);
