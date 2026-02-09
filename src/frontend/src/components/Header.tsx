import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Menu, ShoppingCart, User, Bell, LogOut, Home, UtensilsCrossed, Package, Shield, Phone } from 'lucide-react';
import { useCart } from './CartContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUnreadNotificationsCount, useIsCallerAdmin } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { items } = useCart();
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: unreadCount } = useGetUnreadNotificationsCount();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/orders', label: 'Orders', icon: Package },
    { to: '/contact', label: 'Contact', icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-sm">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/assets/generated/restaurant-logo-transparent.dim_200x200.png" 
            alt="Zaika Kitchen Logo" 
            className="h-12 w-12 transition-transform group-hover:scale-105" 
          />
          <span className="text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Zaika Kitchen
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-2 text-sm font-medium transition-all hover:text-primary hover:bg-primary/5 rounded-lg"
              activeProps={{ className: 'text-primary bg-primary/10' }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 text-sm font-medium transition-all hover:text-primary hover:bg-primary/5 rounded-lg flex items-center gap-1.5"
              activeProps={{ className: 'text-primary bg-primary/10' }}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          {identity && (
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10 hover:text-primary"
              onClick={() => navigate({ to: '/notifications' })}
            >
              <Bell className="h-5 w-5" />
              {unreadCount && Number(unreadCount) > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold"
                >
                  {Number(unreadCount) > 9 ? '9+' : Number(unreadCount)}
                </Badge>
              )}
            </Button>
          )}

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate({ to: '/checkout' })}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          {identity ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/orders' })}>
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/notifications' })}>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                  {unreadCount && Number(unreadCount) > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {Number(unreadCount)}
                    </Badge>
                  )}
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={loginStatus === 'logging-in'}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate({ to: '/' })} className="font-semibold shadow-sm">
              Login
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary px-2 py-1 rounded-lg hover:bg-primary/5"
                      activeProps={{ className: 'text-primary bg-primary/10' }}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary px-2 py-1 rounded-lg hover:bg-primary/5"
                    activeProps={{ className: 'text-primary bg-primary/10' }}
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-5 w-5" />
                    Admin Panel
                  </Link>
                )}
                {cartItemCount > 0 && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3 px-2">
                        <span className="text-sm font-medium text-muted-foreground">Cart Total</span>
                        <span className="font-bold text-lg text-primary">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <Button
                        className="w-full shadow-sm"
                        onClick={() => {
                          navigate({ to: '/checkout' });
                          setIsOpen(false);
                        }}
                      >
                        View Cart ({cartItemCount})
                      </Button>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
