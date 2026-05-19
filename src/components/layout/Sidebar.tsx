import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Settings,
  LogOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { NavItem } from '../../types';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      path: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['member', 'admin', 'superAdmin'],
    },
    {
      id: 'catalog',
      label: t('nav.catalog'),
      path: '/catalog',
      icon: 'ShoppingBag',
      roles: ['member', 'admin', 'superAdmin'],
    },
    {
      id: 'orders',
      label: t('nav.orders'),
      path: '/orders',
      icon: 'ClipboardList',
      roles: ['member', 'admin', 'superAdmin'],
    },
    {
      id: 'manage-catalog',
      label: t('nav.manageCatalog'),
      path: '/manage/catalog',
      icon: 'Settings',
      roles: ['admin', 'superAdmin'],
    },
  ];

  const getIcon = (iconName: string, className: string = "h-5 w-5") => {
    const icons: { [key: string]: React.FC<{ className?: string }> } = {
      LayoutDashboard,
      ShoppingBag,
      ClipboardList,
      Settings,
    };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  const filteredNavigation = navigationItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-secondary-200 h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-secondary-200">
        <h1 className="text-xl font-bold text-primary-600">Mobius Store</h1>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-secondary-500">
              {user?.companyName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = item.path === location.pathname;
          return (
            <NavLink
              key={item.id}
              to={item.path!}
              className={`sidebar-item ${
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
              }`}
            >
              {getIcon(item.icon)}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <div className="px-4 py-4 border-t border-secondary-200">
        <LanguageSwitcher />
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-secondary-200">
        <button
          onClick={handleLogout}
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
