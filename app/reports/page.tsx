"use client";

import { useEffect, useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cattleAPI, expensesAPI, healthAPI } from "@/lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Beef,
  Activity,
  Calendar,
} from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);

  // STATISTIKA STATE
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
  });

  // GRAFIK STATE
  const [monthlyFinancials, setMonthlyFinancials] = useState<any[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [cattleProfitability, setCattleProfitability] = useState<any[]>([]);
  const [healthStats, setHealthStats] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const [cattle, expenses, health] = await Promise.all([
        cattleAPI.getAll(),
        expensesAPI.getAll(),
        healthAPI.getAll(),
      ]);

      const cattleList = Array.isArray(cattle) ? cattle : [];
      const expenseList = Array.isArray(expenses) ? expenses : [];
      const healthList = Array.isArray(health) ? health : [];

      // 1. UMUMIY MOLIYA (KPI)
      const totalExpenses = expenseList.reduce(
        (sum: number, e: any) => sum + (Number(e.amount) || 0),
        0,
      );

      const totalIncome = cattleList
        .filter((c: any) => c.status === 0)
        .reduce((sum: number, c: any) => sum + (Number(c.sale_price) || 0), 0);

      const netProfit = totalIncome - totalExpenses;
      const profitMargin =
        totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

      setStats({
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: Number(profitMargin),
      });

      // 2. OYLIK MOLIYA (Bar/Line Chart uchun)
      const monthlyData: any = {};

      // Xarajatlarni oyga bo'lish
      expenseList.forEach((e: any) => {
        const month = new Date(e.date).toLocaleString("uz-UZ", {
          month: "short",
        });
        if (!monthlyData[month])
          monthlyData[month] = {
            name: month,
            income: 0,
            expense: 0,
            profit: 0,
          };
        monthlyData[month].expense += Number(e.amount);
        monthlyData[month].profit -= Number(e.amount);
      });

      // Daromadni oyga bo'lish (Sotilgan sanasi bo'yicha - agar date bo'lsa, yo'qsa updated_at)
      cattleList
        .filter((c: any) => c.status === 0)
        .forEach((c: any) => {
          // Agar sotilgan sana bo'lmasa, hozirgi oyga yozamiz (Demo uchun)
          const dateStr = c.updated_at || new Date().toISOString();
          const month = new Date(dateStr).toLocaleString("uz-UZ", {
            month: "short",
          });

          if (!monthlyData[month])
            monthlyData[month] = {
              name: month,
              income: 0,
              expense: 0,
              profit: 0,
            };
          monthlyData[month].income += Number(c.sale_price);
          monthlyData[month].profit += Number(c.sale_price);
        });

      // Oylarni tartiblash va arrayga o'tkazish
      const sortedMonthly = Object.values(monthlyData);
      setMonthlyFinancials(sortedMonthly);

      // 3. XARAJATLAR KATEGORIYASI (Pie Chart)
      const expCat = expenseList.reduce((acc: any, e: any) => {
        const cat = e.expenseType || "Boshqa";
        acc[cat] = (acc[cat] || 0) + Number(e.amount);
        return acc;
      }, {});
      setExpensesByCategory(
        Object.entries(expCat).map(([name, value]) => ({ name, value })),
      );

      // 4. MOLLAR SAMARADORLIGI (Top Profit/Loss)
      const cattleProfits = cattleList
        .map((c: any) => {
          const soldPrice = c.status === 0 ? Number(c.sale_price) || 0 : 0;
          const buyPrice = Number(c.purchase_price) || 0;
          const feedCost = Number(c.feed_cost) || 0;
          const otherExp = Array.isArray(c.expenses)
            ? c.expenses.reduce((s: number, x: any) => s + Number(x.amount), 0)
            : 0;

          const totalCost = buyPrice + feedCost + otherExp;
          const profit = soldPrice - totalCost;

          return {
            id: c.tag_number || c.id,
            name: c.name || "Nomsiz",
            status: c.status === 0 ? "Sotilgan" : "Aktiv",
            profit: profit,
            revenue: soldPrice,
            cost: totalCost,
          };
        })
        .sort((a: any, b: any) => b.profit - a.profit); // Eng foydalilar tepada

      setCattleProfitability(cattleProfits);

      // 5. SOG'LIQ STATISTIKASI
      const healthStatsObj = healthList.reduce((acc: any, h: any) => {
        const status = h.healthStatus || "Noma'lum";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      setHealthStats(
        Object.entries(healthStatsObj).map(([name, value]) => ({
          name,
          value,
        })),
      );

      setLoading(false);
    } catch (error) {
      console.error("Failed to load report data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-muted/10 min-h-screen">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Analitika va Hisobotlar
          </h1>
          <p className="text-muted-foreground">
            Fermaning to'liq moliyaviy va ishlab chiqarish tahlili
          </p>
        </div>

        {/* --- KPI KARTALARI --- */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami Tushum</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalIncome.toLocaleString()} so'm
              </div>
              <p className="text-xs text-muted-foreground">
                Sotuvlardan tushgan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jami Xarajat
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalExpenses.toLocaleString()} so'm
              </div>
              <p className="text-xs text-muted-foreground">
                Barcha turdagi chiqimlar
              </p>
            </CardContent>
          </Card>

          <Card
            className={
              stats.netProfit >= 0
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Sof Foyda
              </CardTitle>
              <DollarSign
                className={`h-4 w-4 ${stats.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${stats.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}
              >
                {stats.netProfit.toLocaleString()} so'm
              </div>
              <p className="text-xs text-muted-foreground">Tushum - Xarajat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Foydalilik darajasi
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profitMargin}%</div>
              <p className="text-xs text-muted-foreground">
                Margin (Foyda / Tushum)
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">Hisobot yuklanmoqda...</div>
        ) : (
          <Tabs defaultValue="financial" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="financial">Moliyaviy Tahlil</TabsTrigger>
              <TabsTrigger value="cattle">Mollar Samaradorligi</TabsTrigger>
              <TabsTrigger value="health">Sog'liq va Resurslar</TabsTrigger>
            </TabsList>

            {/* --- 1. MOLIYAVIY TAHLIL --- */}
            <TabsContent value="financial" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Oylik Dinamika */}
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Oylik Moliyaviy Dinamika</CardTitle>
                    <CardDescription>
                      Daromad va Xarajatlar taqqoslami
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={monthlyFinancials}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) =>
                            `${value.toLocaleString()} so'm`
                          }
                        />
                        <Legend />
                        <Bar
                          dataKey="income"
                          name="Daromad"
                          fill="#4ade80"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="expense"
                          name="Xarajat"
                          fill="#f87171"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Xarajatlar Strukturasi */}
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Xarajatlar Strukturasi</CardTitle>
                    <CardDescription>
                      Pullar nimalarga sarflanmoqda?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) =>
                            `${value.toLocaleString()} so'm`
                          }
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* --- 2. MOLLAR SAMARADORLIGI --- */}
            <TabsContent value="cattle" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mollar Rentabelligi (Foyda/Zarar)</CardTitle>
                  <CardDescription>
                    Har bir mol bo'yicha aniq hisob-kitob (Sotilganlar va
                    Aktivlar)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                        <tr>
                          <th className="px-4 py-3">Tag Raqam</th>
                          <th className="px-4 py-3">Nom</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Jami Xarajat</th>
                          <th className="px-4 py-3 text-right">Sotuv Narxi</th>
                          <th className="px-4 py-3 text-right">Sof Foyda</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cattleProfitability.map((item, i) => (
                          <tr key={i} className="border-b hover:bg-muted/20">
                            <td className="px-4 py-3 font-medium">{item.id}</td>
                            <td className="px-4 py-3">{item.name}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold ${item.status === "Sotilgan" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-red-600 font-medium">
                              -{item.cost.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-green-600 font-medium">
                              {item.revenue > 0
                                ? `+${item.revenue.toLocaleString()}`
                                : "-"}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-bold ${item.profit >= 0 ? "text-green-700" : "text-red-700"}`}
                            >
                              {item.profit.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- 3. SOG'LIQ STATISTIKASI --- */}
            <TabsContent value="health" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sog'liq Holati Bo'yicha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={healthStats}
                        layout="vertical"
                        margin={{ left: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar
                          dataKey="value"
                          fill="#8884d8"
                          barSize={30}
                          radius={[0, 4, 4, 0]}
                        >
                          {healthStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Xulosa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-800">
                          Umumiy Holat
                        </h4>
                        <p className="text-sm text-blue-600 mt-1">
                          Fermada{" "}
                          {healthStats.length > 0
                            ? "kasalliklar nazorati yaxshi yo'lga qo'yilgan."
                            : "hozircha kasalliklar qayd etilmagan."}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="font-semibold text-green-800">
                          Moliyaviy Tavsiya
                        </h4>
                        <p className="text-sm text-green-600 mt-1">
                          {stats.profitMargin > 20
                            ? "Rentabellik juda yaxshi (20%+). Ayni strategiyani davom ettiring."
                            : "Rentabellikni oshirish uchun yem xarajatlarini optimallashtirishni ko'rib chiqing."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
