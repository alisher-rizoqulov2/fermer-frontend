"use client";

import React, { useEffect, useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { inventoryAPI } from "@/lib/api";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Package,
  MapPin,
  Menu, // <--- YANGI
  X, // <--- YANGI
  Coins,
  Scale,
} from "lucide-react";

export default function InventoryPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <--- YANGI
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    itemName: "",
    itemType: "",
    quantity: "",
    unit: "",
    price: "",
    location: "",
    notes: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await inventoryAPI.getAll();
      setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        itemName: formData.itemName,
        itemType: formData.itemType,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        price: Number(formData.price),
        location: formData.location,
        notes: formData.notes,
        addedDate: new Date().toISOString().split("T")[0],
      };

      if (editingId) {
        await inventoryAPI.update(editingId, payload);
      } else {
        await inventoryAPI.create(payload);
      }

      resetForm();
      setEditingId(null);
      setIsOpen(false);
      loadInventory();
    } catch (error) {
      console.error("Failed to save inventory:", error);
      alert("Xatolik! Ma'lumotlarni tekshiring.");
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      itemType: "",
      quantity: "",
      unit: "",
      price: "",
      location: "",
      notes: "",
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      itemName: item.itemName || "",
      itemType: item.itemType || "",
      quantity: item.quantity || "",
      unit: item.unit || "",
      price: item.price || "",
      location: item.location || "",
      notes: item.notes || "",
    });
    setEditingId(item.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Mahsulotni o'chirmoqchimisiz?")) {
      try {
        await inventoryAPI.delete(id);
        loadInventory();
      } catch (error) {
        console.error("Failed to delete inventory:", error);
      }
    }
  };

  // Qidiruv va Filtr
  const filteredInventory = inventory.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.itemType &&
        item.itemType.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const totalValue = filteredInventory.reduce((sum: number, item: any) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + quantity * price;
  }, 0);

  return (
    <div className="flex bg-muted/10 min-h-screen relative">
      {/* 1. DESKTOP SIDEBAR */}
      <div className="hidden md:block h-full min-h-screen sticky top-0">
        <SidebarNav />
      </div>

      {/* 2. MOBILE SIDEBAR (Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-white w-3/4 max-w-xs h-full shadow-xl">
            <div className="p-4 flex justify-between items-center border-b">
              <span className="font-bold text-lg">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <SidebarNav />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto p-4 md:p-8 w-full">
        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b">
          <h1 className="text-xl font-bold">Fermer Pro</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Omborxona
              </h1>
              <p className="text-muted-foreground text-sm">
                Fermaga kelgan mahsulotlar, yem-xashak va asboblar ro'yxati
              </p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full md:w-auto"
                  onClick={() => {
                    resetForm();
                    setEditingId(null);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi mahsulot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>
                    {editingId
                      ? "Mahsulotni tahrirlash"
                      : "Yangi mahsulot qo'shish"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="itemName">Mahsulot Nomi *</Label>
                    <Input
                      id="itemName"
                      required
                      value={formData.itemName}
                      onChange={(e) =>
                        setFormData({ ...formData, itemName: e.target.value })
                      }
                      placeholder="Masalan: Makkajo'xori, Belkurak..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="itemType">Turi</Label>
                    <Input
                      id="itemType"
                      value={formData.itemType}
                      onChange={(e) =>
                        setFormData({ ...formData, itemType: e.target.value })
                      }
                      placeholder="Oziq-ovqat, Texnika..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Joylashuvi</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Ombor 1, Javon 2..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity">Miqdori *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit">Birlik *</Label>
                    <Input
                      id="unit"
                      required
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      placeholder="kg, litr, dona..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Narxi (so'm) </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="Bir birlik narxi"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Izoh</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Qo'shimcha ma'lumot"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-4">
                    <Button type="submit" className="w-full">
                      {editingId ? "Saqlash" : "Qo'shish"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Nomi yoki turi bo'yicha qidirish..."
                className="pl-8 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <span className="text-sm text-muted-foreground">
                Ombordagi jami qiymat:
              </span>
              <span className="text-xl md:text-2xl font-bold text-green-700">
                {totalValue.toLocaleString()} so'm
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Yuklanmoqda...</div>
        ) : filteredInventory.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Qidiruv bo'yicha hech narsa topilmadi"
                  : "Ombor bo'sh"}
              </p>
            </CardContent>
          </Card>
        ) : (
          // JADVAL O'RNIGA RESPONSIVE KARTALAR GRID
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredInventory.map((item: any) => {
              const itemValue =
                (Number(item.quantity) || 0) * (Number(item.price) || 0);

              return (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-500" />
                          {item.itemName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location || "Joylashuv yo'q"}
                        </CardDescription>
                      </div>
                      <span className="bg-secondary px-2 py-1 rounded text-xs font-semibold">
                        {item.itemType || "---"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-muted/30 p-2 rounded">
                        <span className="text-muted-foreground text-xs block">
                          Miqdor
                        </span>
                        <div className="flex items-center gap-1 font-bold">
                          <Scale className="h-3 w-3" /> {item.quantity}{" "}
                          {item.unit}
                        </div>
                      </div>
                      <div className="bg-green-50 p-2 rounded border border-green-100">
                        <span className="text-green-600 text-xs block">
                          Jami Qiymat
                        </span>
                        <div className="flex items-center gap-1 font-bold text-green-700">
                          <Coins className="h-3 w-3" />{" "}
                          {itemValue.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                      <span>
                        Donasi: {Number(item.price || 0).toLocaleString()} so'm
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Tahrirlash
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> O'chirish
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
