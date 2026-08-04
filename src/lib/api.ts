import axios, { AxiosError } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const http = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Error thrown for any non-2xx response. Carries per-field validation errors when the server sends them. */
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** URL prefixes that don't imply an authenticated session — skip the auto-logout redirect for these. */
const PUBLIC_PATH_PREFIXES = ["/auth/login", "/auth/register", "/deposit-methods", "/settings"];

/** Routes where redirecting to /login on 401 would be a redirect loop. */
const AUTH_ROUTES = ["/login", "/register"];

http.interceptors.response.use(
  (r) => r,
  (error: AxiosError<{ message?: string; error?: string; errors?: Record<string, string[]> }>) => {
    const data = error.response?.data;
    const message =
      (typeof data === "string" && data) ||
      (data && typeof data === "object" && (data.message || data.error)) ||
      error.message ||
      "Request failed";
    const fieldErrors =
      (data && typeof data === "object" && "errors" in data && data.errors) || {};
    const status = error.response?.status ?? 0;

    // Token missing/invalid: nuke local auth and bounce to login. Skip if
    // the failing call was against a public endpoint, or if we're already on
    // an auth route (avoids redirect loop).
    if (typeof window !== "undefined" && (status === 401 || status === 403)) {
      const url = error.config?.url ?? "";
      const isPublicCall = PUBLIC_PATH_PREFIXES.some((p) => url.startsWith(p));
      const onAuthRoute = AUTH_ROUTES.some((r) => window.location.pathname.startsWith(r));
      if (!isPublicCall && !onAuthRoute && status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("adminAuthBackup");
        window.location.assign("/login");
      }
    }

    return Promise.reject(new ApiError(String(message), status, fieldErrors));
  },
);

/* ---------- Types ---------- */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  /** Referrer's email or numeric ID. */
  referredBy?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "USER" | "ADMIN";
    kycVerified: boolean;
    createdAt: string;
  };
}

export interface WalletSummary {
  balance: number;
  bonus: number;
  referralBonus: number;
  lockedBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalProfit: number;
}

export type GatewayCategory = "CRYPTO" | "BANK";

export interface DepositMethod {
  id: string;
  name: string;
  symbol: string;
  category: GatewayCategory;
  network?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  minAmount: number;
  maxAmount?: number | null;
  feePercent: number;
  processingTime: string;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  code?: string | null;
  description?: string | null;
  listed: boolean;
}

export interface DepositRequest {
  depositMethodId: string;
  amount: number;
  trxHash?: string;
  proofUrl?: string;
}

export type DepositStatus = "PENDING" | "COMPLETED" | "REJECTED";

export interface Deposit {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  methodSymbol: string;
  methodName: string;
  amount: number;
  status: DepositStatus;
  trxid: string;
  trxHash?: string | null;
  proofFileName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WithdrawStatus = "PENDING" | "COMPLETED" | "REJECTED";

export interface Withdraw {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  methodSymbol: string;
  methodName: string;
  amount: number;
  walletAddress: string;
  status: WithdrawStatus;
  trxid: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawRequest {
  methodId: string;
  amount: number;
  walletAddress: string;
}

export type IncrementType = "PERCENTAGE" | "FIXED";

export interface InvestmentPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  minAmount: number;
  maxAmount: number;
  minReturn: number;
  maxReturn: number;
  /** Human duration like "1 Day", "3 Weeks", "6 Months". */
  duration: string;
  /** Preset interval label matching phinance's dropdown, e.g. "Hourly", "Twice Daily". */
  incrementInterval: string;
  incrementType: IncrementType;
  /** Comma-separated payout values, e.g. "2.1, 4, 5.2, 7.3". */
  incrementAmount: string;
  bonus: number;
  referralBonus: number;
  returnCapital: boolean;
  active: boolean;
}

export type UserPlanStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface UserPlan {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  planId: string;
  planName: string;
  minReturn: number;
  maxReturn: number;
  duration: string;
  incrementInterval: string;
  incrementType: IncrementType;
  returnCapital: boolean;
  amount: number;
  expectedReturn: number;
  accruedProfit: number;
  status: UserPlanStatus;
  startedAt: string;
  endsAt: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "INVESTMENT" | "TRANSFER" | "REFERRAL_BONUS";
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  description: string;
  createdAt: string;
}

export type KycStatus = "NONE" | "PENDING" | "VERIFIED";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  phone?: string | null;
  country?: string | null;
  dob?: string | null;
  address?: string | null;
  referrerId?: number | null;
  referrerEmail?: string | null;
  referralCount: number;
  withdrawStatus: boolean;
  twoFaEnabled: boolean;
  hideBalance: boolean;
  suspended: boolean;
  kycStatus: KycStatus;
  kycVerifiedAt?: string | null;
  kycVerified: boolean;
  balance: number;
  bonus: number;
  referralBonus: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalProfit: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: "USER" | "ADMIN";
  phone?: string;
  country?: string;
  dob?: string;
  address?: string;
  withdrawStatus?: boolean;
  twoFaEnabled?: boolean;
  hideBalance?: boolean;
  suspended?: boolean;
  kycStatus?: KycStatus;
}

export interface Session {
  id: string;
  jti: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  lastActive: string;
  createdAt: string;
  /** True when this row is the JWT the caller is using — never revoke it via the sessions list. */
  current?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  activePlans: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalBalance: number;
  totalProfit: number;
}

export interface AdjustBalanceRequest {
  field: "BALANCE" | "BONUS" | "REFERRAL_BONUS" | "PROFIT";
  amount: number;
  reason?: string;
}

/** Self-view of the current user — richer than AuthResponse["user"]. */
export interface Profile {
  id: number;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
  phone?: string | null;
  country?: string | null;
  dob?: string | null;
  address?: string | null;
  kycStatus: KycStatus;
  kycVerifiedAt?: string | null;
  kycVerified: boolean;
  twoFaEnabled: boolean;
  hideBalance: boolean;
  withdrawStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  country?: string;
  dob?: string;
  address?: string;
  hideBalance?: boolean;
  twoFaEnabled?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PlatformSettings {
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  address?: string;
  timezone?: string;
  siteFaviconUrl?: string;
  siteDarkLogoUrl?: string;
  siteLightLogoUrl?: string;
  withdrawEnabled: boolean;
  transferEnabled: boolean;
  minDeposit: number;
  minWithdraw: number;
  minTransfer: number;
  transferPercent: number;
  welcomeBonusEnabled: boolean;
  welcomeBonusAmount: number;
  verifyKyc: boolean;
  kycOnRegistration: boolean;
  kycRequiredForWithdrawal: boolean;
  kycFee: number;
  verifyEmail: boolean;

  // Email (SMTP)
  mailHost?: string;
  mailPort?: number;
  mailUsername?: string;
  mailPassword?: string;
  mailEncryption?: string;
  mailFromAddress?: string;
  mailFromName?: string;

  // Cloudinary
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;

  // Live chat
  liveChatScript?: string;

  lastCron?: string | null;
  updatedAt?: string;
}

export type UpdateSettingsRequest = Partial<Omit<PlatformSettings, "lastCron" | "updatedAt">>;

export interface PublicSettings {
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  address?: string;
  siteFaviconUrl?: string;
  siteDarkLogoUrl?: string;
  siteLightLogoUrl?: string;
  withdrawEnabled: boolean;
  transferEnabled: boolean;
  minDeposit: number;
  minWithdraw: number;
  minTransfer: number;
  transferPercent: number;
  kycRequiredForWithdrawal: boolean;
  liveChatScript?: string;
}

export interface UploadResponse {
  url: string;
  publicId: string;
}

export interface Referral {
  id: number;
  fullName: string;
  email: string;
  country?: string | null;
  active: boolean;
  kycStatus: KycStatus;
  joinedAt: string;
}

/* ---------- Crypto (proxied through backend) ---------- */

export interface CryptoPriceRow {
  id: number;
  crypto_id: number;
  current_price: string;
  percent_change_24h: string;
  market_cap: string;
  volume_24h: string;
  volume_change_24h?: string;
  percent_change_30d?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Crypto {
  id: number;
  name: string;
  symbol: string;
  network_id?: number;
  network: string;
  network_owner?: number;
  is_listed: number;
  logo_url: string;
  created_at?: string;
  updated_at?: string;
  price: CryptoPriceRow | null;
}

/** Binance kline: [openTime, open, high, low, close, volume, closeTime, ...]. */
export type Kline = [number, string, string, string, string, string, number, string, number, string, string, string];

export interface ReferralSummary {
  totalReferrals: number;
  activeReferrals: number;
  totalReferralBonus: number;
  referrerEmail?: string | null;
  referrals: Referral[];
}

/* ---------- API surface ---------- */

const get = <T>(url: string) => http.get<T>(url).then((r) => r.data);
const post = <T>(url: string, body?: unknown) => http.post<T>(url, body).then((r) => r.data);
const patch = <T>(url: string, body?: unknown) => http.patch<T>(url, body).then((r) => r.data);
const del = <T>(url: string) => http.delete<T>(url).then((r) => r.data);

export const api = {
  auth: {
    login: (data: LoginRequest) => post<AuthResponse>("/auth/login", data),
    register: (data: RegisterRequest) => post<AuthResponse>("/auth/register", data),
    logout: () => post<void>("/auth/logout"),
    me: () => get<AuthResponse["user"]>("/auth/me"),
  },
  wallet: {
    summary: () => get<WalletSummary>("/wallet/summary"),
  },
  depositMethods: {
    list: () => get<DepositMethod[]>("/deposit-methods"),
  },
  deposits: {
    create: (data: DepositRequest) => post<Deposit>("/deposits", data),
    list: () => get<Deposit[]>("/deposits"),
  },
  withdrawals: {
    create: (data: WithdrawRequest) => post<Withdraw>("/withdrawals", data),
    list: () => get<Withdraw[]>("/withdrawals"),
  },
  plans: {
    list: () => get<InvestmentPlan[]>("/plans"),
    mine: () => get<UserPlan[]>("/plans/active"),
    invest: (id: string, amount: number) => post<UserPlan>(`/plans/${id}/invest`, { amount }),
  },
  transactions: {
    list: () => get<Transaction[]>("/transactions"),
  },
  referrals: {
    mine: () => get<ReferralSummary>("/referrals"),
  },
  profile: {
    get: () => get<Profile>("/profile"),
    update: (data: UpdateProfileRequest) => patch<Profile>("/profile", data),
    changePassword: (data: ChangePasswordRequest) => post<void>("/profile/password", data),
  },
  sessions: {
    list: () => get<Session[]>("/sessions"),
    revoke: (id: string) => del<void>(`/sessions/${id}`),
  },
  crypto: {
    prices: () => get<Crypto[]>("/crypto/prices"),
    klines: (symbol: string, interval = "1h", limit = 200) =>
      get<Kline[]>(`/crypto/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`),
  },
  settings: {
    public: () => get<PublicSettings>("/settings"),
  },
  uploads: {
    /**
     * Multipart upload to Cloudinary via our backend. Backend uses the config
     * saved by the admin in Settings → Cloudinary. `folder` is optional.
     */
    file: async (file: File, folder?: string) => {
      const form = new FormData();
      form.append("file", file);
      if (folder) form.append("folder", folder);
      const res = await http.post<UploadResponse>("/uploads", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  },
  admin: {
    stats: () => get<AdminStats>("/admin/stats"),
    transactions: () => get<Transaction[]>("/admin/transactions"),
    users: {
      list: () => get<AdminUser[]>("/admin/users"),
      get: (id: string) => get<AdminUser>(`/admin/users/${id}`),
      update: (id: string, data: UpdateUserRequest) => patch<AdminUser>(`/admin/users/${id}`, data),
      adjust: (id: string, data: AdjustBalanceRequest) => post<AdminUser>(`/admin/users/${id}/adjust`, data),
      resetPassword: (id: string, password: string) =>
        post<void>(`/admin/users/${id}/password`, { password }),
      impersonate: (id: string) => post<AuthResponse>(`/admin/users/${id}/impersonate`),
      clear: (id: string, targets: string[]) => post<AdminUser>(`/admin/users/${id}/clear`, { targets }),
      remove: (id: string) => del<void>(`/admin/users/${id}`),
      sessions: (id: string) => get<Session[]>(`/admin/users/${id}/sessions`),
      revokeSession: (userId: string, sessionId: string) =>
        del<void>(`/admin/users/${userId}/sessions/${sessionId}`),
      referrals: (id: string) => get<AdminUser[]>(`/admin/users/${id}/referrals`),
      transactions: (id: string, params?: { type?: string; status?: string }) => {
        const q = new URLSearchParams();
        if (params?.type) q.set("type", params.type);
        if (params?.status) q.set("status", params.status);
        const qs = q.toString();
        return get<Transaction[]>(`/admin/users/${id}/transactions${qs ? `?${qs}` : ""}`);
      },
    },
    deposits: {
      list: () => get<Deposit[]>("/admin/deposits"),
      approve: (id: string) => post<Deposit>(`/admin/deposits/${id}/approve`),
      reject: (id: string) => post<Deposit>(`/admin/deposits/${id}/reject`),
    },
    withdrawals: {
      list: () => get<Withdraw[]>("/admin/withdrawals"),
      approve: (id: string) => post<Withdraw>(`/admin/withdrawals/${id}/approve`),
      reject: (id: string, reason?: string) => post<Withdraw>(`/admin/withdrawals/${id}/reject`, { reason: reason ?? "" }),
    },
    plans: {
      list: () => get<InvestmentPlan[]>("/admin/plans"),
      create: (data: Omit<InvestmentPlan, "id">) => post<InvestmentPlan>("/admin/plans", data),
      update: (id: string, data: Partial<InvestmentPlan>) => patch<InvestmentPlan>(`/admin/plans/${id}`, data),
      remove: (id: string) => del<void>(`/admin/plans/${id}`),
      subscriptions: () => get<UserPlan[]>("/admin/plans/subscriptions"),
    },
    methods: {
      list: () => get<DepositMethod[]>("/admin/deposit-methods"),
      create: (data: Omit<DepositMethod, "id">) => post<DepositMethod>("/admin/deposit-methods", data),
      update: (id: string, data: Partial<DepositMethod>) => patch<DepositMethod>(`/admin/deposit-methods/${id}`, data),
      remove: (id: string) => del<void>(`/admin/deposit-methods/${id}`),
    },
    settings: {
      get: () => get<PlatformSettings>("/admin/settings"),
      update: (data: UpdateSettingsRequest) => patch<PlatformSettings>("/admin/settings", data),
    },
  },
};

/* ---------- Auth persistence ---------- */

export function saveAuth(response: AuthResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", response.token);
  localStorage.setItem("user", JSON.stringify(response.user));
}

export function getAuth(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/* ---------- Query keys (centralized to avoid typos) ---------- */

export const qk = {
  wallet: ["wallet"] as const,
  depositMethods: ["deposit-methods"] as const,
  deposits: ["deposits"] as const,
  withdrawals: ["withdrawals"] as const,
  plans: ["plans"] as const,
  myPlans: ["my-plans"] as const,
  transactions: ["transactions"] as const,
  admin: {
    stats: ["admin", "stats"] as const,
    transactions: ["admin", "transactions"] as const,
    users: ["admin", "users"] as const,
    deposits: ["admin", "deposits"] as const,
    withdrawals: ["admin", "withdrawals"] as const,
    plans: ["admin", "plans"] as const,
    subscriptions: ["admin", "plans", "subscriptions"] as const,
    methods: ["admin", "methods"] as const,
    settings: ["admin", "settings"] as const,
    user: (id: string) => ["admin", "users", id] as const,
    userSessions: (id: string) => ["admin", "users", id, "sessions"] as const,
    userReferrals: (id: string) => ["admin", "users", id, "referrals"] as const,
    userTransactions: (id: string) => ["admin", "users", id, "transactions"] as const,
  },
  publicSettings: ["public-settings"] as const,
  referrals: ["referrals"] as const,
  profile: ["profile"] as const,
  sessions: ["sessions"] as const,
  cryptoPrices: ["crypto", "prices"] as const,
  cryptoKlines: (symbol: string, interval: string) => ["crypto", "klines", symbol, interval] as const,
};
