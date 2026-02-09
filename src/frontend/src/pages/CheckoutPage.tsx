import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Loader2 } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useCart } from '../components/CartContext';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsStripeConfigured, useCreateCheckoutSession } from '../hooks/useQueries';
import { ShoppingItem } from '../backend';
import StripeSetup from '../components/StripeSetup';
import { generateWhatsAppUrl, generateOrderMessage } from '../utils/whatsapp';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total } = useCart();
  const { identity } = useInternetIdentity();
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const createCheckoutSession = useCreateCheckoutSession();

  const deliveryFee = 50.0;
  const taxRate = 0.08;
  const tax = total * taxRate;
  const grandTotal = total + deliveryFee + tax;

  const handleCheckout = async () => {
    if (!identity) {
      toast.error('Please log in to place an order');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!isStripeConfigured) {
      toast.error('Payment system is not configured. Please contact support.');
      return;
    }

    try {
      // Convert cart items to Stripe shopping items
      const shoppingItems: ShoppingItem[] = items.map((item) => ({
        productName: item.name,
        productDescription: item.description,
        priceInCents: BigInt(Math.round(item.price * 100)),
        quantity: BigInt(item.quantity),
        currency: 'inr',
      }));

      // Add delivery fee
      shoppingItems.push({
        productName: 'Delivery Fee',
        productDescription: 'Standard delivery',
        priceInCents: BigInt(Math.round(deliveryFee * 100)),
        quantity: BigInt(1),
        currency: 'inr',
      });

      // Add tax
      shoppingItems.push({
        productName: 'Tax',
        productDescription: 'GST (8%)',
        priceInCents: BigInt(Math.round(tax * 100)),
        quantity: BigInt(1),
        currency: 'inr',
      });

      const session = await createCheckoutSession.mutateAsync(shoppingItems);
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to create checkout session. Please try again.');
    }
  };

  const handleWhatsAppOrder = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const orderMessage = generateOrderMessage(
      items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      grandTotal
    );

    window.open(generateWhatsAppUrl(orderMessage), '_blank');
  };

  if (stripeConfigLoading) {
    return (
      <div className="container py-12 max-w-4xl">
        <Card className="text-center">
          <CardContent className="py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStripeConfigured) {
    return <StripeSetup />;
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some delicious items from our menu!</p>
              <Button onClick={() => navigate({ to: '/menu' })}>Browse Menu</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <p className="text-lg font-semibold text-primary">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Review your order details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={!identity || createCheckoutSession.isPending}
                  >
                    {createCheckoutSession.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleWhatsAppOrder}
                  >
                    <SiWhatsapp className="h-5 w-5" />
                    Order via WhatsApp
                  </Button>
                  {!identity && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please log in to complete your order
                    </p>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
