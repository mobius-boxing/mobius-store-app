import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import { CreateOrderPayload } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: CreateOrderPayload) => Promise<void>;
  submitting: boolean;
  submitError: string | null;
}

const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  submitting,
  submitError,
}) => {
  const { t } = useTranslation();
  const { lines, isValid } = useCart();
  const [notes, setNotes] = useState('');

  const handleConfirm = async () => {
    const payload: CreateOrderPayload = {
      items: lines.map((l) => ({
        itemType: l.itemType,
        sourceUuid: l.sourceUuid,
        quantity: l.quantity,
      })),
      notes: notes.trim() || undefined,
    };
    await onConfirm(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('order.reviewTitle')} size="lg">
      <div className="space-y-4">
        <ul className="divide-y divide-secondary-200 border-y border-secondary-200">
          {lines.map((line) => (
            <li
              key={`${line.itemType}:${line.sourceUuid}`}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-secondary-900 truncate">{line.description}</p>
                <Badge
                  variant={line.itemType === 'box' ? 'info' : 'neutral'}
                  className="mt-1"
                >
                  {line.itemType === 'box' ? t('cart.typeBox') : t('cart.typeRoll')}
                </Badge>
              </div>
              <span className="text-sm font-medium text-secondary-900 shrink-0">
                × {line.quantity}
              </span>
            </li>
          ))}
        </ul>

        <div>
          <label
            htmlFor="order-notes"
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            {t('order.notes')}
          </label>
          <textarea
            id="order-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('order.notesPlaceholder')}
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} loading={submitting} disabled={!isValid}>
            {submitting ? t('order.submitting') : t('order.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderReviewModal;
