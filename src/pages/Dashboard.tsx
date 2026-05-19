import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, ClipboardList, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
              <p className="mt-2 text-primary-100 text-lg">
                {t('dashboard.welcome', { name: user?.firstName })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">{t('dashboard.refresh')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white shadow-md rounded-2xl border border-secondary-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-secondary-100 bg-secondary-50/50">
            <h2 className="text-xl font-semibold text-secondary-900">
              {t('dashboard.quickActions')}
            </h2>
            <p className="mt-1 text-sm text-secondary-500">
              {t('dashboard.quickActionsDesc')}
            </p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <a
                href="/catalog"
                className="group relative rounded-xl border-2 border-secondary-200 bg-white p-6 hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors">
                      {t('dashboard.browseCatalog')}
                    </h3>
                    <p className="mt-1 text-sm text-secondary-500">
                      {t('dashboard.browseCatalogDesc')}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>

              <a
                href="/orders"
                className="group relative rounded-xl border-2 border-secondary-200 bg-white p-6 hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors">
                      {t('dashboard.viewOrders')}
                    </h3>
                    <p className="mt-1 text-sm text-secondary-500">
                      {t('dashboard.viewOrdersDesc')}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
