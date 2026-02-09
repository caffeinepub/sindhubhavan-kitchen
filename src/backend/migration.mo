import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type MenuItem = {
    id : Nat;
    name : Text;
    description : Text;
    priceInINR : Nat;
    category : Text;
    image : ?Blob;
    isActive : Bool;
  };

  type OldActor = {
    menuItems : Map.Map<Nat, MenuItem>;
  };

  type NewActor = {
    menuItems : Map.Map<Nat, MenuItem>;
  };

  public func run(old : OldActor) : NewActor {
    let filteredMenuItems = old.menuItems.filter(
      func(_id, item) {
        item.category != "Curry";
      }
    );

    let updatedMenuItems = Map.empty<Nat, MenuItem>();
    for (entry in filteredMenuItems.entries()) {
      updatedMenuItems.add(entry.0, entry.1);
    };

    let curryItems : [MenuItem] = [
      { id = 0; name = "Dal Fry"; description = ""; priceInINR = 80; category = "Curry"; image = null; isActive = true },
      { id = 1; name = "Dal Tadqa"; description = ""; priceInINR = 90; category = "Curry"; image = null; isActive = true },
      { id = 2; name = "Mixed Veg"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 3; name = "Aloo Gobhi"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 4; name = "Aloo Mutter"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 5; name = "Aloo Jeera"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 6; name = "Channa Masala"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 7; name = "Aloo Bhindi Fry"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 8; name = "Aloo Palak"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 9; name = "Veg Kadhai"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 10; name = "Veg Palao"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 11; name = "Tomato Masala"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 12; name = "Tomato Fry"; description = ""; priceInINR = 99; category = "Curry"; image = null; isActive = true },
      { id = 13; name = "Mushroom Masala"; description = ""; priceInINR = 119; category = "Curry"; image = null; isActive = true },
      { id = 14; name = "Mushroom Mutter"; description = ""; priceInINR = 119; category = "Curry"; image = null; isActive = true },
      { id = 15; name = "Veg Kolapuri"; description = ""; priceInINR = 119; category = "Curry"; image = null; isActive = true },
      { id = 16; name = "Veg Do Pyaza"; description = ""; priceInINR = 119; category = "Curry"; image = null; isActive = true },
      { id = 17; name = "Sev Tomato"; description = ""; priceInINR = 119; category = "Curry"; image = null; isActive = true },
      { id = 18; name = "Kaju Tomato"; description = ""; priceInINR = 119; category = "Curry"; image = null; isActive = true },
      { id = 19; name = "Veg Jaipuri"; description = ""; priceInINR = 119; category = "Curry"; image = null; isActive = true },
      { id = 20; name = "Mutter Paneer"; description = ""; priceInINR = 129; category = "Curry"; image = null; isActive = true },
      { id = 21; name = "Paneer Butter Masala"; description = ""; priceInINR = 129; category = "Curry"; image = null; isActive = true },
      { id = 22; name = "Tomato Paneer"; description = ""; priceInINR = 129; category = "Curry"; image = null; isActive = true },
      { id = 23; name = "Paneer Kolapuri"; description = ""; priceInINR = 139; category = "Curry"; image = null; isActive = true },
      { id = 24; name = "Paneer Kadhai"; description = ""; priceInINR = 139; category = "Curry"; image = null; isActive = true },
      { id = 25; name = "Palak Paneer"; description = ""; priceInINR = 139; category = "Curry"; image = null; isActive = true },
      { id = 26; name = "Paneer do pyaza"; description = ""; priceInINR = 149; category = "Curry"; image = null; isActive = true },
      { id = 27; name = "Kaju Paneer"; description = ""; priceInINR = 149; category = "Curry"; image = null; isActive = true },
      { id = 28; name = "Paneer Bhurji"; description = ""; priceInINR = 159; category = "Curry"; image = null; isActive = true },
      { id = 29; name = "Shahi Paneer"; description = ""; priceInINR = 169; category = "Curry"; image = null; isActive = true },
      { id = 30; name = "Paneer Hyderabadi"; description = ""; priceInINR = 179; category = "Curry"; image = null; isActive = true },
      { id = 31; name = "Methi Chaman"; description = ""; priceInINR = 199; category = "Curry"; image = null; isActive = true },
    ];

    for (item in curryItems.values()) {
      updatedMenuItems.add(item.id, item);
    };

    { menuItems = updatedMenuItems };
  };
};
