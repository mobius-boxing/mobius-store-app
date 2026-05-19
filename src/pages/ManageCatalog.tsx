import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/layout/Layout';

const ManageCatalog: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="page-header">
          <h1 className="page-title">{t('nav.manageCatalog')}</h1>
          <p className="page-subtitle">{t('manageCatalog.subtitle')}</p>
        </div>

        <div className="section-card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">{t('manageCatalog.items')}</h2>
          </div>
          <div className="card-body">
            <p className="text-secondary-500">{t('common.noResults')}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageCatalog;
