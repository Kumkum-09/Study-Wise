'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1" />
      {/* Add any header actions here, e.g. theme toggle, user menu */}
    </header>
  );
}
