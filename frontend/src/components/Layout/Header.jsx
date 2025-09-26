import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'normal_user': return 'Customer';
      case 'store_owner': return 'Store Owner';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left side */}
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-2xl font-semibold text-gray-900">
              {getGreeting()}, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-sm text-gray-500">
              Welcome to your {getRoleDisplayName(user?.role)} dashboard
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search - only for normal users */}
          {user?.role === 'normal_user' && (
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
            <Bell className="h-5 w-5" />
          </button>

          {/* Profile */}
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;