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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { healthAPI, cattleAPI } from "@/lib/api";
import {
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  HeartPulse,
  Stethoscope,
  FileText,
  CalendarDays,
} from "lucide-react";

export default function HealthPage() {
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [cattle, setCattle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    cattleId: "",
    healthStatus: "Sog'lom",
    treatment: "",
    checkupDate: "",
    vetNotes: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [healthData, cattleData] = await Promise.all([
        healthAPI.getAll(),
        cattleAPI.getAll(),
      ]);
      setHealthRecords(Array.isArray(healthData) ? healthData : []);

      // --- O'ZGARTIRILDI: FILTR OLIB TASHLANDI ---
      // Endi barcha mollar (sotilganlar ham) chiqadi
      setCattle(Array.isArray(cattleData) ? cattleData : []);
      // ------------------------------------------
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
        healthStatus: formData.healthStatus,
        treatment: formData.treatment,
        checkupDate: formData.checkupDate,
        vetNotes: formData.vetNotes,
      };

      if (editingId) {
        await healthAPI.update(editingId, payload);
      } else {
        await healthAPI.create(payload);
      }

      resetForm();
      setEditingId(null);
      setIsOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to save health record:", error);
      alert("Xatolik! Barcha maydonlarni to'ldiring.");
    }
  };

  const resetForm = () => {
    setFormData({
      cattleId: "",
      healthStatus: "Sog'lom",
      treatment: "",
      checkupDate: new Date().toISOString().split("T")[0],
      vetNotes: "",
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      cattleId: item.cattle?.id?.toString() || "",
      healthStatus: item.healthStatus || "Sog'lom",
      treatment: item.treatment || "",
      checkupDate: item.checkupDate || "",
      vetNotes: item.vetNotes || "",
    });
    setEditingId(item.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Ushbu yozuvni o'chirmoqchimisiz?")) {
      try {
        await healthAPI.delete(id);
        loadData();
      } catch (error) {
        console.error("Failed to delete health record:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "sog'lom":
        return "text-green-600 bg-green-100 border-green-200";
      case "kasal":
        return "text-red-600 bg-red-100 border-red-200";
      case "jarohatlangan":
        return "text-orange-600 bg-orange-100 border-orange-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  return (
    <div className="flex">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Sog'liqni Saqlash
            </h1>
            <p className="text-muted-foreground">
              Mollarning tibbiy ko'rik va davolash tarixi
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
                Yangi ko'rik qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Yozuvni tahrirlash" : "Yangi tibbiy yozuv"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* MOL TANLASH (Barchasi ko'rinadi) */}
                <div>
                  <Label htmlFor="cattleId">Mol (Tag Raqam)</Label>
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
                      <option
                        key={c.id}
                        value={c.id}
                        className={
                          c.status === 0 ? "text-red-500 bg-red-50" : ""
                        } // Sotilganlar qizil rangda
                      >
                        {c.tag_number} - {c.name || "Nomsiz"}{" "}
                        {c.status === 0 ? "(Sotilgan)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="healthStatus">Sog'liq Holati</Label>
                  <Select
                    value={formData.healthStatus}
                    onValueChange={(val) =>
                      setFormData({ ...formData, healthStatus: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Holatni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sog'lom">Sog'lom</SelectItem>
                      <SelectItem value="Kasal">Kasal</SelectItem>
                      <SelectItem value="Jarohatlangan">
                        Jarohatlangan
                      </SelectItem>
                      <SelectItem value="Emlash">Emlash (Vaksina)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="checkupDate">Ko'rik Sanasi</Label>
                  <Input
                    id="checkupDate"
                    type="date"
                    required
                    value={formData.checkupDate}
                    onChange={(e) =>
                      setFormData({ ...formData, checkupDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="treatment">Davolash Usuli / Dorilar</Label>
                  <Input
                    id="treatment"
                    value={formData.treatment}
                    onChange={(e) =>
                      setFormData({ ...formData, treatment: e.target.value })
                    }
                    placeholder="Masalan: Antibiotik, Vaksina..."
                  />
                </div>

                <div>
                  <Label htmlFor="vetNotes">Veterinar Izohi</Label>
                  <Input
                    id="vetNotes"
                    value={formData.vetNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, vetNotes: e.target.value })
                    }
                    placeholder="Qo'shimcha ma'lumotlar"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Saqlash" : "Qo'shish"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Yuklanmoqda...</div>
        ) : healthRecords.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Hali hech qanday sog'liq yozuvi yo'q
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {healthRecords.map((record: any) => {
              const statusClass = getStatusColor(
                record.healthStatus || "Sog'lom",
              );

              // Molning statusini tekshirish (Agar mol o'chirilgan/sotilgan bo'lsa bildirish)
              const isCattleSold = record.cattle?.status === 0;

              return (
                <Card
                  key={record.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {record.cattle?.name || "Nomsiz"}
                          <span
                            className={`text-sm font-normal px-2 rounded ${isCattleSold ? "bg-red-100 text-red-600" : "bg-secondary text-muted-foreground"}`}
                          >
                            {record.cattle?.tag_number || `#${record.cattleId}`}
                            {isCattleSold && " (Sotilgan)"}
                          </span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <CalendarDays className="h-3 w-3" />{" "}
                          {record.checkupDate}
                        </CardDescription>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-bold border ${statusClass}`}
                      >
                        {record.healthStatus || "Sog'lom"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted/30 p-2 rounded text-sm">
                      <div className="flex gap-2 mb-1">
                        <HeartPulse className="h-4 w-4 text-red-500" />
                        <span className="font-semibold">Davolash:</span>
                      </div>
                      <p className="text-muted-foreground pl-6">
                        {record.treatment || "Davolash belgilanmagan"}
                      </p>
                    </div>

                    <div className="bg-muted/30 p-2 rounded text-sm">
                      <div className="flex gap-2 mb-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">Izoh:</span>
                      </div>
                      <p className="text-muted-foreground pl-6">
                        {record.vetNotes || "Izoh yo'q"}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Tahrirlash
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
