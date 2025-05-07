import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="w-full py-6 bg-background border-t">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4 text-primary">Rafiki Rewards</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Earn free data by referring friends and completing tasks.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Company</h3>
            <div className="grid gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                About
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/faqs" className="text-sm text-muted-foreground hover:text-primary">
                FAQs
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Features</h3>
            <div className="grid gap-2">
              <Link href="/referrals" className="text-sm text-muted-foreground hover:text-primary">
                Referrals
              </Link>
              <Link href="/tasks" className="text-sm text-muted-foreground hover:text-primary">
                Tasks
              </Link>
              <Link href="/rewards" className="text-sm text-muted-foreground hover:text-primary">
                Rewards
              </Link>
              <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-primary">
                Leaderboard
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Contact</h3>
            <div className="grid gap-2">
              <Link href="mailto:support@rafiki.ke" className="text-sm text-muted-foreground hover:text-primary">
                support@rafiki.ke
              </Link>
              <Link href="tel:+254700000000" className="text-sm text-muted-foreground hover:text-primary">
                +254 700 000 000
              </Link>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
            &copy; {new Date().getFullYear()} Rafiki Rewards. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-primary">
              Twitter
            </Link>
            <Link href="https://facebook.com" className="text-muted-foreground hover:text-primary">
              Facebook
            </Link>
            <Link href="https://instagram.com" className="text-muted-foreground hover:text-primary">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}