import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import Array "mo:core/Array";
import Migration "migration"; // Added for migration

(with migration = Migration.run)
actor {
  // Include components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  var restaurantLocation : Text = "Opposite Coromandal Gate, Sriharipuram, Visakhapatnam, Andhra Pradesh-530011";
  var googleMapsUrl : Text = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119520.75554216439!2d83.19362318576921!3d17.686524536353033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3943749a0c4dbd%3A0x326691e810a2e8b8!2sVisakhapatnam%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1716310598853!5m2!1sen!2sin";

  // Types
  public type OrderStatus = {
    #pending;
    #preparing;
    #outForDelivery;
    #delivered;
  };

  public type MenuItem = {
    id : Nat;
    name : Text;
    description : Text;
    priceInINR : Nat;
    category : Text;
    image : ?Storage.ExternalBlob;
    isActive : Bool;
  };

  public type OrderItem = {
    menuItemId : Nat;
    quantity : Nat;
    priceInINR : Nat;
  };

  public type Order = {
    id : Nat;
    user : Principal;
    items : [OrderItem];
    totalAmountInINR : Nat;
    status : OrderStatus;
    created : Time.Time;
    paymentId : ?Text;
  };

  public type NewOrder = {
    items : [OrderItem];
    totalAmountInINR : Nat;
    paymentId : ?Text;
  };

  public type Document = {
    name : Text;
    owner : Principal;
    size : Nat;
    content : Storage.ExternalBlob;
  };

  public type NotificationType = {
    #orderPlaced;
    #orderStatusUpdated;
    #paymentConfirmation;
    #paymentFailure;
    #broadcast;
  };

  public type Notification = {
    id : Nat;
    user : ?Principal;
    content : Text;
    timestamp : Time.Time;
    isRead : Bool;
    notificationType : NotificationType;
    orderId : ?Nat;
    orderStatus : ?OrderStatus;
  };

  type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  // State
  let menuItems = Map.empty<Nat, MenuItem>();
  let orders = Map.empty<Nat, Order>();
  let users = Map.empty<Principal, Set.Set<Nat>>();
  let documents = Map.empty<Blob, Document>();
  let notifications = Map.empty<Nat, Notification>();

  var nextMenuItemId : Nat = 0;
  var nextOrderId : Nat = 0;
  var nextNotificationId : Nat = 0;
  var stripeConfig : ?StripeConfiguration = null;

  // Private helper function to create notifications
  private func createNotification(user : ?Principal, content : Text, notificationType : NotificationType, orderId : ?Nat, orderStatus : ?OrderStatus) {
    let notificationId = nextNotificationId;
    nextNotificationId += 1;

    let notification : Notification = {
      id = notificationId;
      user;
      content;
      timestamp = Time.now();
      isRead = false;
      notificationType;
      orderId;
      orderStatus;
    };

    notifications.add(notificationId, notification);
  };

  // Files Functions
  public shared ({ caller }) func addDocument(id : Blob, content : Storage.ExternalBlob, name : Text, size : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can upload documents");
    };

    let document : Document = {
      name;
      owner = caller;
      size;
      content;
    };

    documents.add(id, document);
  };

  public query ({ caller }) func getSingleDocument(id : Blob) : async ?Document {
    switch (documents.get(id)) {
      case (null) { null };
      case (?doc) {
        // Users can only view their own documents, admins can view all
        if (caller != doc.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own documents");
        };
        ?doc;
      };
    };
  };

  public shared ({ caller }) func deleteDocument(id : Blob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete documents");
    };
    documents.remove(id);
  };

  // Menu Functions
  public shared ({ caller }) func addMenuItem(name : Text, description : Text, priceInINR : Nat, category : Text, image : ?Storage.ExternalBlob) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can perform this action");
    };

    let id = nextMenuItemId;
    nextMenuItemId += 1;

    let menuItem : MenuItem = {
      id;
      name;
      description;
      priceInINR;
      category;
      image;
      isActive = true;
    };

    menuItems.add(id, menuItem);
    id;
  };

  public shared ({ caller }) func updateMenuItem(id : Nat, name : Text, description : Text, priceInINR : Nat, category : Text, image : ?Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can perform this action");
    };

    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        let updatedItem : MenuItem = {
          id;
          name;
          description;
          priceInINR;
          category;
          image;
          isActive = item.isActive;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func setMenuItemActiveStatus(id : Nat, isActive : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can perform this action");
    };

    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item not found") };
      case (?item) {
        let updatedItem = {
          id = item.id;
          name = item.name;
          description = item.description;
          priceInINR = item.priceInINR;
          category = item.category;
          image = item.image;
          isActive;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  public query ({ caller }) func getMenuItems() : async [MenuItem] {
    menuItems.values().toArray();
  };

  public query ({ caller }) func getMenuItemsByCategory(category : Text) : async [MenuItem] {
    let filtered = List.empty<MenuItem>();
    for (item in menuItems.values()) {
      if (Text.equal(item.category, category) and item.isActive) {
        filtered.add(item);
      };
    };
    filtered.toArray();
  };

  // New Function: Replace Category Menu Items
  public shared ({ caller }) func replaceCategoryMenuItems(category : Text, newItems : [MenuItem]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can replace category menu items");
    };

    // Remove all current category items
    let itemsToRemove = List.empty<Nat>();
    for ((id, item) in menuItems.entries()) {
      if (Text.equal(item.category, category)) {
        itemsToRemove.add(id);
      };
    };
    for (id in itemsToRemove.values()) {
      menuItems.remove(id);
    };

    // Add new category items
    for (item in newItems.values()) {
      let id = nextMenuItemId;
      nextMenuItemId += 1;
      let menuItem : MenuItem = {
        id;
        name = item.name;
        description = item.description;
        priceInINR = item.priceInINR;
        category;
        image = item.image;
        isActive = item.isActive;
      };
      menuItems.add(id, menuItem);
    };
  };

  // Order Functions
  public shared ({ caller }) func createOrder(order : NewOrder) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let id = nextOrderId;
    nextOrderId += 1;

    let newOrder : Order = {
      id;
      user = caller;
      items = order.items;
      totalAmountInINR = order.totalAmountInINR;
      status = #pending;
      created = Time.now();
      paymentId = order.paymentId;
    };

    orders.add(id, newOrder);

    // Track customer orders
    switch (users.get(caller)) {
      case (null) {
        let newSet = Set.empty<Nat>();
        newSet.add(id);
        users.add(caller, newSet);
      };
      case (?currentSet) {
        currentSet.add(id);
      };
    };

    // Automatically create notification for order placed
    createNotification(
      ?caller,
      "Your order #" # id.toText() # " has been placed successfully. Total: ₹" # order.totalAmountInINR.toText(),
      #orderPlaced,
      ?id,
      ?#pending
    );

    // Create payment confirmation notification if payment ID exists
    switch (order.paymentId) {
      case (?paymentId) {
        createNotification(
          ?caller,
          "Payment confirmed for order #" # id.toText() # ". Payment ID: " # paymentId,
          #paymentConfirmation,
          ?id,
          null
        );
      };
      case (null) {};
    };

    id;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          user = order.user;
          items = order.items;
          totalAmountInINR = order.totalAmountInINR;
          status;
          created = order.created;
          paymentId = order.paymentId;
        };
        orders.add(orderId, updatedOrder);

        // Automatically create notification for status update
        let statusText = switch (status) {
          case (#pending) { "pending" };
          case (#preparing) { "being prepared" };
          case (#outForDelivery) { "out for delivery" };
          case (#delivered) { "delivered" };
        };

        createNotification(
          ?order.user,
          "Your order #" # orderId.toText() # " is now " # statusText,
          #orderStatusUpdated,
          ?orderId,
          ?status
        );
      };
    };
  };

  public query ({ caller }) func getOrderStatus(orderId : Nat) : async ?OrderStatus {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Users can only view their own order status, admins can view all
        if (caller != order.user and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own order status");
        };
        ?order.status;
      };
    };
  };

  public query ({ caller }) func getUserOrders(user : Principal) : async [Order] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    // Get order ids for user
    let orderList = List.empty<Order>();
    switch (users.get(user)) {
      case (null) { return [] };
      case (?orderIds) {
        for (id in orderIds.values()) {
          switch (orders.get(id)) {
            case (?order) {
              orderList.add(order);
            };
            case (null) {};
          };
        };
      };
    };
    orderList.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getPendingOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view pending orders");
    };

    let pendingList = List.empty<Order>();
    for (order in orders.values()) {
      if (order.status == #pending) {
        pendingList.add(order);
      };
    };

    pendingList.toArray();
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view orders by status");
    };

    let filteredList = List.empty<Order>();
    for (order in orders.values()) {
      if (order.status == status) {
        filteredList.add(order);
      };
    };

    filteredList.toArray();
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        // Users can only view their own orders, admins can view all
        if (caller != order.user and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getUserActiveOrders(user : Principal) : async [Order] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own active orders");
    };

    let filteredList = List.empty<Order>();
    switch (users.get(user)) {
      case (null) { return [] };
      case (?orderIds) {
        for (id in orderIds.values()) {
          switch (orders.get(id)) {
            case (?order) {
              if (order.status == #pending or order.status == #preparing or order.status == #outForDelivery) {
                filteredList.add(order);
              };
            };
            case (null) {};
          };
        };
      };
    };
    filteredList.toArray();
  };

  public query ({ caller }) func getUserOrderHistory(user : Principal) : async [Order] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own order history");
    };

    // Get order ids for user
    let historyList = List.empty<Order>();
    switch (users.get(user)) {
      case (null) { return [] };
      case (?orderIds) {
        for (id in orderIds.values()) {
          switch (orders.get(id)) {
            case (?order) {
              historyList.add(order);
            };
            case (null) {};
          };
        };
      };
    };
    historyList.toArray();
  };

  // Payment Functions
  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can check Stripe configuration");
    };
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : StripeConfiguration) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  func getStripeConfiguration() : StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe is not configured") };
      case (?value) { value };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Notification Functions
  func compareNotificationsByTimestamp(a : Notification, b : Notification) : Order.Order {
    if (a.timestamp > b.timestamp) { return #greater };
    if (a.timestamp < b.timestamp) { return #less };
    #equal;
  };

  public shared ({ caller }) func addBroadcastNotification(content : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can add broadcast notifications");
    };

    createNotification(null, content, #broadcast, null, null);
  };

  public query ({ caller }) func getUserNotifications(user : Principal) : async [Notification] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own notifications");
    };

    let filtered = List.empty<Notification>();
    for (notification in notifications.values()) {
      switch (notification.user) {
        case (null) {};
        case (?notifUser) {
          if (notifUser == user) {
            filtered.add(notification);
          };
        };
      };
    };

    let filteredArray = filtered.toArray();
    let sortedArray = filteredArray.sort(compareNotificationsByTimestamp);
    sortedArray;
  };

  public query ({ caller }) func getBroadcastNotifications() : async [Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view broadcast notifications");
    };

    let broadcastList = List.empty<Notification>();
    for (notification in notifications.values()) {
      switch (notification.user) {
        case (null) {
          broadcastList.add(notification);
        };
        case (_) {};
      };
    };

    let broadcastArray = broadcastList.toArray();
    let sortedArray = broadcastArray.sort(compareNotificationsByTimestamp);
    sortedArray;
  };

  public query ({ caller }) func getUnreadNotificationsCount(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own unread count");
    };

    var count = 0;
    for (notification in notifications.values()) {
      switch (notification.user) {
        case (null) {};
        case (?notifUser) {
          if (notifUser == user and not notification.isRead) {
            count += 1;
          };
        };
      };
    };
    count;
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Nat) : async () {
    switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notification) {
        switch (notification.user) {
          case (null) { Runtime.trap("Cannot mark broadcast as read") };
          case (?user) {
            if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only mark your own notifications as read");
            };

            let updatedNotification = {
              id = notification.id;
              user = notification.user;
              content = notification.content;
              timestamp = notification.timestamp;
              isRead = true;
              notificationType = notification.notificationType;
              orderId = notification.orderId;
              orderStatus = notification.orderStatus;
            };
            notifications.add(notificationId, updatedNotification);
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllNotificationsByUser(user : Principal) : async [Notification] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own notifications");
    };

    let filteredList = List.empty<Notification>();
    for (notification in notifications.values()) {
      switch (notification.user) {
        case (null) {};
        case (?notifUser) {
          if (notifUser == user) {
            filteredList.add(notification);
          };
        };
      };
    };

    let filteredArray = filteredList.toArray();
    filteredArray.sort(compareNotificationsByTimestamp);
  };

  public query ({ caller }) func getPaginatedNotificationsByUser(user : Principal, start : Nat, limit : Nat) : async [Notification] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own notifications");
    };

    let filteredList = List.empty<Notification>();
    for (notification in notifications.values()) {
      switch (notification.user) {
        case (null) {};
        case (?notifUser) {
          if (notifUser == user) {
            filteredList.add(notification);
          };
        };
      };
    };

    let filteredArray = filteredList.toArray();
    let sortedArray = filteredArray.sort(compareNotificationsByTimestamp);

    if (start >= sortedArray.size()) { return [] };
    let end = if (start + limit > sortedArray.size()) {
      sortedArray.size();
    } else {
      start + limit;
    };

    if (end <= start) {
      return [];
    };

    Array.tabulate(
      end - start,
      func(i) {
        sortedArray[start + i];
      },
    );
  };

  public shared ({ caller }) func clearUserNotifications(user : Principal) : async () {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only clear your own notifications");
    };

    let toRemove = List.empty<Nat>();
    for ((id, notification) in notifications.entries()) {
      switch (notification.user) {
        case (null) {};
        case (?notifUser) {
          if (notifUser == user) {
            toRemove.add(id);
          };
        };
      };
    };

    for (id in toRemove.values()) {
      notifications.remove(id);
    };
  };

  public query ({ caller }) func getNotificationById(notificationId : Nat) : async ?Notification {
    switch (notifications.get(notificationId)) {
      case (null) { null };
      case (?notification) {
        // Check authorization: user can only view their own notifications or broadcasts, admins can view all
        switch (notification.user) {
          case (null) {
            // Broadcast notification - only authenticated users can view
            if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
              Runtime.trap("Unauthorized: Only authenticated users can view broadcast notifications");
            };
            ?notification;
          };
          case (?notifUser) {
            if (caller != notifUser and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own notifications");
            };
            ?notification;
          };
        };
      };
    };
  };

  public query ({ caller }) func notificationsDebug() : async [Notification] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access debug functions");
    };
    notifications.values().toArray();
  };

  public query func getRestaurantLocation() : async Text {
    restaurantLocation;
  };

  public query func getRestaurantMapsUrl() : async Text {
    googleMapsUrl;
  };

  public shared ({ caller }) func setRestaurantLocation(newLocation : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update location");
    };
    restaurantLocation := newLocation;
  };

  public shared ({ caller }) func setRestaurantMapsUrl(newUrl : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update maps URL");
    };
    googleMapsUrl := newUrl;
  };
};

