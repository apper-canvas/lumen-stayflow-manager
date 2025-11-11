import guestData from "@/services/mockData/guests.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let guests = [...guestData];

const guestService = {
  async getAll() {
    await delay(300);
    return [...guests];
  },

  async getById(id) {
    await delay(200);
    const guest = guests.find(guest => guest.Id === id);
    if (!guest) {
      throw new Error(`Guest with Id ${id} not found`);
    }
    return { ...guest };
  },

  async create(guestData) {
    await delay(450);
    const newGuest = {
      Id: Math.max(...guests.map(g => g.Id)) + 1,
      ...guestData,
      stayHistory: [],
      vipStatus: false
    };
    guests.push(newGuest);
    return { ...newGuest };
  },

  async update(id, updatedData) {
    await delay(400);
    const index = guests.findIndex(guest => guest.Id === id);
    if (index === -1) {
      throw new Error(`Guest with Id ${id} not found`);
    }
    guests[index] = { ...guests[index], ...updatedData };
    return { ...guests[index] };
  },

  async delete(id) {
    await delay(300);
    const index = guests.findIndex(guest => guest.Id === id);
    if (index === -1) {
      throw new Error(`Guest with Id ${id} not found`);
    }
    const deletedGuest = guests[index];
    guests.splice(index, 1);
    return { ...deletedGuest };
  }
};

export default guestService;