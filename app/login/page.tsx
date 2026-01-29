"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAuthToken } from "@/lib/api";
import { AlertCircle, Tractor } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://54.178.217.232/api";

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
      const token = data.accessToken || data.token;

      // 1. Tokenni saqlash (Axios va Storage uchun)
      setAuthToken(token);
      localStorage.setItem("accessToken", token); // Ehtiyot shart

      // ---------------------------------------------------------
      // 🔥 MUHIM O'ZGARISH: Token ichidan Userni olib saqlash
      // ---------------------------------------------------------
      if (token) {
        try {
          // Tokenni decode qilish (sodda usulda)
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            window
              .atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join(""),
          );

          const userObj = JSON.parse(jsonPayload);

          // Userni localStoragega yozamiz!
          localStorage.setItem("user", JSON.stringify(userObj));

          console.log("User saqlandi:", userObj); // Tekshirish uchun
        } catch (err) {
          console.error("Tokenni o'qishda xato:", err);
        }
      }
      // ---------------------------------------------------------

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Tizimga kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
              Muammo bo'lsa texnik yordamga murojaat qiling +998947827771 --SuperAdmin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
