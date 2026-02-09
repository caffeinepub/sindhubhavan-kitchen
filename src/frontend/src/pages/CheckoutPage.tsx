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
        productDescription: item.description || '',
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

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;

      const session = await createCheckoutSession.mutateAsync({
        items: shoppingItems,
        successUrl,
        cancelUrl,
      });
      
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
      <div className="container py-16 max-w-4xl">
        <Card className="text-center border-2">
          <CardContent className="py-16">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4 text-lg">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStripeConfigured) {
    return <StripeSetup />;
  }

  return (
    <div className="container py-10 md:py-16 max-w-5xl">
      <div className="mb-10">
        <h1 className="font-display text-5xl font-bold mb-3">Checkout</h1>
        <p className="text-lg text-muted-foreground">Review your order and proceed to payment</p>
      </div>

      {items.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-20 text-center">
            <ShoppingCart className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h2 className="font-display text-3xl font-semibold mb-3">Your cart is empty</h2>
            <p className="text-lg text-muted-foreground mb-8">Add some delicious items from our menu!</p>
            <Button onClick={() => navigate({ to: '/menu' })} size="lg" className="shadow-sm font-semibold">Browse Menu</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl font-display">Order Items</CardTitle>
                <CardDescription className="text-base">Review and modify your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-5 border-b last:border-0 last:pb-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="h-9 w-9"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-semibold text-lg">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-9 w-9"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:bg-destructive/10 h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right font-bold text-lg min-w-[90px]">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-display">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-semibold">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-xl font-bold">
                    <span className="font-display">Total</span>
                    <span className="text-primary font-display">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  className="w-full shadow-sm font-semibold"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={createCheckoutSession.isPending || !identity}
                >
                  {createCheckoutSession.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay with Stripe
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 font-semibold"
                  size="lg"
                  onClick={handleWhatsAppOrder}
                >
                  <SiWhatsapp className="mr-2 h-5 w-5" />
                  Order via WhatsApp
                </Button>
                {!identity && (
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Please log in to place an order
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
