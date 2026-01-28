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
  FileText,
} from "lucide-react";

export default function InventoryPage() {
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
        addedDate: new Date().toISOString().split("T")[0], // Avtomatik sana
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
    <div className="flex">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Omborxona
              </h1>
              <p className="text-muted-foreground">
                Fermaga kelgan mahsulotlar, yem-xashak va asboblar ro'yxati
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
                  Yangi mahsulot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingId
                      ? "Mahsulotni tahrirlash"
                      : "Yangi mahsulot qo'shish"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="col-span-2">
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

                  <div className="col-span-2 mt-4">
                    <Button type="submit" className="w-full">
                      {editingId ? "Saqlash" : "Qo'shish"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-secondary/10 p-4 rounded-lg">
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
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">
                Ombordagi jami qiymat:
              </span>
              <span className="text-2xl font-bold text-green-700">
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
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b">
                  <tr>
                    <th className="px-6 py-3">Mahsulot</th>
                    <th className="px-6 py-3">Turi</th>
                    <th className="px-6 py-3">Miqdor</th>
                    <th className="px-6 py-3">Narx (so'm)</th>
                    <th className="px-6 py-3">Jami Qiymat</th>
                    <th className="px-6 py-3">Joylashuv</th>
                    <th className="px-6 py-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item: any) => {
                    const itemValue =
                      (Number(item.quantity) || 0) * (Number(item.price) || 0);
                    return (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-500" />
                          {item.itemName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-secondary px-2 py-1 rounded text-xs font-semibold">
                            {item.itemType || "---"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {item.quantity}{" "}
                          <span className="text-muted-foreground font-normal">
                            {item.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {Number(item.price || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600">
                          {itemValue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-1 text-muted-foreground">
                          {item.location ? (
                            <>
                              <MapPin className="h-3 w-3" /> {item.location}
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
