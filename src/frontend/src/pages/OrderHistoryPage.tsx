import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Loader2, Eye } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserOrders } from '../hooks/useQueries';
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
  const { data: orders, isLoading } = useGetUserOrders();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const sortedOrders = [...(orders || [])].sort((a, b) => {
    const comparison = Number(b.created - a.created);
    return sortOrder === 'desc' ? comparison : -comparison;
  });

  if (!identity) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card className="text-center border-2">
          <CardHeader>
            <Package className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl font-display">Authentication Required</CardTitle>
            <CardDescription className="text-base">
              Please log in to view your order history.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-16 max-w-6xl">
        <Card className="text-center border-2">
          <CardContent className="py-16">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4 text-lg">Loading orders...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-16 max-w-6xl">
      <div className="mb-10">
        <h1 className="font-display text-5xl font-bold mb-3">Order History</h1>
        <p className="text-lg text-muted-foreground">View all your past and current orders</p>
      </div>

      {sortedOrders.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-16 text-center">
            <Package className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl font-semibold mb-3">No orders yet</h2>
            <p className="text-lg text-muted-foreground mb-8">Start ordering from our delicious menu!</p>
            <Button onClick={() => navigate({ to: '/menu' })} size="lg" className="shadow-sm font-semibold">Browse Menu</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-display">Your Orders</CardTitle>
                <CardDescription className="text-base">{sortedOrders.length} total orders</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="border-2 font-semibold"
              >
                Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Items</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id.toString()} className="hover:bg-muted/30">
                      <TableCell className="font-medium">#{order.id.toString()}</TableCell>
                      <TableCell className="text-sm">{formatDate(order.created)}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell className="font-bold text-primary">₹{Number(order.totalAmountInINR)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[order.status]} className="font-semibold">
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate({ to: '/orders/$orderId', params: { orderId: order.id.toString() } })
                          }
                          className="gap-1.5 font-semibold hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
