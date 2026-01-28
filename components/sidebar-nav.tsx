"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Beef,
  DollarSign,
  Heart,
  Apple,
  Package,
  BarChart3,
  Users,
  LogOut,
  Menu, // <--- Yangi qo'shildi (3 ta chiziq)
  ChevronLeft, // <--- Yopish uchun (ixtiyoriy)
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAuthToken } from "@/lib/api";

export function SidebarNav() {
  const pathname = usePathname();
  // Menyuni ochib-yopish uchun state (boshida ochiq turadi = true)
  const [isOpen, setIsOpen] = useState(true);

  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cattle", label: "Mollar", icon: Beef },
    { href: "/expenses", label: "Xarajatlar", icon: DollarSign },
    { href: "/wallet", label: "Hamyon", icon: DollarSign },
    { href: "/health", label: "Sog'liq", icon: Heart },
    // { href: '/feeding', label: 'Yemlanish', icon: Apple },
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
        // Agar ochiq bo'lsa kengligi 64 (w-64), yopiq bo'lsa kichkina (w-20)
        isOpen ? "w-64" : "w-20",
      )}
    >
      {/* Tepa qism: Logo va Menu tugmasi */}
      <div className="mb-8 flex items-center justify-between px-2">
        {/* Agar menyu ochiq bo'lsa, nomini ko'rsatamiz */}
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

        {/* 3 ta chiziqli tugma (Menu Toggle) */}
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

      {/* Menyular ro'yxati */}
      <div className="flex-1 space-y-2">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          return (
            <Link key={route.href} href={route.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all",
                  // Agar yopiq bo'lsa, tugmani o'rtaga joylaymiz
                  !isOpen && "justify-center px-2",
                )}
                title={!isOpen ? route.label : undefined} // Sichqoncha borganda nomi chiqadi
              >
                <Icon className={cn("h-5 w-5", isOpen && "mr-2")} />

                {/* Agar ochiq bo'lsa yozuv ko'rinadi, bo'lmasa yo'q */}
                {isOpen && <span>{route.label}</span>}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Chiqish tugmasi */}
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start bg-transparent mt-auto",
          !isOpen && "justify-center px-2",
        )}
        onClick={handleLogout}
        title={!isOpen ? "Chiqish" : undefined}
      >
        <LogOut className={cn("h-5 w-5", isOpen && "mr-2")} />
        {isOpen && "Chiqish"}
      </Button>
    </nav>
  );
}
