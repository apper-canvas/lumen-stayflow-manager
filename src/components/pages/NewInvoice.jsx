import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { Card } from "@/components/atoms/Card";
import invoiceService from "@/services/api/invoiceService";
import guestService from "@/services/api/guestService";
import roomService from "@/services/api/roomService";
import reservationService from "@/services/api/reservationService";

const NewInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  
  const [formData, setFormData] = useState({
    guestId: "",
    reservationId: "",
    roomId: "",
    billingPeriodStart: "",
    billingPeriodEnd: "",
    roomCharges: 0,
    serviceCharges: 0,
    taxAmount: 0,
    totalAmount: 0,
    paymentTerms: "due_on_receipt",
    notes: "",
    status: "draft"
  });

  const [serviceItems, setServiceItems] = useState([]);
  const [newServiceItem, setNewServiceItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    total: 0
  });

  const [formErrors, setFormErrors] = useState({});
  const TAX_RATE = 0.1; // 10% tax rate

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [guestsData, roomsData, reservationsData] = await Promise.all([
          guestService.getAll(),
          roomService.getAll(),
          reservationService.getAll()
        ]);
        setGuests(guestsData);
        setRooms(roomsData);
        setReservations(reservationsData.filter(r => r.status === 'checked_out' || r.status === 'confirmed'));
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate totals when form data changes
  useEffect(() => {
    const serviceTotal = serviceItems.reduce((sum, item) => sum + item.total, 0);
    const subtotal = formData.roomCharges + serviceTotal;
    const taxAmount = subtotal * TAX_RATE;
    const total = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      serviceCharges: serviceTotal,
      taxAmount: taxAmount,
      totalAmount: total
    }));
  }, [formData.roomCharges, serviceItems]);

  // Auto-populate fields when reservation is selected
useEffect(() => {
    if (formData.reservationId) {
      const selectedReservation = reservations.find(r => r.Id === parseInt(formData.reservationId));
      if (selectedReservation) {
        const checkIn = new Date(selectedReservation.checkInDate);
        const checkOut = new Date(selectedReservation.checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const room = rooms.find(r => r.Id === selectedReservation.roomId);
        const roomCharges = room ? nights * room.pricePerNight : 0;

        setFormData(prev => ({
          ...prev,
          guestId: selectedReservation.guestId ? selectedReservation.guestId.toString() : "",
          roomId: selectedReservation.roomId ? selectedReservation.roomId.toString() : "",
          billingPeriodStart: selectedReservation.checkInDate || "",
          billingPeriodEnd: selectedReservation.checkOutDate || "",
          roomCharges: roomCharges
        }));
      }
    }
  }, [formData.reservationId, reservations, rooms]);

  const validateForm = () => {
    const errors = {};

    if (!formData.guestId) errors.guestId = "Please select a guest";
    if (!formData.billingPeriodStart) errors.billingPeriodStart = "Billing start date is required";
    if (!formData.billingPeriodEnd) errors.billingPeriodEnd = "Billing end date is required";
    
    if (formData.billingPeriodStart && formData.billingPeriodEnd) {
      const start = new Date(formData.billingPeriodStart);
      const end = new Date(formData.billingPeriodEnd);
      
      if (end <= start) {
        errors.billingPeriodEnd = "End date must be after start date";
      }
    }

    if (formData.roomCharges < 0) errors.roomCharges = "Room charges cannot be negative";
    if (formData.totalAmount <= 0) errors.totalAmount = "Total amount must be greater than zero";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddServiceItem = () => {
    if (!newServiceItem.description.trim()) {
      toast.error("Please enter a service description");
      return;
    }
    
    if (newServiceItem.unitPrice <= 0) {
      toast.error("Unit price must be greater than zero");
      return;
    }

    const total = newServiceItem.quantity * newServiceItem.unitPrice;
    const serviceItem = {
      id: Date.now(),
      ...newServiceItem,
      total: total
    };

    setServiceItems(prev => [...prev, serviceItem]);
    setNewServiceItem({
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0
    });
  };

  const handleRemoveServiceItem = (id) => {
    setServiceItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);
      
      const invoiceData = {
        ...formData,
        guestId: parseInt(formData.guestId),
        reservationId: formData.reservationId ? parseInt(formData.reservationId) : null,
        roomId: formData.roomId ? parseInt(formData.roomId) : null,
        roomCharges: parseFloat(formData.roomCharges),
        serviceCharges: parseFloat(formData.serviceCharges),
        taxAmount: parseFloat(formData.taxAmount),
        totalAmount: parseFloat(formData.totalAmount),
        serviceItems: serviceItems,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: formData.paymentTerms === 'due_on_receipt' 
          ? new Date().toISOString().split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      await invoiceService.create(invoiceData);
      toast.success("Invoice created successfully!");
      navigate("/billing");
    } catch (error) {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const selectedGuest = guests.find(guest => guest.Id === parseInt(formData.guestId));
  const selectedRoom = rooms.find(room => room.Id === parseInt(formData.roomId));

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
          onClick={() => navigate("/billing")}
          className="flex items-center gap-2"
        >
          <ApperIcon name="ArrowLeft" className="h-4 w-4" />
          Back to Billing
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-600 mt-1">Create a new guest invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest & Reservation Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest & Reservation Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Reservation (Optional)
              </label>
              <Select
                value={formData.reservationId}
                onChange={(e) => handleInputChange("reservationId", e.target.value)}
              >
                <option value="">Select reservation...</option>
{reservations.map((reservation) => {
                  // Handle both data patterns: guestId lookup or direct guestName
                  let guestName = 'Unknown Guest';
                  if (reservation.guestId) {
                    const guestId = parseInt(reservation.guestId);
                    const guest = guests.find(g => g.Id === guestId);
                    if (guest && guest.firstName && guest.lastName) {
                      guestName = `${guest.firstName} ${guest.lastName}`;
                    }
                  } else if (reservation.guestName) {
                    guestName = reservation.guestName;
                  }
                  
                  const room = reservation.roomId ? rooms.find(r => r.Id === parseInt(reservation.roomId)) : null;
                  return (
                    <option key={reservation.Id} value={reservation.Id}>
                      {guestName} - Room {room?.number || reservation.roomNumber || 'Unknown'} ({reservation.checkIn || 'N/A'} to {reservation.checkOut || 'N/A'})
                    </option>
                  );
                })}
              </Select>
            </div>

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
          </div>
        </Card>

        {/* Billing Period */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.billingPeriodStart}
                onChange={(e) => handleInputChange("billingPeriodStart", e.target.value)}
                className={formErrors.billingPeriodStart ? "border-red-500" : ""}
              />
              {formErrors.billingPeriodStart && <p className="text-red-500 text-sm mt-1">{formErrors.billingPeriodStart}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <Input
                type="date"
                value={formData.billingPeriodEnd}
                onChange={(e) => handleInputChange("billingPeriodEnd", e.target.value)}
                className={formErrors.billingPeriodEnd ? "border-red-500" : ""}
                min={formData.billingPeriodStart}
              />
              {formErrors.billingPeriodEnd && <p className="text-red-500 text-sm mt-1">{formErrors.billingPeriodEnd}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <Select
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
              >
                <option value="due_on_receipt">Due on Receipt</option>
                <option value="net_30">Net 30 Days</option>
                <option value="net_15">Net 15 Days</option>
                <option value="advance_payment">Advance Payment</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Room Charges */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Charges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room (Optional)
              </label>
              <Select
                value={formData.roomId}
                onChange={(e) => handleInputChange("roomId", e.target.value)}
              >
                <option value="">Select room...</option>
                {rooms.map((room) => (
                  <option key={room.Id} value={room.Id}>
                    Room {room.number} - {room.type}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Charges ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.roomCharges}
                onChange={(e) => handleInputChange("roomCharges", parseFloat(e.target.value) || 0)}
                className={formErrors.roomCharges ? "border-red-500" : ""}
              />
              {formErrors.roomCharges && <p className="text-red-500 text-sm mt-1">{formErrors.roomCharges}</p>}
            </div>
          </div>
        </Card>

        {/* Additional Services */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Services</h2>
          
          {/* Add Service Item */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Input
                placeholder="Service description"
                value={newServiceItem.description}
                onChange={(e) => setNewServiceItem(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Input
                type="number"
                min="1"
                placeholder="Quantity"
                value={newServiceItem.quantity}
                onChange={(e) => setNewServiceItem(prev => ({ 
                  ...prev, 
                  quantity: parseInt(e.target.value) || 1,
                  total: (parseInt(e.target.value) || 1) * prev.unitPrice
                }))}
              />
            </div>
            <div>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Unit price ($)"
                value={newServiceItem.unitPrice}
                onChange={(e) => {
                  const price = parseFloat(e.target.value) || 0;
                  setNewServiceItem(prev => ({ 
                    ...prev, 
                    unitPrice: price,
                    total: prev.quantity * price
                  }));
                }}
              />
            </div>
            <div>
              <Button
                type="button"
                onClick={handleAddServiceItem}
                className="w-full"
              >
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>

          {/* Service Items List */}
          {serviceItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Service Items:</h3>
              {serviceItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{item.description}</span>
                    <span className="text-gray-600 ml-2">
                      (Qty: {item.quantity} × ${item.unitPrice.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${item.total.toFixed(2)}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveServiceItem(item.id)}
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Additional notes or payment instructions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-150"
            rows="3"
          />
        </Card>

        {/* Invoice Summary */}
        <Card className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Guest:</span>
              <span className="font-medium">
                {selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}` : 'Not selected'}
              </span>
            </div>
            {selectedRoom && (
              <div className="flex justify-between">
                <span className="text-gray-600">Room:</span>
                <span className="font-medium">Room {selectedRoom.number} - {selectedRoom.type}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Billing Period:</span>
              <span className="font-medium">
                {formData.billingPeriodStart && formData.billingPeriodEnd
                  ? `${formData.billingPeriodStart} to ${formData.billingPeriodEnd}`
                  : 'Not set'}
              </span>
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Room Charges:</span>
                <span>${formData.roomCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Charges:</span>
                <span>${formData.serviceCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%):</span>
                <span>${formData.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>${formData.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/billing")}
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
                <ApperIcon name="FileText" className="h-4 w-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewInvoice;