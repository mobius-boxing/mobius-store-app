import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ShoppingCart } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import CatalogItemCard from '../components/catalog/CatalogItemCard';
import OrderSummary from '../components/catalog/OrderSummary';
import CartDrawer from '../components/cart/CartDrawer';
import OrderReviewModal from '../components/order/OrderReviewModal';
import OrderConfirmation from '../components/order/OrderConfirmation';
import { useCatalog } from '../hooks/useCatalog';
import { useCart } from '../contexts/CartContext';
import { storeOrdersApi, toApiError } from '../services/api';
import { CreateOrderPayload, Order } from '../types';
import { useAuth } from '../contexts/AuthContext';

type CatalogTab = 'boxes' | 'rolls';

const CatalogSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="h-5 bg-secondary-200 rounded w-2/3 mb-3" />
        <div className="h-4 bg-secondary-200 rounded w-1/2 mb-2" />
        <div className="h-10 bg-secondary-200 rounded w-full mt-4" />
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
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

  const handleSubmit = async (payload: CreateOrderPayload) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await storeOrdersApi.create(payload);
      clear();
      setReviewOpen(false);
      setConfirmedOrder(order);
    } catch (err) {
      // Server is source of truth: surface its message, keep the cart.
      setSubmitError(toApiError(err).message || t('order.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeepShopping = () => setConfirmedOrder(null);

  const bothEmpty = !loading && !error && boxes.length === 0 && rolls.length === 0;

  const mobileCartButton = (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
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
      <div className="max-w-7xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">
            {t('catalog.title')}
            {companyName ? ` · ${companyName}` : ''}
          </h1>
          <p className="page-subtitle">{t('catalog.subtitle')}</p>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
          {/* Main column */}
          <div>
            <div className="mb-6">
              <Tabs
                tabs={tabs}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as CatalogTab)}
                ariaLabel={t('catalog.title')}
              />
            </div>

            {loading ? (
              <CatalogSkeleton />
            ) : error ? (
              <ErrorState message={t('catalog.loadError')} onRetry={reload} />
            ) : bothEmpty ? (
              <EmptyState
                icon={<Package className="h-10 w-10" />}
                title={t('catalog.empty')}
              />
            ) : activeTab === 'boxes' ? (
              boxes.length === 0 ? (
                <EmptyState
                  icon={<Package className="h-10 w-10" />}
                  title={t('catalog.empty')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {boxes.map((box) => (
                    <CatalogItemCard key={box.uuid} itemType="box" box={box} />
                  ))}
                </div>
              )
            ) : rolls.length === 0 ? (
              <EmptyState
                icon={<Package className="h-10 w-10" />}
                title={t('catalog.empty')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {rolls.map((roll) => (
                  <CatalogItemCard key={roll.uuid} itemType="roll" roll={roll} />
                ))}
              </div>
            )}
          </div>

          {/* Desktop right rail */}
          <div className="hidden lg:block">
            <OrderSummary onReview={() => setReviewOpen(true)} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      {lines.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-secondary-200 px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="text-sm font-medium text-secondary-700"
          >
            {t('cart.items', { count: totalLines })}
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn-primary"
          >
            {t('cart.review')}
          </button>
        </div>
      )}

      <CartDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onReview={() => setReviewOpen(true)}
      />

      <OrderReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={handleSubmit}
        submitting={submitting}
        submitError={submitError}
      />

      <OrderConfirmation
        isOpen={!!confirmedOrder}
        order={confirmedOrder}
        onKeepShopping={handleKeepShopping}
      />
    </Layout>
  );
};

export default Catalog;
