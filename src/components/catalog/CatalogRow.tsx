import React from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Check } from 'lucide-react';
import { CatalogBox, CatalogRoll } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../utils/cn';

type Props =
  | { itemType: 'box'; box: CatalogBox }
  | { itemType: 'roll'; roll: CatalogRoll };

const MIN_PALLETS = 2; // "mínimo 2 pallet x medida"
const ROLL_STEP = 10;

const fmt = (n: number) => n.toLocaleString('es-AR');

/**
 * One catalog line on the order sheet. Boxes are ordered by the pallet (the unit
 * the customer actually thinks in) with a floor of 2 pallets, so the per-measure
 * minimum is satisfied the moment a row is added. Rolls are ordered by unit with a
 * floor of their minQuantity. The row IS the add affordance: setting a quantity puts
 * the line in the live order summary. No card, no per-item modal.
 */
const CatalogRow: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { getLine, addOrUpdate, setQuantity, remove } = useCart();

  const isBox = props.itemType === 'box';
  const item = isBox ? props.box : props.roll;
  const sourceUuid = item.uuid;
  const line = getLine(props.itemType, sourceUuid);

  const unitsPerPallet = isBox ? props.box.unitsPerPallet : 0;
  const rollMin = isBox ? 0 : props.roll.minQuantity;

  const quantity = line?.quantity ?? 0;
  const pallets = isBox && unitsPerPallet > 0 ? Math.round(quantity / unitsPerPallet) : 0;
  const inCart = quantity > 0;
  const stepValue = isBox ? pallets : quantity;

  const applyUnits = (units: number) => {
    if (units <= 0) {
      remove(props.itemType, sourceUuid);
      return;
    }
    if (line) {
      setQuantity(props.itemType, sourceUuid, units);
    } else if (isBox) {
      addOrUpdate({
        itemType: 'box',
        sourceUuid,
        description: props.box.description,
        unitsPerPallet,
        quantity: units,
      });
    } else {
      addOrUpdate({
        itemType: 'roll',
        sourceUuid,
        description: props.roll.description,
        minQuantity: props.roll.minQuantity,
        quantity: units,
      });
    }
  };

  const onAdd = () => applyUnits(isBox ? MIN_PALLETS * unitsPerPallet : rollMin);
  const onInc = () => applyUnits(isBox ? quantity + unitsPerPallet : quantity + ROLL_STEP);
  const onDec = () => {
    if (isBox) {
      const next = pallets - 1;
      applyUnits(next < MIN_PALLETS ? 0 : next * unitsPerPallet);
    } else {
      const next = quantity - ROLL_STEP;
      applyUnits(next < rollMin ? 0 : next);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 sm:px-5 py-3 transition-colors',
        inCart ? 'bg-primary-50' : 'hover:bg-secondary-50'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-secondary-900 tabular-nums truncate">
            {item.description}
          </p>
          {inCart && <Check className="h-4 w-4 shrink-0 text-primary-600" aria-hidden />}
        </div>
        <p className="mt-0.5 text-xs text-secondary-500 tabular-nums">
          {isBox
            ? t('catalog.boxMeta', {
                perPallet: fmt(props.box.unitsPerPallet),
                perPackage: fmt(props.box.unitsPerPackage),
              })
            : t('catalog.rollMeta', { min: fmt(rollMin) })}
        </p>
      </div>

      {inCart && (
        <div className="hidden sm:block text-right">
          {isBox ? (
            <>
              <p className="text-sm font-semibold text-secondary-900 tabular-nums">
                {t('catalog.pallets', { count: pallets })}
              </p>
              <p className="text-xs text-secondary-500 tabular-nums">{fmt(quantity)} u.</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-secondary-900 tabular-nums">
              {fmt(quantity)} u.
            </p>
          )}
        </div>
      )}

      {!inCart ? (
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm font-medium text-secondary-700 transition-colors hover:border-primary-400 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Plus className="h-4 w-4" />
          {t('catalog.add')}
        </button>
      ) : (
        <div className="shrink-0 inline-flex items-stretch overflow-hidden rounded-lg border border-primary-300">
          <button
            type="button"
            onClick={onDec}
            aria-label={t('catalog.decrease')}
            className="flex w-10 items-center justify-center bg-white text-secondary-700 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex w-12 items-center justify-center border-x border-primary-200 bg-white text-sm font-semibold tabular-nums text-secondary-900">
            {stepValue}
          </span>
          <button
            type="button"
            onClick={onInc}
            aria-label={t('catalog.increase')}
            className="flex w-10 items-center justify-center bg-white text-secondary-700 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CatalogRow;
