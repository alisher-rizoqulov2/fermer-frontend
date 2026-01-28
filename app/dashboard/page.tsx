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
import { cattleAPI, walletAPI, expensesAPI, healthAPI } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Beef,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCattle: 0,
    activeCattle: 0,
    soldCattle: 0,
    totalExpenses: 0, // Umuman hamma xarajatlar (cash flow uchun)
    totalIncome: 0,
    netProfit: 0, // Haqiqiy sof foyda
    walletBalance: 0,
    healthRecords: 0,
  });

  const [expenseChartData, setExpenseChartData] = useState<any[]>([]);
  const [cattleTypeData, setCattleTypeData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [cattle, wallet, expenses, health] = await Promise.all([
        cattleAPI.getAll(),
        walletAPI.getAll(),
        expensesAPI.getAll(),
        healthAPI.getAll(),
      ]);

      const cattleList = Array.isArray(cattle) ? cattle : [];
      const expenseList = Array.isArray(expenses) ? expenses : [];
      const walletList = Array.isArray(wallet) ? wallet : [];
      const healthList = Array.isArray(health) ? health : [];

      // 1. Umumiy Xarajatlar (Fermadan chiqib ketgan hamma pul)
      const totalGlobalExpenses = expenseList.reduce(
        (sum: number, e: any) => sum + (Number(e.amount) || 0),
        0,
      );

      // 2. Daromad (Faqat sotilgan mollardan tushgan pul)
      const totalIncome = cattleList
        .filter((c: any) => c.status === 0)
        .reduce((sum: number, c: any) => sum + (Number(c.sale_price) || 0), 0);

      // --- MUHIM: SOF FOYDA HISOBLASH ---
      // Faqat SOTILGAN (status === 0) mollar bo'yicha foyda hisoblaymiz
      const netProfit = cattleList
        .filter((c: any) => c.status === 0) // Faqat sotilganlarni olamiz
        .reduce((profit: number, cow: any) => {
          const soldPrice = Number(cow.sale_price) || 0; // Sotilgan narxi
          const buyPrice = Number(cow.purchase_price) || 0; // Olingan narxi

          // Shu molga tegishli xarajatlarni yig'amiz
          // Backendda relations: ['expenses'] borligi uchun cow.expenses mavjud
          const cowSpecificExpenses = Array.isArray(cow.expenses)
            ? cow.expenses.reduce(
                (s: number, e: any) => s + (Number(e.amount) || 0),
                0,
              )
            : 0;

          // Foyda = Sotuv - (Olish narxi + Xarajatlar)
          const cowProfit = soldPrice - (buyPrice + cowSpecificExpenses);

          return profit + cowProfit;
        }, 0);
      // ----------------------------------

      const activeCattle = cattleList.filter((c: any) => c.status === 1).length;
      const soldCattle = cattleList.filter((c: any) => c.status === 0).length;

      setStats({
        totalCattle: cattleList.length,
        activeCattle,
        soldCattle,
        totalExpenses: totalGlobalExpenses,
        totalIncome,
        netProfit: netProfit, // Yangilangan hisob-kitob
        walletBalance: walletList.reduce(
          (sum: number, w: any) => sum + (Number(w.balance) || 0),
          0,
        ),
        healthRecords: healthList.length,
      });

      // Xarajatlar Chart
      const expensesByCategory = expenseList.reduce((acc: any, curr: any) => {
        const type = curr.expenseType || "Boshqa";
        acc[type] = (acc[type] || 0) + Number(curr.amount);
        return acc;
      }, {});

      const chartDataExp = Object.entries(expensesByCategory)
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort((a: any, b: any) => b.value - a.value);
      setExpenseChartData(chartDataExp);

      // Mollar Turi Chart
      const typeCount = cattleList
        .filter((c: any) => c.status === 1)
        .reduce((acc: any, c: any) => {
          const type = c.type || "Noma'lum";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
      setCattleTypeData(
        Object.entries(typeCount).map(([name, value]) => ({ name, value })),
      );

      // Recent Activity
      const recentCattle = cattleList.slice(-3).map((c: any) => ({
        type: "cattle",
        name: c.name || c.tag_number,
        date: c.purchase_date,
        amount: c.purchase_price,
        status: "new",
      }));

      const recentExp = expenseList.slice(-3).map((e: any) => ({
        type: "expense",
        name: e.expenseType,
        date: e.date,
        amount: e.amount,
        status: "out",
      }));

      setRecentActivities(
        [...recentCattle, ...recentExp]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 5),
      );
      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-muted/10 min-h-screen">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Ferma Statistikasi
            </h1>
            <p className="text-muted-foreground mt-1">
              Bugungi kungi fermangizning moliyaviy va ishlab chiqarish holati.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            {/* <span className="text-sm font-medium">
              {new Date().toLocaleDateString("uz-UZ", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span> */}
          </div>
        </div>

        {/* --- KPI KARTALAR --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jami Mollar
              </CardTitle>
              <Beef className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCattle} ta</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-green-600 font-medium">
                  {stats.activeCattle} aktiv
                </span>{" "}
                /
                <span className="text-orange-600 font-medium">
                  {stats.soldCattle} sotilgan
                </span>
              </p>
            </CardContent>
          </Card>

          {/* SOF FOYDA KARTASI */}
          <Card
            className={`border-l-4 shadow-sm hover:shadow-md transition-all ${stats.netProfit >= 0 ? "border-l-green-500" : "border-l-red-500"}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sof Foyda (Sotilganlardan)
              </CardTitle>
              {stats.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${stats.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stats.netProfit.toLocaleString()} so'm
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sotuv - (Olish narxi + Xarajatlar)
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-400 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jami Chiqim (Cash Flow)
              </CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalExpenses.toLocaleString()} so'm
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fermadan chiqqan jami pullar
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-400 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jami Tushum
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalIncome.toLocaleString()} so'm
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sotilgan mollar hisobidan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* GRAFIKLAR */}
        <div className="grid gap-4 md:grid-cols-7 mb-8">
          <Card className="col-span-4 shadow-sm">
            <CardHeader>
              <CardTitle>Xarajatlar Tahlili</CardTitle>
              <CardDescription>
                Kategoriyalar bo'yicha pullar qayerga sarflanmoqda?
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {expenseChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={expenseChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toLocaleString()} so'm`,
                        "Summa",
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      fill="#f87171"
                      radius={[0, 4, 4, 0]}
                      barSize={30}
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#ef4444" : "#fca5a5"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Ma'lumot yo'q
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3 shadow-sm">
            <CardHeader>
              <CardTitle>Mollar Tarkibi</CardTitle>
              <CardDescription>Fermadagi mavjud mollar turlari</CardDescription>
            </CardHeader>
            <CardContent>
              {cattleTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={cattleTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {cattleTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Ma'lumot yo'q
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* INFO PANELS */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle>So'nggi Faoliyatlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivities.length > 0 ? (
                  recentActivities.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${item.type === "cattle" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}
                        >
                          {item.type === "cattle" ? (
                            <Beef className="h-4 w-4" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {item.type === "cattle" ? "Yangi mol" : "Xarajat"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${item.type === "cattle" ? "text-blue-600" : "text-red-600"}`}
                        >
                          {item.type === "cattle" ? "+" : "-"}
                          {Number(item.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.date}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Hali hech narsa yo'q
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 grid-rows-2">
            <Card className="bg-slate-900 text-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Hamyon Balansi
                </CardTitle>
                <Wallet className="h-4 w-4 text-slate-300" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.walletBalance.toLocaleString()} so'm
                </div>
                <p className="text-xs text-slate-400 mt-2">Mavjud naqd pul</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sog'liqni saqlash
                </CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {stats.healthRecords}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ta yozuv
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
