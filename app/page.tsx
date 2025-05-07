'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Award,
  Gift,
  Share2,
  CheckCircle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import HeroSection from '@/components/home/hero-section';
import StatsSection from '@/components/home/stats-section';
import TestimonialsSection from '@/components/home/testimonials-section';

import { useUser } from '@clerk/nextjs'; // ✅ Clerk hook

export default function Home() {
  const { isSignedIn, user } = useUser(); // ✅ Access Clerk user state

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">How It Works</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Earn Rewards in Three Simple Steps
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Get free data bundles by referring friends and completing simple tasks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Step Cards */}
            {[{
              icon: Share2,
              title: '1. Invite Friends',
              desc: 'Share your unique referral link with friends and family.'
            }, {
              icon: CheckCircle,
              title: '2. Complete Tasks',
              desc: 'Earn points by watching ads, answering surveys, and more.'
            }, {
              icon: Gift,
              title: '3. Get Rewards',
              desc: 'Redeem your points for data bundles or airtime.'
            }].map((step, idx) => (
              <Card key={idx} className="card-hover">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Benefits</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose Rafiki Rewards?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Join thousands of Kenyans already earning free data and airtime.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              icon: Award,
              title: 'Free to Join',
              desc: 'No registration fees. Start earning immediately.'
            }, {
              icon: RefreshCw,
              title: 'Daily Rewards',
              desc: 'New tasks every day.'
            }, {
              icon: TrendingUp,
              title: 'Unlimited Earnings',
              desc: 'No cap. Refer more, earn more.'
            }].map((benefit, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Button - Conditional */}
          <div className="flex justify-center mt-12">
            {isSignedIn ? (
              <Button asChild size="lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="animate-pulse-scale">
                <Link href="/sign-up">Get Started Now</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <StatsSection />
      <TestimonialsSection />

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Start Earning?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Join Rafiki Rewards today and start earning free data and airtime.
              </p>
            </div>
            <div className="space-x-4">
              {isSignedIn ? (
                <>
                  <Button asChild size="lg">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/sign-up">Sign Up Now</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/sign-in">Login</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
