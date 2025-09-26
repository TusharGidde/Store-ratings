import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Store, 
  Star, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  Plus,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ];

    if (user?.role === 'normal_user') {
      return [
        ...baseItems,
        { name: 'Browse Stores', href: '/stores', icon: Search },
        { name: 'My Ratings', href: '/my-ratings', icon: Star },
      ];
    }

    if (user?.role === 'store_owner') {
      return [
        ...baseItems,
        { name: 'My Store', href: '/my-store', icon: Store },
        { name: 'Store Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Reviews', href: '/reviews', icon: Star },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Stores', href: '/admin/stores', icon: Store },
        { name: 'Ratings', href: '/admin/ratings', icon: Star },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ];
    }

    return baseItems;
  };

  const navigation = getNavigationItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600 text-white">
            <Store className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold">StoreRate</span>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;