import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface OrderItem {
    priceInINR: bigint;
    quantity: bigint;
    menuItemId: bigint;
}
export interface Document {
    content: ExternalBlob;
    owner: Principal;
    name: string;
    size: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    created: Time;
    user: Principal;
    paymentId?: string;
    items: Array<OrderItem>;
    totalAmountInINR: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MenuItem {
    id: bigint;
    name: string;
    priceInINR: bigint;
    description: string;
    isActive: boolean;
    category: string;
    image?: ExternalBlob;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Notification {
    id: bigint;
    content: string;
    orderStatus?: OrderStatus;
    notificationType: NotificationType;
    user?: Principal;
    isRead: boolean;
    orderId?: bigint;
    timestamp: Time;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface NewOrder {
    paymentId?: string;
    items: Array<OrderItem>;
    totalAmountInINR: bigint;
}
export enum NotificationType {
    paymentConfirmation = "paymentConfirmation",
    orderPlaced = "orderPlaced",
    orderStatusUpdated = "orderStatusUpdated",
    paymentFailure = "paymentFailure",
    broadcast = "broadcast"
}
export enum OrderStatus {
    preparing = "preparing",
    pending = "pending",
    outForDelivery = "outForDelivery",
    delivered = "delivered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBroadcastNotification(content: string): Promise<void>;
    addDocument(id: Uint8Array, content: ExternalBlob, name: string, size: bigint): Promise<void>;
    addMenuItem(name: string, description: string, priceInINR: bigint, category: string, image: ExternalBlob | null): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearUserNotifications(user: Principal): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(order: NewOrder): Promise<bigint>;
    deleteDocument(id: Uint8Array): Promise<void>;
    getAllNotificationsByUser(user: Principal): Promise<Array<Notification>>;
    getAllOrders(): Promise<Array<Order>>;
    getBroadcastNotifications(): Promise<Array<Notification>>;
    getCallerUserRole(): Promise<UserRole>;
    getMenuItems(): Promise<Array<MenuItem>>;
    getMenuItemsByCategory(category: string): Promise<Array<MenuItem>>;
    getNotificationById(notificationId: bigint): Promise<Notification | null>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getOrderStatus(orderId: bigint): Promise<OrderStatus | null>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getPaginatedNotificationsByUser(user: Principal, start: bigint, limit: bigint): Promise<Array<Notification>>;
    getPendingOrders(): Promise<Array<Order>>;
    getRestaurantLocation(): Promise<string>;
    getRestaurantMapsUrl(): Promise<string>;
    getSingleDocument(id: Uint8Array): Promise<Document | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUnreadNotificationsCount(user: Principal): Promise<bigint>;
    getUserActiveOrders(user: Principal): Promise<Array<Order>>;
    getUserNotifications(user: Principal): Promise<Array<Notification>>;
    getUserOrderHistory(user: Principal): Promise<Array<Order>>;
    getUserOrders(user: Principal): Promise<Array<Order>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markNotificationAsRead(notificationId: bigint): Promise<void>;
    notificationsDebug(): Promise<Array<Notification>>;
    replaceCategoryMenuItems(category: string, newItems: Array<MenuItem>): Promise<void>;
    setMenuItemActiveStatus(id: bigint, isActive: boolean): Promise<void>;
    setRestaurantLocation(newLocation: string): Promise<void>;
    setRestaurantMapsUrl(newUrl: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateMenuItem(id: bigint, name: string, description: string, priceInINR: bigint, category: string, image: ExternalBlob | null): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
}
