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

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get in touch with us for reservations, inquiries, or feedback. We're here to help!
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
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
                <p className="text-muted-foreground">{location || 'Location not available'}</p>
              )}
            </CardContent>
          </Card>

          {/* Phone Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Call/WhatsApp: +91 99088 26320</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleWhatsAppClick}
              >
                <SiWhatsapp className="h-4 w-4" />
                Chat on WhatsApp
              </Button>
            </CardContent>
          </Card>

          {/* Hours Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Open Daily: 11:00 AM - 10:00 PM</p>
            </CardContent>
          </Card>

          {/* WhatsApp Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Quick Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                Have a question? Chat with us directly on WhatsApp for instant support.
              </p>
              <Button
                className="w-full gap-2"
                onClick={handleWhatsAppClick}
              >
                <SiWhatsapp className="h-5 w-5" />
                Start WhatsApp Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Google Maps Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Find Us on the Map
            </CardTitle>
            <CardDescription>
              Visit us at our location or use the map for directions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mapsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : mapsUrl && mapsUrl.trim() !== '' ? (
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
                <iframe
                  src={mapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Zaika Kitchen Location"
                />
              </div>
            ) : (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Map location is not configured yet. Please contact the restaurant administrator to add the Google Maps embed URL.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
