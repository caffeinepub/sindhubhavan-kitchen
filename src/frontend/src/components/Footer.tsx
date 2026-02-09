import { Heart, MapPin, Phone, Clock } from 'lucide-react';
import { useGetRestaurantLocation } from '../hooks/useQueries';

export default function Footer() {
  const { data: location, isLoading } = useGetRestaurantLocation();
  
  // Fallback to hardcoded location if loading, error, or empty
  const displayLocation = location && location.trim() !== '' ? location : 'Opposite Coromandal Gate, Sriharipuram, Visakhapatnam, Andhra Pradesh-530011';

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-3">Zaika Kitchen</h3>
            <p className="text-sm text-muted-foreground">
              Delicious food, crafted with passion and served with love.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location & Contact
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {displayLocation}
            </p>
            <a 
              href="tel:+919908826320" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mt-3"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call/WhatsApp +91 99088 26320</span>
            </a>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hours
            </h3>
            <p className="text-sm text-muted-foreground">Monday - Friday: 11am - 10pm</p>
            <p className="text-sm text-muted-foreground">Saturday - Sunday: 10am - 11pm</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © 2026. Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
            <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
