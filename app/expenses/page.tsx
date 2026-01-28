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
import { expensesAPI, cattleAPI } from "@/lib/api";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Menu, // <--- YANGI
  X, // <--- YANGI
  Banknote,
  CalendarDays,
  Tag,
} from "lucide-react";

export default function ExpensesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <--- YANGI
  const [expenses, setExpenses] = useState<any[]>([]);
  const [cattle, setCattle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    cattleId: "",
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesData, cattleData] = await Promise.all([
        expensesAPI.getAll(),
        cattleAPI.getAll(),
      ]);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
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
      const payload = {
        cattle_id: Number(formData.cattleId),
        expenseType: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        notes: formData.description,
      };

      if (editingId) {
        await expensesAPI.update(editingId, payload);
      } else {
        await expensesAPI.create(payload);
      }

      resetForm();
      setEditingId(null);
      setIsOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save expense:", error);
      alert("Xatolik! Barcha maydonlarni to'ldiring.");
    }
  };

  const resetForm = () => {
    setFormData({
      cattleId: "",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      cattleId: item.cattle?.id?.toString() || "",
      amount: item.amount || "",
      category: item.expenseType || "",
      description: item.notes || "",
      date: item.date || "",
    });
    setEditingId(item.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Xarajatni o'chirmoqchimisiz?")) {
      try {
        await expensesAPI.delete(id);
        loadData();
      } catch (error) {
        console.error("Failed to delete expense:", error);
      }
    }
  };

  // Umumiy hisob
  const totalExpenses = expenses.reduce(
    (sum: number, e: any) => sum + (Number(e.amount) || 0),
    0,
  );

  // Filtr
  const filteredExpenses = expenses.filter((item) => {
    const cattleName = item.cattle?.name?.toLowerCase() || "";
    const tag = item.cattle?.tag_number?.toLowerCase() || "";
    const type = item.expenseType?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      cattleName.includes(search) ||
      tag.includes(search) ||
      type.includes(search)
    );
  });

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
                Xarajatlar
              </h1>
              <p className="text-muted-foreground text-sm">
                Fermadagi barcha xarajatlar tarixi
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
                  Yangi xarajat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>
                    {editingId
                      ? "Xarajatni tahrirlash"
                      : "Yangi xarajat qo'shish"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cattleId">Molni tanlang</Label>
                    <select
                      id="cattleId"
                      required
                      value={formData.cattleId}
                      onChange={(e) =>
                        setFormData({ ...formData, cattleId: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Tanlang...</option>
                      {cattle.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.tag_number} - {c.name || "Nomsiz"} ({c.breed})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="category">Xarajat Turi (Toifa)</Label>
                    <Input
                      id="category"
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="Masalan: Yem, Dori, Veterinariya..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Summa (so'm)</Label>
                    <div className="relative">
                      <Banknote className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        required
                        className="pl-9"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="date">Sana</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Izoh (Ixtiyoriy)</Label>
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
                    {editingId ? "Saqlash" : "Qo'shish"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* QIDIRUV VA STATISTIKA (RESPONSIVE) */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Qidirish..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Card className="w-full md:w-auto min-w-[200px] shadow-sm bg-red-50 border-red-200">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-sm text-red-600 font-medium">
                  Jami Xarajatlar
                </span>
                <span className="text-2xl font-bold text-red-700">
                  {totalExpenses.toLocaleString()} so'm
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Yuklanmoqda...</div>
        ) : filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Qidiruv bo'yicha hech narsa topilmadi"
                  : "Hali hech qanday xarajat qayd qilinmagan"}
              </p>
            </CardContent>
          </Card>
        ) : (
          // JADVAL O'RNIGA GRID (RESPONSIVE KARTALAR)
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredExpenses.map((item: any) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        {item.expenseType}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {item.cattle ? (
                          <span>
                            {item.cattle.tag_number} - {item.cattle.name}
                          </span>
                        ) : (
                          <span className="text-red-500">O'chirilgan mol</span>
                        )}
                      </CardDescription>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {Number(item.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{item.date}</span>
                    </div>
                    {item.notes && (
                      <div className="bg-muted p-2 rounded text-xs italic">
                        "{item.notes}"
                      </div>
                    )}
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
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
