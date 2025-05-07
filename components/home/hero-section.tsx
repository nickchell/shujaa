import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted/50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="gradient-text">Earn Free Data</span> By Referring Friends
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Join Rafiki Rewards and earn Safaricom data bundles by inviting friends and completing simple tasks.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="animate-pulse-scale">
                <Link href="/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/learn-more">Learn More</Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className="font-medium">10K+</span>
                <span className="text-muted-foreground">Users</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-1">
                <span className="font-medium">5M+</span>
                <span className="text-muted-foreground">Data Bundles</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-1">
                <span className="font-medium">4.9</span>
                <span className="text-muted-foreground">Rating</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm overflow-hidden rounded-lg shadow-xl animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm" />
              <Image
                src="https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="People using smartphones"
                className="w-full h-auto object-cover"
                width={500}
                height={750}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Current Reward</span>
                    <span className="text-2xl font-bold">50MB Data</span>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">Claim Now</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}