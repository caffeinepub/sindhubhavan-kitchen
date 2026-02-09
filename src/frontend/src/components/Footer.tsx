import { Heart, MapPin, Phone, Clock } from 'lucide-react';
import { useGetRestaurantLocation } from '../hooks/useQueries';

export default function Footer() {
  const { data: location, isLoading } = useGetRestaurantLocation();
  
  // Fallback to hardcoded location if loading, error, or empty
  const displayLocation = location && location.trim() !== '' ? location : 'Opposite Coromandal Gate, Sriharipuram, Visakhapatnam, Andhra Pradesh-530011';

  return (
    <footer className="border-t border-border/50 bg-muted/20 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display font-bold text-xl mb-4 text-primary">Zaika Kitchen</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Delicious food, crafted with passion and served with love. Experience authentic flavors that bring joy to every meal.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location & Contact
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {displayLocation}
            </p>
            <a 
              href="tel:+919908826320" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mt-3 font-medium"
            >
              <Phone className="h-4 w-4" />
              <span>Call/WhatsApp +91 99088 26320</span>
            </a>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Hours
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Monday - Friday: 11am - 10pm</p>
            <p className="text-sm text-muted-foreground leading-relaxed">Saturday - Sunday: 10am - 11pm</p>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1.5">
            © 2026. Built with <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" /> using{' '}
            <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
