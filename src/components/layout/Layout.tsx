import React, { ReactNode, useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  /** Optional element rendered on the right of the mobile top bar (e.g. cart badge). */
  mobileHeaderAction?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, mobileHeaderAction }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useTranslation();
  const { companyName } = useAuth();

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-secondary-900/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 max-w-[80%] shadow-xl">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label={t('common.close')}
                className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-secondary-200">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="menu"
              className="p-2 -ml-2 rounded-md text-secondary-600 hover:bg-secondary-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingBag className="h-5 w-5 text-primary-600 shrink-0" />
              <span className="text-sm font-semibold text-secondary-900 truncate">
                {t('brand.name')}
                {companyName ? ` · ${companyName}` : ''}
              </span>
            </div>
          </div>
          {mobileHeaderAction && <div className="shrink-0">{mobileHeaderAction}</div>}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
