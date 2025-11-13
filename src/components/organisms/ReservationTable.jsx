import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import Card from "@/components/atoms/Card";
import { toast } from "react-toastify";
import reservationService from "@/services/api/reservationService";
import ApperIcon from "@/components/ApperIcon";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import Guests from "@/components/pages/Guests";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const ReservationTable = ({ statusFilter, searchQuery }) => {
const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReservation, setEditingReservation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
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

const handleStatusChange = async (reservation, newStatus) => {
    try {
      const updatedReservation = { ...reservation, status: newStatus };
      await reservationService.update(reservation.Id, updatedReservation);
      setReservations(reservations.map(r => r.Id === reservation.Id ? updatedReservation : r));
      toast.success(`Reservation status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update reservation status");
    }
  };

  const handleEdit = (reservation) => {
    setEditingReservation({ ...reservation });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await reservationService.update(editingReservation.Id, editingReservation);
      setReservations(reservations.map(r => r.Id === editingReservation.Id ? editingReservation : r));
      setShowEditModal(false);
      setEditingReservation(null);
      toast.success("Reservation updated successfully");
    } catch (err) {
      toast.error("Failed to update reservation");
    }
  };

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
    <>
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
                    {reservation?.checkIn && !isNaN(new Date(reservation.checkIn).getTime()) 
                      ? format(new Date(reservation.checkIn), "MMM dd, yyyy")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation?.checkOut && !isNaN(new Date(reservation.checkOut).getTime()) 
                      ? format(new Date(reservation.checkOut), "MMM dd, yyyy")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={reservation.status} />
                      <Select
                        value={reservation.status}
                        onChange={(e) => handleStatusChange(reservation, e.target.value)}
                        className="w-32 text-xs"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="noshow">No Show</option>
                        <option value="checkedin">Checked In</option>
                        <option value="checkedout">Checked Out</option>
                      </Select>
                    </div>
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
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(reservation)}
                      >
                        <ApperIcon name="Edit" className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
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

      {/* Edit Reservation Modal */}
      {showEditModal && editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Edit Reservation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <ApperIcon name="X" className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Name
                  </label>
                  <Input
                    value={editingReservation.guestName || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      guestName: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  <Input
                    value={editingReservation.roomNumber || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      roomNumber: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check In Date
                  </label>
                  <Input
                    type="date"
                    value={editingReservation.checkIn?.split('T')[0] || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      checkIn: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check Out Date
                  </label>
                  <Input
                    type="date"
                    value={editingReservation.checkOut?.split('T')[0] || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      checkOut: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <Input
                    type="number"
                    value={editingReservation.guests || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      guests: parseInt(e.target.value)
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingReservation.totalAmount || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      totalAmount: parseFloat(e.target.value)
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    value={editingReservation.status || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      status: e.target.value
                    })}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="noshow">No Show</option>
                    <option value="checkedin">Checked In</option>
                    <option value="checkedout">Checked Out</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact
                  </label>
                  <Input
                    value={editingReservation.contact || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      contact: e.target.value
                    })}
                  />
                </div>
              </div>

              {editingReservation.notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-150"
                    rows="3"
                    value={editingReservation.notes || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      notes: e.target.value
                    })}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ReservationTable;