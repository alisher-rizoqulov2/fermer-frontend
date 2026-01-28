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
import { feedingAPI, cattleAPI } from "@/lib/api";
import {
  Plus,
  Trash2,
  Menu, // <--- YANGI
  X, // <--- YANGI
  Clock,
  Calendar,
  Utensils,
} from "lucide-react";

export default function FeedingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <--- YANGI
  const [feedingRecords, setFeedingRecords] = useState<any[]>([]);
  const [cattle, setCattle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    cattleId: "",
    foodType: "",
    quantity: "",
    unit: "",
    date: "",
    time: "",
    notes: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feedingData, cattleData] = await Promise.all([
        feedingAPI.getAll(),
        cattleAPI.getAll(),
      ]);
      setFeedingRecords(Array.isArray(feedingData) ? feedingData : []);
      setCattle(Array.isArray(cattleData) ? cattleData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await feedingAPI.update(editingId, formData);
      } else {
        await feedingAPI.create(formData);
      }
      setFormData({
        cattleId: "",
        foodType: "",
        quantity: "",
        unit: "",
        date: "",
        time: "",
        notes: "",
      });
      setEditingId(null);
      setIsOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save feeding record:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yozuvni o'chirmoqchimisiz?")) {
      try {
        await feedingAPI.delete(id);
        loadData();
      } catch (error) {
        console.error("Failed to delete feeding record:", error);
      }
    }
  };

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
                Yemlanish
              </h1>
              <p className="text-muted-foreground text-sm">
                Mollaringizni yemlantirishinggizni rejalashtiring
              </p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full md:w-auto"
                  onClick={() => {
                    setFormData({
                      cattleId: "",
                      foodType: "",
                      quantity: "",
                      unit: "",
                      date: "",
                      time: "",
                      notes: "",
                    });
                    setEditingId(null);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Yozuv qo'shish
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Yangi yemlanish yozuvi</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cattleId">Mol</Label>
                    <select
                      id="cattleId"
                      value={formData.cattleId}
                      onChange={(e) =>
                        setFormData({ ...formData, cattleId: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Molni tanlang</option>
                      {cattle.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.tag_number} - {c.name || `Mol #${c.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="foodType">Oziq turi</Label>
                    <Input
                      id="foodType"
                      value={formData.foodType}
                      onChange={(e) =>
                        setFormData({ ...formData, foodType: e.target.value })
                      }
                      placeholder="Donlik, pichan, o't va h.k."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Miqdori</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Birlik</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        placeholder="kg, l, dona..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Sana</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Vaqt</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Izohlar</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Qo'shimcha ma'lumot"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Saqlash
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Yuklanmoqda...</div>
        ) : feedingRecords.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">
                Hali hech qanday yemlanish yozuvi yo'q
              </p>
            </CardContent>
          </Card>
        ) : (
          // JADVAL O'RNIGA GRID (RESPONSIVE KARTALAR)
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {feedingRecords.map((record: any) => {
              const cattleInfo = cattle.find(
                (c: any) => c.id === Number(record.cattleId),
              );
              const cattleName = cattleInfo
                ? cattleInfo.name || cattleInfo.tag_number
                : `Mol #${record.cattleId}`;

              return (
                <Card
                  key={record.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-orange-500" />
                          {record.foodType || "Noma'lum yem"}
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold text-blue-600">
                          {cattleName}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold">
                          {record.quantity} {record.unit}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{record.date || "---"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{record.time || "---"}</span>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="bg-muted p-2 rounded text-xs italic mt-2">
                          "{record.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
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
