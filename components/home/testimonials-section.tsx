import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuoteIcon } from 'lucide-react';

const testimonials = [
  {
    name: "John Kamau",
    location: "Nairobi",
    quote: "I've earned over 5GB of data in just two months using Rafiki Rewards! My friends and family are all using it now too.",
    avatar: "JK"
  },
  {
    name: "Faith Wanjiku",
    location: "Mombasa",
    quote: "As a university student, free data helps me with my online classes. Rafiki Rewards has been a life-saver!",
    avatar: "FW"
  },
  {
    name: "David Ochieng",
    location: "Kisumu",
    quote: "The daily tasks are simple and fun. I complete them during my commute and have earned enough data to last the whole month.",
    avatar: "DO"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Hear From Our Users
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See what Kenyans are saying about Rafiki Rewards.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-hover relative">
              <div className="absolute top-4 right-4 text-primary opacity-30">
                <QuoteIcon className="h-8 w-8" />
              </div>
              <CardHeader>
                <p className="text-lg">{testimonial.quote}</p>
              </CardHeader>
              <CardFooter className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}