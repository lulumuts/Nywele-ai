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
  X,
  DollarSign
} from 'lucide-react';

// Import Caprasimo font
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Caprasimo&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

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
      name: 'How It Works',
      href: '/how-it-works',
      icon: Home,
      description: 'Learn about Nywele.ai'
    },
    {
      name: 'Book Style',
      href: '/booking-flow',
      icon: Sparkles,
      description: 'Book your hairstyle'
    },
    {
      name: 'Hair Care',
      href: '/hair-care',
      icon: Heart,
      description: 'Get recommendations'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/how-it-works') return pathname === '/how-it-works' || pathname === '/';
    if (href === '/booking-flow') return pathname.startsWith('/booking');
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-sm border-b border-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/how-it-works" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 flex items-center justify-center"
            >
              <img src="/coil.svg" alt="Nywele.ai" className="w-8 h-8" />
            </motion.div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Caprasimo, serif', color: '#9E6240' }}>
              nywele.ai
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
                      ? 'bg-[#9E6240] bg-opacity-20' 
                      : 'hover:bg-[#9E6240] hover:bg-opacity-10'
                    }
                  `}
                  style={{ color: '#9E6240' }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile / Login */}
          <div className="hidden md:flex items-center space-x-3">
            {userName ? (
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(158, 98, 64, 0.1)', color: '#9E6240' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(158, 98, 64, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(158, 98, 64, 0.1)'}
              >
                <User className="w-4 h-4" style={{ color: '#9E6240' }} />
                <span className="text-sm font-medium">{userName}</span>
              </Link>
            ) : (
              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-shadow"
                style={{ backgroundColor: '#9E6240' }}
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#9E6240' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(158, 98, 64, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
          className="md:hidden border-t"
          style={{ 
            borderColor: 'rgba(158, 98, 64, 0.2)',
            backgroundColor: 'rgba(254, 244, 230, 0.95)'
          }}
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
                      ? 'bg-[#9E6240] bg-opacity-20' 
                      : 'hover:bg-[#9E6240] hover:bg-opacity-10'
                    }
                  `}
                  style={{ color: '#9E6240' }}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{link.name}</div>
                    <div className="text-xs" style={{ color: '#B87D48' }}>{link.description}</div>
                  </div>
                </Link>
              );
            })}
            
            <div className="pt-4 border-t" style={{ borderColor: 'rgba(158, 98, 64, 0.2)' }}>
              {userName ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg"
                  style={{ backgroundColor: 'rgba(158, 98, 64, 0.1)', color: '#9E6240' }}
                >
                  <User className="w-5 h-5" style={{ color: '#9E6240' }} />
                  <span className="font-medium">{userName}</span>
                </Link>
              ) : (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#9E6240' }}
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

