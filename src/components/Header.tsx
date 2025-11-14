import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ConnectWallet } from './ConnectWallet';
import { Briefcase, Menu, X, Bell, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext-supabase';
import { signOut } from '../lib/auth-supabase';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  const handleAuthRedirect = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/signup');
    }
  };

  // Dynamic navigation based on user role
  const getNavLinks = () => {
    if (!user) {
      // Unauthenticated users - show generic links that redirect to signup
      return [
        { to: '/jobs', label: 'Find Work', requiresAuth: true },
        { to: '/post-job', label: 'Post Job', requiresAuth: true },
      ];
    }

    if (userProfile?.role === 'freelancer') {
      // Freelancer navigation
      return [
        { to: '/jobs', label: 'Find Jobs', requiresAuth: false },
        { to: '/dashboard', label: 'Dashboard', requiresAuth: false },
        { to: '/messages', label: 'Messages', requiresAuth: false },
      ];
    }

    if (userProfile?.role === 'client') {
      // Client navigation
      return [
        { to: '/dashboard', label: 'My Jobs', requiresAuth: false },
        { to: '/post-job', label: 'Post Job', requiresAuth: false },
        { to: '/messages', label: 'Messages', requiresAuth: false },
      ];
    }

    // Default fallback
    return [
      { to: '/jobs', label: 'Find Work', requiresAuth: false },
      { to: '/post-job', label: 'Post Job', requiresAuth: false },
      { to: '/dashboard', label: 'Dashboard', requiresAuth: false },
      { to: '/messages', label: 'Messages', requiresAuth: false },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-transparent bg-clip-text hidden sm:block">
              TalentBridge
            </span>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-transparent bg-clip-text sm:hidden">
              TB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => link.requiresAuth ? handleAuthRedirect(e) : undefined}
                className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-all text-sm xl:text-base ${
                  isActive(link.to)
                    ? 'bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <Button variant="ghost" size="sm" className="hover:bg-orange-50">
              <Bell className="h-5 w-5" />
            </Button>
            <ConnectWallet />
            
            {user && userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {userProfile.display_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden xl:block font-medium text-sm">{userProfile.display_name}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{userProfile.display_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-orange-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t animate-fade-in-up max-h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => {
                    if (link.requiresAuth) {
                      handleAuthRedirect(e);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between ${
                    isActive(link.to)
                      ? 'bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-orange-50">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </Button>
                <ConnectWallet />
                
                {user && userProfile ? (
                  <>
                    <div className="px-4 py-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{userProfile.display_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
}
