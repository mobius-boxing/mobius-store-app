import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, CheckCircle2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import CatalogRow from '../components/catalog/CatalogRow';
import OrderSummary from '../components/catalog/OrderSummary';
import { useCatalog } from '../hooks/useCatalog';
import { useCart } from '../contexts/CartContext';
import { storeOrdersApi, toApiError } from '../services/api';
import { Order } from '../types';
import { useAuth } from '../contexts/AuthContext';

type CatalogTab = 'boxes' | 'rolls';

const SheetSkeleton: React.FC = () => (
  <div className="section-card divide-y divide-secondary-100">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
        <div className="flex-1">
          <div className="h-4 w-40 bg-secondary-200 rounded" />
          <div className="mt-2 h-3 w-28 bg-secondary-100 rounded" />
        </div>
        <div className="h-9 w-24 bg-secondary-200 rounded-lg" />
      </div>
    ))}
  </div>
);

const Catalog: React.FC = () => {
  const { t } = useTranslation();
  const { companyName } = useAuth();
  const { boxes, rolls, loading, error, reload } = useCatalog();
  const { lines, totalLines, clear } = useCart();

  const [activeTab, setActiveTab] = useState<CatalogTab>('boxes');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const tabs = useMemo(
    () => [
      { id: 'boxes', label: t('catalog.tabBoxes') },
      { id: 'rolls', label: t('catalog.tabRolls') },
    ],
    [t]
  );

  const handleSubmit = async (notes: string) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        items: lines.map((l) => ({
          itemType: l.itemType,
          sourceUuid: l.sourceUuid,
          quantity: l.quantity,
        })),
        ...(notes ? { notes } : {}),
      };
      const order = await storeOrdersApi.create(payload);
      clear();
      setSheetOpen(false);
      setConfirmedOrder(order);
    } catch (err) {
      // Server is source of truth: surface its message, keep the cart.
      setSubmitError(toApiError(err).message || t('order.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Confirmation (inline, no modal) ----
  if (confirmedOrder) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-6 sm:mt-16 text-center animate-scale-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-700" aria-hidden />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-secondary-900">
            {t('order.successTitle')}
          </h1>
          <p className="mt-2 text-sm text-secondary-500">{t('order.successBody')}</p>
          <div className="mt-6 rounded-xl border border-secondary-200 bg-white px-5 py-4 text-left shadow-sm">
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-secondary-500">
                {t('order.reference')}
              </dt>
              <dd className="font-mono text-sm font-semibold text-secondary-900">
                #{confirmedOrder.uuid.slice(0, 8)}
              </dd>
            </dl>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={() => setConfirmedOrder(null)}
              className="btn-primary w-full"
            >
              {t('order.newOrder')}
            </button>
            <Link to="/orders" className="btn-secondary w-full">
              {t('order.viewOrders')}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const bothEmpty = !loading && !error && boxes.length === 0 && rolls.length === 0;
  const rows =
    activeTab === 'boxes'
      ? boxes.map((box) => <CatalogRow key={box.uuid} itemType="box" box={box} />)
      : rolls.map((roll) => <CatalogRow key={roll.uuid} itemType="roll" roll={roll} />);
  const tabEmpty = activeTab === 'boxes' ? boxes.length === 0 : rolls.length === 0;

  const mobileCartButton = (
    <button
      type="button"
      onClick={() => setSheetOpen(true)}
      aria-label={t('cart.title')}
      className="relative p-2 rounded-md text-secondary-700 hover:bg-secondary-100"
    >
      <ShoppingCart className="h-5 w-5" />
      {totalLines > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-semibold">
          {totalLines}
        </span>
      )}
    </button>
  );

  return (
    <Layout mobileHeaderAction={mobileCartButton}>
      <div className="max-w-6xl mx-auto pb-24 lg:pb-0">
        <div className="page-header">
          <h1 className="page-title">
            {t('catalog.title')}
            {companyName ? ` · ${companyName}` : ''}
          </h1>
          <p className="page-subtitle">{t('catalog.subtitle')}</p>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-8 lg:items-start">
          <div>
            <div className="mb-5">
              <Tabs
                tabs={tabs}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as CatalogTab)}
                ariaLabel={t('catalog.title')}
              />
            </div>

            {loading ? (
              <SheetSkeleton />
            ) : error ? (
              <ErrorState message={t('catalog.loadError')} onRetry={reload} />
            ) : bothEmpty || tabEmpty ? (
              <EmptyState icon={<Package className="h-10 w-10" />} title={t('catalog.empty')} />
            ) : (
              <div className="section-card divide-y divide-secondary-100">{rows}</div>
            )}
          </div>

          {/* Desktop: live summary, always visible */}
          <div className="hidden lg:block lg:sticky lg:top-6">
            <OrderSummary
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          </div>
        </div>
      </div>

      {/* Mobile: sticky bar + slide-up sheet */}
      {lines.length > 0 && !sheetOpen && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-secondary-200 px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-secondary-700">
            {t('cart.lines', { count: totalLines })}
          </span>
          <button type="button" onClick={() => setSheetOpen(true)} className="btn-primary">
            {t('cart.review')}
          </button>
        </div>
      )}

      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] animate-slide-up">
            <OrderSummary
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
              onClose={() => setSheetOpen(false)}
              className="rounded-b-none"
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Catalog;
