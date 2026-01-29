"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <--- YANGI QO'SHILDI
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { adminAPI } from "@/lib/api";
import {
  Plus,
  Search,
  User,
  Shield,
  Trash2,
  Edit,
  Menu,
  X,
  LogOut, // <--- YANGI QO'SHILDI
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter(); // <--- ROUTER QO'SHILDI
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("User parse error", e);
      }
    }
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getAll();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Adminlarni yuklashda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT FUNKSIYASI (YANGI) ---
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && formData.password !== formData.confirm_password) {
      alert("Parollar mos kelmadi!");
      return;
    }

    try {
      const payload: any = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      };

      if (!editingId) {
        payload.new_password = formData.password;
        payload.confirim_password = formData.confirm_password;
      }

      if (editingId) {
        await adminAPI.update(editingId, payload);
      } else {
        await adminAPI.create(payload);
      }

      setIsOpen(false);
      resetForm();
      loadAdmins();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminAPI.delete(id);
      loadAdmins();
    } catch (error) {
      console.error("O'chirishda xato:", error);
      alert("O'chirish imkonsiz");
    }
  };

  const handleEdit = (admin: any) => {
    setEditingId(admin.id);
    setFormData({
      username: admin.username || "",
      email: admin.email || "",
      first_name: admin.first_name || "",
      last_name: admin.last_name || "",
      phone: admin.phone || "",
      password: "",
      confirm_password: "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      phone: "",
    });
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex relative min-h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full min-h-screen sticky top-0">
        <SidebarNav />
      </div>

      {/* --- MOBILE SIDEBAR (YANGILANDI: LOGOUT QO'SHILDI) --- */}
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

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto">
              <SidebarNav />
            </div>

            {/* 🔥 LOGOUT BUTTON 🔥 */}
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
        {/* Mobile Header */}
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
                Admin Boshqaruvi
              </h1>
              <p className="text-muted-foreground text-sm">
                Tizim administratorlari va xodimlarini boshqaring
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentUser?.is_creator && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="mr-2 h-4 w-4" /> Yangi admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingId
                          ? "Adminni tahrirlash"
                          : "Yangi admin qo'shish"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Form inputs (username, email...) - o'zgarishsiz */}
                      <div>
                        <Label>Username</Label>
                        <Input
                          required
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              username: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>
                      {!editingId && (
                        <>
                          <div>
                            <Label>Parol</Label>
                            <Input
                              type="password"
                              required
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Parolni tasdiqlash</Label>
                            <Input
                              type="password"
                              required
                              value={formData.confirm_password}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  confirm_password: e.target.value,
                                })
                              }
                            />
                          </div>
                        </>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Ism</Label>
                          <Input
                            value={formData.first_name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                first_name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Familiya</Label>
                          <Input
                            value={formData.last_name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                last_name: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Telefon</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Saqlash
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Admin qidirish..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div>Yuklanmoqda...</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredAdmins.map((admin) => (
              <Card key={admin.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {admin.is_creator ? "SUPER ADMIN" : "ADMIN"}
                  </CardTitle>
                  {admin.is_creator ? (
                    <Shield className="h-4 w-4 text-purple-600" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 py-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-lg font-bold leading-none">
                        {admin.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {admin.first_name} {admin.last_name}
                      </p>
                    </div>
                    {admin.is_active ? (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                        Aktive
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                        Blok
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <p className="flex items-center gap-2">
                      <span className="opacity-70">Email:</span> {admin.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="opacity-70">Tel:</span> {admin.phone}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(admin)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Tahrirlash
                    </Button>

                    {currentUser?.is_creator && !admin.is_creator && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Ishonchingiz komilmi?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu amalni ortga qaytarib bo'lmaydi. Admin butunlay
                              o'chiriladi.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(admin.id)}
                            >
                              O'chirish
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
