'use client';
import LogoWhite from '@/components/SharedComponents/LogoWhite';

export default function Footer() {
  return (
    <footer className='bg-gray-900 text-gray-200'>
      <div className='container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row'>
        <div className='flex items-center space-x-2'>
          <LogoWhite />
          <span className='font-semibold'>FundBridge</span>
        </div>
        <p className='text-sm'>
          &copy; {new Date().getFullYear()} FundBridge. Бүх эрх хамгаалагдсан.
        </p>
        <div className='flex space-x-4 text-sm'>
          <a href='#' className='transition-colors hover:text-white'>
            Нууцлалын бодлого
          </a>
          <a href='#' className='transition-colors hover:text-white'>
            Үйлчилгээний нөхцөл
          </a>
          <a href='#' className='transition-colors hover:text-white'>
            Холбоо барих
          </a>
        </div>
      </div>
    </footer>
  );
}
