'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                  pathname === "/dashboard" && "bg-muted font-medium text-primary"
                )}
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
              <Link
                href="/dashboard/tasks"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                  pathname === "/dashboard/tasks" && "bg-muted font-medium text-primary"
                )}
              >
                <Inbox className="h-5 w-5" />
                Tasks
              </Link>
              <Link
                href="/dashboard/referrals"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                  pathname === "/dashboard/referrals" && "bg-muted font-medium text-primary"
                )}
              >
                <Share2 className="h-5 w-5" />
                Referrals
              </Link>
              <Link
                href="/dashboard/rewards"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                  pathname === "/dashboard/rewards" && "bg-muted font-medium text-primary"
                )}
              >
                <Gift className="h-5 w-5" />
                Rewards
              </Link>
              <Link
                href="/dashboard/leaderboard"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                  pathname === "/dashboard/leaderboard" && "bg-muted font-medium text-primary"
                )}
              >
                <BarChart2 className="h-5 w-5" />
                Leaderboard
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                  pathname === "/dashboard/profile" && "bg-muted font-medium text-primary"
                )}
              >
                <Users className="h-5 w-5" />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                  pathname === "/dashboard/settings" && "bg-muted font-medium text-primary"
                )}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-green-600">
            Karibu Rafiki!
          </div>
        </Link>
        <div className="flex-1"></div>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block border-r bg-muted/40">
          <nav className="grid gap-2 p-4 text-sm">
            <div className="py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Menu</h2>
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-colors",
                    pathname === "/dashboard" && "bg-muted font-medium text-primary"
                  )}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-colors",
                    pathname === "/dashboard/tasks" && "bg-muted font-medium text-primary"
                  )}
                >
                  <Inbox className="h-4 w-4" />
                  Tasks
                </Link>
                <Link
                  href="/dashboard/referrals"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-colors",
                    pathname === "/dashboard/referrals" && "bg-muted font-medium text-primary"
                  )}
                >
                  <Share2 className="h-4 w-4" />
                  Referrals
                </Link>
                <Link
                  href="/dashboard/rewards"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-colors",
                    pathname === "/dashboard/rewards" && "bg-muted font-medium text-primary"
                  )}
                >
                  <Gift className="h-4 w-4" />
                  Rewards
                </Link>
                <Link
                  href="/dashboard/leaderboard"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-colors",
                    pathname === "/dashboard/leaderboard" && "bg-muted font-medium text-primary"
                  )}
                >
                  <BarChart2 className="h-4 w-4" />
                  Leaderboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-colors",
                    pathname === "/dashboard/profile" && "bg-muted font-medium text-primary"
                  )}
                >
                  <Users className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-colors",
                    pathname === "/dashboard/settings" && "bg-muted font-medium text-primary"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
            </div>
          </nav>
        </aside>
        <main className="flex flex-col">
          <ScrollArea className="h-full">
            <div className="flex-1 p-4 md:p-8">{children}</div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
