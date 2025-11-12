import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { Card } from "@/components/atoms/Card";
import reservationService from "@/services/api/reservationService";
import guestService from "@/services/api/guestService";
import roomService from "@/services/api/roomService";

const NewReservation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  
  const [formData, setFormData] = useState({
    guestId: "",
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
    adults: 1,
    children: 0,
    totalAmount: 0,
    specialRequests: "",
    status: "pending"
  });

  const [formErrors, setFormErrors] = useState({});

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [guestsData, roomsData] = await Promise.all([
          guestService.getAll(),
          roomService.getAll()
        ]);
        setGuests(guestsData);
        setRooms(roomsData);
        setAvailableRooms(roomsData.filter(room => room.status === 'available'));
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate total amount when dates or room changes
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate && formData.roomId) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const selectedRoom = rooms.find(room => room.Id === parseInt(formData.roomId));
      
      if (selectedRoom && nights > 0) {
        const total = nights * selectedRoom.pricePerNight;
        setFormData(prev => ({ ...prev, totalAmount: total }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.roomId, rooms]);

  const validateForm = () => {
    const errors = {};

    if (!formData.guestId) errors.guestId = "Please select a guest";
    if (!formData.roomId) errors.roomId = "Please select a room";
    if (!formData.checkInDate) errors.checkInDate = "Check-in date is required";
    if (!formData.checkOutDate) errors.checkOutDate = "Check-out date is required";
    
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) {
        errors.checkInDate = "Check-in date cannot be in the past";
      }
      if (checkOut <= checkIn) {
        errors.checkOutDate = "Check-out date must be after check-in date";
      }
    }

    if (formData.adults < 1) errors.adults = "At least 1 adult is required";
    if (formData.children < 0) errors.children = "Children count cannot be negative";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);
      
      const reservationData = {
        ...formData,
        guestId: parseInt(formData.guestId),
        roomId: parseInt(formData.roomId),
        adults: parseInt(formData.adults),
        children: parseInt(formData.children),
        totalAmount: parseFloat(formData.totalAmount)
      };

await reservationService.create(reservationData);
      navigate("/reservations");
    } catch (error) {
      toast.error("Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  const selectedRoom = rooms.find(room => room.Id === parseInt(formData.roomId));
  const selectedGuest = guests.find(guest => guest.Id === parseInt(formData.guestId));

  if (loading && guests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/reservations")}
          className="flex items-center gap-2"
        >
          <ApperIcon name="ArrowLeft" className="h-4 w-4" />
          Back to Reservations
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Reservation</h1>
          <p className="text-gray-600 mt-1">Create a new guest reservation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest & Room Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest & Room Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Guest *
              </label>
              <Select
                value={formData.guestId}
                onChange={(e) => handleInputChange("guestId", e.target.value)}
                className={formErrors.guestId ? "border-red-500" : ""}
              >
                <option value="">Choose a guest...</option>
                {guests.map((guest) => (
                  <option key={guest.Id} value={guest.Id}>
                    {guest.firstName} {guest.lastName} - {guest.email}
                  </option>
                ))}
              </Select>
              {formErrors.guestId && <p className="text-red-500 text-sm mt-1">{formErrors.guestId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Room *
              </label>
              <Select
                value={formData.roomId}
                onChange={(e) => handleInputChange("roomId", e.target.value)}
                className={formErrors.roomId ? "border-red-500" : ""}
              >
                <option value="">Choose a room...</option>
                {availableRooms.map((room) => (
                  <option key={room.Id} value={room.Id}>
                    Room {room.number} - {room.type} (${room.pricePerNight}/night)
                  </option>
                ))}
              </Select>
              {formErrors.roomId && <p className="text-red-500 text-sm mt-1">{formErrors.roomId}</p>}
            </div>
          </div>
        </Card>

        {/* Dates & Occupancy */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stay Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date *
              </label>
              <Input
                type="date"
                value={formData.checkInDate}
                onChange={(e) => handleInputChange("checkInDate", e.target.value)}
                className={formErrors.checkInDate ? "border-red-500" : ""}
                min={new Date().toISOString().split('T')[0]}
              />
              {formErrors.checkInDate && <p className="text-red-500 text-sm mt-1">{formErrors.checkInDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date *
              </label>
              <Input
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => handleInputChange("checkOutDate", e.target.value)}
                className={formErrors.checkOutDate ? "border-red-500" : ""}
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
              />
              {formErrors.checkOutDate && <p className="text-red-500 text-sm mt-1">{formErrors.checkOutDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adults *
              </label>
              <Select
                value={formData.adults}
                onChange={(e) => handleInputChange("adults", e.target.value)}
                className={formErrors.adults ? "border-red-500" : ""}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                ))}
              </Select>
              {formErrors.adults && <p className="text-red-500 text-sm mt-1">{formErrors.adults}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Children
              </label>
              <Select
                value={formData.children}
                onChange={(e) => handleInputChange("children", e.target.value)}
                className={formErrors.children ? "border-red-500" : ""}
              >
                {[0, 1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
                ))}
              </Select>
              {formErrors.children && <p className="text-red-500 text-sm mt-1">{formErrors.children}</p>}
            </div>
          </div>
        </Card>

        {/* Special Requests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => handleInputChange("specialRequests", e.target.value)}
              placeholder="Any special requests or notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-150"
              rows="4"
            />
          </div>
        </Card>

        {/* Booking Summary */}
        {selectedRoom && formData.checkInDate && formData.checkOutDate && (
          <Card className="p-6 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Guest:</span>
                <span className="font-medium">
                  {selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}` : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room:</span>
                <span className="font-medium">Room {selectedRoom.number} - {selectedRoom.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dates:</span>
                <span className="font-medium">
                  {formData.checkInDate} to {formData.checkOutDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-medium">
                  {formData.adults} Adult{formData.adults > 1 ? 's' : ''}
                  {formData.children > 0 && `, ${formData.children} Child${formData.children > 1 ? 'ren' : ''}`}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>${formData.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/reservations")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </div>
            ) : (
              <>
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Create Reservation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewReservation;