import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../types';
import { statusLabel, statusVariant } from '../utils/orderStatus';

const shortUuid = (uuid: string) => `#${uuid.slice(0, 8)}`;

const Orders: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { orders, loading, error, reload } = useOrders();

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const itemCountOf = (order: Order) => order.itemCount ?? order.items?.length ?? 0;

  const columns = [
    {
      header: t('orders.colId'),
      accessor: (o: Order) => (
        <span className="font-medium text-secondary-900">{shortUuid(o.uuid)}</span>
      ),
    },
    {
      header: t('orders.colDate'),
      accessor: (o: Order) => formatDate(o.createdAt),
    },
    {
      header: t('orders.colStatus'),
      accessor: (o: Order) => (
        <Badge variant={statusVariant(o.status)}>{statusLabel(o.status, t)}</Badge>
      ),
    },
    {
      header: t('orders.colItems'),
      accessor: (o: Order) => t('orders.itemCount', { count: itemCountOf(o) }),
    },
    {
      header: t('common.actions'),
      className: 'text-right',
      accessor: (o: Order) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${o.uuid}`)}>
          {t('orders.view')}
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">{t('orders.title')}</h1>
          <p className="page-subtitle">{t('orders.subtitle')}</p>
        </div>

        {error ? (
          <div className="section-card">
            <ErrorState message={t('orders.loadError')} onRetry={reload} />
          </div>
        ) : !loading && orders.length === 0 ? (
          <div className="section-card">
            <EmptyState
              icon={<ClipboardList className="h-10 w-10" />}
              title={t('orders.empty')}
            />
          </div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden md:block table-container">
              <Table data={orders} columns={columns} loading={loading} />
            </div>

            {/* Mobile: stacked cards */}
            <div className="md:hidden space-y-3">
              {loading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="card animate-pulse h-20" />
                  ))
                : orders.map((o) => (
                    <button
                      key={o.uuid}
                      onClick={() => navigate(`/orders/${o.uuid}`)}
                      className="card w-full text-left flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-secondary-900">
                            {shortUuid(o.uuid)}
                          </span>
                          <Badge variant={statusVariant(o.status)}>
                            {statusLabel(o.status, t)}
                          </Badge>
                        </div>
                        <p className="text-sm text-secondary-500 mt-1">
                          {formatDate(o.createdAt)} ·{' '}
                          {t('orders.itemCount', { count: itemCountOf(o) })}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-secondary-400 shrink-0" />
                    </button>
                  ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
