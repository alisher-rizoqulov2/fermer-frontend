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
} from "lucide-react";

export default function AdminPage() {
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

    // Parol tekshiruvi (faqat yangi qo'shganda)
    if (!editingId && formData.new_password !== formData.confirim_password) {
      alert("Parollar mos kelmadi!");
      return;
    }

    try {
      if (editingId) {
        // Update paytida parol bo'sh bo'lsa, uni yubormaslik kerak (Backend logikasiga ko'ra)
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
      new_password: "", // Parolni ko'rsatmaymiz
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
    <div className="flex">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Boshqaruvi
            </h1>
            <p className="text-muted-foreground">
              Tizim administratorlari va xodimlarini boshqaring
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
                Yangi admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Adminni tahrirlash" : "Yangi admin yaratish"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {/* USERNAME & EMAIL */}
                <div>
                  <Label htmlFor="username">Foydalanuvchi nomi (Login)</Label>
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="worker">Ishchi</option>
                  </select>
                </div>

                {/* PAROL (Faqat yangi yoki o'zgartirishda) */}
                <div className="col-span-2 pt-2 border-t mt-2">
                  <Label className="text-muted-foreground mb-2 block">
                    Xavfsizlik (Parol)
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new_password">Yangi Parol</Label>
                      <div className="relative">
                        <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new_password"
                          type="password"
                          required={!editingId} // Yangi bo'lsa majburiy
                          className="pl-9"
                          value={formData.new_password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              new_password: e.target.value,
                            })
                          }
                          placeholder={
                            editingId
                              ? "O'zgartirish uchun kiriting"
                              : "********"
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

                <div className="col-span-2 mt-4">
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
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Foydalanuvchi
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Ism Familiya
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Aloqa
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin: any) => (
                    <tr
                      key={admin.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          {admin.username || "---"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {admin.first_name} {admin.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex flex-col text-xs">
                          <span>{admin.email}</span>
                          <span>{admin.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            admin.role === "super_admin"
                              ? "bg-purple-100 text-purple-800"
                              : admin.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {admin.role || "admin"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(admin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(admin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
