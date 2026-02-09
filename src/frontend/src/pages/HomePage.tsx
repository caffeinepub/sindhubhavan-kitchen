import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, Clock, Award, Heart } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { generateWhatsAppUrl } from '../utils/whatsapp';

export default function HomePage() {
  const navigate = useNavigate();

  const handleWhatsAppClick = () => {
    window.open(generateWhatsAppUrl('Hello! I would like to know more about Zaika Kitchen.'), '_blank');
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <UtensilsCrossed className="h-4 w-4" />
              Welcome to Zaika Kitchen
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Delicious Food,
              <br />
              <span className="text-primary">Delivered Fresh</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Experience culinary excellence with our carefully crafted menu. From appetizers to desserts, every dish is made with passion and the finest ingredients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" onClick={() => navigate({ to: '/menu' })} className="gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                View Menu
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate({ to: '/menu' })}>
                Order Now
              </Button>
              <Button size="lg" variant="outline" onClick={handleWhatsAppClick} className="gap-2">
                <SiWhatsapp className="h-5 w-5" />
                Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best dining experience with quality food and exceptional service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-muted-foreground">
                  Only the finest ingredients sourced from trusted suppliers for exceptional taste.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Service</h3>
                <p className="text-muted-foreground">
                  Quick preparation and delivery without compromising on quality or taste.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Made with Love</h3>
                <p className="text-muted-foreground">
                  Every dish is prepared with care and passion by our experienced chefs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Browse our delicious menu and place your order today. Fresh food, delivered to your door.
              </p>
              <Button size="lg" onClick={() => navigate({ to: '/menu' })} className="gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Explore Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
