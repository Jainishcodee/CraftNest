
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, Bell, Menu, LogIn, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNotifications } from "@/contexts/NotificationContext";

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useData();
  const { unreadCount } = useNotifications();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Navigation links based on auth state and role
  const getNavLinks = () => {
    const commonLinks = [
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
    ];

    if (!isAuthenticated) {
      return commonLinks;
    }

    if (user?.role === "admin") {
      return [...commonLinks, { name: "Admin Dashboard", path: "/admin" }];
    }

    if (user?.role === "vendor") {
      return [...commonLinks, { name: "Vendor Dashboard", path: "/vendor" }];
    }

    // Customer role
    return [...commonLinks];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="craft-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>CraftNest</SheetTitle>
                <SheetDescription>Handmade with love</SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-lg ${
                      location.pathname === link.path
                        ? "text-craft-teal font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                {!isAuthenticated ? (
                  <Link to="/login">
                    <Button className="w-full" variant="outline">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login / Register
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={logout}
                    className="w-full"
                    variant="outline"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-craft-teal flex items-center justify-center">
              <span className="text-white font-semibold">CN</span>
            </div>
            <span className="font-bold text-xl text-craft-brown hidden sm:block">
              CraftNest
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link ${
                  location.pathname === link.path ? "nav-link-active" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Search button */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center bg-craft-terracotta text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  <DropdownMenuItem className="flex justify-center p-4 text-muted-foreground">
                    {unreadCount > 0
                      ? "You have unread notifications"
                      : "No new notifications"}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center bg-craft-teal text-[10px]">
                  {cartItemCount}
                </Badge>
              )}
              <span className="sr-only">Shopping cart</span>
            </Link>
          </Button>

          {/* Auth buttons */}
          {!isAuthenticated ? (
            <Button asChild className="hidden md:flex craft-btn-primary">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <span className="font-medium">{user?.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to={`/${user?.role}`}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:bg-red-50 focus:text-red-500"
                  onClick={logout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
