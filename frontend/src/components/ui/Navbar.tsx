'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react'; // эсвэл бусад icon
import { useSession, signOut } from 'next-auth/react';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Гол линкүүд
  const links = [
    { href: '/', label: 'Home' },
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/marketplace', label: 'Marketplace' },
  ];

  // "Кампанит ажил үүсгэх" товчийг зөвхөн нэвтэрсэн үед нэмье
  // Та хүсвэл links массив дотор нэмсэн ч болно.
  const createLink = { href: '/campaigns/create', label: 'Create' };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  async function handleLogout() {
    await signOut({ callbackUrl: '/' });
  }

  const isLoading = status === 'loading';

  return (
    <div className='flex items-center relative'>
      {/* Desktop nav (hidden on mobile) */}
      <nav className='hidden md:flex space-x-4'>
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
        {/* Зөвхөн нэвтэрсэн үед "Create" товч харагдах */}
        {session?.user && (
          <Link
            href={createLink.href}
            className={`px-3 py-2 rounded transition-colors duration-200 ${
              pathname === createLink.href
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {createLink.label}
          </Link>
        )}
      </nav>

      {/* Mobile menu button (hamburger / close icon) */}
      <button
        onClick={toggleMenu}
        className='ml-2 inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100 focus:outline-none md:hidden'
      >
        {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
      </button>

      {/* Right side - Login/Profile */}
      <div className='ml-auto flex items-center space-x-4'>
        {isLoading ? (
          <span className='text-sm text-gray-500'>Loading...</span>
        ) : session?.user ? (
          // If logged in -> show profile image + dropdown
          <ProfileDropdown sessionUser={session.user} onLogout={handleLogout} />
        ) : (
          // If not logged in -> show Login button
          <Link
            href='/login'
            className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500'
          >
            Нэвтрэх
          </Link>
        )}
      </div>

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
            {/* Зөвхөн session байгаа үед "Create" */}
            {session?.user && (
              <li>
                <Link
                  href={createLink.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded px-3 py-2 transition-colors duration-200 ${
                    pathname === createLink.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {createLink.label}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}

// Тусад нь ProfileDropdown компонент
function ProfileDropdown({
  sessionUser,
  onLogout,
}: {
  sessionUser: any;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen(!open);
  }

  return (
    <div className='relative'>
      <img
        src={sessionUser.image || '/default-avatar.png'}
        alt='Profile'
        className='h-8 w-8 rounded-full cursor-pointer'
        onClick={toggle}
      />
      {open && (
        <div className='absolute right-0 mt-2 w-40 bg-white border rounded shadow-md'>
          <Link
            href='/profile'
            className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
            onClick={() => setOpen(false)}
          >
            Профайл
          </Link>
          <button
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
            className='w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100'
          >
            Гарах
          </button>
        </div>
      )}
    </div>
  );
}
