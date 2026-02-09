import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Blob "mo:core/Blob";
import Time "mo:core/Time";

module {
  type OldRestaurantState = {
    var restaurantLocation : Text;
    var googleMapsUrl : Text;
    menuItems : Map.Map<Nat, OldMenuItem>;
    orders : Map.Map<Nat, OldOrder>;
    users : Map.Map<Principal, Set.Set<Nat>>;
    documents : Map.Map<Blob, Document>;
    notifications : Map.Map<Nat, Notification>;
    var nextMenuItemId : Nat;
    var nextOrderId : Nat;
    var nextNotificationId : Nat;
    var stripeConfig : ?StripeConfiguration;
  };

  type OldMenuItem = {
    id : Nat;
    name : Text;
    description : Text;
    priceInINR : Nat;
    category : Text;
    image : ?Blob;
    isActive : Bool;
  };

  type OldOrderItem = {
    menuItemId : Nat;
    quantity : Nat;
    priceInINR : Nat;
  };

  type OldOrderStatus = {
    #pending;
    #preparing;
    #outForDelivery;
    #delivered;
  };

  type OldOrder = {
    id : Nat;
    user : Principal;
    items : [OldOrderItem];
    totalAmountInINR : Nat;
    status : OldOrderStatus;
    created : Time.Time;
    paymentId : ?Text;
  };

  type Document = {
    name : Text;
    owner : Principal;
    size : Nat;
    content : Blob;
  };

  type NotificationType = {
    #orderPlaced;
    #orderStatusUpdated;
    #paymentConfirmation;
    #paymentFailure;
    #broadcast;
  };

  type Notification = {
    id : Nat;
    user : ?Principal;
    content : Text;
    timestamp : Time.Time;
    isRead : Bool;
    notificationType : NotificationType;
    orderId : ?Nat;
    orderStatus : ?OldOrderStatus;
  };

  type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  type NewRestaurantState = {
    var restaurantLocation : Text;
    var googleMapsUrl : Text;
    menuItems : Map.Map<Nat, OldMenuItem>;
    orders : Map.Map<Nat, OldOrder>;
    users : Map.Map<Principal, Set.Set<Nat>>;
    documents : Map.Map<Blob, Document>;
    notifications : Map.Map<Nat, Notification>;
    var nextMenuItemId : Nat;
    var nextOrderId : Nat;
    var nextNotificationId : Nat;
    var stripeConfig : ?StripeConfiguration;
  };

  public func run(old : OldRestaurantState) : NewRestaurantState {
    var newRestaurantLocation = old.restaurantLocation;
    var newGoogleMapsUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d478.7857271870216!2d83.23327778764002!3d17.689073236620935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3943425688726b%3A0x2f18ed0d5ac3db17!2sSriharipuram%2C%20Visakhapatnam%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1716310598853!5m2!1sen!2sin";

    {
      var restaurantLocation = newRestaurantLocation;
      var googleMapsUrl = newGoogleMapsUrl;
      menuItems = old.menuItems;
      orders = old.orders;
      users = old.users;
      documents = old.documents;
      notifications = old.notifications;
      var nextMenuItemId = old.nextMenuItemId;
      var nextOrderId = old.nextOrderId;
      var nextNotificationId = old.nextNotificationId;
      var stripeConfig = old.stripeConfig;
    };
  };
};
