import { useState } from 'react';
import { useGetMenuItems } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../components/CartContext';
import { toast } from 'sonner';
import { MENU_CATEGORIES } from '../constants/menuCategories';

export default function MenuPage() {
  const { data: menuItems, isLoading } = useGetMenuItems();
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      price: Number(item.priceInINR),
      category: item.category,
      image: item.image ? item.image.getDirectURL() : '',
    });
    toast.success(`${item.name} added to cart!`);
  };

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Sort items by ID (ascending) for deterministic, stable ordering
  const sortedMenuItems = [...(menuItems || [])].sort((a, b) => {
    const aId = Number(a.id);
    const bId = Number(b.id);
    return aId - bId;
  });

  const filteredItems =
    selectedCategory === 'All'
      ? sortedMenuItems.filter((item) => item.isActive)
      : sortedMenuItems.filter((item) => item.category === selectedCategory && item.isActive);

  return (
    <div className="container py-10 md:py-16">
      <div className="mb-10">
        <h1 className="font-display text-5xl font-bold mb-3">Our Menu</h1>
        <p className="text-lg text-muted-foreground">Explore our delicious offerings</p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-2 h-auto p-1.5 bg-muted/40">
          {MENU_CATEGORIES.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm font-semibold py-2.5"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {MENU_CATEGORIES.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {filteredItems.length === 0 ? (
              <Card className="border-2">
                <CardContent className="py-16 text-center">
                  <ShoppingCart className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No items available in this category</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id.toString()} className="overflow-hidden border-2 hover:border-primary/50 hover:shadow-warm transition-all duration-300 group">
                    {item.image && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={item.image.getDirectURL()}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-display">{item.name}</CardTitle>
                      {item.description && (
                        <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-primary font-display">
                          ₹{Number(item.priceInINR)}
                        </span>
                        <Button onClick={() => handleAddToCart(item)} size="sm" className="gap-1.5 font-semibold shadow-sm">
                          <Plus className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
