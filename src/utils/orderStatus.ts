import { OrderStatus } from '../types';

// Loosely typed translator (compatible with react-i18next's `t`), avoids
// coupling to the i18next TFunction type which mismatches under TS 4.9.
type Translator = (key: string, options?: Record<string, unknown>) => string;

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

// Backend store_orders status flow: pending → confirmed → in_production → shipped → delivered.
const KNOWN_STATUSES = ['pending', 'confirmed', 'in_production', 'shipped', 'delivered'];

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'info',
  in_production: 'warning',
  shipped: 'info',
  delivered: 'success',
};

/** Translate a backend status; fall back to the raw value for unknown statuses. */
export function statusLabel(status: OrderStatus, t: Translator): string {
  const key = String(status).toLowerCase();
  if (KNOWN_STATUSES.includes(key)) {
    return t(`status.${key}`);
  }
  return String(status);
}

export function statusVariant(status: OrderStatus): BadgeVariant {
  return STATUS_VARIANTS[String(status).toLowerCase()] ?? 'neutral';
}
