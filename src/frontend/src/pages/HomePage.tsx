import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, Clock, Award, Heart, Sparkles } from 'lucide-react';
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
      <section className="relative gradient-hero py-24 md:py-36">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 text-primary text-sm font-semibold border border-primary/20 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Welcome to Zaika Kitchen
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Delicious Food,
              <br />
              <span className="text-primary">Delivered Fresh</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Experience culinary excellence with our carefully crafted menu. From appetizers to desserts, every dish is made with passion and the finest ingredients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button size="lg" onClick={() => navigate({ to: '/menu' })} className="gap-2 shadow-warm text-base font-semibold px-8 py-6">
                <UtensilsCrossed className="h-5 w-5" />
                View Menu
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate({ to: '/menu' })} className="text-base font-semibold px-8 py-6 border-2 hover:bg-primary/5">
                Order Now
              </Button>
              <Button size="lg" variant="outline" onClick={handleWhatsAppClick} className="gap-2 text-base font-semibold px-8 py-6 border-2 hover:bg-primary/5">
                <SiWhatsapp className="h-5 w-5" />
                Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-5">Why Choose Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're committed to providing the best dining experience with quality food and exceptional service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-warm group">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3">Premium Quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Only the finest ingredients sourced from trusted suppliers for exceptional taste.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-warm group">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3">Fast Service</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quick preparation and delivery without compromising on quality or taste.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-warm group">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3">Made with Love</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every dish is prepared with care and passion by our experienced chefs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <Card className="gradient-warm border-2 border-primary/20 shadow-warm">
            <CardContent className="py-16 text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-5">Ready to Order?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Browse our delicious menu and place your order today. Fresh food, delivered to your door.
              </p>
              <Button size="lg" onClick={() => navigate({ to: '/menu' })} className="gap-2 shadow-warm text-base font-semibold px-8 py-6">
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
