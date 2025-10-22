'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
}

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="FlyNova" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-aviation-600">
              Fly<span className="text-slate-900">Nova</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`font-semibold transition-colors ${
                    isActive('/dashboard') ? 'text-aviation-600' : 'text-slate-600 hover:text-aviation-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/virtual-airlines" 
                  className={`font-semibold transition-colors ${
                    isActive('/virtual-airlines') ? 'text-aviation-600' : 'text-slate-600 hover:text-aviation-600'
                  }`}
                >
                  Virtual Airlines
                </Link>
                <Link 
                  href="/tracker" 
                  className={`font-semibold transition-colors ${
                    isActive('/tracker') ? 'text-aviation-600' : 'text-slate-600 hover:text-aviation-600'
                  }`}
                >
                  Tracker
                </Link>
                <Link 
                  href="/downloads" 
                  className={`font-semibold transition-colors ${
                    isActive('/downloads') ? 'text-aviation-600' : 'text-slate-600 hover:text-aviation-600'
                  }`}
                >
                  Downloads
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="text-slate-600 hover:text-aviation-600 transition-colors">Home</Link>
                <Link href="/virtual-airlines" className="text-slate-600 hover:text-aviation-600 transition-colors">Virtual Airlines</Link>
              </>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href={`/profile/${user.id}`} className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900 hover:text-aviation-600 transition-colors">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </Link>
                <Link href={`/profile/${user.id}`}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full ring-2 ring-aviation-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-aviation-600 flex items-center justify-center text-white font-bold ring-2 ring-aviation-100">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-sm text-slate-600 hover:text-red-600 transition-colors font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary hidden sm:inline-block">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-600 hover:text-aviation-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4 space-y-3">
            {user ? (
              <>
                <Link href="/dashboard" className="block text-slate-700 hover:text-aviation-600 font-semibold">Dashboard</Link>
                <Link href="/virtual-airlines" className="block text-slate-700 hover:text-aviation-600 font-semibold">Virtual Airlines</Link>
                <Link href="/tracker" className="block text-slate-700 hover:text-aviation-600 font-semibold">Tracker</Link>
                <Link href="/downloads" className="block text-slate-700 hover:text-aviation-600 font-semibold">Downloads</Link>
                <Link href={`/profile/${user.id}`} className="block text-slate-700 hover:text-aviation-600 font-semibold">My Profile</Link>
              </>
            ) : (
              <>
                <Link href="/" className="block text-slate-700 hover:text-aviation-600 font-semibold">Home</Link>
                <Link href="/virtual-airlines" className="block text-slate-700 hover:text-aviation-600 font-semibold">Virtual Airlines</Link>
                <Link href="/auth/login" className="block text-slate-700 hover:text-aviation-600 font-semibold">Sign In</Link>
                <Link href="/auth/register" className="block text-aviation-600 font-bold">Get Started</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
