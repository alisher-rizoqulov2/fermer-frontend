"use client";

import React, { useEffect, useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { walletAPI } from "@/lib/api";
import {
  Plus,
  Trash2,
  Edit,
  Wallet,
  CreditCard,
  Banknote,
  Coins,
} from "lucide-react";

export default function WalletPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "", // Backendda "name"
    balance: "",
    currency: "UZS",
    description: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const data = await walletAPI.getAll();
      setWallets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        balance: Number(formData.balance),
        currency: formData.currency,
        description: formData.description,
      };

      if (editingId) {
        await walletAPI.update(editingId, payload);
      } else {
        await walletAPI.create(payload);
      }

      resetForm();
      setEditingId(null);
      setIsOpen(false);
      loadWallets();
    } catch (error) {
      console.error("Failed to save wallet:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      balance: "",
      currency: "UZS",
      description: "",
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name || "",
      balance: item.balance || "",
      currency: item.currency || "UZS",
      description: item.description || "",
    });
    setEditingId(item.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Hamyonni o'chirmoqchimisiz? Ichidagi barcha hisob-kitoblar yo'qolishi mumkin.",
      )
    ) {
      try {
        await walletAPI.delete(id);
        loadWallets();
      } catch (error) {
        console.error("Failed to delete wallet:", error);
      }
    }
  };

  // Jami balansni valyutalar bo'yicha hisoblash
  const totalBalances = wallets.reduce((acc: any, w: any) => {
    const curr = w.currency || "UZS";
    acc[curr] = (acc[curr] || 0) + Number(w.balance);
    return acc;
  }, {});

  // Valyutaga qarab ikonka va rang tanlash
  const getWalletStyle = (currency: string) => {
    switch (currency) {
      case "USD":
        return {
          icon: <Banknote className="h-5 w-5" />,
          color: "bg-green-100 text-green-700 border-green-200",
        };
      case "EUR":
        return {
          icon: <CreditCard className="h-5 w-5" />,
          color: "bg-blue-100 text-blue-700 border-blue-200",
        };
      default:
        return {
          icon: <Coins className="h-5 w-5" />,
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="flex">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Hamyonlar</h1>
              <p className="text-muted-foreground">
                Fermer hisob raqamlari va kassalarini boshqarish
              </p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setEditingId(null);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi hamyon
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId
                      ? "Hamyonni tahrirlash"
                      : "Yangi hamyon yaratish"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="walletName">Hamyon nomi</Label>
                    <Input
                      id="walletName"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Masalan: Asosiy Kassa, Plastik karta..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="balance">Balans</Label>
                      <Input
                        id="balance"
                        type="number"
                        required
                        value={formData.balance}
                        onChange={(e) =>
                          setFormData({ ...formData, balance: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Valyuta</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(val) =>
                          setFormData({ ...formData, currency: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UZS">So'm (UZS)</SelectItem>
                          <SelectItem value="USD">Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Yevro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Izoh</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Qo'shimcha ma'lumot..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingId ? "Saqlash" : "Yaratish"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* JAMI BALANS KARTALARI */}
          <div className="flex flex-wrap gap-4">
            {Object.entries(totalBalances).map(([curr, amount]: any) => (
              <Card key={curr} className="min-w-[200px] shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Jami {curr}
                    </p>
                    <p className="text-2xl font-bold">
                      {amount.toLocaleString()} {curr}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Yuklanmoqda...</div>
        ) : wallets.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">
                Hali hech qanday hamyon yo'q
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet: any) => {
              const style = getWalletStyle(wallet.currency);
              return (
                <Card
                  key={wallet.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg">
                        {wallet.name || "Nomsiz"}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {wallet.description || "Izoh yo'q"}
                      </CardDescription>
                    </div>
                    <div className={`p-2 rounded-lg ${style.color} border`}>
                      {style.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Mavjud mablag':
                      </p>
                      <p className="text-2xl font-bold tracking-tight">
                        {Number(wallet.balance || 0).toLocaleString()}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          {wallet.currency}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(wallet)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Tahrirlash
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(wallet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
