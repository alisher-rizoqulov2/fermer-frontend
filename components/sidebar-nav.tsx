"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Beef,
  DollarSign,
  Heart,
  Package,
  BarChart3,
  Users,
  LogOut,
  Menu,
  ChevronLeft,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAuthToken } from "@/lib/api";

export function SidebarNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Komponent brauzerda yuklanganini kutish
  useEffect(() => {
    setMounted(true);
  }, []);

  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cattle", label: "Mollar", icon: Beef },
    { href: "/expenses", label: "Xarajatlar", icon: DollarSign },
    { href: "/wallet", label: "Hamyon", icon: DollarSign },
    { href: "/health", label: "Sog'liq", icon: Heart },
    { href: "/inventory", label: "Omborxona", icon: Package },
    { href: "/reports", label: "Hisobotlar", icon: BarChart3 },
    { href: "/admin", label: "Admin", icon: Users },
  ];

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = "/login";
  };

  return (
    <nav
      className={cn(
        "relative flex h-screen flex-col border-r bg-background p-4 transition-all duration-300",
        isOpen ? "w-64" : "w-20",
      )}
    >
      {/* Logo qismi */}
      <div className="mb-8 flex items-center justify-between px-2">
        {isOpen && (
          <div className="overflow-hidden transition-all">
            <h1 className="text-2xl font-bold text-primary truncate">
              Fermer Pro
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              Boshqaruv tizimi
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn("ml-auto", !isOpen && "mx-auto")}
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Menyu elementlari */}
      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          return (
            <Link key={route.href} href={route.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all",
                  !isOpen && "justify-center px-2",
                )}
                title={!isOpen ? route.label : undefined}
              >
                <Icon className={cn("h-5 w-5", isOpen && "mr-2")} />
                {isOpen && <span>{route.label}</span>}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* --- KUN/TUN REJIMI TUGMASI --- */}
      <div className="mt-auto space-y-2 pt-4">
        {mounted && (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start transition-all text-muted-foreground hover:text-foreground",
              !isOpen && "justify-center px-2",
            )}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={!isOpen ? "Rejimni o'zgartirish" : undefined}
          >
            {theme === "dark" ? (
              <Sun
                className={cn("h-5 w-5 text-yellow-500", isOpen && "mr-2")}
              />
            ) : (
              <Moon className={cn("h-5 w-5 text-blue-500", isOpen && "mr-2")} />
            )}
            {isOpen && (theme === "dark" ? "Kunduzgi rejim" : "Tungi rejim")}
          </Button>
        )}

        {/* Chiqish tugmasi */}
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start bg-transparent border-destructive/20 text-destructive hover:bg-destructive/10",
            !isOpen && "justify-center px-2",
          )}
          onClick={handleLogout}
          title={!isOpen ? "Chiqish" : undefined}
        >
          <LogOut className={cn("h-5 w-5", isOpen && "mr-2")} />
          {isOpen && "Chiqish"}
        </Button>
      </div>
    </nav>
  );
}
