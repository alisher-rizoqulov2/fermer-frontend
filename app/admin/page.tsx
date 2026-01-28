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
import { adminAPI } from "@/lib/api";
import {
  Plus,
  Trash2,
  Edit,
  Shield,
  User,
  Phone,
  Mail,
  Key,
  Menu, // <--- YANGI
  X, // <--- YANGI
} from "lucide-react";

export default function AdminPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <--- YANGI
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Backendga mos form state
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "admin",
    new_password: "",
    confirim_password: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const data = await adminAPI.getAll();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && formData.new_password !== formData.confirim_password) {
      alert("Parollar mos kelmadi!");
      return;
    }

    try {
      if (editingId) {
        const updatePayload: any = { ...formData };
        if (!updatePayload.new_password) {
          delete updatePayload.new_password;
          delete updatePayload.confirim_password;
        }
        await adminAPI.update(editingId, updatePayload);
      } else {
        await adminAPI.create(formData);
      }

      resetForm();
      setEditingId(null);
      setIsOpen(false);
      loadAdmins();
    } catch (error) {
      console.error("Failed to save admin:", error);
      alert(
        "Xatolik! Ma'lumotlarni tekshiring (Email, Username band bo'lishi mumkin).",
      );
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "admin",
      new_password: "",
      confirim_password: "",
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      username: item.username || "",
      first_name: item.first_name || "",
      last_name: item.last_name || "",
      email: item.email || "",
      phone: item.phone || "",
      role: item.role || "admin",
      new_password: "",
      confirim_password: "",
    });
    setEditingId(item.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bu adminni o'chirishni xohlaysizmi?")) {
      try {
        await adminAPI.delete(id);
        loadAdmins();
      } catch (error) {
        console.error("Failed to delete admin:", error);
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

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Admin Boshqaruvi
            </h1>
            <p className="text-muted-foreground text-sm">
              Tizim administratorlari va xodimlarini boshqaring
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
                Yangi admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Adminni tahrirlash" : "Yangi admin yaratish"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* USERNAME */}
                <div>
                  <Label htmlFor="username">Login</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      required
                      className="pl-9"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="admin_ali"
                    />
                  </div>
                </div>
                {/* EMAIL */}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      className="pl-9"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="ali@ferma.uz"
                    />
                  </div>
                </div>

                {/* ISM & FAMILIYA */}
                <div>
                  <Label htmlFor="first_name">Ism</Label>
                  <Input
                    id="first_name"
                    required
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    placeholder="Ali"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Familiya</Label>
                  <Input
                    id="last_name"
                    required
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    placeholder="Valiyev"
                  />
                </div>

                {/* TELEFON & ROL */}
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      required
                      className="pl-9"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+998901234567"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="worker">Ishchi</option>
                  </select>
                </div>

                {/* PAROL (Faqat yangi yoki o'zgartirishda) */}
                <div className="col-span-1 md:col-span-2 pt-2 border-t mt-2">
                  <Label className="text-muted-foreground mb-2 block">
                    Xavfsizlik (Parol)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new_password">Yangi Parol</Label>
                      <div className="relative">
                        <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new_password"
                          type="password"
                          required={!editingId}
                          className="pl-9"
                          value={formData.new_password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              new_password: e.target.value,
                            })
                          }
                          placeholder={
                            editingId ? "O'zgartirish uchun" : "********"
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirim_password">
                        Parolni tasdiqlash
                      </Label>
                      <Input
                        id="confirim_password"
                        type="password"
                        required={!editingId}
                        value={formData.confirim_password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirim_password: e.target.value,
                          })
                        }
                        placeholder="********"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-4">
                  <Button type="submit" className="w-full">
                    {editingId ? "Saqlash" : "Yaratish"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Yuklanmoqda...</div>
        ) : admins.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Hali hech qanday admin yo'q
              </p>
            </CardContent>
          </Card>
        ) : (
          // JADVAL O'RNIGA RESPONSIVE KARTALAR GRID
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {admins.map((admin: any) => (
              <Card
                key={admin.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      {admin.username || "---"}
                    </CardTitle>
                    <CardDescription>
                      {admin.first_name} {admin.last_name}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      admin.role === "super_admin"
                        ? "bg-purple-100 text-purple-800"
                        : admin.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {admin.role || "admin"}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{admin.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(admin)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Tahrirlash
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(admin.id)}
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
