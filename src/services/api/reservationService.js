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
    const newReservation = {
      Id: Math.max(...reservations.map(r => r.Id)) + 1,
      ...reservationData,
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