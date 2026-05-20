import React from 'react';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

interface OrderSummaryProps {
  onReview: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ onReview }) => {
  const { t } = useTranslation();
  const { lines, distinctBoxCount, remove, clear, validation, isValid } = useCart();

  return (
    <aside className="card sticky top-6" aria-label={t('cart.title')}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-secondary-900">{t('cart.title')}</h2>
        {lines.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-secondary-500 hover:text-red-600"
          >
            {t('cart.clear')}
          </button>
        )}
      </div>

      {lines.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-8 w-8" />}
          title={t('cart.empty')}
          className="py-8"
        />
      ) : (
        <>
          <p className="text-sm text-secondary-600 mb-3">
            {t('cart.boxMeasures', { count: distinctBoxCount })}
          </p>
          {validation.maxBoxMeasuresExceeded && (
            <p role="alert" className="text-sm text-red-600 mb-3">
              {t('cart.validation.maxBoxMeasures')}
            </p>
          )}

          <ul className="divide-y divide-secondary-200 mb-4">
            {lines.map((line) => {
              const key = `${line.itemType}:${line.sourceUuid}`;
              const lv = validation.lines[key];
              const err =
                lv && !lv.valid && lv.errorKey
                  ? t(lv.errorKey, lv.errorParams)
                  : undefined;
              return (
                <li key={key} className="py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-secondary-900 truncate">
                        {line.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant={line.itemType === 'box' ? 'info' : 'neutral'}
                        >
                          {line.itemType === 'box'
                            ? t('cart.typeBox')
                            : t('cart.typeRoll')}
                        </Badge>
                        <span className="text-sm text-secondary-600">
                          × {line.quantity}
                        </span>
                      </div>
                      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.itemType, line.sourceUuid)}
                      aria-label={t('cart.remove')}
                      className="p-1.5 text-secondary-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-secondary-200 pt-3">
            <p className="text-sm text-secondary-600 mb-3">
              {t('cart.lines', { count: lines.length })}
            </p>
            {!isValid && (
              <p className="text-xs text-amber-700 mb-2">
                {t('cart.validation.fixErrors')}
              </p>
            )}
            <Button className="w-full" onClick={onReview} disabled={!isValid}>
              {t('cart.review')}
            </Button>
          </div>
        </>
      )}
    </aside>
  );
};

export default OrderSummary;
