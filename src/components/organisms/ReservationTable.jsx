import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/atoms/Card";
import { toast } from "react-toastify";
import reservationService from "@/services/api/reservationService";
import guestService from "@/services/api/guestService";
import roomService from "@/services/api/roomService";
import ApperIcon from "@/components/ApperIcon";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import Guests from "@/components/pages/Guests";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
const ReservationTable = ({ statusFilter, searchQuery }) => {
const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReservation, setEditingReservation] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);
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

  const handlePaymentStatusChange = async (reservationId, newStatus) => {
    try {
      const reservation = reservations.find(r => r.Id === reservationId);
      const updatedReservation = { ...reservation, paymentStatus: newStatus };
      await reservationService.update(reservationId, updatedReservation);
      setReservations(reservations.map(r => 
        r.Id === reservationId ? updatedReservation : r
      ));
      toast.success("Payment status updated successfully");
    } catch (err) {
      toast.error("Failed to update payment status");
    }
  };

const handleEdit = async (reservation) => {
    try {
      // Fetch the latest reservation data to ensure we have current status values
      const latestReservation = await reservationService.getById(reservation.Id);
      setEditingReservation({ ...latestReservation });
      setShowEditModal(true);
    } catch (error) {
      toast.error('Failed to load reservation details');
      console.error('Error fetching latest reservation:', error);
    }
  };

const handleSaveEdit = async () => {
    try {
const updatedReservation = {
        ...editingReservation
      };
      
      await reservationService.update(editingReservation.Id, updatedReservation);
      setReservations(reservations.map(r => r.Id === editingReservation.Id ? updatedReservation : r));
      setShowEditModal(false);
      setEditingReservation(null);
      toast.success("Reservation updated successfully");
    } catch (err) {
      toast.error("Failed to update reservation");
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
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
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
                        <option value="confirmed">
                          <div className="flex items-center gap-2">
                            <StatusBadge status="confirmed" />
                            <span>Confirmed</span>
                          </div>
                        </option>
                        <option value="pending">
                          <div className="flex items-center gap-2">
                            <StatusBadge status="pending" />
                            <span>Pending</span>
                          </div>
                        </option>
                        <option value="cancelled">
                          <div className="flex items-center gap-2">
                            <StatusBadge status="cancelled" />
                            <span>Cancelled</span>
                          </div>
                        </option>
                        <option value="noshow">
                          <div className="flex items-center gap-2">
                            <StatusBadge status="noshow" />
                            <span>No Show</span>
                          </div>
                        </option>
                        <option value="checkedin">
                          <div className="flex items-center gap-2">
                            <StatusBadge status="checkedin" />
                            <span>Checked In</span>
                          </div>
                        </option>
                        <option value="checkedout">
                          <div className="flex items-center gap-2">
                            <StatusBadge status="checkedout" />
                            <span>Checked Out</span>
                          </div>
                        </option>
                      </Select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Select
                      value={reservation.paymentStatus}
                      onChange={(value) => handlePaymentStatusChange(reservation.Id, value)}
                      className="min-w-[140px]"
                    >
                      <option value="paid">
                        <div className="flex items-center gap-2">
                          <StatusBadge status="paid" />
                          <span>Paid</span>
                        </div>
                      </option>
                      <option value="partial">
                        <div className="flex items-center gap-2">
                          <StatusBadge status="partial" />
                          <span>Partial Payment</span>
                        </div>
                      </option>
                      <option value="unpaid">
                        <div className="flex items-center gap-2">
                          <StatusBadge status="unpaid" />
                          <span>Unpaid</span>
                        </div>
                      </option>
                    </Select>
                  </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    ${reservation.totalAmount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
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
                    Payment Status
                  </label>
                  <Select
                    value={editingReservation.paymentStatus || ''}
                    onChange={(e) => setEditingReservation({
                      ...editingReservation,
                      paymentStatus: e.target.value
                    })}
                    className="min-w-[140px]"
                  >
                    <option value="paid">
                      <div className="flex items-center gap-2">
                        <StatusBadge status="paid" />
                        <span>Paid</span>
                      </div>
                    </option>
                    <option value="partial">
                      <div className="flex items-center gap-2">
                        <StatusBadge status="partial" />
                        <span>Partial Payment</span>
                      </div>
                    </option>
                    <option value="unpaid">
                      <div className="flex items-center gap-2">
                        <StatusBadge status="unpaid" />
                        <span>Unpaid</span>
                      </div>
                    </option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  {lookupsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading rooms...</span>
                    </div>
                  ) : (
                    <Select
                      value={editingReservation.roomId || ''}
                      onChange={(e) => setEditingReservation({
                        ...editingReservation,
                        roomId: e.target.value
                      })}
                    >
                      <option value="">Select a room</option>
                      {rooms.map(room => (
                        <option key={room.Id} value={room.Id}>
                          {room.number} ({room.type})
                        </option>
                      ))}
                    </Select>
                  )}
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
                    <option value="confirmed">
                      <div className="flex items-center gap-2">
                        <StatusBadge status="confirmed" />
                        <span>Confirmed</span>
                      </div>
                    </option>
                    <option value="pending">
                      <div className="flex items-center gap-2">
                        <StatusBadge status="pending" />
                        <span>Pending</span>
                      </div>
                    </option>
                    <option value="cancelled">
                      <div className="flex items-center gap-2">
                        <StatusBadge status="cancelled" />
                        <span>Cancelled</span>
                      </div>
                    </option>
                    <option value="noshow">
                      <div className="flex items-center gap-2">
                        <StatusBadge status="noshow" />
                        <span>No Show</span>
                      </div>
                    </option>
                    <option value="checkedin">
                      <div className="flex items-center gap-2">
                        <StatusBadge status="checkedin" />
                        <span>Checked In</span>
                      </div>
                    </option>
                    <option value="checkedout">
                      <div className="flex items-center gap-2">
                        <StatusBadge status="checkedout" />
                        <span>Checked Out</span>
                      </div>
                    </option>
</Select>
                </div>
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