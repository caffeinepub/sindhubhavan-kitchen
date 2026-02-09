import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Clock, Truck, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useGetOrder } from '../hooks/useQueries';
import { OrderStatus } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    variant: 'secondary' as const,
  },
  preparing: {
    label: 'Preparing',
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    variant: 'default' as const,
  },
  outForDelivery: {
    label: 'Out for Delivery',
    icon: Truck,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    variant: 'default' as const,
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    variant: 'outline' as const,
  },
};

export default function OrderTrackingPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: order, isLoading, error } = useGetOrder(orderId ? BigInt(orderId) : null);

  if (!identity) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to track your order.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardContent className="py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
            <CardDescription>
              The order you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/orders' })}>
              View Order History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const orderDate = new Date(Number(order.created) / 1000000);
  const totalAmount = Number(order.totalAmountInINR) / 100;

  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => navigate({ to: '/orders' })}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{order.id.toString()}</CardTitle>
              <CardDescription>
                Placed on {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge variant={status.variant} className="text-sm">
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Timeline */}
          <div className={`${status.bgColor} rounded-lg p-6 text-center`}>
            <StatusIcon className={`h-12 w-12 mx-auto mb-3 ${status.color}`} />
            <h3 className={`text-lg font-semibold mb-1 ${status.color}`}>
              {status.label}
            </h3>
            <p className="text-sm text-muted-foreground">
              {order.status === 'pending' && 'Your order has been received and is being processed.'}
              {order.status === 'preparing' && 'Our chefs are preparing your delicious meal.'}
              {order.status === 'outForDelivery' && 'Your order is on its way to you!'}
              {order.status === 'delivered' && 'Your order has been delivered. Enjoy your meal!'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between items-center px-4">
            {(['pending', 'preparing', 'outForDelivery', 'delivered'] as OrderStatus[]).map((step, index) => {
              const stepConfig = statusConfig[step];
              const StepIcon = stepConfig.icon;
              const isActive = order.status === step;
              const isPast = ['pending', 'preparing', 'outForDelivery', 'delivered'].indexOf(order.status) > index;
              
              return (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isActive || isPast
                        ? stepConfig.bgColor
                        : 'bg-muted'
                    }`}
                  >
                    <StepIcon
                      className={`h-5 w-5 ${
                        isActive || isPast ? stepConfig.color : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <span className={`text-xs text-center ${
                    isActive || isPast ? 'font-medium' : 'text-muted-foreground'
                  }`}>
                    {stepConfig.label}
                  </span>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Item #{item.menuItemId.toString()} × {item.quantity.toString()}
                  </span>
                  <span className="font-medium">
                    ₹{(Number(item.priceInINR) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-primary">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>

          {order.paymentId && (
            <p className="text-xs text-muted-foreground text-center">
              Payment ID: {order.paymentId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
