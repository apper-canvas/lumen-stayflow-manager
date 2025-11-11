import { useState, useEffect } from "react";
import DashboardStats from "@/components/organisms/DashboardStats";
import RoomCard from "@/components/molecules/RoomCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import ApperIcon from "@/components/ApperIcon";
import roomService from "@/services/api/roomService";
import reservationService from "@/services/api/reservationService";
import housekeepingService from "@/services/api/housekeepingService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Dashboard = () => {
  const [recentRooms, setRecentRooms] = useState([]);
  const [todayArrivals, setTodayArrivals] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [rooms, reservations, tasks] = await Promise.all([
        roomService.getAll(),
        reservationService.getAll(),
        housekeepingService.getAll()
      ]);

      // Get recent room updates (first 6 rooms)
      setRecentRooms(rooms.slice(0, 6));

      // Get today's arrivals (reservations with check-in today)
      const today = new Date().toISOString().split("T")[0];
      const arrivals = reservations.filter(r => 
        r.checkIn.startsWith(today) && r.status === "confirmed"
      ).slice(0, 5);
      setTodayArrivals(arrivals);

      // Get pending housekeeping tasks
      const pending = tasks.filter(t => t.status === "todo" || t.status === "inprogress").slice(0, 5);
      setPendingTasks(pending);

    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      const room = recentRooms.find(r => r.Id === roomId);
      if (!room) return;

      const updatedRoom = { ...room, status: newStatus };
      await roomService.update(roomId, updatedRoom);
      
      setRecentRooms(recentRooms.map(r => r.Id === roomId ? updatedRoom : r));
      toast.success(`Room ${room.number} status updated`);
    } catch (err) {
      toast.error("Failed to update room status");
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadDashboardData} />;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your hotel today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <ApperIcon name="Download" className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Room Status Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="Bed" className="h-5 w-5" />
                Room Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentRooms.map((room) => (
                  <RoomCard
                    key={room.Id}
                    room={room}
                    onStatusChange={handleRoomStatusChange}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Arrivals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="Calendar" className="h-5 w-5" />
                Today's Arrivals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayArrivals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="CalendarX" className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No arrivals scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayArrivals.map((arrival) => (
                    <div key={arrival.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-full p-2">
                          <ApperIcon name="User" className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{arrival.guestName}</p>
                          <p className="text-sm text-gray-500">Room {arrival.roomNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={arrival.status} />
                        <p className="text-sm text-gray-500 mt-1">
                          {arrival.adults + arrival.children} guests
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="Zap" className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
                New Check-in
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ApperIcon name="UserMinus" className="h-4 w-4 mr-2" />
                Process Check-out
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                Add Reservation
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ApperIcon name="DollarSign" className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="CheckSquare" className="h-5 w-5" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <ApperIcon name="CheckCircle" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All tasks completed!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div key={task.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{task.taskType}</p>
                        <p className="text-sm text-gray-500">Room {task.roomNumber}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="TrendingUp" className="h-5 w-5" />
                Today's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    $2,450
                  </div>
                  <div className="text-sm text-gray-500">
                    +12% from yesterday
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Revenue</span>
                    <span className="font-medium">$1,890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Revenue</span>
                    <span className="font-medium">$560</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>$2,450</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;