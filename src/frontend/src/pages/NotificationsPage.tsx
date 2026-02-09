import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Package, CreditCard, AlertCircle, Megaphone, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserNotifications, useGetBroadcastNotifications, useMarkNotificationAsRead } from '../hooks/useQueries';
import { Notification, NotificationType } from '../backend';

const notificationIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  orderPlaced: Package,
  orderStatusUpdated: Package,
  paymentConfirmation: CreditCard,
  paymentFailure: AlertCircle,
  broadcast: Megaphone,
};

const notificationColors: Record<NotificationType, string> = {
  orderPlaced: 'text-blue-600 dark:text-blue-400',
  orderStatusUpdated: 'text-green-600 dark:text-green-400',
  paymentConfirmation: 'text-green-600 dark:text-green-400',
  paymentFailure: 'text-red-600 dark:text-red-400',
  broadcast: 'text-purple-600 dark:text-purple-400',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userNotifications, isLoading: userLoading } = useGetUserNotifications();
  const { data: broadcastNotifications, isLoading: broadcastLoading } = useGetBroadcastNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if it's a user notification
    if (notification.user && !notification.isRead) {
      try {
        await markAsRead.mutateAsync(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate to order if it's an order-related notification
    if (notification.orderId) {
      navigate({ to: '/orders/$orderId', params: { orderId: notification.orderId.toString() } });
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  if (!identity) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card className="text-center border-2">
          <CardHeader>
            <Bell className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl font-display">Authentication Required</CardTitle>
            <CardDescription className="text-base">
              Please log in to view your notifications.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (userLoading || broadcastLoading) {
    return (
      <div className="container py-16 max-w-4xl">
        <Card className="text-center border-2">
          <CardContent className="py-16">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4 text-lg">Loading notifications...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allNotifications = [
    ...(userNotifications || []),
    ...(broadcastNotifications || []),
  ].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="container py-10 md:py-16 max-w-4xl">
      <div className="mb-10">
        <h1 className="font-display text-5xl font-bold mb-3">Notifications</h1>
        <p className="text-lg text-muted-foreground">Stay updated with your orders and announcements</p>
      </div>

      {allNotifications.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-16 text-center">
            <Bell className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl font-display">All Notifications</CardTitle>
            <CardDescription className="text-base">
              {allNotifications.filter((n) => n.user && !n.isRead).length} unread notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {allNotifications.map((notification, index) => {
              const Icon = notificationIcons[notification.notificationType];
              const iconColor = notificationColors[notification.notificationType];
              const isUnread = notification.user && !notification.isRead;

              return (
                <div key={notification.id.toString()}>
                  <div
                    className={`py-4 px-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors ${
                      isUnread ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 ${iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm leading-relaxed ${isUnread ? 'font-semibold' : ''}`}>
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      {isUnread && (
                        <Badge variant="default" className="ml-auto font-semibold">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                  {index < allNotifications.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
