"use client";

import React, { useEffect, useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { expensesAPI, cattleAPI } from "@/lib/api";
import { Plus, Trash2, Edit, Search } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [cattle, setCattle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    cattleId: "",
    amount: "",
    category: "", // Backendda -> expenseType
    description: "", // Backendda -> notes
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
      // Faqat active mollarni ro'yxatga chiqaramiz (xarajat qilish uchun)
      // Agar sotilganlarga ham xarajat yozish kerak bo'lsa .filter ni olib tashlang
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
      // Backendga to'g'ri formatda yuborish
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
      date: new Date().toISOString().split("T")[0], // Bugungi sana default
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
    <div className="flex">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Xarajatlar</h1>
              <p className="text-muted-foreground">
                Fermadagi barcha xarajatlar tarixi
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
                  Yangi xarajat
                </Button>
              </DialogTrigger>
              <DialogContent>
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
                    <Input
                      id="amount"
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="0"
                    />
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

          {/* QIDIRUV VA STATISTIKA */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Mol, tag raqam yoki xarajat turi..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Card className="w-full md:w-auto min-w-[200px]">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  Jami Xarajatlar
                </span>
                <span className="text-2xl font-bold text-red-600">
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
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Mol (Tag Raqam)
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Toifa
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Summa
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Sana
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Izoh
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((item: any) => {
                    return (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium">
                          {item.cattle ? (
                            <div className="flex flex-col">
                              <span>{item.cattle.name || "Nomsiz"}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.cattle.tag_number}
                              </span>
                            </div>
                          ) : (
                            <span className="text-red-500">
                              O'chirilgan mol
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="bg-secondary px-2 py-1 rounded text-xs font-semibold">
                            {item.expenseType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-red-600">
                          {Number(item.amount || 0).toLocaleString()} so'm
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {item.date}
                        </td>
                        <td
                          className="px-6 py-4 text-sm max-w-[200px] truncate"
                          title={item.notes}
                        >
                          {item.notes || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
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
