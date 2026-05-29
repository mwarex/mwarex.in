'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Play, LogOut, User, Settings, ChevronDown, Bell, Check } from 'lucide-react';
import { MWareXLogo } from '@/components/mwarex-logo';
import { isAuthenticated, getUserRole, getUserData, logout } from '@/lib/auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const role = getUserRole();
  const userData = getUserData();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${isScrolled
          ? 'glass border-white/5 py-3'
          : 'bg-transparent border-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="z-10 hover:scale-105 transition-transform duration-300" id="nav-logo-anchor">
            <MWareXLogo size="md" showText={false} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {mounted && isAuthenticated() ? (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative group">
                  <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </button>
                  {/* Simple Notification Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-80 glass-card rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <span className="font-semibold text-white text-sm">Notifications</span>
                      <span className="text-xs text-red-400 cursor-pointer hover:text-red-300">Mark all read</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {/* Mock Notifications */}
                      <div className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Play className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-200">New video submitted</p>
                            <p className="text-xs text-gray-500 mt-1">Check "My Vlog" for review.</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-200">Upload Complete</p>
                            <p className="text-xs text-gray-500 mt-1">"Gaming Highlight" is now live on YouTube.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                      {userData?.name?.[0] || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl overflow-hidden p-2 shadow-2xl ring-1 ring-white/10"
                        >
                          <div className="px-3 py-2 border-b border-white/5 mb-1">
                            <p className="text-sm font-medium text-white">{userData?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{userData?.email || 'email@example.com'}</p>
                          </div>

                          <Link
                            href={role === 'creator' ? '/dashboard/creator' : '/dashboard/editor'}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Dashboard
                          </Link>

                          {role === 'creator' && (
                            <Link
                              href="/dashboard/creator/settings"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors mt-1"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm font-medium text-gray-400 hover:text-white px-4 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary py-2.5 text-sm px-6 shadow-red-500/20 shadow-lg hover:shadow-red-500/40">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden glass border-t border-white/5 overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 font-medium hover:text-white px-4 py-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                  {mounted && isAuthenticated() ? (
                    <button onClick={handleLogout} className="text-red-500 font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg text-left transition-colors">Logout</button>
                  ) : (
                    <>
                      <Link href="/auth/signin" className="text-gray-400 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>Sign In</Link>
                      <Link href="/auth/signup" className="btn-primary py-3 text-center" onClick={() => setIsOpen(false)}>Get Started</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  );
}
