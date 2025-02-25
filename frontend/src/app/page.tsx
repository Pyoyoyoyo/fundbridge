// src/app/page.tsx
'use client';

import Hero from './components/Hero';
import Advantages from './components/Advantages';
import Steps from './components/Steps';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <div className='bg-white'>
      <Hero />
      <Advantages />
      <Steps />
      <CTA />
      <Footer />
    </div>
  );
}
