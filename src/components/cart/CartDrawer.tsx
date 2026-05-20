import React, { useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import CartLineItem from './CartLineItem';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReview: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onReview }) => {
  const { t } = useTranslation();
  const { lines, distinctBoxCount, isValid, validation, clear } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
      <div className="absolute inset-0 bg-secondary-900/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between h-14 px-4 border-b border-secondary-200">
          <h2 className="text-base font-semibold text-secondary-900">{t('cart.title')}</h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {lines.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-8 w-8" />}
              title={t('cart.empty')}
            />
          ) : (
            <>
              <p className="text-sm text-secondary-600 mt-4">
                {t('cart.boxMeasures', { count: distinctBoxCount })}
              </p>
              {validation.maxBoxMeasuresExceeded && (
                <p role="alert" className="text-sm text-red-600 mt-1">
                  {t('cart.validation.maxBoxMeasures')}
                </p>
              )}
              <div className="divide-y divide-secondary-200">
                {lines.map((line) => (
                  <CartLineItem key={`${line.itemType}:${line.sourceUuid}`} line={line} />
                ))}
              </div>
            </>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-secondary-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">
                {t('cart.lines', { count: lines.length })}
              </span>
              <button
                type="button"
                onClick={clear}
                className="text-xs text-secondary-500 hover:text-red-600"
              >
                {t('cart.clear')}
              </button>
            </div>
            {!isValid && (
              <p className="text-xs text-amber-700">{t('cart.validation.fixErrors')}</p>
            )}
            <Button
              className="w-full"
              disabled={!isValid}
              onClick={() => {
                onClose();
                onReview();
              }}
            >
              {t('cart.review')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
