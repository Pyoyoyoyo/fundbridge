'use client';

import Hero from '@/components/home/Hero';
import Advantages from '@/components/home/Advantages';
import Steps from '@/components/home/Steps';
import Testimonials from '@/components/home/Testimonials';
import CTA from '@/components/home/CTA';
import Footer from '@/components/home/Footer';
import StatsSection from '@/components/home/StatsSection';
import SocialProofSection from '@/components/home/SocialProofSection';

export default function HomePage() {
  return (
    <div className='bg-white'>
      <Hero />
      <Advantages />
      <StatsSection />
      <SocialProofSection />
      <Steps />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
