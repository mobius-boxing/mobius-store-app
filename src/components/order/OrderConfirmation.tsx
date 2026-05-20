import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types';
import { statusLabel, statusVariant } from '../../utils/orderStatus';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface OrderConfirmationProps {
  isOpen: boolean;
  order: Order | null;
  onKeepShopping: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  isOpen,
  order,
  onKeepShopping,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onKeepShopping} size="md" showCloseButton={false}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-secondary-900">
          {t('order.successTitle')}
        </h3>
        <p className="mt-2 text-sm text-secondary-600">
          {t('order.successBody', { uuid: order.uuid.slice(0, 8) })}
        </p>
        <div className="mt-3 flex justify-center">
          <Badge variant={statusVariant(order.status)}>
            {statusLabel(order.status, t)}
          </Badge>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(`/orders/${order.uuid}`)}>
            {t('order.viewOrder')}
          </Button>
          <Button onClick={onKeepShopping}>{t('order.keepShopping')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderConfirmation;
