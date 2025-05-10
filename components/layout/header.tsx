'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUser, SignOutButton } from '@clerk/nextjs';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Tasks', path: '/dashboard/tasks' },
  { name: 'Referrals', path: '/dashboard/referrals' },
  { name: 'Leaderboard', path: '/dashboard/leaderboard' },
  { name: 'Rewards', path: '/dashboard/rewards' },
];

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            
            <SheetContent side="left" className="pr-0">
              <nav className="grid gap-6 text-lg font-medium">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      'flex w-full items-center rounded-md px-3 py-2 hover:text-primary',
                      pathname === item.path
                        ? 'font-medium text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-green-600">
              Rafiki Rewards
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.path
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {isSignedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="User avatar"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const initials = document.createElement('div');
                        initials.className = 'h-full w-full flex items-center justify-center bg-primary/10 text-primary text-sm font-medium';
                        initials.textContent = user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'U';
                        target.parentNode?.appendChild(initials);
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-sm font-medium">
                      {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'U'}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <SignOutButton>
                  <DropdownMenuItem asChild>
                    <button className="w-full text-left">Sign out</button>
                  </DropdownMenuItem>
                </SignOutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
