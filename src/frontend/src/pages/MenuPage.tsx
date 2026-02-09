import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart, MenuItem as CartMenuItem } from '../components/CartContext';
import { toast } from 'sonner';
import { MENU_CATEGORIES } from '../constants/menuCategories';
import { useGetMenuItems } from '../hooks/useQueries';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addItem } = useCart();
  const { data: menuItems, isLoading } = useGetMenuItems();

  const filteredItems = selectedCategory === 'All'
    ? menuItems || []
    : (menuItems || []).filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: CartMenuItem) => {
    addItem(item);
    toast.success(`${item.name} added to cart!`, {
      description: `₹${Number(item.price)}`,
    });
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Menu</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our carefully curated selection of dishes, made fresh daily with premium ingredients.
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 max-w-6xl mx-auto gap-1">
          {MENU_CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const cartItem: CartMenuItem = {
              id: item.id.toString(),
              name: item.name,
              description: item.description,
              price: Number(item.priceInINR),
              category: item.category,
              image: item.image?.getDirectURL() || '/assets/generated/main-dish-sample.dim_400x300.jpg',
            };

            return (
              <Card key={item.id.toString()} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={cartItem.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                    <Badge variant="secondary">{item.category}</Badge>
                  </div>
                  {item.description && (
                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">₹{Number(item.priceInINR)}</span>
                  <Button onClick={() => handleAddToCart(cartItem)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No items found in this category.</p>
        </div>
      )}
    </div>
  );
}
