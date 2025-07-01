'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  // async function fetchNotifications() {
  //   try {
  //     const res = await fetch('/api/notifications');
  //     if (res.ok) {
  //       const data = await res.json();
  //       setNotifications(data);
  //     }
  //   } catch (err) {
  //     console.error('Failed to fetch notifications', err);
  //   }
  // }

  // useEffect(() => {
  //   fetchNotifications(); // first load

  //   const interval = setInterval(fetchNotifications, 5000); // refresh every 5 sec

  //   // cleanup when component unmount
  //   return () => clearInterval(interval);
  // }, []);

  // const unreadCount = notifications.filter((n) => !n.isRead).length;

  function toggleOpen() {
    setOpen((prev) => !prev);
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative' ref={bellRef}>
      <button
        onClick={toggleOpen}
        className='relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition'
      >
        <Bell
          className={`h-5 w-5 text-gray-800
          `}
        />
      </button>

      {open && (
        <div className='absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50'>
          <div className='p-4'>
            <h3 className='text-sm font-semibold text-gray-700 mb-2'>
              Notifications
            </h3>
            <div className='divide-y divide-gray-200 max-h-60 overflow-y-auto'>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <Link
                    key={n._id}
                    href={n.link || '#'}
                    className='flex items-start gap-2 px-2 py-3 hover:bg-gray-50 text-gray-800 text-sm transition'
                    onClick={() => setOpen(false)}
                  >
                    {/* Blue dot for unread */}
                    {!n.isRead && (
                      <div className='h-2 w-2 bg-blue-500 rounded-full mt-2' />
                    )}
                    <div>
                      <p className='font-medium'>{n.message}</p>
                      <p className='text-xs text-gray-500'>
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className='text-gray-500 text-sm p-4 text-center'>
                  You have no notifications.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
