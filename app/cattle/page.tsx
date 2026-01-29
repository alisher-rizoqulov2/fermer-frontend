"use client";

import React, { useEffect, useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { useRouter } from "next/navigation"; // Router kerak logout uchun
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
// adminAPI ni import qilishni unutmang (yoki api.ts dan)
import { cattleAPI, adminAPI } from "@/lib/api"; 
import {
  Plus,
  Edit,
  Search,
  Archive,
  CheckCircle2,
  DollarSign,
  CalendarClock,
  CreditCard,
  Menu,
  X,
  LogOut, // <--- Logout ikonka
  User, // <--- User ikonka
  Users, // <--- Users ikonka
} from "lucide-react";

export default function CattlePage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- CREATOR MODE STATES ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("all");
  // ---------------------------

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
    sale_price: "",
    feed_cost: "",
    payment_type: "cash",
    credit_due_date: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 1. Userni aniqlash va Adminlarni yuklash
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);

      // Agar Creator bo'lsa, adminlar ro'yxatini olib kelamiz
      if (user.is_creator) {
        loadAdmins();
      }
    }
    loadCattle();
  }, []);

  const loadAdmins = async () => {
    try {
      // API orqali adminlarni olish
      const data = await adminAPI.getAll(); 
      setAdmins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Adminlarni yuklashda xato:", error);
    }
  };

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

  // Logout funksiyasi (Mobile uchun)
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const calculateEstimatedProfit = () => {
    const sale = Number(formData.sale_price) || 0;
    const buy = Number(formData.purchase_price) || 0;
    const feed = Number(formData.feed_cost) || 0;

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

  const calculateTotalExpenses = (expenses: any[]) => {
    if (!expenses || !Array.isArray(expenses)) return 0;
    return expenses.reduce(
      (total, item) => total + (Number(item.amount) || 0),
      0,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... validatsiyalar ...
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

    try {
      const payload = {
        ...formData,
        weight: Number(formData.weight) || 0,
        age: Number(formData.age) || 0,
        purchase_price: Number(formData.purchase_price) || 0,
        status: Number(formData.status),
        sale_price: Number(formData.sale_price) || 0,
        feed_cost: Number(formData.feed_cost) || 0,
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
      breed: "",
      weight: "",
      age: "",
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
      feed_cost: item.feed_cost || "",
      payment_type: item.payment_type || "cash",
      credit_due_date: item.credit_due_date || "",
    });
    setEditingId(item.id);
    setIsOpen(true);
  };

  // --- FILTRLASH MANTIQI (UPDATED) ---
  const filteredCattle = cattle.filter((item) => {
    // 1. Status bo'yicha
    const statusMatch =
      viewMode === "active" ? item.status === 1 : item.status === 0;
    
    // 2. Qidiruv bo'yicha
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = (item.name || "").toLowerCase().includes(searchLower);
    const tagMatch = (item.tag_number || "").toLowerCase().includes(searchLower);
    
    // 3. ADMIN FILTER (Faqat Creator uchun)
    let adminMatch = true;
    if (currentUser?.is_creator && selectedAdminId !== "all") {
      // Backenddan admin_id raqam bo'lib keladi
      adminMatch = item.admin_id === Number(selectedAdminId);
    }

    return statusMatch && (nameMatch || tagMatch) && adminMatch;
  });

  // Statistikani ham faqat filtrlangan ma'lumotdan olamiz
  const soldStats = filteredCattle // <-- filteredCattle ishlatildi
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
    <div className="flex relative min-h-screen bg-gray-50/50">
      {/* 1. DESKTOP SIDEBAR */}
      <div className="hidden md:block h-full min-h-screen sticky top-0">
        <SidebarNav />
      </div>

      {/* 2. MOBILE SIDEBAR (YANGILANGAN) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-white w-3/4 max-w-xs h-full shadow-xl flex flex-col">
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
            
            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto">
                <SidebarNav />
            </div>

            {/* --- MOBILE LOGOUT TUGMASI --- */}
            <div className="p-4 border-t bg-gray-50">
                <Button 
                    variant="destructive" 
                    className="w-full flex items-center gap-2"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Tizimdan chiqish
                </Button>
            </div>
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
                {viewMode === "active"
                  ? "Fermadagi Mollar"
                  : "Sotilgan Mollar Tarixi"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {viewMode === "active"
                  ? "Ayni vaqtda fermada mavjud mollar ro'yxati"
                  : "Sotilgan yoki hisobdan chiqarilgan mollar tarixi"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              
              {/* --- CREATOR UCHUN ADMIN TANLASH (YANGI) --- */}
              {currentUser?.is_creator && (
                 <div className="w-full sm:w-[200px]">
                    <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                        <SelectTrigger className="w-full bg-white border-blue-300">
                             <div className="flex items-center gap-2 text-blue-700">
                                <Users className="h-4 w-4" />
                                <SelectValue placeholder="Adminni tanlang" />
                             </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <span className="font-bold">Barcha Adminlar</span>
                            </SelectItem>
                            {admins.map((admin) => (
                                <SelectItem key={admin.id} value={String(admin.id)}>
                                    {admin.username || admin.email} (ID: {admin.id})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
              )}

              <Button
                variant={viewMode === "active" ? "outline" : "default"}
                onClick={() =>
                  setViewMode(viewMode === "active" ? "sold" : "active")
                }
                className="w-full sm:w-auto"
              >
                {viewMode === "active" ? (
                  <>
                    <Archive className="mr-2 h-4 w-4" /> Arxiv (Sotilganlar)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Aktiv mollar
                  </>
                )}
              </Button>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => {
                      resetForm();
                      setEditingId(null);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Yangi mol
                  </Button>
                </DialogTrigger>
                {/* ... DIALOG CONTENT (O'ZGARISHSIZ QOLDIRILDI) ... */}
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {editingId && (
                      <div className="col-span-1 md:col-span-2 p-4 border rounded-lg bg-secondary/10">
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
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
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
                        {formData.status === 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t mt-2">
                            <div className="col-span-1 md:col-span-2">
                              <p className="text-sm text-yellow-600 font-medium">
                                ⚠ Sotuv va Yakuniy hisob-kitob:
                              </p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <Label>Jami Yegan Ozuqasi Summasi</Label>
                              <Input
                                type="number"
                                value={formData.feed_cost}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    feed_cost: e.target.value,
                                  })
                                }
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label className="text-red-600">
                                Sotilgan Narxi *
                              </Label>
                              <Input
                                type="number"
                                required
                                value={formData.sale_price}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    sale_price: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-red-600">
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
                                <SelectTrigger>
                                  <SelectValue placeholder="Tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Naqd</SelectItem>
                                  <SelectItem value="credit">Nasiya</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {formData.payment_type === "credit" && (
                              <div className="col-span-1 md:col-span-2">
                                <Label className="text-red-600">
                                  Nasiya Qaytarish Sanasi *
                                </Label>
                                <Input
                                  type="date"
                                  required
                                  value={formData.credit_due_date}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      credit_due_date: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )}
                            <div className="col-span-1 md:col-span-2 mt-2 p-3 bg-gray-100 rounded text-center">
                              <span className="text-sm text-gray-500">
                                Taxminiy Sof Foyda:
                              </span>
                              <div
                                className={`text-xl font-bold ${estimatedProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {estimatedProfit.toLocaleString()} so'm
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <Label>Tag Raqami</Label>
                      <Input
                        required
                        value={formData.tag_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tag_number: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Laqabi</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Turi</Label>
                      <Input
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Zoti</Label>
                      <Input
                        value={formData.breed}
                        onChange={(e) =>
                          setFormData({ ...formData, breed: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Vazni (kg)</Label>
                      <Input
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Yoshi</Label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Olingan narxi</Label>
                      <Input
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
                      <Label>Olingan sanasi</Label>
                      <Input
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
                    <div className="col-span-1 md:col-span-2 mt-4">
                      <Button type="submit" className="w-full">
                        {editingId ? "Saqlash" : "Qo'shish"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* --- STATISTIKA (UPDATED: SELECTED ADMIN BO'YICHA) --- */}
          {viewMode === "sold" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 animate-in fade-in slide-in-from-top-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Jami Naqd Tushum
                    </p>
                    <h2 className="text-xl md:text-2xl font-bold text-green-700">
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
                      Jami Nasiya
                    </p>
                    <h2 className="text-xl md:text-2xl font-bold text-yellow-700">
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
                    <h2 className="text-xl md:text-2xl font-bold text-blue-700">
                      {soldStats.creditCount} ta
                    </h2>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* --- QIDIRUV --- */}
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Qidirish (Nomi yoki Tag raqami)..."
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCattle.map((item: any) => {
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
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                          {item.name || item.tag_number}
                        </CardTitle>
                        <CardDescription>
                            {/* Agar Creator bo'lsa, mol kimnikiligini ko'rsatish */}
                            {currentUser?.is_creator && (
                                <span className="block text-blue-600 font-bold text-xs mb-1">
                                    Egasi ID: {item.admin_id}
                                </span>
                            )}
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
                      {/* ... CARD CONTENT (O'ZGARISHSIZ QOLADI) ... */}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zot:</span>
                        <span className="font-medium">
                          {item.breed || "---"}
                        </span>
                      </div>

                      {item.status === 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed space-y-2 bg-white/50 p-2 rounded">
                          <div className="flex justify-between text-blue-600">
                            <span>Ozuqa:</span>{" "}
                            <span className="font-bold">
                              {Number(item.feed_cost || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Sotildi:</span>{" "}
                            <span className="font-bold">
                              {Number(item.sale_price).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-300 pt-1 mt-1">
                            <span className="font-bold text-gray-700">
                              SOF FOYDA:
                            </span>
                            <span
                              className={`font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {profit.toLocaleString()}
                            </span>
                          </div>
                          {item.payment_type === "credit" && (
                            <div className="flex justify-between text-yellow-700 bg-yellow-50 p-1 rounded mt-1 text-xs">
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

                      <div className="flex justify-between pt-1">
                        <span className="text-muted-foreground">
                          Boshqa xarajat:
                        </span>
                        <span className="font-medium text-orange-600">
                          {otherExpenses.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Olingan:</span>
                        <span className="font-medium">
                          {item.purchase_price
                            ? Number(item.purchase_price).toLocaleString()
                            : "---"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
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