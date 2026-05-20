import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toApiError } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, skip the login form.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/catalog', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      await login({ email: data.email, password: data.password });
      navigate('/catalog', { replace: true });
    } catch (err: any) {
      setError(toApiError(err).message || t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            {t('login.subtitle')}
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-secondary-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Input
              {...register('email', {
                required: t('login.emailRequired'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('login.emailInvalid'),
                },
              })}
              type="email"
              label={t('login.email')}
              placeholder={t('login.emailPlaceholder')}
              error={errors.email?.message as string}
              autoComplete="email"
            />

            <Input
              {...register('password', {
                required: t('login.passwordRequired'),
                minLength: {
                  value: 6,
                  message: t('login.passwordMinLength'),
                },
              })}
              type="password"
              label={t('login.password')}
              placeholder={t('login.passwordPlaceholder')}
              error={errors.password?.message as string}
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" loading={loading}>
              {t('login.signIn')}
            </Button>
          </form>

          <div className="mt-6 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
