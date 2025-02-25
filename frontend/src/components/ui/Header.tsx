'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react'; // or your preferred icons
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // If you have nav links (Home, Campaigns, Marketplace):
  const pathname = usePathname();
  const links = [
    { href: '/', label: 'Home' },
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/marketplace', label: 'Marketplace' },
  ];

  return (
    <header className='bg-white shadow px-4 py-3'>
      <div className='container mx-auto flex h-16 items-center justify-between'>
        {/* Left: Brand Logo + Name */}
        <div className='flex items-center space-x-2'>
          {/* Example logo or brand icon */}
          <Logo />
          <Link href='/' className='text-xl font-semibold text-gray-800'>
            FundBridge
          </Link>
        </div>

        {/* Right side: Desktop nav + Login (hidden on mobile) */}
        <div className='hidden md:flex items-center space-x-4'>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href='/login'
            className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500'
          >
            Login
          </Link>
        </div>

        {/* Mobile menu button (hamburger / close) - shown on small screens */}
        <button
          className='md:hidden inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100 focus:outline-none'
          onClick={toggleMenu}
        >
          {menuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
        </button>
      </div>

      {/* Mobile dropdown menu (only if menuOpen) */}
      {menuOpen && (
        <div className='md:hidden'>
          <nav className='flex flex-col space-y-1 border-t bg-white px-4 py-2 shadow'>
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)} // close menu on click
                  className={`block rounded px-3 py-2 transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href='/login'
              onClick={() => setMenuOpen(false)}
              className='block rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-500'
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
