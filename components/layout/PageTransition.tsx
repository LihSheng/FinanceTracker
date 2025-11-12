'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setDisplayChildren(children);
    });
  }, [pathname, children]);

  return (
    <>
      {/* Top loading bar - shows immediately on navigation */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500 animate-pulse"></div>
        </div>
      )}
      
      {/* Content with fade effect during transition */}
      <div className={`transition-opacity duration-150 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {displayChildren}
      </div>
    </>
  );
}
