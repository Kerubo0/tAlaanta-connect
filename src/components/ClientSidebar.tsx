/**
 * Client Sidebar Navigation
 * Professional sidebar for client dashboard pages
 */

import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  CreditCard, 
  FileText,
  Settings,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  userProfile?: any;
}

export default function ClientSidebar({ userProfile }: SidebarProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      description: 'Overview & stats'
    },
    { 
      path: '/client/my-jobs', 
      icon: Briefcase, 
      label: 'My Jobs',
      description: 'Manage all jobs'
    },
    { 
      path: '/messages', 
      icon: MessageSquare, 
      label: 'Messages',
      description: 'Chat with freelancers'
    },
    { 
      path: '/client/payments', 
      icon: FileText, 
      label: 'Payments',
      description: 'Transaction history'
    },
    { 
      path: '/client/payment-methods', 
      icon: CreditCard, 
      label: 'Payment Methods',
      description: 'Cards & billing'
    },
    { 
      path: '/client/settings', 
      icon: Settings, 
      label: 'Settings',
      description: 'Account preferences'
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 pt-20
        `}
      >
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {userProfile?.display_name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {userProfile?.display_name || 'Client'}
              </h3>
              <p className="text-sm text-gray-500 truncate">{userProfile?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${active 
                    ? 'bg-purple-50 text-purple-700 font-medium shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} className={active ? 'text-purple-600' : 'text-gray-500'} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
                {active && (
                  <div className="w-1 h-8 bg-purple-600 rounded-full -mr-4" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <Link
            to="/post-job"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Briefcase size={20} />
            Post a Job
          </Link>
        </div>
      </aside>
    </>
  );
}
