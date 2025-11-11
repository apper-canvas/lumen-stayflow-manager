import { useState, useEffect } from "react";
import { format } from "date-fns";
import Button from "@/components/atoms/Button";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import reservationService from "@/services/api/reservationService";
import { toast } from "react-toastify";

const ReservationTable = ({ statusFilter, searchQuery }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await reservationService.getAll();
      setReservations(data);
    } catch (err) {
      setError(err.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCheckIn = async (reservation) => {
    try {
      const updatedReservation = { ...reservation, status: "checkedin" };
      await reservationService.update(reservation.Id, updatedReservation);
      setReservations(reservations.map(r => r.Id === reservation.Id ? updatedReservation : r));
      toast.success(`Guest ${reservation.guestName} checked in successfully`);
    } catch (err) {
      toast.error("Failed to check in guest");
    }
  };

  const handleCheckOut = async (reservation) => {
    try {
      const updatedReservation = { ...reservation, status: "checkedout" };
      await reservationService.update(reservation.Id, updatedReservation);
      setReservations(reservations.map(r => r.Id === reservation.Id ? updatedReservation : r));
      toast.success(`Guest ${reservation.guestName} checked out successfully`);
    } catch (err) {
      toast.error("Failed to check out guest");
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadReservations} />;

  // Filter reservations
  let filteredReservations = reservations;
  if (statusFilter !== "all") {
    filteredReservations = filteredReservations.filter(r => r.status === statusFilter);
  }
  if (searchQuery) {
    filteredReservations = filteredReservations.filter(r => 
      r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (filteredReservations.length === 0) {
    return (
      <Empty
        title="No reservations found"
        description="No reservations match the current filters."
        icon="Calendar"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.map((reservation) => (
              <tr key={reservation.Id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-primary/10 rounded-full p-2 mr-3">
                      <ApperIcon name="User" className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.guestName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.adults} adults, {reservation.children} children
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Room {reservation.roomNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reservation.roomType}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(reservation.checkIn), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(reservation.checkOut), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={reservation.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {reservation.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(reservation)}
                      >
                        <ApperIcon name="LogIn" className="h-3 w-3 mr-1" />
                        Check In
                      </Button>
                    )}
                    {reservation.status === "checkedin" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCheckOut(reservation)}
                      >
                        <ApperIcon name="LogOut" className="h-3 w-3 mr-1" />
                        Check Out
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <ApperIcon name="Eye" className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationTable;