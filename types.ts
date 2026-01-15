
export type UserRole = 'CLIENT' | 'ADMIN' | 'OWNER';
export type AdminLevel = 1 | 2 | 3; 

export type TransactionStatus = 
  | 'PENDING' | 'INVOICE_SENT' | 'VERIFYING' | 'PROCESSING' | 'COMPLETED';      

export type TransactionType = 'EXCHANGE_PAYPAL' | 'CRYPTO' | 'ADVISORY';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  paypalEmail?: string;
  country?: string; // New
  password?: string;
  adminLevel?: AdminLevel;
  paymentDetails?: string;
  isTwoFactorEnabled?: boolean;
  notes?: string; 
  referralCode?: string;
  savedCoupons?: string[]; // Array of coupon codes redeemed by the user
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  type: TransactionType;
  amountIn: number; 
  amountOut: number; 
  rateApplied: number;
  status: TransactionStatus;
  createdAt: number; 
  updatedAt: number; 
  timerEndAt?: number;
  internalNotes?: string; 
  couponApplied?: string;
  
  // New Operational Fields
  destinationData?: Record<string, string>; // Stores dynamic fields like {bank: 'Banesco', phone: '...'}
  rejectionReason?: string; // If admin rejects payment verification
  clientConfirmed?: boolean; // Step 6
}

// --- LOGISTICS & CONFIG TYPES ---

export type RateStrategyType = 'FIXED' | 'DYNAMIC';
export type CostType = 'PCT' | 'FIXED';
export type CostCategory = 'DEDUCTIVE' | 'ADDITIVE'; 
export type ProfitStrategy = 'GLOBAL' | 'PER_CURRENCY';

export interface ProfitRule {
  mode: 'PCT_ONLY' | 'FIXED_ONLY' | 'MIXED';
  pct: number;
  fixed: number;
}

export interface CostItem {
  id: string;
  label: string;
  type: CostType;
  category: CostCategory; 
  value: number;
  enabled: boolean;
  isClientChargeable?: boolean; // New: If true, client pays. If false, admin absorbs.
}

export interface CostGroup {
  id: string;
  label: string;
  items: CostItem[];
}

export interface RateConfig {
  strategy: RateStrategyType;
  baseP2P: number; 
  manualRate: number; 
  profitStrategy: ProfitStrategy;
  globalProfit: ProfitRule;
}

// Config Profiles
export interface ScheduleConfig {
  enabled: boolean;
  days: number[]; // 0 = Sunday, 1 = Monday...
  startTime: string; // "08:00"
  endTime: string; // "18:00"
}

export interface ConfigProfile {
  id: string;
  name: string; 
  schedule: ScheduleConfig;
  snapshot: {
    rates: RateConfig;
    costs: CostGroup[];
  };
}

// Payment Gateways & Currencies
export interface PaymentMethodConfig {
  id: string;
  name: string; 
  enabled: boolean;
  commission: { pct: number; fixed: number; enabled: boolean };
}

export type RateMode = 'MANUAL' | 'DYNAMIC';

export interface ReferenceItem {
  id: string;
  label: string; // e.g. "Tasa BCV", "Binance P2P"
  value: number;
  isActive: boolean; // Used for Deductive Rate
  isReferential?: boolean; // Used for Referential Rate (BCV)
}

export interface AmountRangeRule {
  id: string;
  minAmount: number;
  maxAmount: number; // 0 means infinity
  adjustmentPct: number; // Percentage to reduce from the profit margin (improving client rate)
  enabled: boolean;
}

export interface DynamicRateSettings {
  references: ReferenceItem[]; 
  profitRule: ProfitRule;
  amountRanges?: AmountRangeRule[]; // New field for dynamic parameters
}

export interface CurrencyConfig {
  code: string; // VES, COP, USDT
  name: string;
  enabled: boolean;
  
  rateMode: RateMode;
  manualRate: number; // For VES: "Precio P2P (Deductiva)"
  secondaryRate?: number; // For VES: "Tasa BCV (Referencial)"
  
  dynamicSetting: DynamicRateSettings;

  methods: PaymentMethodConfig[];
}

// --- NEW HIERARCHY: GATEWAY PROFILES ---
export interface GatewayProfile {
    id: string;
    slug: string; // 'PAYPAL', 'USDT', 'ZINLI', 'WALLY'
    label: string; // "Saldo PayPal", "Criptomonedas"
    iconName: string; // For UI mapping
    enabled: boolean;
    
    // Each Gateway has its own Currencies and Costs
    currencies: CurrencyConfig[];
    costs: CostGroup[];
}

// Coupons
export type CouponCategory = 'ADMIN' | 'CLIENT';
export type CouponType = 'REFERRAL' | 'GIFT' | 'GLOBAL_PROMO' | 'TARGET_PROMO';

export interface Coupon {
  id: string;
  code: string;
  category: CouponCategory;
  type: CouponType;
  active: boolean;
  expirationDate?: string; // YYYY-MM-DD
  description?: string; // New
  
  // For Admin Referrals:
  adminOwnerId?: string; // The admin who owns this code
  adminReward?: { type: CostType; value: number }; // What the admin gets
  
  // For Clients (Referral benefit OR Promo):
  clientDiscount: { type: CostType; value: number }; // What the client gets (added to final amount or discounted from fee)
}

// Hierarchy
export interface AdminPermission {
  canEditRates: boolean;
  canProcessPayments: boolean;
  canManageClients: boolean;
  canViewAudit: boolean;
  canEditCommissions: boolean;
}

export interface HierarchyConfig {
  level1: AdminPermission;
  level2: AdminPermission;
  level3: AdminPermission;
}

// Section Context Descriptions
export interface ContextDescriptions {
  internalCosts: string;
  ratesAndGateways: string;
  coupons: string;
}

// --- DESIGN CMS TYPES ---
export interface ServiceItem {
   id: string;
   iconName: 'BarChart3' | 'Shield' | 'MessageCircle' | 'Globe' | 'Zap' | 'Wallet'; 
   title: string;
   description: string;
}

export interface SocialLink {
    id: string;
    platform: 'WHATSAPP' | 'INSTAGRAM' | 'TWITTER' | 'FACEBOOK' | 'TIKTOK' | 'TELEGRAM' | 'EMAIL';
    url: string;
    label: string;
    enabled: boolean;
}

export interface DesignConfig {
   heroTitle: string;
   heroSubtitle: string;
   footerText: string;
   processingTimeText: string;
   whatsappNumber: string; // Legacy support, sync with socialLinks
   socialLinks: SocialLink[]; // New
   services: ServiceItem[];
}

export interface ContactMessage { // NEW
    id: string;
    fullName: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    date: number;
    read: boolean;
}

export interface SystemConfig {
  logistics: {
    gatewayProfiles: GatewayProfile[]; // NEW ROOT
    coupons: Coupon[];
    profiles: ConfigProfile[];
    descriptions: ContextDescriptions;
  };
  design: DesignConfig; 
  notices: string;
  paypalExternalFee: { pct: number; fixed: number }; 
  hierarchy: HierarchyConfig;
}

export type BudgetTheme = 'DEFAULT' | 'MODERN_DARK' | 'MINIMAL';