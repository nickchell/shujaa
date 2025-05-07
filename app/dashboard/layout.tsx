"use client"

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

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: Inbox,
  },
  {
    title: "Referrals",
    href: "/dashboard/referrals",
    icon: Share2,
  },
  {
    title: "Rewards",
    href: "/dashboard/rewards",
    icon: Gift,
  },
  {
    title: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: BarChart2,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

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
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary",
                    pathname === item.href && "bg-muted font-medium text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-green-600">Rafiki Rewards</div>
        </Link>
        <div className="flex-1"></div>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            <div className="py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Menu
              </h2>
              <div className="space-y-1">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-colors",
                      pathname === item.href && "bg-muted font-medium text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </aside>
        <main className="flex flex-col">
          <ScrollArea className="h-full">
            <div className="flex-1 p-4 md:p-8">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}