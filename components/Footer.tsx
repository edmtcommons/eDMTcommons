'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  
  // Hide footer on home page
  if (pathname === '/') {
    return null;
  }
  
  return (
    <footer className="w-full py-4 px-8 flex items-center justify-end bg-transparent z-10 fixed bottom-0 left-0 right-0">
      <div className="flex items-center gap-4">
        {/* X.com Icon */}
        <a
          href="https://x.com/psy_dao"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center transition-all duration-300 group"
          aria-label="Visit PsyDAO on X (Twitter)"
        >
          <Image
            src="/assets/x.svg"
            alt="X (Twitter)"
            width={20}
            height={20}
            className="group-hover:scale-110 transition-transform brightness-0 invert"
          />
        </a>

        {/* PsyDAO Website Icon */}
        <a
          href="https://www.psydao.io"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center transition-all duration-300 group"
          aria-label="Visit PsyDAO website"
        >
          <Image
            src="/assets/psydao.svg"
            alt="PsyDAO"
            width={20}
            height={20}
            className="group-hover:scale-110 transition-transform brightness-0 invert"
          />
        </a>
      </div>
    </footer>
  );
}

