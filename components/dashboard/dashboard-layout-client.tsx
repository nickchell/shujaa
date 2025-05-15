'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Gift,
  Home,
  Inbox,
  BarChart2,
  Share2,
  Users,
  Settings,
  Menu,
} from 'lucide-react';

// Navigation items configuration
const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/tasks', icon: Inbox, label: 'Tasks' },
  { href: '/dashboard/rewards', icon: Gift, label: 'Rewards' },
  { href: '/dashboard/referrals', icon: Share2, label: 'Referrals' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/team', icon: Users, label: 'Team' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

// Loading skeleton for navigation items
function NavSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

// Navigation component with loading state
function Navigation({ isMobile = false, onNavClick }: { isMobile?: boolean; onNavClick?: () => void }) {
  const pathname = usePathname();
  const { isLoaded } = useUser();
  
  if (!isLoaded) {
    return <NavSkeleton />;
  }
  
  return (
    <nav className="grid gap-2 text-lg font-medium">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavClick?.()}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-colors',
              isActive && 'bg-muted font-medium text-primary'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col w-[280px] max-w-full" title="Navigation">
            <Suspense fallback={<NavSkeleton />}>
              <Navigation isMobile onNavClick={() => setOpen(false)} />
            </Suspense>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-black via-red-600 to-green-500 bg-clip-text text-transparent">
              Karibu Rafiki
            </span>
          </div>
        </Link>
        <div className="flex-1"></div>
      </header>
      <div className="flex flex-1">
        <div className="hidden md:flex md:flex-col md:w-[280px] border-r">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Gift className="h-6 w-6" />
              <span>Shujaa</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2 px-2">
            <Suspense fallback={<NavSkeleton />}>
              <Navigation />
            </Suspense>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <main className="p-4 md:p-6">
            <Suspense fallback={
              <div className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
