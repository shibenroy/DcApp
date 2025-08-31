import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Home, Settings, Users, LogOut, User, Menu, X, MessageSquare } from "lucide-react";
import { PartyPopper } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Events",
    href: "/events",
    icon: PartyPopper,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Calendar",
    href: "/Calendar",
    icon: Calendar,
  },
  {
    name: "Announcements",
    href: "/announcements",
    icon: MessageSquare, // Import this from lucide-react
  },
];

export function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-card shadow-soft border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SchoolEvents
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Welcome back!
                </span>
                <button
                  onClick={signOut}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                to="/auth"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
              >
                <Settings className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium w-full inline-flex items-center",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile Auth Buttons */}
            {user ? (
              <div className="px-3 py-2">
                <span className="block text-sm text-muted-foreground mb-2">
                  Welcome back!
                </span>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                to="/auth"
                className="block px-3 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                  <Settings className="mr-2 h-4 w-4" />
                  Sign In
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}