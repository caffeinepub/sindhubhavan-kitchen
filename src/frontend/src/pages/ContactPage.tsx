import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Phone, Clock, MessageCircle, Loader2 } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { generateWhatsAppUrl } from '../utils/whatsapp';
import { useGetRestaurantLocation, useGetRestaurantMapsUrl } from '../hooks/useQueries';

export default function ContactPage() {
  const { data: location, isLoading: locationLoading } = useGetRestaurantLocation();
  const { data: mapsUrl, isLoading: mapsLoading } = useGetRestaurantMapsUrl();

  const handleWhatsAppClick = () => {
    window.open(generateWhatsAppUrl('Hello! I have a question about Zaika Kitchen.'), '_blank');
  };

  const handleCallClick = () => {
    window.location.href = 'tel:+919908826320';
  };

  return (
    <div className="container py-10 md:py-16">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get in touch with us for reservations, inquiries, or feedback. We're here to help!
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Card */}
          <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-display">
                <MapPin className="h-6 w-6 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {locationLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">{location || 'Location not available'}</p>
              )}
            </CardContent>
          </Card>

          {/* Phone Card */}
          <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-display">
                <Phone className="h-6 w-6 text-primary" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 leading-relaxed">Call/WhatsApp: +91 99088 26320</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-2 font-semibold"
                onClick={handleWhatsAppClick}
              >
                <SiWhatsapp className="h-4 w-4" />
                Chat on WhatsApp
              </Button>
            </CardContent>
          </Card>

          {/* Hours Card */}
          <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-display">
                <Clock className="h-6 w-6 text-primary" />
                Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">Open Daily: 11:00 AM - 10:00 PM</p>
            </CardContent>
          </Card>

          {/* WhatsApp Card */}
          <Card className="border-2 hover:border-primary/50 hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-display">
                <MessageCircle className="h-6 w-6 text-primary" />
                Quick Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Have a question? Chat with us directly on WhatsApp for instant support.
              </p>
              <div className="space-y-2">
                <Button
                  className="w-full gap-2 shadow-sm font-semibold"
                  onClick={handleWhatsAppClick}
                >
                  <SiWhatsapp className="h-5 w-5" />
                  Start WhatsApp Chat
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-2 font-semibold"
                  onClick={handleCallClick}
                >
                  <Phone className="h-5 w-5" />
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <Card className="border-2 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Find Us</CardTitle>
            <CardDescription className="text-base">Visit us at our location</CardDescription>
          </CardHeader>
          <CardContent>
            {mapsLoading ? (
              <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : mapsUrl && mapsUrl.trim() !== '' ? (
              <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-border">
                <iframe
                  src={mapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Restaurant Location"
                />
              </div>
            ) : (
              <Alert className="border-2">
                <MapPin className="h-5 w-5" />
                <AlertDescription className="text-base">
                  Map location is not configured yet. Please contact us for directions.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
