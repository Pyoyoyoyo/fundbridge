'use client';

import Hero from './components/Hero';
import Advantages from './components/Advantages';
import Steps from './components/Steps';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import StatsSection from './components/StatsSection';
import SocialProofSection from './components/SocialProofSection';

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
