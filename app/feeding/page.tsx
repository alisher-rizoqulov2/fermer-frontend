'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { SidebarNav } from '@/components/sidebar-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { feedingAPI, cattleAPI } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

export default function FeedingPage() {
  const [feedingRecords, setFeedingRecords] = useState<any[]>([]);
  const [cattle, setCattle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    cattleId: '',
    foodType: '',
    quantity: '',
    unit: '',
    date: '',
    time: '',
    notes: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feedingData, cattleData] = await Promise.all([feedingAPI.getAll(), cattleAPI.getAll()]);
      setFeedingRecords(Array.isArray(feedingData) ? feedingData : []);
      setCattle(Array.isArray(cattleData) ? cattleData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
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
        cattleId: '',
        foodType: '',
        quantity: '',
        unit: '',
        date: '',
        time: '',
        notes: '',
      });
      setEditingId(null);
      setIsOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save feeding record:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await feedingAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete feeding record:', error);
    }
  };

  return (
    <div className="flex">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Yemlanish</h1>
            <p className="text-muted-foreground">Mollaringizni yemlantirishinggizni rejalashtiring</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setFormData({
                    cattleId: '',
                    foodType: '',
                    quantity: '',
                    unit: '',
                    date: '',
                    time: '',
                    notes: '',
                  });
                  setEditingId(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Yemlanish yozuvi qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi yemlanish yozuvi</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cattleId">Mol</Label>
                  <select
                    id="cattleId"
                    value={formData.cattleId}
                    onChange={(e) => setFormData({ ...formData, cattleId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Molni tanlang</option>
                    {cattle.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name || `Mol #${c.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="foodType">Oziq turi</Label>
                  <Input
                    id="foodType"
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                    placeholder="Donlik, pichandahar, o't va h.k."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Miqdori</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Birlik</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="kg, l, dona va h.k."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Sana</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Vaqt</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Izohlar</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Qo'shimcha ma'lumot"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Qo'shish
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Yuklanmoqda...</div>
        ) : feedingRecords.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Hali hech qanday yemlanish yozuvi yo'q</p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Mol</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Oziq turi</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Miqdori</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Sana</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Vaqt</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Izohlar</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {feedingRecords.map((record: any) => {
                    const cattleName = cattle.find((c: any) => c.id === record.cattleId)?.name || `Mol #${record.cattleId}`;
                    return (
                      <tr key={record.id} className="border-b hover:bg-muted/30">
                        <td className="px-6 py-4 text-sm">{cattleName}</td>
                        <td className="px-6 py-4 text-sm">{record.foodType || '---'}</td>
                        <td className="px-6 py-4 text-sm">
                          {record.quantity} {record.unit}
                        </td>
                        <td className="px-6 py-4 text-sm">{record.date || '---'}</td>
                        <td className="px-6 py-4 text-sm">{record.time || '---'}</td>
                        <td className="px-6 py-4 text-sm">{record.notes || '---'}</td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
