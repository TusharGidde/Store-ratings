import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

const AuthForm = ({ type = 'login' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState('normal_user'); // For signup toggle
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      let result;
      if (type === 'login') {
        result = await login(data);
      } else {
        result = await signup({ ...data, role: userRole });
      }

      if (result.success) {
        // Redirect based on user role
        const userRole = result.user.role;
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'store_owner') {
          navigate('/store/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLogin = type === 'login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Store className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* User Role Toggle - Only for Signup */}
            {!isLogin && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="normal_user"
                      checked={userRole === 'normal_user'}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <User className="ml-2 h-4 w-4 text-gray-500" />
                    <span className="ml-1 text-sm text-gray-700">Customer</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="store_owner"
                      checked={userRole === 'store_owner'}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Store className="ml-2 h-4 w-4 text-gray-500" />
                    <span className="ml-1 text-sm text-gray-700">Store Owner</span>
                  </label>
                </div>
              </div>
            )}

            {/* Name field - Only for Signup */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 5, message: 'Name must be at least 5 characters' },
                    maxLength: { value: 60, message: 'Name must be at most 60 characters' }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name (5-60 characters)"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Address field - Only for Signup */}
            {!isLogin && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  rows={3}
                  {...register('address', {
                    required: 'Address is required',
                    maxLength: { value: 400, message: 'Address must be at most 400 characters' }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your complete address (max 400 characters)"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
            )}

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  {...register('password', {
                    required: 'Password is required',
                    ...((!isLogin) && {
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/,
                        message: 'Password must be 8-16 characters with at least one uppercase letter and one special character'
                      }
                    })
                  })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isLogin ? "Enter your password" : "8-16 chars with uppercase & special char"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-blue-600 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors duration-200"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>

          {/* Demo accounts info for login */}
          {isLogin && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Accounts:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>Admin:</strong> admin@storerating.com / Admin123!</div>
                <div><strong>Store Owner:</strong> jane.store.admin@example.com / Password123!</div>
                <div><strong>Normal User:</strong> john.admin.created@example.com / Password123!</div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthForm;