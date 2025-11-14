import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card } from "@/components/atoms/Card";
import reservationService from "@/services/api/reservationService";
import guestService from "@/services/api/guestService";
import roomService from "@/services/api/roomService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Reservations from "@/components/pages/Reservations";
import Guests from "@/components/pages/Guests";
import GuestProfileEditor from "@/components/organisms/GuestProfileEditor";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
const NewReservation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  
// Search states for dropdowns
  const [guestSearch, setGuestSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  
  // Modal state for New Guest creation
  const [showGuestModal, setShowGuestModal] = useState(false);
const [formData, setFormData] = useState({
    guestId: "",
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
    adults: 1,
    children: 0,
    totalAmount: 0,
    specialRequests: "",
    status: "pending",
    paymentStatus: "pending",
    reservationId: "",
    numberOfNights: 0,
    taxPercentage: 5,
    serviceChargePercentage: 10,
    discount: {
      type: "none",
      value: 0,
      reason: ""
    },
    additionalServices: [],
    baseAmount: 0,
    taxAmount: 0,
    serviceChargeAmount: 0,
    discountAmount: 0,
    grandTotal: 0
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

  // Handle new guest creation
  const handleNewGuestCreated = async (newGuest) => {
    try {
      // Refresh guests list
      const updatedGuests = await guestService.getAll();
      setGuests(updatedGuests);
      
      // Auto-select the newly created guest
      const createdGuest = updatedGuests.find(guest => 
        guest.email === newGuest.email && 
        guest.firstName === newGuest.firstName && 
        guest.lastName === newGuest.lastName
      );
      
      if (createdGuest) {
        handleInputChange("guestId", createdGuest.Id);
        setGuestSearch(`${createdGuest.firstName} ${createdGuest.lastName} - ${createdGuest.email}`);
      }
      
      // Close modal
      setShowGuestModal(false);
      toast.success('Guest created and selected successfully');
    } catch (error) {
      toast.error('Failed to refresh guest list');
    }
  };

  // Filter guests based on search
  const filteredGuests = guests.filter(guest => 
    !guestSearch || 
    `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(guestSearch.toLowerCase()) ||
    guest.email.toLowerCase().includes(guestSearch.toLowerCase())
  );

  // Filter rooms based on search
  const filteredRooms = availableRooms.filter(room =>
    !roomSearch ||
    room.number.toString().includes(roomSearch) ||
    room.type.toLowerCase().includes(roomSearch.toLowerCase())
  );

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

  // Calculate total amount when dates or room changes
// Calculate number of nights
  const calculateNumberOfNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  // Generate Reservation ID
  const generateReservationId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RES-${year}-${random}`;
  };

  // Calculate all billing amounts
  const calculateBillingAmounts = (nights, roomPrice, taxPct, serviceChargePct, discount, servicesTotal) => {
    const baseAmount = nights > 0 && roomPrice ? nights * roomPrice : 0;
    const subtotal = baseAmount + servicesTotal;
    const taxAmount = (subtotal * taxPct) / 100;
    const subtotalWithTax = subtotal + taxAmount;
    const serviceChargeAmount = (subtotalWithTax * serviceChargePct) / 100;
    
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = ((subtotalWithTax + serviceChargeAmount) * discount.value) / 100;
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    }
    
    const grandTotal = subtotal + taxAmount + serviceChargeAmount - discountAmount;
    
    return {
      baseAmount: Math.max(0, baseAmount),
      taxAmount: Math.max(0, taxAmount),
      serviceChargeAmount: Math.max(0, serviceChargeAmount),
      discountAmount: Math.max(0, discountAmount),
      grandTotal: Math.max(0, grandTotal)
    };
  };

  // Calculate services total
  const calculateServicesTotal = (services) => {
    return services.reduce((sum, service) => {
      const qty = parseInt(service.quantity) || 0;
      const price = parseFloat(service.pricePerUnit) || 0;
      return sum + (qty * price);
    }, 0);
  };

  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate && formData.roomId) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return;
      }
      
      const nights = calculateNumberOfNights(formData.checkInDate, formData.checkOutDate);
      const roomId = parseInt(formData.roomId);
      const selectedRoom = rooms.find(room => room.Id === roomId);
      
      if (selectedRoom && nights > 0 && typeof selectedRoom.pricePerNight === 'number') {
        const servicesTotal = calculateServicesTotal(formData.additionalServices);
        const billing = calculateBillingAmounts(
          nights,
          selectedRoom.pricePerNight,
          parseInt(formData.taxPercentage) || 5,
          parseInt(formData.serviceChargePercentage) || 10,
          formData.discount,
          servicesTotal
        );
        
        setFormData(prev => ({
          ...prev,
          numberOfNights: nights,
          totalAmount: billing.grandTotal,
          baseAmount: billing.baseAmount,
          taxAmount: billing.taxAmount,
          serviceChargeAmount: billing.serviceChargeAmount,
          discountAmount: billing.discountAmount,
          grandTotal: billing.grandTotal
        }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.roomId, formData.taxPercentage, formData.serviceChargePercentage, formData.discount, formData.additionalServices, rooms]);

  // Generate Reservation ID on mount
  useEffect(() => {
    if (!formData.reservationId) {
      setFormData(prev => ({
        ...prev,
        reservationId: generateReservationId()
      }));
    }
  }, []);
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
    
    if (parseInt(formData.taxPercentage) < 0) errors.taxPercentage = "Tax percentage cannot be negative";
    if (parseInt(formData.serviceChargePercentage) < 0) errors.serviceChargePercentage = "Service charge cannot be negative";
    if (formData.discount.type !== 'none') {
      if (!formData.discount.value || parseFloat(formData.discount.value) < 0) {
        errors.discountValue = "Discount value must be greater than 0";
      }
    }

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
        totalAmount: parseFloat(formData.grandTotal || formData.totalAmount),
        paymentStatus: formData.paymentStatus,
        reservationId: formData.reservationId,
        numberOfNights: formData.numberOfNights,
        taxPercentage: parseInt(formData.taxPercentage),
        serviceChargePercentage: parseInt(formData.serviceChargePercentage),
        discount: formData.discount,
        additionalServices: formData.additionalServices,
        baseAmount: parseFloat(formData.baseAmount),
        taxAmount: parseFloat(formData.taxAmount),
        serviceChargeAmount: parseFloat(formData.serviceChargeAmount),
        discountAmount: parseFloat(formData.discountAmount),
        grandTotal: parseFloat(formData.grandTotal)
      };

await reservationService.create(reservationData);
      toast.success("Reservation created successfully!");
      navigate("/reservations");
    } catch (error) {
      console.error('Failed to create reservation:', error);
      toast.error(error?.message || "Failed to create reservation");
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
    <>
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
              <div className="relative dropdown-container">
                <div className="relative">
                  <ApperIcon 
                    name="Search" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10"
                  />
                  <Input
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Search guests..."
                    className={`pl-9 ${formErrors.guestId ? "border-red-500" : ""}`}
                    onFocus={() => setShowGuestDropdown(true)}
                  />
                  {selectedGuest && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange("guestId", "");
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
                    {/* New Guest Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowGuestModal(true);
                        setShowGuestDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100"
                    >
                      <div className="font-medium text-blue-600 flex items-center gap-2">
                        <ApperIcon name="Plus" size={16} />
                        New Guest
                      </div>
                      <div className="text-sm text-blue-500">Create a new guest profile</div>
                    </button>
                    
                    {/* Existing Guests */}
                    {filteredGuests.length > 0 && filteredGuests.map((guest) => (
                      <button
                        key={guest.Id}
                        type="button"
                        onClick={() => {
                          handleInputChange("guestId", guest.Id);
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
                      <div className="px-3 py-2 text-gray-500 text-sm border-t border-gray-100">
                        No existing guests found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formErrors.guestId && <p className="text-red-500 text-sm mt-1">{formErrors.guestId}</p>}
</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Room *
              </label>
              <div className="relative dropdown-container">
                <div className="relative">
                  <ApperIcon 
                    name="Search" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10"
                  />
                  <Input
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    placeholder="Search rooms..."
                    className={`pl-9 ${formErrors.roomId ? "border-red-500" : ""}`}
                    onFocus={() => setShowRoomDropdown(true)}
                  />
                  {selectedRoom && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange("roomId", "");
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
                          handleInputChange("roomId", room.Id);
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

        {/* Billing Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reservation ID
              </label>
              <Input
                type="text"
                value={formData.reservationId}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Nights
              </label>
              <Input
                type="number"
                value={formData.numberOfNights}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Percentage *
              </label>
              <Select
                value={formData.taxPercentage}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    handleInputChange("taxPercentage", "");
                  } else {
                    handleInputChange("taxPercentage", e.target.value);
                  }
                }}
                className={formErrors.taxPercentage ? "border-red-500" : ""}
              >
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="custom">Custom</option>
              </Select>
              {formData.taxPercentage === '' && (
                <Input
                  type="number"
                  placeholder="Enter custom tax %"
                  value={formData.taxPercentage}
                  onChange={(e) => handleInputChange("taxPercentage", e.target.value)}
                  className="mt-2"
                  min="0"
                  max="100"
                />
              )}
              {formErrors.taxPercentage && <p className="text-red-500 text-sm mt-1">{formErrors.taxPercentage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Charge Percentage
              </label>
              <Input
                type="number"
                value={formData.serviceChargePercentage}
                onChange={(e) => handleInputChange("serviceChargePercentage", e.target.value)}
                className={formErrors.serviceChargePercentage ? "border-red-500" : ""}
                min="0"
                max="100"
              />
              {formErrors.serviceChargePercentage && <p className="text-red-500 text-sm mt-1">{formErrors.serviceChargePercentage}</p>}
            </div>
          </div>
        </Card>

        {/* Discount Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Discount</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <Select
                value={formData.discount.type}
                onChange={(e) => {
                  handleInputChange("discount", {
                    ...formData.discount,
                    type: e.target.value,
                    value: 0
                  });
                }}
              >
                <option value="none">None</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </Select>
            </div>

            {formData.discount.type !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value
                </label>
                <Input
                  type="number"
                  value={formData.discount.value}
                  onChange={(e) => {
                    handleInputChange("discount", {
                      ...formData.discount,
                      value: e.target.value
                    });
                  }}
                  placeholder={formData.discount.type === 'percentage' ? "Enter %" : "Enter amount"}
                  min="0"
                />
                {formErrors.discountValue && <p className="text-red-500 text-sm mt-1">{formErrors.discountValue}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Reason
              </label>
              <Input
                type="text"
                value={formData.discount.reason}
                onChange={(e) => {
                  handleInputChange("discount", {
                    ...formData.discount,
                    reason: e.target.value
                  });
                }}
                placeholder="e.g., Early booking, Loyalty..."
              />
            </div>
          </div>
        </Card>

        {/* Additional Services */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Additional Services</h2>
            <Button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  additionalServices: [
                    ...prev.additionalServices,
                    { serviceName: "", quantity: 1, pricePerUnit: 0, total: 0 }
                  ]
                }));
                toast.info("Service row added");
              }}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Add Service
            </Button>
          </div>

          {formData.additionalServices.length > 0 ? (
            <div className="space-y-4">
              {formData.additionalServices.map((service, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name
                      </label>
                      <Select
                        value={service.serviceName}
                        onChange={(e) => {
                          const updated = [...formData.additionalServices];
                          updated[index].serviceName = e.target.value;
                          handleInputChange("additionalServices", updated);
                        }}
                      >
                        <option value="">Select Service</option>
                        <option value="Minibar">Minibar</option>
                        <option value="Laundry">Laundry</option>
                        <option value="Room Service">Room Service</option>
                        <option value="Spa">Spa</option>
                        <option value="Parking">Parking</option>
                        <option value="Extra Bed">Extra Bed</option>
                        <option value="Airport Transfer">Airport Transfer</option>
                        <option value="Other">Other</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        value={service.quantity}
                        onChange={(e) => {
                          const updated = [...formData.additionalServices];
                          updated[index].quantity = parseInt(e.target.value) || 1;
                          updated[index].total = (updated[index].quantity * parseFloat(updated[index].pricePerUnit || 0));
                          handleInputChange("additionalServices", updated);
                        }}
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Unit
                      </label>
                      <Input
                        type="number"
                        value={service.pricePerUnit}
                        onChange={(e) => {
                          const updated = [...formData.additionalServices];
                          updated[index].pricePerUnit = parseFloat(e.target.value) || 0;
                          updated[index].total = (parseInt(updated[index].quantity || 1) * updated[index].pricePerUnit);
                          handleInputChange("additionalServices", updated);
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <Input
                        type="number"
                        value={(parseInt(service.quantity || 1) * parseFloat(service.pricePerUnit || 0)).toFixed(2)}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={() => {
                          const updated = formData.additionalServices.filter((_, i) => i !== index);
                          handleInputChange("additionalServices", updated);
                          toast.warning("Service removed");
                        }}
                        variant="destructive"
                        className="w-full"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No additional services added. Click "Add Service" to include extras.</p>
          )}
        </Card>

{/* Payment & Additional Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment & Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <Select
                value={formData.paymentStatus}
                onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
                className="w-full"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="failed">Payment Failed</option>
              </Select>
            </div>
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
          </div>
        </Card>
{/* Booking Summary */}
{selectedRoom && formData.checkInDate && formData.checkOutDate && (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Reservation ID:</span>
                <span className="font-medium text-blue-600">{formData.reservationId}</span>
              </div>
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
                <span className="text-gray-600">Check-in to Check-out:</span>
                <span className="font-medium">
                  {formData.checkInDate} to {formData.checkOutDate} ({formData.numberOfNights} night{formData.numberOfNights !== 1 ? 's' : ''})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-medium">
                  {formData.adults} Adult{formData.adults > 1 ? 's' : ''}
                  {formData.children > 0 && `, ${formData.children} Child${formData.children > 1 ? 'ren' : ''}`}
                </span>
              </div>
              
              <div className="border-t border-blue-200 pt-3 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Room Charges ({formData.numberOfNights} nights × ${selectedRoom.pricePerNight}):</span>
                    <span>${formData.baseAmount.toFixed(2)}</span>
                  </div>
                  
                  {formData.additionalServices.length > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Additional Services:</span>
                        <span>${formData.additionalServices.reduce((sum, s) => sum + (parseInt(s.quantity || 0) * parseFloat(s.pricePerUnit || 0)), 0).toFixed(2)}</span>
                      </div>
                      {formData.additionalServices.map((service, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-500 ml-4">
                          <span>{service.serviceName} (×{service.quantity})</span>
                          <span>${(parseInt(service.quantity || 0) * parseFloat(service.pricePerUnit || 0)).toFixed(2)}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({formData.taxPercentage}%):</span>
                    <span>${formData.taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Charge ({formData.serviceChargePercentage}%):</span>
                    <span>${formData.serviceChargeAmount.toFixed(2)}</span>
                  </div>

                  {formData.discount.type !== 'none' && formData.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({formData.discount.type === 'percentage' ? `${formData.discount.value}%` : 'Fixed'}):</span>
                      <span>-${formData.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-blue-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-blue-600">
                  <span>Grand Total:</span>
                  <span>${formData.grandTotal.toFixed(2)}</span>
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
    
    {/* New Guest Modal */}
    {showGuestModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <GuestProfileEditor
            guest={null}
            onSave={handleNewGuestCreated}
            onClose={() => setShowGuestModal(false)}
          />
        </div>
      </div>
    )}
    </>
  );
};

export default NewReservation;