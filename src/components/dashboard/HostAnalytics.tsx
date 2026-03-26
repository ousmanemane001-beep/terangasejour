import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, Calendar, Percent, BedDouble } from "lucide-react";
import { useOwnerBookings, useOwnerListings } from "@/hooks/useOwnerData";
import { useTranslation } from "react-i18next";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, differenceInDays } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(0 84% 60%)",
];

const HostAnalytics = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? enUS : fr;
  const { data: bookings } = useOwnerBookings();
  const { data: listings } = useOwnerListings();

  const analytics = useMemo(() => {
    if (!bookings || !listings) return null;

    const now = new Date();
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const pending = bookings.filter((b) => b.status === "pending");

    // Monthly revenue (last 6 months)
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const monthBookings = confirmed.filter((b) =>
        isWithinInterval(new Date(b.created_at), { start, end })
      );
      return {
        month: format(monthDate, "MMM", { locale }),
        revenue: monthBookings.reduce((s, b) => s + b.total_price, 0),
        count: monthBookings.length,
      };
    });

    // Booking status distribution
    const statusCounts = bookings.reduce(
      (acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Revenue by listing
    const listingRevenue = listings.map((l) => {
      const rev = confirmed
        .filter((b) => b.listing_id === l.id)
        .reduce((s, b) => s + b.total_price, 0);
      return { name: l.title.slice(0, 20), revenue: rev };
    }).filter((l) => l.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Occupancy rate (last 30 days)
    const publishedListings = listings.filter((l) => l.status === "published");
    const totalDays = publishedListings.length * 30;
    const bookedDays = confirmed.reduce((sum, b) => {
      const ci = new Date(b.check_in);
      const co = new Date(b.check_out);
      const daysAgo30 = subMonths(now, 1);
      if (co >= daysAgo30 && ci <= now) {
        const effectiveStart = ci < daysAgo30 ? daysAgo30 : ci;
        const effectiveEnd = co > now ? now : co;
        return sum + Math.max(0, differenceInDays(effectiveEnd, effectiveStart));
      }
      return sum;
    }, 0);
    const occupancyRate = totalDays > 0 ? Math.round((bookedDays / totalDays) * 100) : 0;

    // Average stay duration
    const avgStay = confirmed.length > 0
      ? (confirmed.reduce((s, b) => s + b.nights, 0) / confirmed.length).toFixed(1)
      : "0";

    // Month-over-month growth
    const thisMonthRev = monthlyRevenue[5]?.revenue || 0;
    const lastMonthRev = monthlyRevenue[4]?.revenue || 0;
    const growth = lastMonthRev > 0 ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100) : 0;

    return {
      monthlyRevenue,
      statusData,
      listingRevenue,
      occupancyRate,
      avgStay,
      totalConfirmed: confirmed.length,
      totalPending: pending.length,
      totalRevenue: confirmed.reduce((s, b) => s + b.total_price, 0),
      growth,
    };
  }, [bookings, listings, locale]);

  if (!analytics) return null;

  const kpis = [
    {
      label: t("analytics.occupancyRate"),
      value: `${analytics.occupancyRate}%`,
      icon: Percent,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: t("analytics.avgStay"),
      value: `${analytics.avgStay} ${t("dashboard.nights")}`,
      icon: BedDouble,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: t("analytics.totalGuests"),
      value: String(analytics.totalConfirmed),
      icon: Users,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      label: t("analytics.pendingBookings"),
      value: String(analytics.totalPending),
      icon: Calendar,
      color: "bg-primary/10 text-primary",
    },
  ];

  const revenueChartConfig = {
    revenue: { label: t("analytics.revenue"), color: "hsl(var(--primary))" },
  };
  const bookingsChartConfig = {
    count: { label: t("analytics.bookings"), color: "hsl(var(--accent))" },
  };

  const statusLabels: Record<string, string> = {
    confirmed: t("dashboard.confirmed"),
    pending: t("dashboard.pending"),
    cancelled: t("dashboard.cancelled"),
    expired: t("analytics.expired"),
  };

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-none shadow-[var(--shadow-card)]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.color)}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="font-display text-2xl font-bold text-foreground leading-none mb-1">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue trend + Growth */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-none shadow-[var(--shadow-card)] md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">{t("analytics.revenueTrend")}</CardTitle>
            <div className={cn("flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full",
              analytics.growth >= 0 ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
            )}>
              {analytics.growth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {analytics.growth > 0 ? "+" : ""}{analytics.growth}%
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[260px] w-full">
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${Number(value).toLocaleString("fr-FR")} F`} />} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("analytics.bookingStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {analytics.statusData.length > 0 ? (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={analytics.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {analytics.statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {analytics.statusData.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{statusLabels[s.name] || s.name} ({s.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t("analytics.noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bookings per month + Revenue by listing */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("analytics.bookingsPerMonth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={bookingsChartConfig} className="h-[220px] w-full">
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("analytics.revenueByListing")}</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.listingRevenue.length > 0 ? (
              <div className="space-y-3">
                {analytics.listingRevenue.map((l, i) => {
                  const maxRev = analytics.listingRevenue[0]?.revenue || 1;
                  const pct = Math.round((l.revenue / maxRev) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-medium truncate mr-2">{l.name}</span>
                        <span className="text-muted-foreground shrink-0">{l.revenue.toLocaleString("fr-FR")} F</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">{t("analytics.noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostAnalytics;
