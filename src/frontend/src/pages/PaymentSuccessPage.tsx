import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Package } from 'lucide-react';
import { useCreateOrder, useGetStripeSessionStatus } from '../hooks/useQueries';
import { useCart } from '../components/CartContext';
import { toast } from 'sonner';
import { OrderItem } from '../backend';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { session_id?: string };
  const { items, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const getSessionStatus = useGetStripeSessionStatus();
  const [orderId, setOrderId] = useState<bigint | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      const sessionId = search.session_id;
      
      if (!sessionId) {
        toast.error('Invalid payment session');
        setIsProcessing(false);
        return;
      }

      try {
        // Verify payment with Stripe
        const sessionStatus = await getSessionStatus.mutateAsync(sessionId);

        if (sessionStatus.__kind__ === 'completed') {
          // Create order in backend
          const orderItems: OrderItem[] = items.map((item) => ({
            menuItemId: BigInt(item.id),
            quantity: BigInt(item.quantity),
            priceInINR: BigInt(Math.round(item.price * 100)),
          }));

          const deliveryFee = 50.0;
          const taxRate = 0.08;
          const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const tax = subtotal * taxRate;
          const total = subtotal + deliveryFee + tax;

          const newOrderId = await createOrder.mutateAsync({
            items: orderItems,
            totalAmountInINR: BigInt(Math.round(total * 100)),
            paymentId: sessionId,
          });

          setOrderId(newOrderId);
          clearCart();
          toast.success('Order placed successfully!');
        } else {
          toast.error('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        toast.error('Failed to process order. Please contact support.');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [search.session_id]);

  if (isProcessing) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardContent className="py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <CardTitle className="mb-2">Processing Your Order</CardTitle>
            <CardDescription>
              Please wait while we confirm your payment and create your order...
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your order has been confirmed and we'll start preparing it right away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orderId !== null && (
            <p className="text-muted-foreground mb-6">
              Order ID: <span className="font-mono font-semibold">#{orderId.toString()}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {orderId !== null && (
              <Button onClick={() => navigate({ to: `/orders/${orderId.toString()}` })} className="gap-2">
                <Package className="h-4 w-4" />
                Track Order
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate({ to: '/orders' })}>
              View Order History
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/menu' })}>
              Order More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
