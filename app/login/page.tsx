"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { setAuthToken } from "@/lib/api";
import { AlertCircle, Tractor } from "lucide-react";

// API manzilini .env dan yoki to'g'ridan-to'g'ri olamiz
// Agar api.ts da API_BASE_URL bor bo'lsa, o'shandan foydalangan ma'qul.
// Lekin login uchun alohida fetch yozilgani uchun, bu yerda ham dinamik qilamiz.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://54.178.217.232:3000/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API manzilini to'g'irladik
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Login xato: Email yoki parol noto'g'ri",
        );
      }

      const data = await response.json();
      setAuthToken(data.accessToken || data.token);

      // Muvaffaqiyatli kirgandan so'ng Dashboardga yo'naltirish
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Tizimga kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Kartani telefonda to'liq ekran, kompyuterda ixcham qilamiz */}
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
            <Tractor className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Fermer Pro
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Boshqaruv tizimiga xush kelibsiz
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700 font-medium">
                  {error}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email manzil</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ferma.uz"
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Parol</Label>
                {/* <a href="#" className="text-xs text-blue-600 hover:underline">Parolni unutdingizmi?</a> */}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium mt-6 bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kirish...
                </div>
              ) : (
                "Tizimga kirish"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Muammo bo'lsa texnik yordamga murojaat qiling
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
