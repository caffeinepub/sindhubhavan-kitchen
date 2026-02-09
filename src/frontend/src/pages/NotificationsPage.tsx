import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Loader2, Package, CreditCard, AlertCircle, Megaphone } from 'lucide-react';
import { useGetUserNotifications, useMarkNotificationAsRead } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Notification, NotificationType, OrderStatus } from '../backend';
import { toast } from 'sonner';

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  orderPlaced: <Package className="h-5 w-5 text-blue-500" />,
  orderStatusUpdated: <Package className="h-5 w-5 text-orange-500" />,
  paymentConfirmation: <CreditCard className="h-5 w-5 text-green-500" />,
  paymentFailure: <AlertCircle className="h-5 w-5 text-red-500" />,
  broadcast: <Megaphone className="h-5 w-5 text-purple-500" />,
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  outForDelivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: notifications, isLoading } = useGetUserNotifications(
    identity?.getPrincipal() || null
  );
  const markAsRead = useMarkNotificationAsRead();

  if (!identity) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to view your notifications.</CardDescription>
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
            <p className="text-muted-foreground mt-4">Loading notifications...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedNotifications = [...(notifications || [])].sort(
    (a, b) => Number(b.timestamp - a.timestamp)
  );

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if it's a user-specific notification
    if (notification.user && !notification.isRead) {
      try {
        await markAsRead.mutateAsync(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate to relevant page if applicable
    if (notification.orderId) {
      navigate({ to: `/orders/${notification.orderId.toString()}` });
    }
  };

  return (
    <div className="container py-8 md:py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">Stay updated on your orders and announcements</p>
      </div>

      {sortedNotifications.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Notifications</CardTitle>
            <CardDescription>
              You don't have any notifications yet. We'll notify you about order updates and special announcements.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              All Notifications
            </CardTitle>
            <CardDescription>
              {sortedNotifications.length} {sortedNotifications.length === 1 ? 'notification' : 'notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {sortedNotifications.map((notification, index) => {
                const notificationDate = new Date(Number(notification.timestamp) / 1000000);
                const isBroadcast = notification.notificationType === 'broadcast';
                const isUnread = notification.user && !notification.isRead;

                return (
                  <div
                    key={`${notification.id.toString()}-${index}`}
                    className={`p-4 transition-colors ${
                      notification.orderId ? 'cursor-pointer hover:bg-muted/50' : ''
                    } ${isUnread ? 'bg-primary/5' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {notificationIcons[notification.notificationType]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium leading-relaxed">
                            {notification.content}
                          </p>
                          {isUnread && (
                            <Badge variant="default" className="flex-shrink-0">
                              New
                            </Badge>
                          )}
                          {isBroadcast && (
                            <Badge variant="secondary" className="flex-shrink-0">
                              Announcement
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{notificationDate.toLocaleDateString()}</span>
                          <span>{notificationDate.toLocaleTimeString()}</span>
                          {notification.orderId && (
                            <>
                              <Separator orientation="vertical" className="h-3" />
                              <span className="font-mono">
                                Order #{notification.orderId.toString()}
                              </span>
                            </>
                          )}
                          {notification.orderStatus && (
                            <>
                              <Separator orientation="vertical" className="h-3" />
                              <span>{statusLabels[notification.orderStatus]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
