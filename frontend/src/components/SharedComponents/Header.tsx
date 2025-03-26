'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
import Logo from './Logo';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  // Гол navigation линкүүд
  // (Profile, My Campaigns, Selling Items‐ийг dropdown руу оруулна => эндээс хасна)
  const links = [
    { href: '/', label: 'Home' },
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/marketplace', label: 'Marketplace' },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);

  async function handleLogout() {
    await signOut({ callbackUrl: '/' });
  }

  return (
    <header className='bg-white shadow px-4 py-3'>
      <div className='container mx-auto flex h-16 items-center justify-between'>
        {/* ------ Left: Brand Logo + Name ------ */}
        <div className='flex items-center space-x-2'>
          <Logo />
          <Link href='/' className='text-xl font-semibold text-gray-800'>
            FundBridge
          </Link>
        </div>

        {/* ------ Right side: Desktop nav ------ */}
        <div className='hidden md:flex items-center space-x-4'>
          {/* Үндсэн link-үүд */}
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

          {/* Нэвтрэлтийн төлөв */}
          {isLoading ? (
            <Skeleton className='h-5 w-16 rounded bg-gray-300' />
          ) : session?.user ? (
            // Logged in => Dropdown‐той ProfileMenu
            <ProfileMenu user={session.user} onLogout={handleLogout} />
          ) : (
            // Not logged in => Login button
            <Link
              href='/login'
              className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500'
            >
              Login
            </Link>
          )}
        </div>

        {/* ------ Mobile menu button (hamburger / close) ------ */}
        <button
          className='md:hidden inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100 focus:outline-none'
          onClick={toggleMenu}
        >
          {menuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
        </button>
      </div>

      {/* ------ Mobile dropdown menu (only if menuOpen) ------ */}
      {menuOpen && (
        <div className='md:hidden border-t bg-white px-4 py-2 shadow'>
          <nav className='flex flex-col space-y-1'>
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
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

            {/* Nэвтрэлтийн төлөв (mobile) */}
            {isLoading ? (
              <Skeleton className='h-5 w-16 rounded bg-gray-300' />
            ) : session?.user ? (
              <ProfileMenuMobile
                user={session.user}
                onLogout={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              />
            ) : (
              <Link
                href='/login'
                onClick={() => setMenuOpen(false)}
                className='block rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-500'
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/** ProfileMenu (Desktop) - Avatar дээр дарж dropdown гарна.
 *  Энд Profile, My Campaigns, Selling Items, Logout гэсэн 4 сонголт байршуулна.
 */
function ProfileMenu({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen(!open);
  }

  return (
    <div className='relative z-50'>
      <img
        src={user.image || '/default-avatar.png'}
        alt='profile'
        className='h-8 w-8 rounded-full cursor-pointer'
        onClick={toggle}
      />
      {open && (
        <div className='absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50'>
          {/* Profile */}
          <Link
            href='/profile'
            className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>

          {/* My Campaigns */}
          <Link
            href='/profile/campaigns'
            className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
            onClick={() => setOpen(false)}
          >
            My Campaigns
          </Link>

          {/* Selling Items */}
          <Link
            href='/profile/items'
            className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
            onClick={() => setOpen(false)}
          >
            Selling Items
          </Link>

          {/* Logout */}
          <button
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
            className='block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100'
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

/** ProfileMenuMobile (Mobile) - Mobile цэсэнд
 * Profile, My Campaigns, Selling Items, Logout
 * жагсаалтаар харуулна.
 */
function ProfileMenuMobile({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  return (
    <div className='flex flex-col space-y-1 mt-2'>
      {/* Avatar + name */}
      <div className='flex items-center space-x-2 px-3 py-2'>
        <img
          src={user.image || '/default-avatar.png'}
          alt='profile'
          className='h-8 w-8 rounded-full'
        />
        <span className='text-gray-800 font-medium'>{user.name || 'User'}</span>
      </div>

      {/* Profile */}
      <Link
        href='/profile'
        className='block rounded px-3 py-2 text-gray-700 hover:bg-gray-100'
      >
        Profile
      </Link>

      {/* My Campaigns */}
      <Link
        href='/profile/campaigns'
        className='block rounded px-3 py-2 text-gray-700 hover:bg-gray-100'
      >
        My Campaigns
      </Link>

      {/* Selling Items */}
      <Link
        href='/profile/items'
        className='block rounded px-3 py-2 text-gray-700 hover:bg-gray-100'
      >
        Selling Items
      </Link>

      {/* Logout */}
      <button
        onClick={onLogout}
        className='text-left block rounded px-3 py-2 text-gray-700 hover:bg-gray-100'
      >
        Logout
      </button>
    </div>
  );
}
