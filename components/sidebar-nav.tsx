'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearAuthToken } from '@/lib/api';

export function SidebarNav() {
  const pathname = usePathname();

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
    window.location.href = '/login';
  };

  return (
    <nav className="flex h-screen w-64 flex-col border-r bg-background p-4">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-primary">Fermer Pro</h1>
        <p className="text-sm text-muted-foreground">Qishloq xo'jaligi boshqaruvi</p>
      </div>

      <div className="flex-1 space-y-2">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          return (
            <Link key={route.href} href={route.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Icon className="mr-2 h-4 w-4" />
                {route.label}
              </Button>
            </Link>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="w-full justify-start bg-transparent"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Chiqish
      </Button>
    </nav>
  );
}
