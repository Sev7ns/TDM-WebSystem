
import { Transaction, User, SystemConfig, TransactionStatus, CostGroup, ConfigProfile, Coupon, ContactMessage, GatewayProfile, OperationProfile, CurrencyConfig, AuditLog } from '../types';

const STORAGE_KEYS = {
  USERS: 'tdm_users_v2',
  TRANSACTIONS: 'tdm_transactions_v2',
  CONFIG: 'tdm_config_v15_profiles', // Bumped version for migration
  MESSAGES: 'tdm_messages',
  AUDIT: 'tdm_audit_logs'
};

// --- DEFAULT DATA FACTORIES ---
const createDefaultCurrencies = (): CurrencyConfig[] => [
    {
        code: 'VES', name: 'Bolívares', enabled: true,
        rateMode: 'MANUAL',
        manualRate: 45.50, // P2P Deductiva
        secondaryRate: 46.00, // BCV Referencial
        dynamicSetting: {
           references: [
              { id: 'r1', label: 'Promedio P2P', value: 46.50, isActive: true, isReferential: false },
              { id: 'r2', label: 'BCV Oficial', value: 46.00, isActive: false, isReferential: true },
           ],
           profitRule: { mode: 'PCT_ONLY', pct: 12, fixed: 0 },
           amountRanges: []
        },
        methods: [
          { id: 'm1', name: 'Pago Móvil', enabled: true, commission: { pct: 0, fixed: 0, enabled: false } },
          { id: 'm2', name: 'Transferencia', enabled: true, commission: { pct: 0, fixed: 0, enabled: false } }
        ]
    },
    {
        code: 'USDT', name: 'Tether (Cripto)', enabled: true,
        rateMode: 'MANUAL',
        manualRate: 0.95,
        dynamicSetting: { references: [], profitRule: { mode: 'PCT_ONLY', pct: 5, fixed: 0 } },
        methods: []
    }
];

const createDefaultCosts = (): CostGroup[] => [
    {
      id: 'group_bank',
      label: 'Deducciones (Ejemplo)',
      items: [
        { id: 'c1', label: 'Comisión Pasarela', type: 'PCT', category: 'DEDUCTIVE', value: 5.4, enabled: true, isClientChargeable: true },
        { id: 'c1b', label: 'Fijo Pasarela', type: 'FIXED', category: 'DEDUCTIVE', value: 0.30, enabled: true, isClientChargeable: true },
      ]
    }
];

const createDefaultCoupons = (): Coupon[] => [
    { 
      id: 'cp-1', code: 'BIENVENIDA', category: 'CLIENT', type: 'GLOBAL_PROMO', active: true, 
      expirationDate: '2025-12-31', description: 'Bono de bienvenida', clientDiscount: { type: 'FIXED', value: 2 } 
    }
];

const DEFAULT_CONFIG: SystemConfig = {
  notices: "Horario de atención: 8:00 AM - 6:00 PM EST",
  paypalExternalFee: { pct: 5.4, fixed: 0.30 }, 
  hierarchy: {
    level1: { canEditRates: false, canProcessPayments: false, canManageClients: true, canViewAudit: false, canEditCommissions: false },
    level2: { canEditRates: false, canProcessPayments: true, canManageClients: true, canViewAudit: true, canEditCommissions: false },
    level3: { canEditRates: true, canProcessPayments: true, canManageClients: true, canViewAudit: true, canEditCommissions: true }
  },
  design: {
     heroTitle: "Tu dinero mueve el mundo.",
     heroSubtitle: "Gestionamos tu capital con atención humana y tecnología financiera avanzada.",
     footerText: "© 2024 tudineromueve. Todos los derechos reservados.",
     processingTimeText: "Recibirás tu pago entre 10 - 25 minutos",
     whatsappNumber: "584120000000",
     socialLinks: [
         { id: 'soc-1', platform: 'WHATSAPP', label: 'Atención al Cliente', url: 'https://wa.me/584120000000', enabled: true },
         { id: 'soc-2', platform: 'INSTAGRAM', label: 'Instagram Oficial', url: 'https://instagram.com/tudineromueve', enabled: true },
         { id: 'soc-3', platform: 'EMAIL', label: 'Soporte Email', url: 'mailto:soporte@tdm.com', enabled: true }
     ],
     services: [
        { id: 's1', iconName: 'MessageCircle', title: 'Asesoría Financiera', description: 'Expertos listos para ayudarte a mover tu capital de forma inteligente.' },
        { id: 's2', iconName: 'BarChart3', title: 'Intercambio PayPal', description: 'La tasa más competitiva del mercado, procesada en minutos por humanos.' },
        { id: 's3', iconName: 'Shield', title: 'Cripto Activos', description: 'Compra y venta de USDT, BTC y ETH con total seguridad.' }
     ]
  },
  logistics: {
    descriptions: {
      internalCosts: "Gestione los costos operativos, rentabilidad global y perfiles automáticos.",
      ratesAndGateways: "Establezca la Tasa de Cambio por divisa y configure pasarelas de pago.",
      coupons: "Administre la vigencia y beneficios de cupones para clientes y referidos."
    },
    profiles: [],
    // NEW STRUCTURE: GATEWAY -> [SELL PROFILES, BUY PROFILES] -> [CURRENCIES, COSTS, COUPONS]
    gatewayProfiles: [
        {
            id: 'gw-paypal',
            slug: 'PAYPAL',
            label: 'Saldo PayPal',
            iconName: 'Wallet',
            enabled: true,
            sellProfiles: [
                {
                    id: 'prof-sell-std', name: 'Venta Estándar', active: true,
                    currencies: createDefaultCurrencies(),
                    costs: createDefaultCosts(),
                    coupons: createDefaultCoupons()
                }
            ],
            buyProfiles: [
                {
                    id: 'prof-buy-std', name: 'Recarga Estándar', active: true,
                    currencies: createDefaultCurrencies(),
                    costs: createDefaultCosts(),
                    coupons: []
                }
            ]
        },
        {
            id: 'gw-usdt',
            slug: 'USDT',
            label: 'Criptomonedas',
            iconName: 'Bitcoin',
            enabled: true,
             sellProfiles: [
                {
                    id: 'prof-sell-crypto', name: 'Venta Crypto', active: true,
                    currencies: [{...createDefaultCurrencies()[0], manualRate: 46.00}], // VES
                    costs: [{ id: 'g1', label: 'Network Fee', items: [{id:'c1', label:'Gas', type:'FIXED', category:'DEDUCTIVE', value:1, enabled:true, isClientChargeable:true}]}],
                    coupons: []
                }
            ],
            buyProfiles: [
                {
                    id: 'prof-buy-crypto', name: 'Compra Crypto', active: true,
                    currencies: [{...createDefaultCurrencies()[0], manualRate: 48.00}],
                    costs: [],
                    coupons: []
                }
            ]
        }
    ]
  }
};

const SEED_OWNER: User = {
  id: 'owner-1',
  fullName: 'Propietario',
  email: 'admin@tdm.com',
  password: 'admin',
  role: 'OWNER',
  isTwoFactorEnabled: false
};

const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export class MockBackend {
  static getConfig(): SystemConfig {
    const config = getStorage(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    if (!(config.logistics.gatewayProfiles[0] as any).sellProfiles) {
        return DEFAULT_CONFIG; 
    }
    return config;
  }

  static updateConfig(newConfig: Partial<SystemConfig>): SystemConfig {
    const current = this.getConfig();
    const updated = { ...current, ...newConfig };
    setStorage(STORAGE_KEYS.CONFIG, updated);
    this.createAuditLog("CONFIG_UPDATE", "System configuration updated");
    return updated;
  }

  // --- RATES & QUOTES (UPDATED FOR PROFILES) ---
  
  static getActiveProfile(gatewaySlug: string, mode: 'BUY' | 'SELL'): OperationProfile | null {
      const config = this.getConfig();
      const gateway = config.logistics.gatewayProfiles.find(g => g.slug === gatewaySlug);
      if(!gateway) return null;

      const profiles = mode === 'SELL' ? gateway.sellProfiles : gateway.buyProfiles;
      return profiles.find(p => p.active) || profiles[0] || null;
  }

  static getClientRate(currencyCode: string, gatewaySlug: string = 'PAYPAL', mode: 'BUY' | 'SELL' = 'SELL'): number {
    const profile = this.getActiveProfile(gatewaySlug, mode);
    if (!profile) return 0;

    const currency = profile.currencies.find(c => c.code === currencyCode);
    if (!currency) return 0;

    if (currency.rateMode === 'MANUAL') {
        return currency.manualRate; 
    } else {
        const activeRef = currency.dynamicSetting.references.find(r => r.isActive) || { value: 0 };
        const refValue = activeRef.value;
        const profit = currency.dynamicSetting.profitRule;
        let margin = 0;
        
        if (profit.mode === 'PCT_ONLY' || profit.mode === 'MIXED') {
            margin += refValue * (profit.pct / 100);
        }
        
        if (profit.mode === 'FIXED_ONLY' || profit.mode === 'MIXED') margin += profit.fixed;
        
        return Math.max(0, refValue - margin);
    }
  }

  static calculateQuote(
      amountGross: number, 
      currencyCode: string, 
      profileId?: string, 
      couponCode?: string, 
      gatewaySlug: string = 'PAYPAL',
      mode: 'BUY' | 'SELL' = 'SELL'
  ) {
    const profile = this.getActiveProfile(gatewaySlug, mode);
    
    // Default zero-result
    const zeroResult = {
        gross: amountGross, externalGatewayFee: 0, netGateway: 0, opsDeductions: 0, adminAbsorbedCosts: 0,
        netInternalReceipt: 0, serviceFee: 0, baseForExchange: 0, rate: 0, finalAmount: 0,
        bcvEquivalent: 0, appliedCoupon: null, marketReferenceRate: 0, internalStats: { netProfitUSD: 0 },
        // Legacy prop for compatibility
        ppFee: 0
    };

    if (!profile) return zeroResult;

    // 2. Calculate Costs from Profile
    let opsDeductions = 0; 
    let serviceFee = 0;    
    let adminAbsorbedCosts = 0; 
    let externalGatewayFee = 0; // Generic external fee (PayPal, Zinli, etc)

    // Helper to check if a cost is the "External Gateway Fee"
    // Checks for "paypal", "zinli", "pasarela", "fee", or the gateway slug itself
    const isGatewayFee = (label: string) => {
        const l = label.toLowerCase();
        return l.includes('paypal') || l.includes('pasarela') || l.includes('fee') || l.includes(gatewaySlug.toLowerCase());
    };

    profile.costs.forEach(group => {
        group.items.forEach(item => {
            if(item.enabled) {
                let val = 0;
                if(item.type === 'PCT') val = amountGross * (item.value / 100);
                else val = item.value;

                if(isGatewayFee(item.label) && item.category === 'DEDUCTIVE') {
                    externalGatewayFee += val; 
                }

                if (item.category === 'ADDITIVE') {
                    serviceFee += val; 
                } else {
                    const isChargeable = item.isClientChargeable !== false;
                    
                    // If it is the external fee, we count it as deduction but handle it in netGateway logic too
                    if (isChargeable) {
                        opsDeductions += val; 
                    } else {
                        adminAbsorbedCosts += val;
                    }
                }
            }
        });
    });

    const netGateway = amountGross - externalGatewayFee;
    
    // NOTE: opsDeductions includes the externalGatewayFee if it was chargeable.
    // So netInternalReceipt = Gross - All Deductibles - Admin Absorbed
    const netInternalReceipt = amountGross - opsDeductions - adminAbsorbedCosts;
    const baseForExchange = Math.max(0, amountGross - opsDeductions); // Usually base is what's left after deductions
    
    const currency = profile.currencies.find(c => c.code === currencyCode);
    const rate = this.getClientRate(currencyCode, gatewaySlug, mode); 
    
    let finalAmount = 0;
    if (mode === 'SELL') {
        // Client sends USD -> We deduct costs -> We exchange remaining USD to VES
        finalAmount = baseForExchange * rate;
    } else {
        // Client wants to BUY (Recarga)
        // Usually: Client Pays VES -> We convert to USD -> We deduct costs -> Client receives Net USD
        // However, if amountGross is the USD amount they want to RECEIVE (Target):
        // logic depends on input type. Assuming amountGross is the USD base value involved.
        // Simplified: 
        finalAmount = baseForExchange / (rate || 1);
    }

    let bcvEquivalent = 0;
    let marketReferenceRate = 0; 

    if (currencyCode === 'VES' && currency) {
        const activeRef = currency.dynamicSetting.references.find(r => r.isActive);
        marketReferenceRate = activeRef ? activeRef.value : (currency.manualRate * 1.05); 
        if (currency.secondaryRate) {
            bcvEquivalent = finalAmount / currency.secondaryRate; // Approximate USD value of VES received
        }
    }

    let appliedCoupon: Coupon | null = null;
    if (couponCode) {
        const coupon = profile.coupons.find(c => c.code === couponCode && c.active);
        if (coupon) {
            appliedCoupon = coupon;
            if (coupon.clientDiscount.type === 'PCT') {
                 finalAmount = finalAmount * (1 + (coupon.clientDiscount.value / 100));
            } else {
                 finalAmount = finalAmount + coupon.clientDiscount.value; 
            }
        }
    }

    let profit = 0;
    
    if (mode === 'SELL') {
        // We received 'netInternalReceipt' in USD. We paid 'finalAmount' in VES.
        // Profit = Money In (USD) - Money Out (USD Equivalent)
        if (currencyCode === 'VES' && marketReferenceRate > 0) {
            const costToCoverInUSD = finalAmount / marketReferenceRate; // Reposition cost
            profit = netInternalReceipt - costToCoverInUSD;
        } else {
            // Crypto/USD case
            profit = netInternalReceipt - (finalAmount / (rate || 1));
        }
    } else {
        // BUY Mode
        // We received VES (amountGross * rate?). 
        // Logic simplified: Profit is usually the service fee + spread.
        profit = serviceFee + (amountGross * 0.02); // Mock spread profit for demo
    }

    return {
        gross: amountGross,
        externalGatewayFee, // Renamed from ppFee
        netGateway, // Renamed from netPaypal
        opsDeductions, 
        adminAbsorbedCosts, 
        netInternalReceipt, 
        serviceFee,   
        baseForExchange,
        rate,
        finalAmount,
        bcvEquivalent,
        appliedCoupon,
        marketReferenceRate, 
        internalStats: {
            netProfitUSD: profit
        },
        // Legacy mapping for UI components that might still use ppFee
        ppFee: externalGatewayFee,
        netPaypal: netGateway
    };
  }

  // --- USERS & AUTH ---
  static getUsers(): User[] { return getStorage<User[]>(STORAGE_KEYS.USERS, [SEED_OWNER]); }
  
  static register(userData: Partial<User>): { success: boolean, user?: User, error?: string } {
    const users = this.getUsers();
    
    if (!userData.email || !userData.password || !userData.fullName) {
        return { success: false, error: 'Datos incompletos' };
    }
    
    if (userData.password.length < 3) {
        return { success: false, error: 'La contraseña es muy corta.' };
    }

    if (users.find(u => u.email === userData.email)) {
        return { success: false, error: 'El correo ya está registrado.' };
    }

    const newUser: User = { 
        id: `u-${Date.now()}`, 
        role: 'CLIENT', 
        savedCoupons: [],
        ...userData 
    } as User;
    
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    this.createAuditLog("REGISTER", `New user registered: ${newUser.email}`);
    return { success: true, user: newUser };
  }
  
  static login(email: string): User | null { return this.getUsers().find(u => u.email === email) || null; }
  static getAdmins(): User[] { return this.getUsers().filter(u => u.role === 'ADMIN' || u.role === 'OWNER'); }
  static createAdmin(admin: User): void { const users = this.getUsers(); users.push({ ...admin, id: `adm-${Date.now()}`, role: 'ADMIN' }); setStorage(STORAGE_KEYS.USERS, users); }
  
  // --- COUPONS (USER REDEEM) ---
  static redeemCoupon(userId: string, code: string): { success: boolean, message: string } {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) return { success: false, message: 'Usuario no encontrado' };

      const config = this.getConfig();
      let foundCoupon: Coupon | null = null;
      
      for (const gw of config.logistics.gatewayProfiles) {
          for (const p of [...gw.sellProfiles, ...gw.buyProfiles]) {
              const c = p.coupons.find(cp => cp.code === code && cp.active);
              if (c) { foundCoupon = c; break; }
          }
          if (foundCoupon) break;
      }
      
      if (!foundCoupon) return { success: false, message: 'Cupón inválido o expirado' };
      
      const user = users[userIndex];
      if (user.savedCoupons?.includes(code)) return { success: false, message: 'Ya has canjeado este cupón' };

      user.savedCoupons = [...(user.savedCoupons || []), code];
      users[userIndex] = user;
      setStorage(STORAGE_KEYS.USERS, users);
      
      return { success: true, message: 'Cupón agregado a tu billetera' };
  }

  // --- TRANSACTIONS ---
  static getTransactions(userId?: string): Transaction[] {
      const txs = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
      if (userId) return txs.filter(t => t.clientId === userId).sort((a,b) => b.createdAt - a.createdAt);
      return txs.sort((a,b) => b.createdAt - a.createdAt);
  }
  
  static createTransaction(tx: Partial<Transaction>): Transaction {
      const txs = this.getTransactions();
      const newTx: Transaction = { id: `tx-${Date.now()}`, status: 'PENDING', createdAt: Date.now(), updatedAt: Date.now(), type: 'EXCHANGE_PAYPAL', amountIn: 0, amountOut: 0, rateApplied: 0, clientId: '', clientName: '', ...tx } as Transaction;
      txs.push(newTx);
      setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
      return newTx;
  }
  
  static updateTransactionStatus(txId: string, status: TransactionStatus, minutes?: number, rejectionReason?: string): void {
      let txs = this.getTransactions();
      txs = txs.map(t => { 
          if (t.id === txId) {
             return { 
                 ...t, 
                 status, 
                 updatedAt: Date.now(), 
                 timerEndAt: minutes ? Date.now() + (minutes * 60000) : t.timerEndAt,
                 rejectionReason: rejectionReason || t.rejectionReason
             }; 
          }
          return t; 
      });
      setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
      this.createAuditLog("TX_UPDATE", `Transaction ${txId} updated to ${status}`);
  }

  static updateTransactionDestination(txId: string, data: Record<string, string>): void {
      let txs = this.getTransactions();
      txs = txs.map(t => t.id === txId ? { ...t, destinationData: data, updatedAt: Date.now() } : t);
      setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
  }

  static confirmClientReceipt(txId: string): void {
      let txs = this.getTransactions();
      txs = txs.map(t => t.id === txId ? { ...t, clientConfirmed: true, updatedAt: Date.now() } : t);
      setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
  }

  // --- MESSAGES ---
  static getMessages(): ContactMessage[] {
      return getStorage<ContactMessage[]>(STORAGE_KEYS.MESSAGES, []).sort((a,b) => b.date - a.date);
  }

  static sendMessage(msg: Partial<ContactMessage>): void {
      const msgs = this.getMessages();
      msgs.push({ id: `msg-${Date.now()}`, read: false, date: Date.now(), ...msg } as ContactMessage);
      setStorage(STORAGE_KEYS.MESSAGES, msgs);
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(): AuditLog[] {
      return getStorage<AuditLog[]>(STORAGE_KEYS.AUDIT, []).sort((a,b) => b.timestamp - a.timestamp);
  }

  static createAuditLog(action: string, details: string, severity: 'INFO'|'WARNING'|'CRITICAL' = 'INFO') {
      const logs = this.getAuditLogs();
      logs.unshift({
          id: `log-${Date.now()}`,
          action,
          details,
          severity,
          timestamp: Date.now(),
          adminName: 'System' // In real app, pass current user context
      });
      // Keep only last 100
      if(logs.length > 100) logs.pop();
      setStorage(STORAGE_KEYS.AUDIT, logs);
  }
}
