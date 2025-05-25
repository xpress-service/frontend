'use client';

import { usePathname } from 'next/navigation';
import DefaultLayout from '../_layoutcomponents/DefaultLayout';
import ClientLayoutWrapper from '../_layoutcomponents/ClientLayoutWrapper';
import { useAuth } from '../contexts/AuthContext';

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { userId } = useAuth();

  const excludedPaths = ['/', '/sign-in', '/sign-up'];

  const shouldExcludeLayout = excludedPaths.includes(pathname);

  if (shouldExcludeLayout) {
    return <>{children}</>;
  }

  return (
    <ClientLayoutWrapper>
      <DefaultLayout serviceOwnerId={userId || ''}>
        {children}
      </DefaultLayout>
    </ClientLayoutWrapper>
  );
}
