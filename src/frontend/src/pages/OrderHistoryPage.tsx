import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Loader2, ShoppingBag } from 'lucide-react';
import { useGetUserOrderHistory } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { OrderStatus } from '../backend';

const statusVariants: Record<OrderStatus, 'default' | 'secondary' | 'outline'> = {
  pending: 'secondary',
  preparing: 'default',
  outForDelivery: 'default',
  delivered: 'outline',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  outForDelivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useGetUserOrderHistory(identity?.getPrincipal() || null);

  if (!identity) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to view your order history.</CardDescription>
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
            <p className="text-muted-foreground mt-4">Loading your orders...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedOrders = [...(orders || [])].sort((a, b) => Number(b.created - a.created));

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Order History</h1>
        <p className="text-muted-foreground">View all your past and current orders</p>
      </div>

      {sortedOrders.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Orders Yet</CardTitle>
            <CardDescription>
              You haven't placed any orders yet. Start by browsing our menu!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/menu' })}>
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>
              {sortedOrders.length} {sortedOrders.length === 1 ? 'order' : 'orders'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => {
                    const orderDate = new Date(Number(order.created) / 1000000);
                    const totalAmount = Number(order.totalAmountInINR) / 100;
                    const itemCount = order.items.reduce(
                      (sum, item) => sum + Number(item.quantity),
                      0
                    );

                    return (
                      <TableRow key={order.id.toString()}>
                        <TableCell className="font-medium">
                          #{order.id.toString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {orderDate.toLocaleDateString()}
                          <br />
                          <span className="text-xs">
                            {orderDate.toLocaleTimeString()}
                          </span>
                        </TableCell>
                        <TableCell>{itemCount}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                              navigate({ to: `/orders/${order.id.toString()}` })
                            }
                          >
                            <Package className="h-4 w-4" />
                            Track
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
