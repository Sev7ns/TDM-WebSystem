import React, { useEffect, useState, useCallback } from 'react';
import { 
  Clock, CheckCircle, FileText, Loader, Send, AlertTriangle, ChevronRight, 
  Download, MessageCircle, RefreshCw, XCircle, Wallet, Shield, 
  History, Ticket, Phone, ArrowRight, Menu, X, ArrowLeft,
  Instagram, Twitter, Facebook, Copy, Banknote, HelpCircle
} from 'lucide-react';
import { Transaction, User, TransactionStatus, SystemConfig } from '../types';
import { MockBackend } from '../services/mockBackend';

// Export TabId so App.tsx can use it for typing if needed, though strictly not required if passing string
export type TabId = 'SELL' | 'OPERATIONS' | 'COUPONS' | 'CONTACT';

interface ClientDashboardProps {
  user: User;
  initialTab?: TabId; // New prop to control entry point
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, initialTab }) => {
  // Initialize with prop or default to SELL
  const [activeTab, setActiveTab] = useState<TabId>(initialTab || 'SELL');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig>(MockBackend.getConfig());
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // React to prop changes (e.g. when finishing a modal flow while already on dashboard)
  useEffect(() => {
      if(initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Polling for updates
  const refreshData = useCallback(() => {
    const txs = MockBackend.getTransactions(user.id);
    setTransactions(txs);
    setConfig(MockBackend.getConfig());
  }, [user.id]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000); 
    return () => clearInterval(interval);
  }, [refreshData]);

  const NavItem = ({ id, label, icon: Icon }: { id: TabId, label: string, icon: any }) => (
      <button 
        onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === id ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-600'}`}
      >
          <Icon size={20} />
          {label}
      </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-slate-50">
       
       {/* SIDEBAR NAVIGATION */}
       <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-slate-200 z-30 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl">
                      {user.fullName[0]}
                  </div>
                  <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-800 truncate">{user.fullName}</h3>
                      <p className="text-xs text-slate-500 truncate">ID: {user.id.slice(-6)}</p>
                  </div>
              </div>

              <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">Mi Hub</div>
                  <NavItem id="SELL" label="Vender Saldo" icon={Wallet} />
                  <NavItem id="OPERATIONS" label="Operaciones" icon={History} />
                  <NavItem id="COUPONS" label="Mis Cupones" icon={Ticket} />
                  <NavItem id="CONTACT" label="Contacto" icon={Phone} />
              </div>
          </div>
       </aside>

       {/* MOBILE TOGGLE */}
       <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden fixed bottom-6 right-6 z-40 bg-slate-900 text-white p-4 rounded-full shadow-xl">
           {isMobileMenuOpen ? <X/> : <Menu/>}
       </button>

       {/* MAIN CONTENT AREA */}
       <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
           {activeTab === 'SELL' && <SellSection user={user} config={config} onTransactionCreated={() => setActiveTab('OPERATIONS')} />}
           {activeTab === 'OPERATIONS' && <OperationsSection transactions={transactions} config={config} />}
           {activeTab === 'COUPONS' && <CouponsSection user={user} config={config} transactions={transactions} refresh={refreshData} />}
           {activeTab === 'CONTACT' && <ContactSection config={config} />}
       </main>
    </div>
  );
};

// --- SECTION 1: SELL (PAYPAL) ---
const SellSection = ({ user, config, onTransactionCreated }: { user: User, config: SystemConfig, onTransactionCreated: () => void }) => {
    const [amount, setAmount] = useState(100);
    const [currency, setCurrency] = useState<'VES' | 'USDT'>('VES');
    const [quote, setQuote] = useState<any>(null);
    const [couponCode, setCouponCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setQuote(MockBackend.calculateQuote(amount, currency, user.id, couponCode));
    }, [amount, currency, couponCode, user.id, config]);

    const handleCreate = async () => {
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 1500));
        MockBackend.createTransaction({
            clientId: user.id,
            clientName: user.fullName,
            type: 'EXCHANGE_PAYPAL',
            amountIn: amount,
            amountOut: quote.finalAmount,
            rateApplied: quote.rate,
            couponApplied: quote.appliedCoupon ? quote.appliedCoupon.code : undefined
        });
        setIsSubmitting(false);
        onTransactionCreated();
    };

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Wallet className="text-brand-600"/> Vender Saldo PayPal
            </h2>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                    
                    {/* INPUTS */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto a Enviar (PayPal)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-4 text-slate-400 font-bold">$</span>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={e => setAmount(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-3 text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Recibes En</label>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button onClick={() => setCurrency('VES')} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${currency === 'VES' ? 'bg-white shadow text-brand-600' : 'text-slate-400'}`}>VES (Bs)</button>
                                    <button onClick={() => setCurrency('USDT')} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${currency === 'USDT' ? 'bg-white shadow text-brand-600' : 'text-slate-400'}`}>USDT</button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cupón (Opcional)</label>
                                <input 
                                    placeholder="CÓDIGO" 
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm uppercase focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* QUOTE RESULT */}
                    {quote && (
                        <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 relative">
                            <div className="absolute top-0 right-0 bg-brand-100 text-brand-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">Cotización en tiempo real</div>
                            
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-xs font-bold text-brand-400 uppercase">Tú Recibes</p>
                                    <p className="text-4xl font-extrabold text-brand-700 tracking-tight">
                                        {quote.finalAmount.toFixed(2)} <span className="text-lg text-brand-600">{currency}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                     <p className="text-xs font-bold text-brand-400 uppercase">Tasa</p>
                                     <p className="text-xl font-bold text-brand-600">{quote.rate.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-brand-100 flex flex-col gap-1">
                                {quote.appliedCoupon && (
                                    <div className="flex justify-between text-xs font-bold text-green-600">
                                        <span>Cupón Aplicado ({quote.appliedCoupon.code})</span>
                                        <span>+ Descuento/Bono</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs text-brand-800 opacity-70">
                                    <span>Comisión PayPal (Est.)</span>
                                    <span>-${quote.ppFee.toFixed(2)}</span>
                                </div>
                                {currency === 'VES' && quote.bcvEquivalent > 0 && (
                                    <div className="flex justify-between text-xs font-bold text-blue-600 mt-1">
                                        <span>Equivalente BCV (Ref)</span>
                                        <span>${quote.bcvEquivalent.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleCreate}
                        disabled={isSubmitting}
                        className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-200 hover:bg-brand-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader className="animate-spin"/> : <>Confirmar y Vender <ArrowRight/></>}
                    </button>
                    
                    <p className="text-center text-xs text-slate-400">
                        Al confirmar, se creará una orden pendiente y recibirás las instrucciones de pago.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- SECTION 2: OPERATIONS (PENDING & HISTORY) ---
const OperationsSection = ({ transactions, config }: { transactions: Transaction[], config: SystemConfig }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
    const [subTab, setSubTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
    
    // IMPORTANT: Store ID instead of Object to allow polling updates to reflect immediately
    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

    // Derive selectedTx from the live transactions list
    const selectedTx = transactions.find(t => t.id === selectedTxId) || null;

    // Active transactions are those not fully completed
    const pendingTxs = transactions.filter(t => ['PENDING', 'INVOICE_SENT', 'VERIFYING', 'PROCESSING'].includes(t.status));
    
    // History includes everything
    const historyTxs = transactions;

    const handleSelectTx = (id: string) => {
        setSelectedTxId(id);
        setViewMode('DETAIL');
    };

    if (viewMode === 'DETAIL' && selectedTx) {
        return (
            <div className="animate-fadeIn">
                <button 
                    onClick={() => { setViewMode('LIST'); setSelectedTxId(null); }} 
                    className="mb-6 flex items-center gap-2 text-slate-500 hover:text-brand-600 font-medium transition-colors"
                >
                    <ArrowLeft size={20}/> Volver a Operaciones
                </button>
                <TransactionDetailView transaction={selectedTx} config={config} />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <History className="text-brand-600"/> Centro de Operaciones
            </h2>

            {/* SUB TABS */}
            <div className="flex space-x-1 bg-slate-200 p-1 rounded-xl w-fit mb-6">
                <button 
                    onClick={() => setSubTab('PENDING')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'PENDING' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Pendientes ({pendingTxs.length})
                </button>
                <button 
                    onClick={() => setSubTab('HISTORY')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'HISTORY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Historial Completo
                </button>
            </div>

            {/* VIEW: PENDING */}
            {subTab === 'PENDING' && (
                <div className="space-y-4">
                    {pendingTxs.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
                            <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-green-500"/>
                            <p className="font-medium text-lg text-slate-600">¡Estás al día!</p>
                            <p className="text-sm">No tienes operaciones pendientes de completar.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {pendingTxs.map(tx => (
                                <div key={tx.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                                                <Clock size={24}/> 
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                tx.status === 'INVOICE_SENT' ? 'bg-blue-100 text-blue-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                                {tx.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-lg text-slate-800 mb-1">Operación #{tx.id.slice(-6)}</h3>
                                        <p className="text-slate-500 text-xs mb-6">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}</p>

                                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6">
                                            <span className="font-bold text-slate-600">${tx.amountIn}</span>
                                            <ArrowRight size={14} className="text-slate-400"/>
                                            <span className="font-bold text-brand-600">{tx.amountOut.toFixed(2)}</span>
                                        </div>

                                        <button 
                                            onClick={() => handleSelectTx(tx.id)}
                                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            Continuar Proceso <ArrowRight size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* VIEW: HISTORY */}
            {subTab === 'HISTORY' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {historyTxs.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <History size={48} className="mx-auto mb-4 opacity-20"/>
                            <p>No hay registro de operaciones.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Fecha / ID</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Monto</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {historyTxs.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleSelectTx(tx.id)}>
                                        <td className="px-6 py-4">
                                            <span className="block font-bold text-slate-700">#{tx.id.slice(-6)}</span>
                                            <span className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Wallet size={16} className="text-slate-400"/>
                                                <span>PayPal</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            <span className="text-slate-600">${tx.amountIn}</span>
                                            <span className="mx-2 text-slate-300">→</span>
                                            <span className="font-bold text-brand-600">{tx.amountOut.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-brand-600 hover:text-brand-800 hover:bg-brand-50 p-2 rounded-full">
                                                <ArrowRight size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

// --- TRANSACTION DETAIL DEEP VIEW ---
const TransactionDetailView = ({ transaction, config }: { transaction: Transaction, config: SystemConfig }) => {
    // Determine progress index
    const statusOrder = ['PENDING', 'INVOICE_SENT', 'VERIFYING', 'PROCESSING', 'COMPLETED'];
    const currentIdx = statusOrder.indexOf(transaction.status);
    const [isReporting, setIsReporting] = useState(false);

    const handleSupportClick = () => {
        window.open(`https://wa.me/${config.design.whatsappNumber}?text=Hola, tengo una consulta sobre la operación #${transaction.id}`, '_blank');
    };

    const handleReportPayment = async () => {
        setIsReporting(true);
        await new Promise(r => setTimeout(r, 1000)); // Mock network
        MockBackend.updateTransactionStatus(transaction.id, 'VERIFYING');
        setIsReporting(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* 1. HEADER & STATUS TRACKER */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Detalle de Operación</h1>
                        <p className="text-slate-500 text-sm">ID: <span className="font-mono text-slate-700 font-bold">#{transaction.id.slice(-6)}</span></p>
                    </div>
                    <StatusBadge status={transaction.status} large />
                </div>

                {/* Stepper */}
                <div className="relative flex items-center justify-between mb-4 px-4">
                    {/* Line */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 transition-all duration-1000 -z-10" style={{ width: `${(currentIdx / (statusOrder.length - 1)) * 100}%` }}></div>

                    {statusOrder.map((step, idx) => {
                        const isCompleted = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                            <div key={step} className="flex flex-col items-center gap-2 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-300'} ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                                    {isCompleted ? <CheckCircle size={16}/> : <div className="w-2 h-2 bg-slate-300 rounded-full"></div>}
                                </div>
                                <span className={`text-[10px] font-bold uppercase hidden md:block ${isCurrent ? 'text-brand-600' : 'text-slate-400'}`}>
                                    {step.replace('_', ' ')}
                                </span>
                            </div>
                        );
                    })}
                </div>
                
                {transaction.rejectionReason && (
                    <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="text-red-500 shrink-0" size={20}/>
                        <div>
                            <p className="text-sm font-bold text-red-800">Operación Rechazada</p>
                            <p className="text-xs text-red-600 mt-1">{transaction.rejectionReason}</p>
                            <button onClick={handleSupportClick} className="mt-2 text-xs font-bold text-red-700 underline">Contactar Soporte</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* 2. FINANCIAL DETAILS */}
                <div className="md:col-span-2 space-y-6">
                    {transaction.status === 'COMPLETED' ? (
                        <div className="animate-fadeIn">
                             <ReceiptView transaction={transaction} />
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-brand-600"/> Resumen Financiero
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-500">Monto Enviado (PayPal)</span>
                                    <span className="font-bold text-slate-800">${transaction.amountIn.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-500">Tasa de Cambio</span>
                                    <span className="font-bold text-slate-800">{transaction.rateApplied.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between p-4 bg-brand-50 border border-brand-100 rounded-lg">
                                    <span className="text-sm font-bold text-brand-700 uppercase">Total Recibido</span>
                                    <span className="font-bold text-xl text-brand-600">{transaction.amountOut.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. RIGHT COLUMN: ACTIONS */}
                <div className="space-y-6">
                    {/* ACTION CARD */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                         {transaction.status === 'PENDING' && (
                             <>
                                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-100 rounded-bl-full -mr-8 -mt-8"></div>
                                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 relative z-10"><Clock className="text-yellow-500"/> Esperando Factura</h3>
                                <p className="text-xs text-slate-500 mb-4">Estamos generando tu factura de pago. Te notificaremos en breve.</p>
                                <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-lg font-bold text-sm cursor-not-allowed">Esperando Admin...</button>
                             </>
                         )}

                         {transaction.status === 'INVOICE_SENT' && (
                             <div className="animate-fadeIn">
                                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Banknote className="text-blue-500"/> Factura Emitida</h3>
                                <p className="text-xs text-slate-500 mb-4">Hemos enviado la factura a tu correo PayPal. Por favor realiza el pago y repórtalo aquí.</p>
                                <button 
                                    onClick={handleReportPayment}
                                    disabled={isReporting}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
                                >
                                    {isReporting ? <Loader className="animate-spin" size={16}/> : <CheckCircle size={16}/>}
                                    Ya realicé el pago
                                </button>
                             </div>
                         )}

                         {transaction.status === 'VERIFYING' && (
                             <>
                                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Shield className="text-purple-500"/> Verificando</h3>
                                <p className="text-xs text-slate-500 mb-4">Estamos validando tu pago en nuestro sistema. Esto toma unos minutos.</p>
                                <div className="w-full bg-purple-50 text-purple-700 py-3 rounded-lg text-xs font-bold text-center border border-purple-100">
                                    Validación en progreso...
                                </div>
                             </>
                         )}
                         
                         {transaction.status === 'PROCESSING' && (
                             <>
                                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><RefreshCw className="text-orange-500 animate-spin"/> Procesando Pago</h3>
                                <p className="text-xs text-slate-500 mb-4">Pago verificado. Estamos enviando tu dinero a la cuenta destino.</p>
                             </>
                         )}

                         {transaction.status === 'COMPLETED' && (
                             <>
                                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><CheckCircle className="text-green-500"/> ¡Todo Listo!</h3>
                                <p className="text-xs text-slate-500 mb-4">La operación ha finalizado exitosamente. Puedes descargar tu recibo.</p>
                                <button className="w-full py-2 bg-green-50 text-green-700 rounded-lg font-bold text-xs border border-green-200">Dejar Testimonio</button>
                             </>
                         )}
                    </div>

                    {/* SUPPORT & HELP */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                         <h3 className="font-bold text-slate-800 mb-2 text-sm">¿Problemas?</h3>
                         <p className="text-xs text-slate-500 mb-4">Si tienes dudas sobre el estado de tu transacción.</p>
                         <button 
                            onClick={handleSupportClick}
                            className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                         >
                             <HelpCircle size={14}/> Contactar Soporte
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status, large }: { status: TransactionStatus, large?: boolean }) => {
   const styles: any = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'INVOICE_SENT': 'bg-blue-100 text-blue-800',
      'VERIFYING': 'bg-purple-100 text-purple-800',
      'PROCESSING': 'bg-orange-100 text-orange-800',
      'COMPLETED': 'bg-green-100 text-green-800'
   };
   const labels: any = {
      'PENDING': 'Esperando Factura',
      'INVOICE_SENT': 'Factura Enviada',
      'VERIFYING': 'Verificando Pago',
      'PROCESSING': 'En Proceso',
      'COMPLETED': 'Finalizado'
   };
   return <span className={`rounded-full font-bold uppercase ${styles[status]} ${large ? 'px-4 py-2 text-sm' : 'px-2 py-0.5 text-[10px]'}`}>{labels[status]}</span>;
};

// --- RECEIPT COMPONENT (ENHANCED) ---
const ReceiptView = ({ transaction }: { transaction: Transaction }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative print:shadow-none">
            {/* DECORATIVE HEADER */}
            <div className="h-2 w-full bg-gradient-to-r from-brand-500 to-brand-700"></div>
            
            <div className="p-8">
                {/* LOGO & DATE */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">tudinero<span className="text-brand-600">mueve</span></h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Comprobante de Operación</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Fecha de Emisión</div>
                        <p className="text-sm font-medium text-slate-800">{new Date(transaction.updatedAt).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500">{new Date(transaction.updatedAt).toLocaleTimeString()}</p>
                    </div>
                </div>

                {/* MAIN INFO GRID */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Cliente / Remitente</p>
                        <p className="font-bold text-slate-800 text-sm mb-1">{transaction.clientName}</p>
                        <p className="text-xs text-slate-500 font-mono">ID: {transaction.clientId.slice(0,8)}...</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Referencia Única</p>
                        <p className="font-mono font-bold text-slate-800 text-lg">#{transaction.id.slice(-6)}</p>
                        <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1"><CheckCircle size={10}/> Completado</p>
                    </div>
                </div>

                {/* BREAKDOWN TABLE */}
                <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-4">Detalle de la Transacción</h4>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-3 text-slate-600">Monto Recibido (PayPal)</td>
                                <td className="py-3 text-right font-medium text-slate-900">${transaction.amountIn.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-slate-600">Tasa de Cambio Aplicada</td>
                                <td className="py-3 text-right font-medium text-slate-900">{transaction.rateApplied.toFixed(2)}</td>
                            </tr>
                            {transaction.couponApplied && (
                                <tr>
                                    <td className="py-3 text-green-600 font-medium">Cupón Promocional</td>
                                    <td className="py-3 text-right font-bold text-green-600">Aplicado</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-100">
                            <tr>
                                <td className="py-4 text-base font-bold text-slate-800">Total Entregado</td>
                                <td className="py-4 text-right text-xl font-bold text-brand-600">{transaction.amountOut.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* DESTINATION INFO (IF AVAILABLE) */}
                {transaction.destinationData && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-8">
                        <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-2"><Wallet size={12}/> Datos de Destino</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs text-blue-900">
                            <div>
                                <span className="block opacity-60 font-bold">Banco / Plataforma</span>
                                <span>{transaction.destinationData.bank || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block opacity-60 font-bold">Cuenta / Beneficiario</span>
                                <span>{transaction.destinationData.account || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                     <p className="text-[10px] text-slate-400 max-w-[200px]">Este documento es un comprobante digital emitido por tudineromueve.com</p>
                     <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                         <Download size={14}/> Descargar PDF
                     </button>
                </div>
            </div>
            
            {/* WATERMARK */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
                 <Wallet size={300} />
            </div>
        </div>
    );
};

// --- SECTION 3: COUPONS ---
const CouponsSection = ({ user, config, transactions, refresh }: { user: User, config: SystemConfig, transactions: Transaction[], refresh: () => void }) => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

    const handleRedeem = () => {
        if(!code) return;
        const result = MockBackend.redeemCoupon(user.id, code);
        setMessage({ type: result.success ? 'success' : 'error', text: result.message });
        if(result.success) {
            setCode('');
            refresh();
        }
        setTimeout(() => setMessage(null), 3000);
    };

    // Coupons collected in wallet vs Used in transactions
    const walletCoupons = user.savedCoupons || [];
    const usedCoupons = transactions.filter(t => t.couponApplied).map(t => ({ code: t.couponApplied, date: t.createdAt }));

    return (
        <div className="animate-fadeIn space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Ticket className="text-brand-600"/> Mis Cupones
            </h2>

            {/* REDEEM */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Canjear Código Promocional</h3>
                <div className="flex gap-3">
                    <input 
                        value={code} 
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="INGRESA TU CÓDIGO AQUÍ" 
                        className="flex-1 p-3 border border-slate-200 rounded-xl text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    <button 
                        onClick={handleRedeem}
                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Canjear
                    </button>
                </div>
                {message && (
                    <div className={`mt-3 p-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-fadeIn ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                        {message.text}
                    </div>
                )}
            </div>

            {/* WALLET (Available) */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Disponibles en Billetera</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {walletCoupons.length === 0 ? (
                        <p className="text-slate-400 text-sm italic">No tienes cupones guardados.</p>
                    ) : (
                        walletCoupons.map((code, idx) => (
                            <div key={idx} className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex justify-between items-center relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-16 h-16 bg-brand-100 rounded-full opacity-50"></div>
                                <div>
                                    <p className="text-xl font-black text-brand-700 tracking-widest">{code}</p>
                                    <p className="text-xs text-brand-500 font-medium">Disponible para usar</p>
                                </div>
                                <Ticket className="text-brand-300" size={32}/>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* HISTORY (Used) */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Historial de Uso</h3>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {usedCoupons.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">No has utilizado cupones aún.</div>
                    ) : (
                        usedCoupons.map((c, idx) => (
                            <div key={idx} className="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center">
                                <span className="font-bold text-slate-600">{c.code}</span>
                                <span className="text-xs text-slate-400">Usado el {new Date(c.date).toLocaleDateString()}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// --- SECTION 4: CONTACT (SOCIAL) ---
const ContactSection = ({ config }: { config: SystemConfig }) => {
    // Re-declaring for completeness of file replacement
    const icons: Record<string, any> = {
        'WHATSAPP': MessageCircle,
        'INSTAGRAM': Instagram,
        'TWITTER': Twitter,
        'FACEBOOK': Facebook,
        'EMAIL': Send
    };
    
    // Fallback icons if imports fail/change
    const getIcon = (platform: string) => {
        switch(platform) {
            case 'WHATSAPP': return MessageCircle;
            case 'EMAIL': return Send;
            case 'INSTAGRAM': return Instagram;
            case 'TWITTER': return Twitter;
            case 'FACEBOOK': return Facebook;
            default: return MessageCircle; 
        }
    };

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Phone className="text-brand-600"/> Contacto Directo
            </h2>
            <p className="text-slate-500 mb-8">
                Estamos disponibles para atenderte en nuestras plataformas oficiales. Elige tu canal preferido.
            </p>

            <div className="grid gap-4">
                {config.design.socialLinks?.filter(l => l.enabled).map(link => {
                    // Simple icon selection for mock
                    const Icon = getIcon(link.platform);
                    const colors: Record<string, string> = {
                        'WHATSAPP': 'bg-green-500 hover:bg-green-600',
                        'INSTAGRAM': 'bg-pink-600 hover:bg-pink-700',
                        'TWITTER': 'bg-sky-500 hover:bg-sky-600',
                        'FACEBOOK': 'bg-blue-600 hover:bg-blue-700',
                        'EMAIL': 'bg-slate-600 hover:bg-slate-700'
                    };
                    const btnColor = colors[link.platform] || 'bg-brand-600 hover:bg-brand-700';

                    return (
                        <a 
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center justify-between p-5 rounded-xl text-white shadow-md transition-transform hover:-translate-y-1 ${btnColor}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Icon size={24} />
                                </div>
                                <span className="font-bold text-lg">{link.label}</span>
                            </div>
                        </a>
                    );
                })}
            </div>
            
            <div className="mt-12 text-center">
                 <p className="text-xs text-slate-400 font-mono">Horario de Atención: {config.notices}</p>
            </div>
        </div>
    );
};