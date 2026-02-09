import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole, MenuItem, Order, OrderStatus, ShoppingItem, StripeConfiguration, NewOrder, OrderItem, Notification, NotificationType } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Menu Items
export function useGetMenuItems() {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMenuItemsByCategory(category: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menuItems', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItemsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      priceInINR: bigint;
      category: string;
      image: any;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMenuItem(
        params.name,
        params.description,
        params.priceInINR,
        params.category,
        params.image
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
    onError: (error: any) => {
      if (error?.message?.includes('Unauthorized')) {
        throw new Error('You do not have permission to add menu items');
      }
      throw error;
    },
  });
}

export function useReplaceCategoryMenuItems() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { category: string; newItems: MenuItem[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.replaceCategoryMenuItems(params.category, params.newItems);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
    onError: (error: any) => {
      if (error?.message?.includes('Unauthorized')) {
        throw new Error('You do not have permission to replace menu items');
      }
      throw error;
    },
  });
}

// Orders
export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: NewOrder): Promise<bigint> => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['userActiveOrders'] });
      queryClient.invalidateQueries({ queryKey: ['userOrderHistory'] });
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
}

export function useGetOrder(orderId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
    refetchInterval: 5000, // Poll every 5 seconds for status updates
  });
}

export function useGetOrderStatus(orderId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<OrderStatus | null>({
    queryKey: ['orderStatus', orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrderStatus(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

export function useGetUserOrders(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['userOrders', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getUserOrders(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetUserActiveOrders(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['userActiveOrders', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getUserActiveOrders(user);
    },
    enabled: !!actor && !isFetching && !!user,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useGetUserOrderHistory(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['userOrderHistory', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getUserOrderHistory(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000, // Poll every 10 seconds for admin
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['orderStatus'] });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['userActiveOrders'] });
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
}

// Stripe Payment
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}

export function useGetStripeSessionStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
  });
}

// Notifications
export function useGetUserNotifications(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['userNotifications', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      const userNotifications = await actor.getUserNotifications(user);
      const broadcastNotifications = await actor.getBroadcastNotifications();
      return [...userNotifications, ...broadcastNotifications];
    },
    enabled: !!actor && !isFetching && !!user,
    refetchInterval: 10000, // Poll every 10 seconds for new notifications
  });
}

export function useGetUnreadNotificationsCount(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['unreadNotificationsCount', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return BigInt(0);
      const count = await actor.getUnreadNotificationsCount(user);
      // Count unread broadcasts
      const broadcasts = await actor.getBroadcastNotifications();
      return count + BigInt(broadcasts.length);
    },
    enabled: !!actor && !isFetching && !!user,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
}

export function useAddBroadcastNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBroadcastNotification(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
}

// Restaurant Location
export function useGetRestaurantLocation() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['restaurantLocation'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getRestaurantLocation();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetRestaurantLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLocation: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setRestaurantLocation(newLocation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantLocation'] });
    },
  });
}

// Restaurant Google Maps URL
export function useGetRestaurantMapsUrl() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['restaurantMapsUrl'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getRestaurantMapsUrl();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetRestaurantMapsUrl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUrl: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setRestaurantMapsUrl(newUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantMapsUrl'] });
    },
  });
}
