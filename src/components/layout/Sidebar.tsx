import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, ClipboardList, LogOut, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';

interface SidebarProps {
  onNavigate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { storeUser, companyName, logout } = useAuth();
  const { t } = useTranslation();

  const navigationItems = [
    {
      id: 'catalog',
      label: t('nav.catalog'),
      path: '/catalog',
      icon: ShoppingBag,
    },
    {
      id: 'orders',
      label: t('nav.orders'),
      path: '/orders',
      icon: ClipboardList,
    },
  ];

  const initials = (() => {
    const f = storeUser?.firstName?.[0] ?? '';
    const l = storeUser?.lastName?.[0] ?? '';
    return (f + l).trim().toUpperCase();
  })();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-secondary-200 h-full">
      {/* Brand */}
      <div className="flex items-center h-16 px-4 border-b border-secondary-200 gap-2">
        <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-primary-600 leading-tight">
            {t('brand.name')}
          </p>
          {companyName && (
            <p className="text-xs text-secondary-500 truncate">{companyName}</p>
          )}
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
            {initials ? (
              <span className="text-sm font-medium text-primary-700">{initials}</span>
            ) : (
              <UserIcon className="h-4 w-4 text-primary-600" />
            )}
          </div>
          <div className="min-w-0">
            {companyName && (
              <p className="text-sm font-medium text-secondary-900 truncate">
                {companyName}
              </p>
            )}
            <p className="text-xs text-secondary-500 truncate">{storeUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" aria-label={t('brand.name')}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="ml-3">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Language switcher */}
      <div className="px-4 py-4 border-t border-secondary-200">
        <LanguageSwitcher />
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-secondary-200">
        <button
          onClick={logout}
          className="sidebar-item sidebar-item-inactive w-full text-left"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">{t('nav.signOut')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
