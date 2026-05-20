import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CartLine, CatalogBox, CatalogRoll } from '../../types';
import { useCart, MAX_BOX_MEASURES } from '../../contexts/CartContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import QuantityInput from '../ui/QuantityInput';

type Props =
  | { itemType: 'box'; box: CatalogBox }
  | { itemType: 'roll'; roll: CatalogRoll };

const CatalogItemCard: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { getLine, addOrUpdate, remove, distinctBoxCount, validation } = useCart();

  const isBox = props.itemType === 'box';
  const source = isBox ? props.box : props.roll;
  const description = source.description;
  const sourceUuid = source.uuid;

  const minQty = isBox
    ? (props.box.unitsPerPallet ?? 0) * 2
    : props.roll.minQuantity ?? 0;

  const existing = getLine(props.itemType, sourceUuid);
  const inCart = !!existing;

  const [draftQty, setDraftQty] = useState<number>(existing?.quantity || minQty || 1);

  const lineKey = `${props.itemType}:${sourceUuid}`;
  const lineValidation = validation.lines[lineKey];
  const cartError =
    inCart && lineValidation && !lineValidation.valid && lineValidation.errorKey
      ? t(lineValidation.errorKey, lineValidation.errorParams)
      : undefined;

  // Block adding a 9th distinct box measure.
  const blockedByMax =
    isBox && !inCart && distinctBoxCount >= MAX_BOX_MEASURES;

  const handleAddOrUpdate = () => {
    const qty = inCart && draftQty === 0 ? existing!.quantity : draftQty;
    const line: CartLine = isBox
      ? {
          itemType: 'box',
          sourceUuid,
          description,
          quantity: qty,
          unitsPerPallet: props.box.unitsPerPallet,
        }
      : {
          itemType: 'roll',
          sourceUuid,
          description,
          quantity: qty,
          minQuantity: props.roll.minQuantity,
        };
    addOrUpdate(line);
  };

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-secondary-900 break-words">
          {description}
        </h3>
        {inCart && (
          <Badge variant="success" className="shrink-0">
            <Check className="h-3 w-3 mr-1" />
            {t('catalog.inCart')}
          </Badge>
        )}
      </div>

      <div className="text-sm text-secondary-600 space-y-0.5">
        {isBox ? (
          <>
            <p className="font-medium text-secondary-700">
              {t('catalog.boxMinHelper', { min: minQty })}
            </p>
            <p className="text-xs text-secondary-500">
              {t('catalog.unitsPerPackage', { count: props.box.unitsPerPackage })} ·{' '}
              {t('catalog.unitsPerPallet', { count: props.box.unitsPerPallet })}
            </p>
          </>
        ) : (
          <p className="font-medium text-secondary-700">
            {t('catalog.rollMinHelper', { min: minQty })}
          </p>
        )}
      </div>

      <div className="mt-auto">
        <QuantityInput
          label={t('catalog.quantity')}
          value={draftQty}
          min={1}
          onChange={setDraftQty}
          disabled={blockedByMax}
          error={cartError}
        />
        {blockedByMax && (
          <p role="alert" className="mt-1 text-sm text-amber-700">
            {t('cart.validation.maxBoxMeasures')}
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant={inCart ? 'outline' : 'primary'}
            className="flex-1"
            onClick={handleAddOrUpdate}
            disabled={blockedByMax || draftQty <= 0}
          >
            {inCart ? t('catalog.update') : t('catalog.add')}
          </Button>
          {inCart && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => remove(props.itemType, sourceUuid)}
              aria-label={t('cart.remove')}
            >
              {t('cart.remove')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogItemCard;
