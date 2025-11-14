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
  
  // Search states for edit modal dropdowns
  const [guestSearch, setGuestSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowGuestDropdown(false);
        setShowRoomDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter guests based on search
  const filteredGuests = guests.filter(guest => 
    !guestSearch || 
    `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(guestSearch.toLowerCase()) ||
    guest.email.toLowerCase().includes(guestSearch.toLowerCase())
  );

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    !roomSearch ||
    room.number.toString().includes(roomSearch) ||
    room.type.toLowerCase().includes(roomSearch.toLowerCase())
  );

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
      setLookupsLoading(true);
      
      // Fetch the latest reservation data and lookup data
      const [latestReservation, guestsData, roomsData] = await Promise.all([
        reservationService.getById(reservation.Id),
        guestService.getAll(),
        roomService.getAll()
      ]);
      
      setEditingReservation({ ...latestReservation });
      setGuests(guestsData);
      setRooms(roomsData);
      setShowEditModal(true);
    } catch (error) {
      toast.error('Failed to load reservation details');
      console.error('Error fetching latest reservation:', error);
    } finally {
      setLookupsLoading(false);
    }
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
                  onClick={() => {
                    setShowEditModal(false);
                    setGuestSearch("");
                    setRoomSearch("");
                    setShowGuestDropdown(false);
                    setShowRoomDropdown(false);
                  }}
                >
                  <ApperIcon name="X" className="h-4 w-4" />
                </Button>
              </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest *
                  </label>
                  {lookupsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading guests...</span>
                    </div>
                  ) : (
                    <div className="relative dropdown-container">
                      <div className="relative">
                        <ApperIcon 
                          name="Search" 
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10"
                        />
                        <Input
                          value={guestSearch || (editingReservation.guestId ? 
                            (() => {
                              const guest = guests.find(g => g.Id === parseInt(editingReservation.guestId));
                              return guest ? `${guest.firstName} ${guest.lastName} - ${guest.email}` : '';
                            })() : ''
                          )}
                          onChange={(e) => setGuestSearch(e.target.value)}
                          placeholder="Search guests..."
                          className="pl-9"
                          onFocus={() => setShowGuestDropdown(true)}
                        />
                        {editingReservation.guestId && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReservation({
                                  ...editingReservation,
                                  guestId: ""
                                });
                                setGuestSearch("");
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <ApperIcon name="X" className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {showGuestDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {/* Existing Guests */}
                          {filteredGuests.length > 0 && filteredGuests.map((guest) => (
                            <button
                              key={guest.Id}
                              type="button"
                              onClick={() => {
                                setEditingReservation({
                                  ...editingReservation,
                                  guestId: guest.Id
                                });
                                setGuestSearch(`${guest.firstName} ${guest.lastName} - ${guest.email}`);
                                setShowGuestDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                            >
                              <div className="font-medium">{guest.firstName} {guest.lastName}</div>
                              <div className="text-sm text-gray-500">{guest.email}</div>
                            </button>
                          ))}
                          
                          {/* No guests found message */}
                          {guestSearch && filteredGuests.length === 0 && (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              No guests found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room *
                  </label>
                  {lookupsLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading rooms...</span>
                    </div>
                  ) : (
                    <div className="relative dropdown-container">
                      <div className="relative">
                        <ApperIcon 
                          name="Search" 
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10"
                        />
                        <Input
                          value={roomSearch || (editingReservation.roomId ? 
                            (() => {
                              const room = rooms.find(r => r.Id === parseInt(editingReservation.roomId));
                              return room ? `Room ${room.number} - ${room.type} ($${room.pricePerNight}/night)` : '';
                            })() : ''
                          )}
                          onChange={(e) => setRoomSearch(e.target.value)}
                          placeholder="Search rooms..."
                          className="pl-9"
                          onFocus={() => setShowRoomDropdown(true)}
                        />
                        {editingReservation.roomId && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReservation({
                                  ...editingReservation,
                                  roomId: ""
                                });
                                setRoomSearch("");
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <ApperIcon name="X" className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {showRoomDropdown && filteredRooms.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredRooms.map((room) => (
                            <button
                              key={room.Id}
                              type="button"
                              onClick={() => {
                                setEditingReservation({
                                  ...editingReservation,
                                  roomId: room.Id
                                });
                                setRoomSearch(`Room ${room.number} - ${room.type} ($${room.pricePerNight}/night)`);
                                setShowRoomDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                            >
                              <div className="font-medium">Room {room.number} - {room.type}</div>
                              <div className="text-sm text-gray-500">${room.pricePerNight}/night</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {showRoomDropdown && roomSearch && filteredRooms.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          <div className="px-3 py-2 text-gray-500 text-sm">No rooms found</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
                  onClick={() => {
                    setShowEditModal(false);
                    setGuestSearch("");
                    setRoomSearch("");
                    setShowGuestDropdown(false);
                    setShowRoomDropdown(false);
                  }}
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