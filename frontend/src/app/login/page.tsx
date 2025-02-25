'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Placeholder login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace with real auth logic: e.g. call an API or use Firebase
    alert(`Logging in with email: ${email}, password: ${password}`);
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md rounded bg-white p-8 shadow-md'>
        <h1 className='mb-6 text-2xl font-semibold text-gray-800'>Нэвтрэх</h1>

        <form onSubmit={handleLogin} className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              И-мэйл
            </label>
            <input
              id='email'
              type='email'
              required
              className='mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='name@example.com'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              Нууц үг
            </label>
            <input
              id='password'
              type='password'
              required
              className='mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            className='w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500'
          >
            Нэвтрэх
          </button>
        </form>

        {/* Optional: Forgot password link */}
        <div className='mt-4 text-sm text-center'>
          <a href='#' className='text-blue-600 hover:underline'>
            Нууц үг сэргээх
          </a>
        </div>
        <div className='mt-4 text-sm text-center'>
          <span className='text-gray-700'>Шинэ хэрэглэгч үү?</span>{' '}
          <a href='/signup' className='text-blue-600 hover:underline'>
            Бүртгүүлэх
          </a>
        </div>

        {/* Optional: Divider for social or web3 login */}
        <div className='my-4 flex items-center'>
          <div className='flex-1 border-t border-gray-300' />
          <p className='mx-2 text-sm text-gray-500'>эсвэл</p>
          <div className='flex-1 border-t border-gray-300' />
        </div>

        {/* Example: Social or web3 login */}
        <div className='flex flex-col space-y-2'>
          <button className='flex items-center justify-center space-x-2 rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100'>
            <img src='/google-logo.png' alt='Google' className='h-4 w-4' />
            <span>Google-ээр нэвтрэх</span>
          </button>
          <button className='flex items-center justify-center space-x-2 rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100'>
            <img src='/wallet-logo.png' alt='Wallet' className='h-4 w-4' />
            <span>MetaMask Wallet-ээр нэвтрэх</span>
          </button>
        </div>
      </div>
    </div>
  );
}
