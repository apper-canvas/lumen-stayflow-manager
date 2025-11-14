import reservationData from "@/services/mockData/reservations.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let reservations = [...reservationData];

const reservationService = {
  async getAll() {
    await delay(350);
    return [...reservations];
  },

  async getById(id) {
    await delay(200);
    const reservation = reservations.find(reservation => reservation.Id === id);
    if (!reservation) {
      throw new Error(`Reservation with Id ${id} not found`);
    }
    return { ...reservation };
  },

async create(reservationData) {
    await delay(500);
    
    // Generate Reservation ID if not provided
    const generateReservationId = () => {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `RES-${year}-${random}`;
    };

    // Calculate number of nights
    const calculateNights = (checkIn, checkOut) => {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    };

    // Calculate services total
    const servicesTotal = (reservationData.additionalServices || []).reduce((sum, service) => {
      const qty = parseInt(service.quantity) || 0;
      const price = parseFloat(service.pricePerUnit) || 0;
      return sum + (qty * price);
    }, 0);

    const nights = calculateNights(reservationData.checkInDate, reservationData.checkOutDate);
    const baseAmount = (reservationData.totalAmount && nights > 0) ? reservationData.totalAmount : 0;
    
    const taxPct = parseInt(reservationData.taxPercentage) || 5;
    const serviceChargePct = parseInt(reservationData.serviceChargePercentage) || 10;
    
    const subtotal = baseAmount + servicesTotal;
    const taxAmount = (subtotal * taxPct) / 100;
    const subtotalWithTax = subtotal + taxAmount;
    const serviceChargeAmount = (subtotalWithTax * serviceChargePct) / 100;
    
    let discountAmount = 0;
    if (reservationData.discount?.type === 'percentage') {
      discountAmount = ((subtotalWithTax + serviceChargeAmount) * reservationData.discount.value) / 100;
    } else if (reservationData.discount?.type === 'fixed') {
      discountAmount = reservationData.discount.value || 0;
    }
    
    const grandTotal = Math.max(0, subtotal + taxAmount + serviceChargeAmount - discountAmount);

    const newReservation = {
      Id: Math.max(...reservations.map(r => r.Id)) + 1,
      ...reservationData,
      reservationId: reservationData.reservationId || generateReservationId(),
      numberOfNights: nights,
      taxPercentage: taxPct,
      serviceChargePercentage: serviceChargePct,
      discount: reservationData.discount || { type: 'none', value: 0, reason: '' },
      additionalServices: reservationData.additionalServices || [],
      baseAmount: baseAmount,
      taxAmount: Math.max(0, taxAmount),
      serviceChargeAmount: Math.max(0, serviceChargeAmount),
      discountAmount: Math.max(0, discountAmount),
      grandTotal: grandTotal,
      totalAmount: grandTotal,
      createdAt: new Date().toISOString()
    };
    reservations.push(newReservation);
    return { ...newReservation };
  },

async update(id, updatedData) {
    await delay(400);
    const index = reservations.findIndex(reservation => reservation.Id === id);
    if (index === -1) {
      throw new Error(`Reservation with Id ${id} not found`);
    }
    reservations[index] = { ...reservations[index], ...updatedData };
    return { ...reservations[index] };
  },

  async updatePayment(id, paymentStatus) {
    await delay(300);
    const index = reservations.findIndex(reservation => reservation.Id === id);
    if (index === -1) {
      throw new Error(`Reservation with Id ${id} not found`);
    }
    reservations[index] = { ...reservations[index], paymentStatus };
    return { ...reservations[index] };
  },

  async delete(id) {
    await delay(300);
    const index = reservations.findIndex(reservation => reservation.Id === id);
    if (index === -1) {
      throw new Error(`Reservation with Id ${id} not found`);
    }
    const deletedReservation = reservations[index];
    reservations.splice(index, 1);
    return { ...deletedReservation };
  }
};

export default reservationService;