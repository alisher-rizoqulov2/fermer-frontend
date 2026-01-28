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
import { cattleAPI } from "@/lib/api";
import {
  Plus,
  Edit,
  Search,
  Archive,
  CheckCircle2,
  DollarSign,
  CalendarClock,
  CreditCard,
} from "lucide-react";

export default function CattlePage() {
  const [cattle, setCattle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"active" | "sold">("active");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    tag_number: "",
    type: "",
    breed: "",
    weight: "",
    age: "",
    purchase_price: "",
    purchase_date: "",
    status: 1,
    // Yangi maydonlar
    sale_price: "",
    feed_cost: "", // YANGI: Ozuqa narxi
    payment_type: "cash",
    credit_due_date: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Live Profit Calculation for Form
  const calculateEstimatedProfit = () => {
    const sale = Number(formData.sale_price) || 0;
    const buy = Number(formData.purchase_price) || 0;
    const feed = Number(formData.feed_cost) || 0;

    // Agar bu molni tahrirlayotgan bo'lsak va unda expenses bo'lsa, ularni ham qo'shish kerak
    // Lekin hozircha formadagi ma'lumotlar asosida hisoblaymiz.
    // Aniqroq bo'lishi uchun editingId orqali molni topib uning expenses larini olish mumkin:
    let otherExpenses = 0;
    if (editingId) {
      const currentCattle = cattle.find((c) => c.id === editingId);
      if (currentCattle && currentCattle.expenses) {
        otherExpenses = currentCattle.expenses.reduce(
          (sum: number, e: any) => sum + (Number(e.amount) || 0),
          0,
        );
      }
    }

    return sale - (buy + feed + otherExpenses);
  };

  const estimatedProfit = calculateEstimatedProfit();

  useEffect(() => {
    loadCattle();
  }, []);

  const loadCattle = async () => {
    try {
      const data = await cattleAPI.getAll();
      setCattle(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load cattle:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalExpenses = (expenses: any[]) => {
    if (!expenses || !Array.isArray(expenses)) return 0;
    return expenses.reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- SOTISH VALIDATSIYASI ---
    if (formData.status === 0) {
      if (!formData.sale_price) {
        alert("Sotish narxini kiriting!");
        return;
      }
      if (formData.payment_type === "credit" && !formData.credit_due_date) {
        alert("Nasiya muddatini (sanani) kiriting!");
        return;
      }
    }
    // ----------------------------

    try {
      const payload = {
        ...formData,
        weight: Number(formData.weight) || 0,
        age: Number(formData.age) || 0,
        purchase_price: Number(formData.purchase_price) || 0,
        status: Number(formData.status),
        sale_price: Number(formData.sale_price) || 0,
        feed_cost: Number(formData.feed_cost) || 0, // YANGI
        credit_due_date:
          formData.payment_type === "credit" ? formData.credit_due_date : null,
      };

      if (editingId) {
        await cattleAPI.update(editingId, payload);
      } else {
        await cattleAPI.create(payload);
      }

      resetForm();
      setEditingId(null);
      setIsOpen(false);
      loadCattle();
    } catch (error) {
      console.error("Failed to save cattle:", error);
      alert("Xatolik yuz berdi. Ma'lumotlarni tekshiring.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      tag_number: "",
      type: "",
      weight: "",
      age: "",
      breed: "",
      purchase_price: "",
      purchase_date: "",
      status: 1,
      sale_price: "",
      feed_cost: "",
      payment_type: "cash",
      credit_due_date: "",
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name || "",
      tag_number: item.tag_number || "",
      type: item.type || "",
      breed: item.breed || "",
      weight: item.weight || "",
      age: item.age || "",
      purchase_price: item.purchase_price || "",
      purchase_date: item.purchase_date || "",
      status: item.status ?? 1,
      sale_price: item.sale_price || "",
      feed_cost: item.feed_cost || "", // YANGI
      payment_type: item.payment_type || "cash",
      credit_due_date: item.credit_due_date || "",
    });
    setEditingId(item.id);
    setIsOpen(true);
  };

  const filteredCattle = cattle.filter((item) => {
    const statusMatch =
      viewMode === "active" ? item.status === 1 : item.status === 0;
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = (item.name || "").toLowerCase().includes(searchLower);
    const tagMatch = (item.tag_number || "")
      .toLowerCase()
      .includes(searchLower);
    return statusMatch && (nameMatch || tagMatch);
  });

  // --- STATISTIKA (Sotilganlar uchun) ---
  const soldStats = cattle
    .filter((c) => c.status === 0)
    .reduce(
      (acc, curr) => {
        const price = Number(curr.sale_price) || 0;
        if (curr.payment_type === "credit") {
          acc.creditCount += 1;
          acc.creditTotal += price;
        } else {
          acc.cashTotal += price;
        }
        return acc;
      },
      { creditCount: 0, creditTotal: 0, cashTotal: 0 },
    );

  return (
    <div className="flex">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {viewMode === "active"
                  ? "Fermadagi Mollar"
                  : "Sotilgan Mollar Tarixi"}
              </h1>
              <p className="text-muted-foreground">
                {viewMode === "active"
                  ? "Ayni vaqtda fermada mavjud mollar ro'yxati"
                  : "Sotilgan yoki hisobdan chiqarilgan mollar tarixi"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "active" ? "outline" : "default"}
                onClick={() =>
                  setViewMode(viewMode === "active" ? "sold" : "active")
                }
              >
                {viewMode === "active" ? (
                  <>
                    {" "}
                    <Archive className="mr-2 h-4 w-4" /> Arxiv
                    (Sotilganlar){" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Aktiv mollar{" "}
                  </>
                )}
              </Button>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetForm();
                      setEditingId(null);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Yangi mol
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId
                        ? "Mol ma'lumotlarini tahrirlash"
                        : "Yangi mol qo'shish"}
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-2 gap-4"
                  >
                    {/* --- STATUS SWITCH --- */}
                    {editingId && (
                      <div className="col-span-2 p-4 border rounded-lg bg-secondary/10">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-base font-bold">
                            Mol Statusi
                          </Label>
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                formData.status === 0
                                  ? "font-bold text-red-500"
                                  : "text-muted-foreground"
                              }
                            >
                              Sotildi
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.status === 1}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    status: e.target.checked ? 1 : 0,
                                  })
                                }
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                            <span
                              className={
                                formData.status === 1
                                  ? "font-bold text-green-600"
                                  : "text-muted-foreground"
                              }
                            >
                              Aktiv
                            </span>
                          </div>
                        </div>

                        {/* --- SOTUV FORMALARI (Faqat Sotildi tanlansa chiqadi) --- */}
                        {formData.status === 0 && (
                          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 pt-2 border-t mt-2">
                            <div className="col-span-2">
                              <p className="text-sm text-yellow-600 font-medium mb-2">
                                ⚠ Sotuv va Yakuniy hisob-kitob:
                              </p>
                            </div>

                            {/* YANGI INPUT: OZUQA SUMMASI */}
                            <div className="col-span-2">
                              <Label
                                htmlFor="feed_cost"
                                className="text-blue-600 font-bold"
                              >
                                Jami Yegan Ozuqasi Summasi (so'm)
                              </Label>
                              <Input
                                id="feed_cost"
                                type="number"
                                value={formData.feed_cost}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    feed_cost: e.target.value,
                                  })
                                }
                                className="border-blue-300 focus:border-blue-500 bg-blue-50"
                                placeholder="0"
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor="sale_price"
                                className="text-red-600"
                              >
                                Sotilgan Narxi (so'm) *
                              </Label>
                              <Input
                                id="sale_price"
                                type="number"
                                required
                                value={formData.sale_price}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    sale_price: e.target.value,
                                  })
                                }
                                className="border-red-300 focus:border-red-500"
                                placeholder="Masalan: 15000000"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="payment_type"
                                className="text-red-600"
                              >
                                To'lov Turi *
                              </Label>
                              <Select
                                value={formData.payment_type}
                                onValueChange={(val) =>
                                  setFormData({
                                    ...formData,
                                    payment_type: val,
                                  })
                                }
                              >
                                <SelectTrigger className="border-red-300">
                                  <SelectValue placeholder="Tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Naqd pul</SelectItem>
                                  <SelectItem value="credit">
                                    Nasiya (Qarz)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {formData.payment_type === "credit" && (
                              <div className="col-span-2">
                                <Label
                                  htmlFor="credit_due_date"
                                  className="text-red-600"
                                >
                                  Nasiya Qaytarish Sanasi *
                                </Label>
                                <Input
                                  id="credit_due_date"
                                  type="date"
                                  required
                                  value={formData.credit_due_date}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      credit_due_date: e.target.value,
                                    })
                                  }
                                  className="border-red-300"
                                />
                              </div>
                            )}

                            {/* TAHMINIY FOYDA KO'RSATISH */}
                            <div className="col-span-2 mt-2 p-3 bg-gray-100 rounded border border-dashed text-center">
                              <span className="text-sm text-gray-500">
                                Taxminiy Sof Foyda:
                              </span>
                              <div
                                className={`text-xl font-bold ${estimatedProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {estimatedProfit.toLocaleString()} so'm
                              </div>
                              <p className="text-xs text-gray-400">
                                (Sotuv - [Olish narxi + Ozuqa + Boshqa
                                xarajatlar])
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* --- ASOSIY INPUTLAR (O'ZGARMAGAN) --- */}
                    <div>
                      <Label htmlFor="tag_number">Tag Raqami</Label>
                      <Input
                        id="tag_number"
                        required
                        value={formData.tag_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tag_number: e.target.value,
                          })
                        }
                        placeholder="UZ-12345"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Laqabi</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Turi</Label>
                      <Input
                        id="type"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="breed">Zoti</Label>
                      <Input
                        id="breed"
                        value={formData.breed}
                        onChange={(e) =>
                          setFormData({ ...formData, breed: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Vazni (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Yoshi</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchase_price">Olingan narxi</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        value={formData.purchase_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchase_price: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchase_date">Olingan sanasi</Label>
                      <Input
                        id="purchase_date"
                        type="date"
                        value={formData.purchase_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchase_date: e.target.value,
                          })
                        }
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
          </div>

          {/* --- STATISTIKA PANELI --- */}
          {viewMode === "sold" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 animate-in fade-in slide-in-from-top-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Jami Naqd Tushum
                    </p>
                    <h2 className="text-2xl font-bold text-green-700">
                      {soldStats.cashTotal.toLocaleString()} so'm
                    </h2>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">
                      Jami Nasiya Summasi
                    </p>
                    <h2 className="text-2xl font-bold text-yellow-700">
                      {soldStats.creditTotal.toLocaleString()} so'm
                    </h2>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <CalendarClock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      Nasiyadagi Mollar
                    </p>
                    <h2 className="text-2xl font-bold text-blue-700">
                      {soldStats.creditCount} ta
                    </h2>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* --- QIDIRUV --- */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Qidirish..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- MOLLAR RO'YXATI --- */}
        {loading ? (
          <div className="text-center py-12">Yuklanmoqda...</div>
        ) : filteredCattle.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Ma'lumot topilmadi</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCattle.map((item: any) => {
              // Har bir mol uchun foydani hisoblash
              const otherExpenses = calculateTotalExpenses(item.expenses);
              const totalCost =
                (Number(item.purchase_price) || 0) +
                (Number(item.feed_cost) || 0) +
                otherExpenses;
              const profit = (Number(item.sale_price) || 0) - totalCost;

              return (
                <Card
                  key={item.id}
                  className={
                    item.status === 0
                      ? "border-l-4 border-l-gray-400 bg-gray-50/50"
                      : "border-l-4 border-l-green-500"
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {item.name || item.tag_number}
                        </CardTitle>
                        <CardDescription>
                          {item.type || "Turlamagan"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs bg-secondary px-2 py-1 rounded font-mono">
                          {item.tag_number}
                        </span>
                        {item.status === 0 && (
                          <span
                            className={`text-xs px-2 py-1 rounded font-bold ${item.payment_type === "credit" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                          >
                            {item.payment_type === "credit" ? "NASIYA" : "NAQD"}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zot:</span>
                        <span className="font-medium">
                          {item.breed || "---"}
                        </span>
                      </div>

                      {/* --- SOTILGAN MOLLAR INFO --- */}
                      {item.status === 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed space-y-2 bg-white/50 p-2 rounded">
                          <div className="flex justify-between text-blue-600">
                            <span>Ozuqa Xarajati:</span>
                            <span className="font-bold">
                              {Number(item.feed_cost || 0).toLocaleString()}{" "}
                              so'm
                            </span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Sotilgan Narxi:</span>
                            <span className="font-bold">
                              {Number(item.sale_price).toLocaleString()} so'm
                            </span>
                          </div>

                          {/* FOYDA HISOBI */}
                          <div className="flex justify-between border-t border-gray-300 pt-1 mt-1">
                            <span className="font-bold text-gray-700">
                              SOF FOYDA:
                            </span>
                            <span
                              className={`font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {profit.toLocaleString()} so'm
                            </span>
                          </div>

                          {item.payment_type === "credit" && (
                            <div className="flex justify-between text-yellow-700 bg-yellow-50 p-1 rounded mt-1">
                              <span className="flex items-center gap-1">
                                <CalendarClock className="h-3 w-3" /> Muddat:
                              </span>
                              <span className="font-bold">
                                {item.credit_due_date}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* --- UMUMIY XARAJATLAR (Boshqa xarajatlar) --- */}
                      <div className="flex justify-between pt-1">
                        <span className="text-muted-foreground">
                          Boshqa xarajatlar:
                        </span>
                        <span className="font-medium text-orange-600">
                          {otherExpenses.toLocaleString()} so'm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Olingan narxi:
                        </span>
                        <span className="font-medium">
                          {item.purchase_price
                            ? Number(item.purchase_price).toLocaleString()
                            : "---"}{" "}
                          so'm
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent hover:bg-secondary"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Tahrirlash
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
