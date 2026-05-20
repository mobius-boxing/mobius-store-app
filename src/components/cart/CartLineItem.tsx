import React from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CartLine } from '../../types';
import { useCart } from '../../contexts/CartContext';
import Badge from '../ui/Badge';
import QuantityInput from '../ui/QuantityInput';

interface CartLineItemProps {
  line: CartLine;
}

const CartLineItem: React.FC<CartLineItemProps> = ({ line }) => {
  const { t } = useTranslation();
  const { setQuantity, remove, validation } = useCart();

  const key = `${line.itemType}:${line.sourceUuid}`;
  const lineValidation = validation.lines[key];
  const errorMsg =
    lineValidation && !lineValidation.valid && lineValidation.errorKey
      ? t(lineValidation.errorKey, lineValidation.errorParams)
      : undefined;

  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-secondary-900 truncate">
            {line.description}
          </p>
          <Badge variant={line.itemType === 'box' ? 'info' : 'neutral'} className="mt-1">
            {line.itemType === 'box' ? t('cart.typeBox') : t('cart.typeRoll')}
          </Badge>
        </div>
        <button
          type="button"
          onClick={() => remove(line.itemType, line.sourceUuid)}
          aria-label={t('cart.remove')}
          className="p-2 text-secondary-400 hover:text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 w-36">
        <QuantityInput
          value={line.quantity}
          min={1}
          onChange={(v) => setQuantity(line.itemType, line.sourceUuid, v)}
          error={errorMsg}
        />
      </div>
    </div>
  );
};

export default CartLineItem;
