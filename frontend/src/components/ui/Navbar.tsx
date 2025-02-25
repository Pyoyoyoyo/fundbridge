'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react'; // or any icon set you prefer

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/marketplace', label: 'Marketplace' },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='flex items-center'>
      {/* Desktop nav (hidden on mobile) */}
      <nav className='hidden space-x-4 md:flex'>
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
      </nav>

      {/* Mobile menu button (hamburger / close icon) */}
      <button
        onClick={toggleMenu}
        className='ml-2 inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100 focus:outline-none md:hidden'
      >
        {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
      </button>

      {/* Mobile menu panel (only visible on small screens if isOpen) */}
      {isOpen && (
        <nav className='absolute left-0 top-16 z-50 w-full bg-white shadow md:hidden'>
          <ul className='flex flex-col space-y-1 p-4'>
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)} // close menu after clicking
                    className={`block rounded px-3 py-2 transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
