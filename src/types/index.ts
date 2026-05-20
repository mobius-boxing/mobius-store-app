// ============================================================================
// Identity (store users have NO role)
// ============================================================================
export interface StoreUser {
  uuid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  companyUuid?: string;
  companyName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StoreLoginResponse {
  token: string;
  storeUser: StoreUser;
}

export interface StoreMeResponse {
  storeUser: StoreUser;
  companyName: string;
}

// ============================================================================
// Catalog
// ============================================================================
export interface CatalogBox {
  uuid: string;
  description: string;
  unitsPerPackage: number;
  unitsPerPallet: number;
}

export interface CatalogRoll {
  uuid: string;
  description: string;
  minQuantity: number;
}

// ============================================================================
// Orders
// ============================================================================
export type ItemType = 'box' | 'roll';

// Backend-defined; render via i18n map with raw-value fallback.
export type OrderStatus = string;

export interface OrderItem {
  uuid?: string;
  itemType: ItemType;
  sourceUuid: string;
  description: string;
  quantity: number;
  unitsPerPallet?: number;
}

export interface Order {
  uuid: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  items?: OrderItem[];
  itemCount?: number;
}

export interface CreateOrderPayload {
  items: Array<{ itemType: ItemType; sourceUuid: string; quantity: number }>;
  notes?: string;
}

// ============================================================================
// Cart (UI-only — never persisted server-side until submit)
// ============================================================================
export interface CartLine {
  itemType: ItemType;
  sourceUuid: string;
  description: string;
  quantity: number;
  unitsPerPallet?: number; // boxes
  minQuantity?: number; // rolls
}

export interface CartLineValidation {
  valid: boolean;
  errorKey?: string;
  errorParams?: Record<string, unknown>;
}

export interface CartValidation {
  lines: Record<string, CartLineValidation>; // keyed by `${itemType}:${sourceUuid}`
  maxBoxMeasuresExceeded: boolean;
}

// ============================================================================
// API envelope
// ============================================================================
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Array<{ field: string; message: string }>;
}
