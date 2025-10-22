'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Briefcase, 
  User,
  Heart,
  Home,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('Profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const profile = localStorage.getItem('nywele-user-profile');
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      setUserName(parsedProfile.name || 'Profile');
    }
  }, []);

  const navLinks = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: Home,
      description: 'Dashboard'
    },
    {
      name: 'Book Style',
      href: '/',
      icon: Sparkles,
      description: 'Book your hairstyle',
      highlight: true
    },
    {
      name: 'Find Stylists',
      href: '/stylists',
      icon: Search,
      description: 'Browse stylists'
    },
    {
      name: 'Hair Care',
      href: '/hair-care',
      icon: Heart,
      description: 'Get recommendations'
    },
    {
      name: 'For Stylists',
      href: '/braiders',
      icon: Briefcase,
      description: 'Stylist dashboard'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/') return pathname === '/' || pathname.startsWith('/booking');
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nywele.ai
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium text-sm transition-all
                    flex items-center space-x-2
                    ${active 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                    }
                    ${link.highlight ? 'ring-2 ring-purple-200' : ''}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-purple-100 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Profile / Login */}
          <div className="hidden md:flex items-center space-x-3">
            {userName ? (
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </Link>
            ) : (
              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:shadow-lg transition-shadow"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-gray-200 bg-white"
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${active 
                      ? 'bg-purple-50 text-purple-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{link.name}</div>
                    <div className="text-xs text-gray-500">{link.description}</div>
                  </div>
                </Link>
              );
            })}
            
            <div className="pt-4 border-t border-gray-200">
              {userName ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-100"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">{userName}</span>
                </Link>
              ) : (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

