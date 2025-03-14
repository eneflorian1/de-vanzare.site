'use client';

import React, { ReactNode } from 'react';
import { SessionProvider } from './SessionProvider';
import { CategoryProvider } from '@/components/CategoryProvider';

interface ProvidersProps {
  children: ReactNode;
  session: any;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <CategoryProvider>
        {children}
      </CategoryProvider>
    </SessionProvider>
  );
}
