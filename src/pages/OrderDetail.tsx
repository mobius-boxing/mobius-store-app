import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useOrder } from '../hooks/useOrders';
import { OrderItem } from '../types';
import { statusLabel, statusVariant } from '../utils/orderStatus';

const OrderDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const { order, loading, error, notFound, reload } = useOrder(uuid);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const columns = [
    {
      header: t('orders.colDescription'),
      accessor: (item: OrderItem) => (
        <span className="text-secondary-900">{item.description}</span>
      ),
    },
    {
      header: t('orders.colType'),
      accessor: (item: OrderItem) => (
        <Badge variant={item.itemType === 'box' ? 'info' : 'neutral'}>
          {item.itemType === 'box' ? t('cart.typeBox') : t('cart.typeRoll')}
        </Badge>
      ),
    },
    {
      header: t('orders.colQuantity'),
      className: 'text-right',
      accessor: (item: OrderItem) => (
        <span className="font-medium">{item.quantity}</span>
      ),
    },
  ];

  const backButton = (
    <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
      <ArrowLeft className="h-4 w-4 mr-1" />
      {t('orders.backToList')}
    </Button>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">{backButton}</div>

        {loading ? (
          <div className="section-card animate-pulse">
            <div className="card-body space-y-3">
              <div className="h-5 bg-secondary-200 rounded w-1/3" />
              <div className="h-4 bg-secondary-200 rounded w-1/2" />
              <div className="h-24 bg-secondary-200 rounded w-full" />
            </div>
          </div>
        ) : notFound ? (
          <div className="section-card">
            <EmptyState
              icon={<FileQuestion className="h-10 w-10" />}
              title={t('orders.notFound')}
              action={
                <Button onClick={() => navigate('/orders')}>{t('orders.backToList')}</Button>
              }
            />
          </div>
        ) : error ? (
          <div className="section-card">
            <ErrorState message={t('orders.loadError')} onRetry={reload} />
          </div>
        ) : order ? (
          <div className="space-y-6">
            <div className="section-card">
              <div className="card-body">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-secondary-900">
                      {t('orders.detailTitle')}
                    </h1>
                    <p className="text-sm text-secondary-500 mt-1">#{order.uuid}</p>
                    <p className="text-sm text-secondary-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(order.status)}>
                    {statusLabel(order.status, t)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="table-container">
              <Table
                data={order.items ?? []}
                columns={columns}
                emptyMessage={t('common.noResults')}
              />
            </div>

            <div className="section-card">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-secondary-700">
                  {t('orders.notesLabel')}
                </h2>
              </div>
              <div className="card-body">
                <p className="text-sm text-secondary-600 whitespace-pre-wrap">
                  {order.notes?.trim() || t('orders.noNotes')}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default OrderDetail;
