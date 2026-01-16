
export type UserRole = 'CLIENT' | 'ADMIN' | 'OWNER';
export type AdminLevel = 1 | 2 | 3; 

export type TransactionStatus = 
  | 'PENDING' | 'INVOICE_SENT' | 'VERIFYING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';      

export type TransactionType = 'EXCHANGE_PAYPAL' | 'CRYPTO' | 'ADVISORY';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  paypalEmail?: string;
  country?: string; 
  password?: string;
  adminLevel?: AdminLevel;
  paymentDetails?: string;
  isTwoFactorEnabled?: boolean;
  notes?: string; 
  referralCode?: string;
  savedCoupons?: string[]; 
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
  destinationData?: Record<string, string>; 
  rejectionReason?: string; 
  clientConfirmed?: boolean; 
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
  isClientChargeable?: boolean; 
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

// Config Profiles (Legacy/Global)
export interface ScheduleConfig {
  enabled: boolean;
  days: number[]; 
  startTime: string; 
  endTime: string; 
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
  label: string; 
  value: number;
  isActive: boolean; 
  isReferential?: boolean; 
}

export interface AmountRangeRule {
  id: string;
  minAmount: number;
  maxAmount: number; 
  adjustmentPct: number; 
  enabled: boolean;
}

export interface DynamicRateSettings {
  references: ReferenceItem[]; 
  profitRule: ProfitRule;
  amountRanges?: AmountRangeRule[]; 
}

export interface CurrencyConfig {
  code: string; // VES, COP, USDT
  name: string;
  enabled: boolean;
  
  rateMode: RateMode;
  manualRate: number; 
  secondaryRate?: number; 
  
  dynamicSetting: DynamicRateSettings;

  methods: PaymentMethodConfig[];
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
  expirationDate?: string; 
  description?: string; 
  
  adminOwnerId?: string; 
  adminReward?: { type: CostType; value: number }; 
  clientDiscount: { type: CostType; value: number }; 
}

// --- NEW HIERARCHY: OPERATION PROFILES ---
export interface OperationProfile {
    id: string;
    name: string; // e.g. "Venta Estándar", "Compra Mayorista"
    active: boolean; // Only one active per mode usually, or logic selects first active
    
    // The 3 Pillars of Logistics, now scoped to this profile
    currencies: CurrencyConfig[];
    costs: CostGroup[];
    coupons: Coupon[];
}

// --- ROOT GATEWAY PROFILE ---
export interface GatewayProfile {
    id: string;
    slug: string; // 'PAYPAL', 'USDT'
    label: string; 
    iconName: string; 
    enabled: boolean;
    
    // Split Configuration by Operation Mode
    sellProfiles: OperationProfile[]; // User SELLS to us (We buy) - "Venta de Saldo"
    buyProfiles: OperationProfile[];  // User BUYS from us (We sell) - "Recarga"
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
   whatsappNumber: string; 
   socialLinks: SocialLink[]; 
   services: ServiceItem[];
}

export interface ContactMessage {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    date: number;
    read: boolean;
}

// --- AUDIT & SYSTEM TYPES ---
export interface AuditLog {
    id: string;
    action: string;
    details: string;
    adminName: string;
    timestamp: number;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface SystemNotification {
    id: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    read: boolean;
    timestamp: number;
}

export interface SystemConfig {
  logistics: {
    gatewayProfiles: GatewayProfile[]; 
    profiles: ConfigProfile[]; // Legacy
    descriptions: ContextDescriptions;
  };
  design: DesignConfig; 
  notices: string;
  paypalExternalFee: { pct: number; fixed: number }; 
  hierarchy: HierarchyConfig;
}

export type BudgetTheme = 'DEFAULT' | 'MODERN_DARK' | 'MINIMAL';