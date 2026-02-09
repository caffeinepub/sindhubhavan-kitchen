import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Lock, Loader2, Package, Send, MapPin, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useGetCallerUserRole, useGetAllOrders, useUpdateOrderStatus, useIsStripeConfigured, useAddBroadcastNotification, useGetRestaurantLocation, useSetRestaurantLocation, useGetRestaurantMapsUrl, useSetRestaurantMapsUrl, useAddMenuItem, useReplaceCategoryMenuItems, useAddStarters } from '../hooks/useQueries';
import { OrderStatus, MenuItem } from '../backend';
import StripeSetup from '../components/StripeSetup';
import { ADMIN_MENU_CATEGORIES } from '../constants/menuCategories';

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

type ParsedMenuItem = {
  name: string;
  priceInINR: number;
  description: string;
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const { data: currentLocation, isLoading: locationLoading } = useGetRestaurantLocation();
  const { data: currentMapsUrl, isLoading: mapsUrlLoading } = useGetRestaurantMapsUrl();
  const updateOrderStatus = useUpdateOrderStatus();
  const addBroadcast = useAddBroadcastNotification();
  const setLocation = useSetRestaurantLocation();
  const setMapsUrl = useSetRestaurantMapsUrl();
  const addMenuItem = useAddMenuItem();
  const replaceCategoryMenuItems = useReplaceCategoryMenuItems();
  const addStarters = useAddStarters();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [mapsUrlInput, setMapsUrlInput] = useState('');
  const [bulkReplaceCategory, setBulkReplaceCategory] = useState('Biryani');
  const [bulkReplaceInput, setBulkReplaceInput] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedMenuItem[]>([]);

  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Biryani',
  });

  // Initialize location input when data loads
  useState(() => {
    if (currentLocation !== undefined && locationInput === '') {
      setLocationInput(currentLocation);
    }
    if (currentMapsUrl !== undefined && mapsUrlInput === '') {
      setMapsUrlInput(currentMapsUrl);
    }
  });

  // Update location input when currentLocation changes
  if (currentLocation !== undefined && locationInput === '' && !locationLoading) {
    setLocationInput(currentLocation);
  }

  // Update maps URL input when currentMapsUrl changes
  if (currentMapsUrl !== undefined && mapsUrlInput === '' && !mapsUrlLoading) {
    setMapsUrlInput(currentMapsUrl);
  }

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!menuItemForm.name.trim() || !menuItemForm.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const priceInINR = BigInt(Math.round(parseFloat(menuItemForm.price)));
      await addMenuItem.mutateAsync({
        name: menuItemForm.name,
        description: menuItemForm.description,
        priceInINR,
        category: menuItemForm.category,
        image: null,
      });
      toast.success('Menu item added successfully!');
      setMenuItemForm({ name: '', description: '', price: '', category: 'Biryani' });
    } catch (error: any) {
      console.error('Failed to add menu item:', error);
      toast.error(error.message || 'Failed to add menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStarters = async () => {
    try {
      await addStarters.mutateAsync();
      toast.success('Starters category updated successfully with 11 items!');
    } catch (error: any) {
      console.error('Failed to update starters:', error);
      toast.error(error.message || 'Failed to update starters category');
    }
  };

  const handleStatusChange = async (orderId: bigint, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
      toast.success('Order status updated successfully!');
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await addBroadcast.mutateAsync(broadcastMessage);
      toast.success('Broadcast notification sent successfully!');
      setBroadcastMessage('');
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      toast.error('Failed to send broadcast notification');
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) {
      toast.error('Please enter a location');
      return;
    }

    try {
      await setLocation.mutateAsync(locationInput);
      toast.success('Restaurant location updated successfully!');
    } catch (error) {
      console.error('Failed to update location:', error);
      toast.error('Failed to update restaurant location');
    }
  };

  const handleSaveMapsUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapsUrlInput.trim()) {
      toast.error('Please enter a Google Maps embed URL');
      return;
    }

    try {
      await setMapsUrl.mutateAsync(mapsUrlInput);
      toast.success('Google Maps URL updated successfully!');
    } catch (error) {
      console.error('Failed to update maps URL:', error);
      toast.error('Failed to update Google Maps URL');
    }
  };

  const handleParseBulkItems = () => {
    if (!bulkReplaceInput.trim()) {
      toast.error('Please enter items to parse');
      return;
    }

    try {
      const lines = bulkReplaceInput.split('\n').filter(line => line.trim());
      const items: ParsedMenuItem[] = [];

      for (const line of lines) {
        // Parse format: "Name, Price" or "Name - Price" or "Name: Price"
        const match = line.match(/^(.+?)[\s,:-]+(\d+)\s*\/-?\s*$/);
        if (match) {
          const name = match[1].trim();
          const price = parseInt(match[2]);
          items.push({
            name,
            priceInINR: price,
            description: '',
          });
        }
      }

      if (items.length === 0) {
        toast.error('No valid items found. Use format: "Item Name, Price/-"');
        return;
      }

      setParsedItems(items);
      toast.success(`Parsed ${items.length} items successfully!`);
    } catch (error) {
      console.error('Failed to parse items:', error);
      toast.error('Failed to parse items. Check the format.');
    }
  };

  const handleConfirmBulkReplace = async () => {
    if (parsedItems.length === 0) {
      toast.error('No items to replace');
      return;
    }

    try {
      const newItems: MenuItem[] = parsedItems.map((item, index) => ({
        id: BigInt(0), // Will be assigned by backend
        name: item.name,
        description: item.description,
        priceInINR: BigInt(item.priceInINR),
        category: bulkReplaceCategory,
        image: undefined,
        isActive: true,
      }));

      await replaceCategoryMenuItems.mutateAsync({
        category: bulkReplaceCategory,
        newItems,
      });

      toast.success(`Successfully replaced ${parsedItems.length} items in ${bulkReplaceCategory} category!`);
      setBulkReplaceInput('');
      setParsedItems([]);
    } catch (error: any) {
      console.error('Failed to replace category items:', error);
      toast.error(error.message || 'Failed to replace category items');
    }
  };

  const handleRemoveParsedItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  if (!identity) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (roleLoading || stripeConfigLoading) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardContent className="py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isStripeConfigured) {
    return <StripeSetup />;
  }

  const sortedOrders = [...(orders || [])].sort((a, b) => Number(b.created - a.created));

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage orders, menu items, and restaurant information</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant Info</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Management
              </CardTitle>
              <CardDescription>View and manage all customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : sortedOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedOrders.map((order) => (
                        <TableRow key={order.id.toString()}>
                          <TableCell className="font-medium">#{order.id.toString()}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {order.user.toString().slice(0, 8)}...
                          </TableCell>
                          <TableCell>{order.items.length} items</TableCell>
                          <TableCell>₹{Number(order.totalAmountInINR)}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariants[order.status]}>
                              {statusLabels[order.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="outForDelivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Update Starters Category
              </CardTitle>
              <CardDescription>
                Replace all items in the Starters category with the predefined list of 11 items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleUpdateStarters} 
                disabled={addStarters.isPending}
                variant="default"
              >
                {addStarters.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Starters...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Starters
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Menu Item
              </CardTitle>
              <CardDescription>Add a new item to the menu</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMenuItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={menuItemForm.name}
                      onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                      placeholder="e.g., Chicken Biryani"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={menuItemForm.price}
                      onChange={(e) => setMenuItemForm({ ...menuItemForm, price: e.target.value })}
                      placeholder="e.g., 250"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={menuItemForm.category}
                    onValueChange={(value) => setMenuItemForm({ ...menuItemForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_MENU_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={menuItemForm.description}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                    placeholder="Brief description of the item"
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bulk Replace Category Items</CardTitle>
              <CardDescription>
                Replace all items in a category with a new list. Paste items in format: "Item Name, Price/-"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulkCategory">Category</Label>
                <Select value={bulkReplaceCategory} onValueChange={setBulkReplaceCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_MENU_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulkInput">Items (one per line)</Label>
                <Textarea
                  id="bulkInput"
                  value={bulkReplaceInput}
                  onChange={(e) => setBulkReplaceInput(e.target.value)}
                  placeholder="Chicken Biryani, 250/-&#10;Mutton Biryani, 300/-&#10;Veg Biryani, 200/-"
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleParseBulkItems} variant="outline">
                  Parse Items
                </Button>
                {parsedItems.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Replace {parsedItems.length} Items
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Bulk Replace</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete all existing items in the "{bulkReplaceCategory}" category and replace them with {parsedItems.length} new items. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmBulkReplace}>
                          Confirm Replace
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              {parsedItems.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Parsed Items ({parsedItems.length}):</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {parsedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm py-1 px-2 bg-muted rounded">
                        <span>{item.name} - ₹{item.priceInINR}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveParsedItem(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Broadcast Notification
              </CardTitle>
              <CardDescription>Send a notification to all users</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="broadcast">Message</Label>
                  <Textarea
                    id="broadcast"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter your broadcast message..."
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={addBroadcast.isPending}>
                  {addBroadcast.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Broadcast
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restaurant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Restaurant Location
              </CardTitle>
              <CardDescription>Update the restaurant address</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveLocation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Address</Label>
                  <Textarea
                    id="location"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Enter restaurant address..."
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={setLocation.isPending}>
                  {setLocation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Location'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google Maps Embed URL</CardTitle>
              <CardDescription>Update the Google Maps iframe embed URL</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveMapsUrl} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mapsUrl">Embed URL</Label>
                  <Textarea
                    id="mapsUrl"
                    value={mapsUrlInput}
                    onChange={(e) => setMapsUrlInput(e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={setMapsUrl.isPending}>
                  {setMapsUrl.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Maps URL'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
