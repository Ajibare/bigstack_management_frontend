'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
// import logo from '../assets/logo.png';
import logo from '../components/asset/logo.png'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSeenSplash = window.sessionStorage.getItem('bigstack-splash-shown');
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = window.setTimeout(() => {
      setIsVisible(false);
      window.sessionStorage.setItem('bigstack-splash-shown', 'true');
    }, 1600);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center overflow-hidden bg-slate-950/95 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white shadow-[0_0_80px_rgba(99,102,241,0.18)] animate-[pulse_1.6s_ease-in-out_infinite]">
          <Image
            src={logo}
            alt="BigStack logo"
            width={88}
            height={88}
            priority
            className="drop-shadow-[0_8px_25px_rgba(255,255,255,0.18)]"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-[0.25em] text-white/90 uppercase">
          BigStack Technologies
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300/80">
          Management made simple
        </p>
      </div>
    </div>
  );
}
