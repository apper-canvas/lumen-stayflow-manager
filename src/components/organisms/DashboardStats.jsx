import { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import { getRoomStats, getReservationStats } from "@/services/api/dashboardService";

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [roomStats, reservationStats] = await Promise.all([
        getRoomStats(),
        getReservationStats()
      ]);

      setStats({
        ...roomStats,
        ...reservationStats
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <Loading type="skeleton" className="h-32" />;
  if (error) return <ErrorView message={error} onRetry={loadStats} />;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Rooms"
        value={stats.totalRooms}
        icon="Building"
        color="primary"
        change={`${stats.occupancyRate}% occupied`}
        gradient
      />
      <StatCard
        title="Available"
        value={stats.availableRooms}
        icon="CheckCircle"
        color="success"
        change="Ready for guests"
        gradient
      />
      <StatCard
        title="Occupied"
        value={stats.occupiedRooms}
        icon="Users"
        color="info"
        change="Currently checked in"
        gradient
      />
      <StatCard
        title="Revenue Today"
        value={`$${stats.todayRevenue?.toLocaleString() || 0}`}
        icon="DollarSign"
        color="primary"
        change={`${stats.checkInsToday} check-ins today`}
        gradient
      />
    </div>
  );
};

export default DashboardStats;