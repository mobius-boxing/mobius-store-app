import React, { useState } from 'react';
import { Trash2, ShoppingCart, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart, MAX_BOX_MEASURES } from '../../contexts/CartContext';
import { cn } from '../../utils/cn';

interface OrderSummaryProps {
  onSubmit: (notes: string) => void;
  submitting: boolean;
  submitError: string | null;
  /** Sheet variant shows a close control (mobile). */
  onClose?: () => void;
  className?: string;
}

const fmt = (n: number) => n.toLocaleString('es-AR');

const OrderSummary: React.FC<OrderSummaryProps> = ({
  onSubmit,
  submitting,
  submitError,
  onClose,
  className,
}) => {
  const { t } = useTranslation();
  const { lines, distinctBoxCount, remove, clear, validation, isValid } = useCart();
  const [notes, setNotes] = useState('');

  const empty = lines.length === 0;

  return (
    <section
      aria-label={t('cart.title')}
      className={cn(
        'flex flex-col bg-white border border-secondary-200 rounded-xl shadow-sm',
        className
      )}
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-secondary-200">
        <h2 className="text-base font-semibold text-secondary-900">{t('cart.title')}</h2>
        <div className="flex items-center gap-3">
          {!empty && (
            <button
              type="button"
              onClick={clear}
              className="text-xs font-medium text-secondary-500 hover:text-red-600 transition-colors"
            >
              {t('cart.clear')}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="p-1 -mr-1 text-secondary-400 hover:text-secondary-700 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {empty ? (
        <div className="flex flex-col items-center justify-center text-center px-6 py-12">
          <ShoppingCart className="h-8 w-8 text-secondary-300" aria-hidden />
          <p className="mt-3 text-sm text-secondary-500">{t('cart.empty')}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-5 py-2.5 bg-secondary-50/60 border-b border-secondary-200">
            <span className="text-xs font-medium text-secondary-600">
              {t('cart.boxMeasures', { count: distinctBoxCount, max: MAX_BOX_MEASURES })}
            </span>
            <span
              className={cn(
                'text-xs font-semibold tabular-nums',
                validation.maxBoxMeasuresExceeded ? 'text-red-600' : 'text-secondary-500'
              )}
            >
              {distinctBoxCount}/{MAX_BOX_MEASURES}
            </span>
          </div>

          <ul className="flex-1 overflow-y-auto divide-y divide-secondary-100 max-h-[42vh] lg:max-h-none">
            {lines.map((line) => {
              const key = `${line.itemType}:${line.sourceUuid}`;
              const lv = validation.lines[key];
              const err = lv && !lv.valid && lv.errorKey ? t(lv.errorKey, lv.errorParams) : undefined;
              const qtyLabel =
                line.itemType === 'box' && line.unitsPerPallet
                  ? `${t('catalog.pallets', { count: Math.round(line.quantity / line.unitsPerPallet) })} · ${fmt(line.quantity)} u.`
                  : `${fmt(line.quantity)} u.`;
              return (
                <li key={key} className="flex items-start gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-secondary-900 tabular-nums truncate">
                      {line.description}
                    </p>
                    <p className="mt-0.5 text-xs text-secondary-500 tabular-nums">{qtyLabel}</p>
                    {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(line.itemType, line.sourceUuid)}
                    aria-label={t('cart.remove')}
                    className="shrink-0 p-1.5 text-secondary-400 hover:text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="px-5 py-4 border-t border-secondary-200 space-y-3">
            <label htmlFor="order-notes" className="block">
              <span className="text-xs font-medium text-secondary-600">
                {t('order.notes')}
              </span>
              <textarea
                id="order-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('order.notesPlaceholder')}
                className="input-field mt-1 resize-none text-sm"
              />
            </label>

            {validation.maxBoxMeasuresExceeded && (
              <p role="alert" className="text-xs text-red-600">
                {t('cart.validation.maxBoxMeasures', { max: MAX_BOX_MEASURES })}
              </p>
            )}
            {!isValid && !validation.maxBoxMeasuresExceeded && (
              <p className="text-xs text-amber-700">{t('cart.validation.fixErrors')}</p>
            )}
            {submitError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-800">{submitError}</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => onSubmit(notes.trim())}
              disabled={!isValid || submitting}
              className="btn-primary w-full"
            >
              {submitting ? t('order.submitting') : t('order.confirm')}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default OrderSummary;
